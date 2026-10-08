"""
Preprocessor module for transforming raw student academic and technical profile data
into structured feature vectors for tech-stack recommendation model training and inference.
"""

from typing import Dict, List, Any, Union, Optional
import numpy as np
import pandas as pd

from .features import (
    ACADEMIC_COURSES,
    INTEREST_DOMAINS,
    TECHNICAL_SKILLS,
    SKILL_ALIASES,
    INTEREST_ALIASES,
    SKILL_LEVEL_WEIGHTS,
)


class StudentDataPreprocessor:
    """
    Transforms student ERP data, declared skills, and interest domains into
    normalized numerical feature vectors for the Random Forest model.
    """

    def __init__(self):
        self.academic_courses = ACADEMIC_COURSES
        self.interest_domains = INTEREST_DOMAINS
        self.technical_skills = TECHNICAL_SKILLS
        self._feature_names = self._build_feature_names()

    def _build_feature_names(self) -> List[str]:
        names = ["cgpa"]
        names.extend([f"course_{c}" for c in self.academic_courses])
        names.extend([f"interest_{i}" for i in self.interest_domains])
        names.extend([f"skill_{s}" for s in self.technical_skills])
        names.extend(["projects_completed", "certifications_count"])
        return names

    def get_feature_names(self) -> List[str]:
        """Returns the list of all feature names in the exact vector order."""
        return list(self._feature_names)

    @property
    def num_features(self) -> int:
        """Total number of engineered features."""
        return len(self._feature_names)

    def _canonicalize_skill(self, skill_name: str) -> Optional[str]:
        clean = str(skill_name).strip().lower()
        if clean in SKILL_ALIASES:
            clean = SKILL_ALIASES[clean]
        if clean in self.technical_skills:
            return clean
        return None

    def _canonicalize_interest(self, interest_name: str) -> Optional[str]:
        clean = str(interest_name).strip().lower()
        if clean in INTEREST_ALIASES:
            clean = INTEREST_ALIASES[clean]
        if clean in self.interest_domains:
            return clean
        return None

    def transform_single(self, student_data: Dict[str, Any]) -> np.ndarray:
        """
        Transforms a single student profile dictionary into a 1D numerical feature array.
        Handles missing keys gracefully with defensive defaults.
        """
        features: List[float] = []

        # 1. CGPA (normalized 0.0 to 1.0 from 0-10 scale)
        cgpa_raw = student_data.get("cgpa", 7.0)
        try:
            cgpa = float(cgpa_raw)
            cgpa = max(0.0, min(10.0, cgpa)) / 10.0
        except (ValueError, TypeError):
            cgpa = 0.70
        features.append(cgpa)

        # 2. Academic Course Scores (normalized 0.0 to 1.0 from 0-100 scale)
        academic_scores = student_data.get("academic_scores", {})
        if not isinstance(academic_scores, dict):
            academic_scores = {}

        for course in self.academic_courses:
            score_raw = academic_scores.get(course, student_data.get(f"{course}_score", 70.0))
            try:
                score = float(score_raw)
                score = max(0.0, min(100.0, score)) / 100.0
            except (ValueError, TypeError):
                score = 0.70
            features.append(score)

        # 3. Interest Domains (Binary 0.0 or 1.0)
        interests_input = student_data.get("interests", [])
        if isinstance(interests_input, str):
            interests_input = [item.strip() for item in interests_input.split(",") if item.strip()]
        elif not isinstance(interests_input, (list, tuple, set)):
            interests_input = []

        active_interests = set()
        for item in interests_input:
            canon = self._canonicalize_interest(item)
            if canon:
                active_interests.add(canon)

        for domain in self.interest_domains:
            features.append(1.0 if domain in active_interests else 0.0)

        # 4. Technical Skills (Weighted: 0.0=none, 1.0=beginner, 2.0=intermediate, 3.0=advanced)
        # Normalized by 3.0 to keep in [0, 1] range
        skills_input = student_data.get("skills", [])
        skill_weights: Dict[str, float] = {}

        if isinstance(skills_input, str):
            skills_input = [item.strip() for item in skills_input.split(",") if item.strip()]

        if isinstance(skills_input, (list, tuple, set)):
            for item in skills_input:
                if isinstance(item, dict):
                    name = item.get("name", "")
                    level = str(item.get("level", "intermediate")).strip().lower()
                    canon = self._canonicalize_skill(name)
                    if canon:
                        weight = SKILL_LEVEL_WEIGHTS.get(level, 1.5)
                        skill_weights[canon] = max(skill_weights.get(canon, 0.0), weight)
                elif isinstance(item, str):
                    canon = self._canonicalize_skill(item)
                    if canon:
                        skill_weights[canon] = max(skill_weights.get(canon, 0.0), 2.0)

        for skill in self.technical_skills:
            weight = skill_weights.get(skill, 0.0)
            normalized_weight = min(weight / 3.0, 1.0)
            features.append(normalized_weight)

        # 5. Experience & Attributes
        projects_raw = student_data.get("projects_completed", student_data.get("projects_count", 1))
        try:
            projects = float(projects_raw)
            projects_norm = max(0.0, min(10.0, projects)) / 10.0
        except (ValueError, TypeError):
            projects_norm = 0.1
        features.append(projects_norm)

        certs_raw = student_data.get("certifications_count", student_data.get("certifications", 0))
        try:
            certs = float(certs_raw)
            certs_norm = max(0.0, min(5.0, certs)) / 5.0
        except (ValueError, TypeError):
            certs_norm = 0.0
        features.append(certs_norm)

        return np.array(features, dtype=np.float32)

    def transform(self, data: Union[List[Dict[str, Any]], pd.DataFrame]) -> np.ndarray:
        """
        Transforms a collection of student profiles (list of dicts or DataFrame)
        into a 2D numpy array of shape (N, num_features).
        """
        if isinstance(data, pd.DataFrame):
            records = data.to_dict(orient="records")
        else:
            records = list(data)

        matrix = [self.transform_single(record) for record in records]
        return np.vstack(matrix)
