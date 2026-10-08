"""
Inference and prediction interface for the Tech-Stack Recommendation System.
Loads serialized Random Forest model and preprocessor to generate ranked,
explainable technology stack recommendations for student profiles.
"""

import datetime
from pathlib import Path
from typing import Dict, Any, List, Optional
import joblib
import numpy as np

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.recommendation.tech_stacks import get_stack_metadata, TECH_STACK_CATALOG

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_MODEL_DIR = BASE_DIR / "model" / "saved_models"


class TechStackPredictor:
    """
    Production-ready predictor that loads the trained Random Forest model
    and exposes a clean interface for tech-stack recommendations.
    """

    _instance: Optional["TechStackPredictor"] = None

    def __init__(self, model_dir: Optional[Path] = None):
        self.model_dir = Path(model_dir) if model_dir else DEFAULT_MODEL_DIR
        self.model_path = self.model_dir / "rf_tech_stack_model.joblib"
        self.preprocessor_path = self.model_dir / "preprocessor.joblib"
        self.metadata_path = self.model_dir / "model_metadata.json"

        self.model = None
        self.classes: List[str] = []
        self.feature_names: List[str] = []
        self.preprocessor: Optional[StudentDataPreprocessor] = None
        self.metadata: Dict[str, Any] = {}

        self._load_artifacts()

    @classmethod
    def get_instance(cls, model_dir: Optional[Path] = None) -> "TechStackPredictor":
        """Singleton accessor to prevent reloading the model on every inference call."""
        if cls._instance is None:
            cls._instance = cls(model_dir)
        return cls._instance

    def _load_artifacts(self) -> None:
        """Loads serialized model, preprocessor, and metadata from disk, auto-training if missing."""
        if not self.model_path.exists():
            print(f"[TechStackPredictor] Model artifact not found at {self.model_path}. Triggering initial training...")
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

        if self.metadata_path.exists():
            import json
            with open(self.metadata_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def _generate_reason_snippet(
        self,
        stack_code: str,
        student_data: Dict[str, Any],
        raw_features: np.ndarray,
    ) -> str:
        """Generates an intuitive reasoning snippet for the recommendation."""
        academic_scores = student_data.get("academic_scores", {})
        if not isinstance(academic_scores, dict):
            academic_scores = {}

        skills = student_data.get("skills", [])
        extracted_skills = []
        if isinstance(skills, list):
            for s in skills:
                if isinstance(s, dict):
                    extracted_skills.append(s.get("name", "").lower())
                elif isinstance(s, str):
                    extracted_skills.append(s.lower())

        if stack_code == "IOT_EMBEDDED_SYSTEMS":
            iot_mark = academic_scores.get("iot_embedded", 70)
            return f"Strong alignment with IoT/hardware coursework ({iot_mark}/100) and embedded development background."
        elif stack_code == "MERN_FULL_STACK":
            web_mark = academic_scores.get("web_technologies", 70)
            return f"High synergy with Web Technologies marks ({web_mark}/100) and frontend/backend development preferences."
        elif stack_code == "AI_ML_ENGINEERING":
            ml_mark = academic_scores.get("ml_math", 70)
            return f"Exceptional match with Mathematical/ML foundations ({ml_mark}/100) and Python analytical interests."
        elif stack_code == "CLOUD_DEVOPS":
            cloud_mark = academic_scores.get("cloud_computing", 70)
            return f"Built upon Cloud & Operating Systems aptitude ({cloud_mark}/100) and containerization tools."
        elif stack_code == "MOBILE_APP_DEV":
            dsa_mark = academic_scores.get("dsa", 70)
            return f"Leverages your Algorithm fundamentals ({dsa_mark}/100) toward native & cross-platform app ecosystems."
        elif stack_code == "DATA_ANALYTICS":
            db_mark = academic_scores.get("dbms", 70)
            return f"Grounded in DBMS coursework ({db_mark}/100) and relational database query proficiencies."
        elif stack_code == "CYBERSECURITY":
            os_mark = academic_scores.get("operating_systems", 70)
            return f"Correlates with Operating Systems expertise ({os_mark}/100) and network security interests."
        else:
            return "Recommended based on holistic student academic records and self-reported skills."

    def predict_for_student(
        self,
        student_data: Dict[str, Any],
        top_k: int = 3,
    ) -> Dict[str, Any]:
        """
        Generates top-K ranked tech-stack recommendations for a given student profile.
        Returns payload conforming to frontend RecommendationItem data contracts.
        """
        if self.model is None or self.preprocessor is None:
            raise RuntimeError("Model or preprocessor is not loaded.")

        # Transform raw student inputs to feature vector
        feature_vector = self.preprocessor.transform_single(student_data)
        features_2d = feature_vector.reshape(1, -1)

        # Get class prediction probabilities
        probabilities = self.model.predict_proba(features_2d)[0]

        # Sort indices by probability descending
        sorted_indices = np.argsort(probabilities)[::-1]

        recommendations = []
        top_k = min(top_k, len(self.classes))

        for rank, idx in enumerate(sorted_indices[:top_k], start=1):
            stack_code = self.classes[idx]
            prob = float(probabilities[idx])
            # Match score scaled to percentage (clamped 10.0% to 98.5% for natural UI display)
            match_score = round(min(98.5, max(15.0, prob * 100.0)), 1)

            meta = get_stack_metadata(stack_code)
            reason = self._generate_reason_snippet(stack_code, student_data, feature_vector)

            rec_item = {
                "id": meta["id"],
                "stack_code": stack_code,
                "title": meta["title"],
                "category": meta["category"],
                "matchScore": match_score,
                "difficulty": meta["difficulty"],
                "estimatedTimeToLearn": meta["estimated_time_to_learn"],
                "targetRoles": meta["target_roles"],
                "technologies": meta["technologies"],
                "whyRecommendedSnippet": reason,
                "rank": rank,
            }
            recommendations.append(rec_item)

        # Top influential features for this profile (prep for Sprint 4 explainability)
        feature_names = self.preprocessor.get_feature_names()
        non_zero_features = []
        for name, val in zip(feature_names, feature_vector):
            if val > 0.0:
                non_zero_features.append({"feature": name, "value": round(float(val), 2)})

        student_id = student_data.get("student_id", "ANONYMOUS_STUDENT")

        return {
            "student_id": student_id,
            "model_version": self.metadata.get("model_version", "1.0.0-rf"),
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            "primary_recommendation": recommendations[0] if recommendations else None,
            "alternative_recommendations": recommendations[1:] if len(recommendations) > 1 else [],
            "all_ranked_stacks": recommendations,
            "active_student_features": non_zero_features[:10],
        }

    def predict_batch(
        self,
        students: List[Dict[str, Any]],
        top_k: int = 3,
    ) -> List[Dict[str, Any]]:
        """Batch inference for multiple student records."""
        return [self.predict_for_student(s, top_k=top_k) for s in students]
