"""
SHAP-based Explainability Module for the Tech-Stack Recommendation Model.
Utilizes shap.TreeExplainer on the trained Random Forest classifier to compute
exact multi-class feature attributions, positive and negative factor contributions,
human-readable summaries, and global feature importance.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import json
import joblib
import numpy as np
import pandas as pd
import shap

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.recommendation.tech_stacks import get_stack_metadata, TECH_STACK_CATALOG
from model.recommendation.explainability import STACK_FEATURE_MAPPING
from .labels import FEATURE_LABELS, get_feature_label

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_DIR = BASE_DIR / "model" / "saved_models"
DEFAULT_DATASET_PATH = BASE_DIR / "model" / "data" / "student_tech_stack_dataset.csv"


class ShapExplainer:
    """
    Production TreeSHAP explainer for Random Forest Tech-Stack Recommendations.
    Caches shap.TreeExplainer in memory and generates deterministic,
    sub-millisecond explanations conforming to the frontend StackExplanation schema.
    """

    _instance: Optional["ShapExplainer"] = None

    def __init__(self, model_dir: Optional[Union[str, Path]] = None):
        self.model_dir = Path(model_dir) if model_dir else DEFAULT_MODEL_DIR
        self.model_path = self.model_dir / "rf_tech_stack_model.joblib"
        self.preprocessor_path = self.model_dir / "preprocessor.joblib"

        self.model = None
        self.classes: List[str] = []
        self.feature_names: List[str] = []
        self.preprocessor: Optional[StudentDataPreprocessor] = None
        self.tree_explainer: Optional[shap.TreeExplainer] = None

        self._load_and_initialize()

    @classmethod
    def get_instance(cls, model_dir: Optional[Union[str, Path]] = None) -> "ShapExplainer":
        """Singleton accessor to ensure TreeExplainer is compiled and cached once."""
        if cls._instance is None:
            cls._instance = cls(model_dir)
        return cls._instance

    @classmethod
    def reset_instance(cls) -> None:
        """Resets the singleton instance (primarily for isolated test fixtures)."""
        cls._instance = None

    def _load_and_initialize(self) -> None:
        """Loads serialized model artifacts and initializes shap.TreeExplainer."""
        if not self.model_path.exists():
            from model.training.train import train_model
            train_model(output_dir=self.model_dir)

        artifacts = joblib.load(self.model_path)
        self.model = artifacts["model"]
        self.classes = artifacts["classes"]
        self.feature_names = artifacts.get("feature_names", [])

        if self.preprocessor_path.exists():
            self.preprocessor = joblib.load(self.preprocessor_path)
        else:
            self.preprocessor = StudentDataPreprocessor()

        # Build and cache TreeExplainer once
        self.tree_explainer = shap.TreeExplainer(self.model)

    def validate_feature_vector(self, feature_vector: Union[List[float], np.ndarray]) -> np.ndarray:
        """Validates feature vector length and shape against model expectations."""
        arr = np.asarray(feature_vector, dtype=np.float32)
        if arr.ndim == 1:
            if arr.shape[0] != len(self.feature_names):
                raise ValueError(
                    f"Invalid feature vector length: expected {len(self.feature_names)} features, "
                    f"got {arr.shape[0]}."
                )
            return arr.reshape(1, -1)
        elif arr.ndim == 2:
            if arr.shape[1] != len(self.feature_names):
                raise ValueError(
                    f"Invalid feature vector dimensions: expected (N, {len(self.feature_names)}), "
                    f"got {arr.shape}."
                )
            return arr
        else:
            raise ValueError(f"Feature vector must be 1D or 2D, got {arr.ndim}D array.")

    def _extract_class_shap(self, raw_shap: Any, class_idx: int) -> np.ndarray:
        """
        Robustly extracts 1D SHAP attribution array for a target class index across
        different shap library versions (list-of-arrays vs 3D ndarray vs Explanation).
        """
        if isinstance(raw_shap, list):
            arr = raw_shap[class_idx]
            return arr[0] if arr.ndim > 1 else arr

        if hasattr(raw_shap, "values"):
            values = raw_shap.values
        else:
            values = np.asarray(raw_shap)

        if values.ndim == 3:
            num_classes = len(self.classes)
            if values.shape[2] == num_classes:
                return values[0, :, class_idx]
            elif values.shape[1] == num_classes:
                return values[0, class_idx, :]
            else:
                return values[0, :, class_idx]
        elif values.ndim == 2:
            return values[0]
        else:
            return np.asarray(values).flatten()

    def _extract_base_value(self, class_idx: int) -> float:
        """Extracts expected base value (prior probability) for a class index."""
        base_vals = self.tree_explainer.expected_value
        if isinstance(base_vals, (list, np.ndarray)):
            val = float(base_vals[class_idx])
        else:
            val = float(base_vals)
        # Ensure clamped into [0.0, 1.0] for probability representation
        return float(max(0.0, min(1.0, val)))

    def _categorize_feature(self, feature_name: str) -> str:
        """Assigns an architectural category token to each feature name."""
        if feature_name.startswith("course_") or feature_name == "cgpa":
            return "ERP_ACADEMICS"
        elif feature_name.startswith("interest_"):
            return "STUDENT_INTEREST"
        elif feature_name.startswith("skill_"):
            return "EXISTING_SKILL"
        else:
            return "PORTFOLIO_EXPERIENCE"

    def _generate_factor_note(
        self,
        feature_name: str,
        label: str,
        value: float,
        shap_val: float,
        stack_title: str,
    ) -> str:
        """Constructs a descriptive explanation note for a feature factor."""
        direction_word = "strengthens" if shap_val >= 0 else "weakens"
        if feature_name.startswith("course_"):
            pct = int(value * 100)
            return f"Course performance in {label} ({pct}%) {direction_word} foundational readiness for {stack_title}."
        elif feature_name == "cgpa":
            cgpa_val = round(value * 10.0, 1)
            return f"Overall academic standing (CGPA: {cgpa_val}/10.0) {direction_word} curriculum adaptability."
        elif feature_name.startswith("interest_"):
            return f"Career aspiration in {label} {direction_word} alignment with target industry roles."
        elif feature_name.startswith("skill_"):
            level_str = "Advanced" if value >= 0.8 else ("Intermediate" if value >= 0.5 else "Beginner")
            return f"Demonstrated skill proficiency in {label} ({level_str}) {direction_word} ramp-up speed."
        else:
            return f"{label} (metric: {round(value, 2)}) {direction_word} practical execution capacity."

    def _build_summary_text(
        self,
        stack_title: str,
        top_pos: List[Dict[str, Any]],
        top_neg: List[Dict[str, Any]],
    ) -> str:
        """
        Synthesizes 1 to 2 plain-English sentences explaining the model's recommendation,
        highlighting top positive drivers and primary bridgeable gaps.
        """
        pos_names = [f["label"] for f in top_pos[:2]]
        neg_names = [f["label"] for f in top_neg[:1]]

        if pos_names and neg_names:
            pos_phrase = " and ".join(pos_names)
            return (
                f"Recommended mainly because of strong {pos_phrase}. "
                f"Developing experience in {neg_names[0]} will further strengthen this match."
            )
        elif pos_names:
            pos_phrase = " and ".join(pos_names)
            return f"Recommended mainly because of strong {pos_phrase}."
        elif neg_names:
            return (
                f"Selected as a viable pathway for {stack_title}. "
                f"Focusing on {neg_names[0]} represents the primary bridgeable growth area."
            )
        else:
            return (
                f"Recommended based on a balanced foundational match across engineering coursework "
                f"and declared interests for {stack_title}."
            )

    def explain_recommendation(
        self,
        student_data: Dict[str, Any],
        stack_code: Optional[str] = None,
        top_n: int = 5,
    ) -> Dict[str, Any]:
        """
        Primary interface matching frontend StackExplanation schema.
        Explains either the predicted top stack (default) or a user-selected target stack.
        Returns camelCase keys with topPositiveFactors (top 5) and topNegativeFactors (top 5).
        """
        if self.preprocessor is None:
            self.preprocessor = StudentDataPreprocessor()

        feature_vector = self.preprocessor.transform_single(student_data)
        features_2d = self.validate_feature_vector(feature_vector)
        feat_1d = features_2d[0]

        # Model predicted probabilities
        probabilities = self.model.predict_proba(features_2d)[0]

        # Determine target stack
        if not stack_code or stack_code not in self.classes:
            best_idx = int(np.argmax(probabilities))
            stack_code = self.classes[best_idx]

        class_idx = self.classes.index(stack_code)
        target_proba = float(probabilities[class_idx])
        base_val = self._extract_base_value(class_idx)

        # Compute SHAP values
        raw_shap = self.tree_explainer(features_2d)
        class_shap = self._extract_class_shap(raw_shap, class_idx)

        # Lookup catalog and mapping metadata
        meta = get_stack_metadata(stack_code)
        target_info = STACK_FEATURE_MAPPING.get(stack_code, STACK_FEATURE_MAPPING.get("MERN_FULL_STACK", {}))
        remedy_map = target_info.get("remedies", {})
        prereqs = target_info.get("prerequisites", [
            "Core Programming Foundations (OOP)",
            "Data Structures & Algorithms",
            "Command-Line & Version Control",
        ])

        # Separate positive and negative SHAP factors
        pos_factors_raw: List[Dict[str, Any]] = []
        neg_factors_raw: List[Dict[str, Any]] = []

        for f_idx, (f_name, s_val) in enumerate(zip(self.feature_names, class_shap)):
            s_val = float(s_val)
            f_val = float(feat_1d[f_idx])
            label = get_feature_label(f_name)
            category = self._categorize_feature(f_name)
            note = self._generate_factor_note(f_name, label, f_val, s_val, meta["title"])

            # Check remedy and boost
            remedy_tuple = remedy_map.get(f_name)
            remedy_elective = remedy_tuple[0] if remedy_tuple else None
            potential_boost = remedy_tuple[1] if remedy_tuple else (round(abs(s_val) * 100.0, 1) if s_val < 0 else None)

            factor_dict = {
                "feature": f_name,
                "featureName": f_name,
                "label": label,
                "displayName": label,
                "value": round(f_val, 4),
                "shapValue": round(s_val, 4),
                "shap_value": round(s_val, 4),
                "impactDirection": "POSITIVE" if s_val >= 0 else "NEGATIVE",
                "category": category,
                "explanationNote": note,
                "direction": "supports" if s_val >= 0 else "reduces",
                "remedyElective": remedy_elective,
                "potentialBoost": potential_boost,
            }

            if s_val >= 0:
                pos_factors_raw.append(factor_dict)
            else:
                neg_factors_raw.append(factor_dict)

        # Sort positive factors descending by shapValue (largest positive impact first)
        pos_factors_raw.sort(key=lambda x: x["shapValue"], reverse=True)
        # Sort negative factors ascending by shapValue (most negative impact first)
        neg_factors_raw.sort(key=lambda x: x["shapValue"])

        # Take top N of each
        top_positive = pos_factors_raw[:top_n]
        top_negative = neg_factors_raw[:top_n]

        # Generate summary text
        summary_text = self._build_summary_text(meta["title"], top_positive, top_negative)

        return {
            "recommendationId": meta["id"],
            "recommendationTitle": meta["title"],
            "stackCode": stack_code,
            "baseConfidence": round(base_val, 4),
            "predictedConfidence": round(target_proba, 4),
            "summaryText": summary_text,
            "topPositiveFactors": top_positive,
            "topNegativeFactors": top_negative,
            "learningPrerequisites": prereqs,
        }

    def explain_vector(
        self,
        feature_vector: Union[List[float], np.ndarray],
        top_k: int = 3,
        top_n_features: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Computes SHAP explanations for top-K recommended stacks given a raw 48-feature vector.
        Preserves backward compatibility with existing tests.
        """
        features_2d = self.validate_feature_vector(feature_vector)
        feat_1d = features_2d[0]

        probabilities = self.model.predict_proba(features_2d)[0]
        sorted_indices = np.argsort(probabilities)[::-1]
        top_k = min(top_k, len(self.classes))

        raw_shap = self.tree_explainer(features_2d)

        explanations = []
        for rank, class_idx in enumerate(sorted_indices[:top_k], start=1):
            stack_code = self.classes[class_idx]
            meta = get_stack_metadata(stack_code)
            class_shap = self._extract_class_shap(raw_shap, class_idx)
            base_val = self._extract_base_value(class_idx)

            sorted_feat_indices = np.argsort(np.abs(class_shap))[::-1]
            top_feat_indices = sorted_feat_indices[:top_n_features]

            top_contributions: List[Dict[str, Any]] = []
            for f_idx in top_feat_indices:
                f_name = self.feature_names[f_idx]
                f_val = float(feat_1d[f_idx])
                s_val = float(class_shap[f_idx])
                direction = "supports" if s_val >= 0.0 else "reduces"

                top_contributions.append({
                    "feature": f_name,
                    "label": get_feature_label(f_name),
                    "value": round(f_val, 4),
                    "shap_value": round(s_val, 4),
                    "direction": direction,
                })

            # Synthesize short summary
            supports = [f["label"] for f in top_contributions if f["direction"] == "supports"]
            reduces = [f["label"] for f in top_contributions if f["direction"] == "reduces"]
            if supports and reduces:
                summary = (
                    f"Recommended mainly because of strong {', '.join(supports[:2])}, "
                    f"though lower {reduces[0]} slightly reduces the match score."
                )
            elif supports:
                summary = f"Recommended mainly because of strong {', '.join(supports[:2])}."
            else:
                summary = f"Recommended based on balanced engineering coursework for {meta['title']}."

            explanations.append({
                "stack_code": stack_code,
                "rank": rank,
                "predicted_probability": round(float(probabilities[class_idx]), 4),
                "base_value": round(base_val, 4),
                "explanation": {
                    "summary": summary,
                    "top_features": top_contributions,
                },
            })

        return explanations

    def explain_student(
        self,
        student_data: Dict[str, Any],
        top_k: int = 3,
        top_n_features: int = 5,
    ) -> List[Dict[str, Any]]:
        """Transforms raw student profile dict and computes top-K SHAP explanations."""
        if self.preprocessor is None:
            self.preprocessor = StudentDataPreprocessor()
        feature_vector = self.preprocessor.transform_single(student_data)
        return self.explain_vector(feature_vector, top_k=top_k, top_n_features=top_n_features)

    def check_additivity(
        self,
        feature_vector: Union[List[float], np.ndarray],
        atol: float = 1e-4,
    ) -> bool:
        """
        Sanity test of SHAP additivity property:
        base_value + sum(shap_values) == model.predict_proba for every class.
        """
        features_2d = self.validate_feature_vector(feature_vector)
        predicted_probas = self.model.predict_proba(features_2d)[0]
        raw_shap = self.tree_explainer(features_2d)

        for c_idx, expected_proba in enumerate(predicted_probas):
            class_shap = self._extract_class_shap(raw_shap, c_idx)
            base_val = self._extract_base_value(c_idx)
            reconstructed = base_val + float(np.sum(class_shap))
            if abs(reconstructed - expected_proba) > atol:
                return False
        return True

    def get_global_feature_importance(
        self,
        dataset_path: Optional[Union[str, Path]] = None,
        top_n: int = 15,
    ) -> List[Dict[str, Any]]:
        """
        Computes global feature importance via mean absolute SHAP value across the dataset.
        Essential for research paper publication metrics and documentation.
        """
        path = Path(dataset_path) if dataset_path else DEFAULT_DATASET_PATH
        if not path.exists():
            raise FileNotFoundError(f"Dataset not found at {path}")

        df = pd.read_csv(path)
        # Check if df already has the 48 engineered features or needs preprocessing
        if all(col in df.columns for col in self.feature_names):
            X = df[self.feature_names].values.astype(np.float32)
        else:
            if self.preprocessor is None:
                self.preprocessor = StudentDataPreprocessor()
            X = self.preprocessor.transform(df)

        # Sample up to 100 records if dataset is large to keep calculation fast and responsive
        if len(X) > 100:
            np.random.seed(42)
            indices = np.random.choice(len(X), size=100, replace=False)
            X_sample = X[indices]
        else:
            X_sample = X

        # Use shap_values for robust array output
        raw_shap = self.tree_explainer.shap_values(X_sample)

        # Handle list vs 3D Explanation values
        if isinstance(raw_shap, list):
            # list of (n_samples, n_features) per class -> stack to (n_samples, n_features, n_classes)
            all_shaps = np.stack(raw_shap, axis=-1)
        elif hasattr(raw_shap, "values"):
            all_shaps = raw_shap.values
        else:
            all_shaps = np.asarray(raw_shap)

        # Mean absolute SHAP across samples and classes for each feature
        if all_shaps.ndim == 3:
            # (n_samples, n_features, n_classes)
            if all_shaps.shape[1] == len(self.feature_names):
                mean_abs = np.mean(np.abs(all_shaps), axis=(0, 2))
            else:
                mean_abs = np.mean(np.abs(all_shaps), axis=(0, 1))
        else:
            mean_abs = np.mean(np.abs(all_shaps), axis=0)

        sorted_indices = np.argsort(mean_abs)[::-1]
        ranking: List[Dict[str, Any]] = []
        for rank, idx in enumerate(sorted_indices[:top_n], start=1):
            f_name = self.feature_names[idx]
            ranking.append({
                "rank": rank,
                "feature": f_name,
                "label": get_feature_label(f_name),
                "meanAbsShap": round(float(mean_abs[idx]), 5),
            })

        return ranking


# Alias for backward compatibility with earlier naming
RecommendationExplainer = ShapExplainer
