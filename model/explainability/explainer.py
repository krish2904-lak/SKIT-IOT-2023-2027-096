"""
SHAP-based Explainability Module for the Tech-Stack Recommendation Model.
Utilizes shap.TreeExplainer to compute exact feature attributions for multi-class
Random Forest recommendations, producing sorted feature contributions and
plain-language explanation summaries.
"""

from pathlib import Path
from typing import Dict, Any, List, Optional, Union
import time
import joblib
import numpy as np
import shap

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.recommendation.tech_stacks import get_stack_metadata
from .labels import get_feature_label

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_DIR = BASE_DIR / "model" / "saved_models"


class RecommendationExplainer:
    """
    Production-ready TreeSHAP explainer for Tech-Stack Recommendations.
    Caches shap.TreeExplainer in memory and generates deterministic,
    sub-millisecond explanations for student feature vectors.
    """

    _instance: Optional["RecommendationExplainer"] = None

    def __init__(self, model_dir: Optional[Path] = None):
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
    def get_instance(cls, model_dir: Optional[Path] = None) -> "RecommendationExplainer":
        """Singleton accessor to ensure TreeExplainer is compiled and cached once."""
        if cls._instance is None:
            cls._instance = cls(model_dir)
        return cls._instance

    def _load_and_initialize(self) -> None:
        """Loads serialized model artifacts and initializes shap.TreeExplainer."""
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model file not found at {self.model_path}. Train the model first."
            )

        artifacts = joblib.load(self.model_path)
        self.model = artifacts["model"]
        self.classes = artifacts["classes"]
        self.feature_names = artifacts.get("feature_names", [])

        if self.preprocessor_path.exists():
            self.preprocessor = joblib.load(self.preprocessor_path)
        else:
            self.preprocessor = StudentDataPreprocessor()

        # Build and cache TreeExplainer
        self.tree_explainer = shap.TreeExplainer(self.model)

    def validate_feature_vector(self, feature_vector: Union[List[float], np.ndarray]) -> np.ndarray:
        """
        Validates feature vector length and shape against model expectations.
        Raises ValueError with a clear, actionable message if invalid.
        """
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
        Robustly extracts the 1D SHAP attribution array for a target class,
        handling differences across SHAP versions (list of arrays vs 3D ndarray).
        """
        if isinstance(raw_shap, list):
            arr = raw_shap[class_idx]
            return arr[0] if arr.ndim > 1 else arr

        # shap.Explanation object
        if hasattr(raw_shap, "values"):
            values = raw_shap.values
        else:
            values = np.asarray(raw_shap)

        if values.ndim == 3:
            # Shape is either (n_samples, n_features, n_classes) or (n_samples, n_classes, n_features)
            if values.shape[2] == len(self.classes):
                return values[0, :, class_idx]
            elif values.shape[1] == len(self.classes):
                return values[0, class_idx, :]
            else:
                raise ValueError(f"Unexpected SHAP 3D array shape: {values.shape}")
        elif values.ndim == 2:
            return values[0]
        else:
            raise ValueError(f"Unexpected SHAP array dimension: {values.ndim}")

    def _extract_base_value(self, class_idx: int) -> float:
        """Extracts expected base value for a class."""
        base_vals = self.tree_explainer.expected_value
        if isinstance(base_vals, (list, np.ndarray)):
            return float(base_vals[class_idx])
        return float(base_vals)

    def _build_summary_text(
        self,
        stack_title: str,
        top_features: List[Dict[str, Any]],
    ) -> str:
        """Synthesizes a short, human-friendly explanation summary using templates."""
        supports = [f["label"] for f in top_features if f["direction"] == "supports"]
        reduces = [f["label"] for f in top_features if f["direction"] == "reduces"]

        if supports and reduces:
            top_sup_str = ", ".join(supports[:2])
            if len(supports) > 2:
                top_sup_str += f" and {supports[2]}"
            return (
                f"Recommended mainly because of strong {top_sup_str}, "
                f"though lower {reduces[0]} slightly reduces the match score."
            )
        elif supports:
            if len(supports) == 1:
                return f"Recommended mainly because of strong {supports[0]}."
            elif len(supports) == 2:
                return f"Recommended mainly because of strong {supports[0]} and {supports[1]}."
            else:
                return (
                    f"Recommended mainly because of strong {supports[0]}, "
                    f"{supports[1]}, and {supports[2]}."
                )
        else:
            return (
                f"Recommended based on a balanced match across foundational engineering "
                f"coursework for {stack_title}."
            )

    def explain_vector(
        self,
        feature_vector: Union[List[float], np.ndarray],
        top_k: int = 3,
        top_n_features: int = 5,
    ) -> List[Dict[str, Any]]:
        """
        Computes SHAP explanations for top-K recommended stacks given a 48-length feature vector.
        Returns a list of explanation objects conforming to the project data contracts.
        """
        features_2d = self.validate_feature_vector(feature_vector)
        feat_1d = features_2d[0]

        # Model inference probabilities
        probabilities = self.model.predict_proba(features_2d)[0]
        sorted_indices = np.argsort(probabilities)[::-1]
        top_k = min(top_k, len(self.classes))

        # Compute SHAP values
        raw_shap = self.tree_explainer(features_2d)

        explanations = []
        for rank, class_idx in enumerate(sorted_indices[:top_k], start=1):
            stack_code = self.classes[class_idx]
            meta = get_stack_metadata(stack_code)
            class_shap = self._extract_class_shap(raw_shap, class_idx)
            base_val = self._extract_base_value(class_idx)

            # Sort features by absolute SHAP impact descending
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

            summary = self._build_summary_text(meta["title"], top_contributions)

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
        """Transforms raw student profile dictionary and computes SHAP explanations."""
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
