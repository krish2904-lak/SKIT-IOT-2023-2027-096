"""
Resume Feature Mapper and Manual Profile Merger.
Converts extracted resume competencies into the standardized 48-feature schema
and merges them with manual form inputs, enforcing the rule that student manual inputs
strictly take precedence over resume-extracted values.

Provides confidence per feature field:
- Form entered (manual) values: 1.0 confidence
- Resume extracted values: 0.75 - 0.90 confidence
- Pipeline imputed default values: 0.0 confidence
"""

from typing import Dict, Any, List, Optional, Tuple, Set
import numpy as np

from model.preprocessing.preprocessor import StudentDataPreprocessor
from .schemas import ResumeExtractionResult, ExtractedSkill


class ResumeFeatureMapper:
    """
    Maps extracted resume information to the 48-dimensional feature vector,
    resolving conflicts with student manual profile input and computing per-feature confidences.
    """

    def __init__(self):
        self.preprocessor = StudentDataPreprocessor()
        self.feature_names = self.preprocessor.get_feature_names()

    def merge_and_map(
        self,
        extracted: ResumeExtractionResult,
        manual_profile: Optional[Dict[str, Any]] = None,
    ) -> Tuple[Dict[str, Any], Dict[str, float], Dict[str, float], np.ndarray]:
        """
        Merges resume extraction results with manual student inputs.
        
        Returns:
            merged_profile: Dictionary structured for TechStackPredictor
            mapped_features: Dict of {feature_name: normalized_value} across 48 features
            confidences: Dict of {feature_name: confidence_score} in [0.0, 1.0]
            feature_vector: Fixed 48-dimensional float32 NumPy array
        """
        manual = dict(manual_profile) if manual_profile else {}
        confidences: Dict[str, float] = {f: 0.0 for f in self.feature_names}

        # -------------------------------------------------------------
        # 1. CGPA: Manual wins; then Resume hint; then pipeline default (7.0)
        # -------------------------------------------------------------
        if manual.get("cgpa") is not None:
            cgpa = float(manual["cgpa"])
            confidences["cgpa"] = 1.0
        elif extracted.cgpa_hint is not None:
            cgpa = float(extracted.cgpa_hint)
            confidences["cgpa"] = 0.80
        else:
            cgpa = 7.0
            confidences["cgpa"] = 0.0

        # -------------------------------------------------------------
        # 2. Academic Scores (ERP): Manual wins; else pipeline default (70.0)
        # -------------------------------------------------------------
        manual_academic = manual.get("academic_scores", {})
        if not isinstance(manual_academic, dict):
            manual_academic = {}

        academic_scores: Dict[str, float] = {}
        for course in self.preprocessor.academic_courses:
            f_name = f"course_{course}"
            if course in manual_academic:
                academic_scores[course] = float(manual_academic[course])
                confidences[f_name] = 1.0
            elif manual.get(f"{course}_score") is not None:
                academic_scores[course] = float(manual[f"{course}_score"])
                confidences[f_name] = 1.0
            else:
                academic_scores[course] = 70.0
                confidences[f_name] = 0.0

        # -------------------------------------------------------------
        # 3. Technical Skills: Manual wins on conflict; resume fills missing
        # -------------------------------------------------------------
        manual_skills = manual.get("skills", [])
        merged_skills: List[Dict[str, Any]] = []
        seen_skills: Set[str] = set()

        # Add manual skills (confidence = 1.0)
        if isinstance(manual_skills, (list, tuple, set)):
            for item in manual_skills:
                if isinstance(item, dict):
                    s_name = str(item.get("name", "")).strip().lower()
                    s_level = str(item.get("level", "intermediate")).strip().lower()
                    s_source = item.get("source", "SELF_REPORTED")
                else:
                    s_name = str(item).strip().lower()
                    s_level = "intermediate"
                    s_source = "SELF_REPORTED"

                canon = self.preprocessor._canonicalize_skill(s_name)
                if canon and canon not in seen_skills:
                    seen_skills.add(canon)
                    merged_skills.append({
                        "name": canon,
                        "level": s_level,
                        "source": s_source,
                    })
                    confidences[f"skill_{canon}"] = 1.0

        # Add resume extracted skills (confidence = skill.confidence)
        for r_skill in extracted.skills:
            if isinstance(r_skill, ExtractedSkill):
                r_name = r_skill.name.strip().lower()
                r_level = r_skill.level.strip().lower()
                r_source = r_skill.source or "RESUME_EXTRACTED"
                r_conf = r_skill.confidence
            elif isinstance(r_skill, dict):
                r_name = str(r_skill.get("name", "")).strip().lower()
                r_level = str(r_skill.get("level", "intermediate")).strip().lower()
                r_source = r_skill.get("source", "RESUME_EXTRACTED")
                r_conf = float(r_skill.get("confidence", 0.85))
            else:
                r_name = str(r_skill).strip().lower()
                r_level = "intermediate"
                r_source = "RESUME_EXTRACTED"
                r_conf = 0.85

            canon = self.preprocessor._canonicalize_skill(r_name)
            if canon and canon not in seen_skills:
                seen_skills.add(canon)
                merged_skills.append({
                    "name": canon,
                    "level": r_level,
                    "source": r_source,
                })
                confidences[f"skill_{canon}"] = r_conf

        # -------------------------------------------------------------
        # 4. Domain Interests: Manual wins / combined; manual takes precedence
        # -------------------------------------------------------------
        manual_interests = manual.get("interests", [])
        if isinstance(manual_interests, str):
            manual_interests = [i.strip() for i in manual_interests.split(",") if i.strip()]
        elif not isinstance(manual_interests, (list, tuple, set)):
            manual_interests = []

        merged_interests: List[str] = []
        for mi in manual_interests:
            canon = self.preprocessor._canonicalize_interest(mi)
            if canon and canon not in merged_interests:
                merged_interests.append(canon)
                confidences[f"interest_{canon}"] = 1.0

        for r_dom in extracted.domains:
            canon = self.preprocessor._canonicalize_interest(r_dom)
            if canon and canon not in merged_interests:
                merged_interests.append(canon)
                confidences[f"interest_{canon}"] = 0.80

        # -------------------------------------------------------------
        # 5. Projects Completed: Manual count > 0 wins; else resume; else default 1
        # -------------------------------------------------------------
        manual_projects = manual.get("projects_completed")
        if manual_projects is not None and int(manual_projects) > 0:
            projects_completed = int(manual_projects)
            confidences["projects_completed"] = 1.0
        elif extracted.projects_count > 0:
            projects_completed = min(10, extracted.projects_count)
            confidences["projects_completed"] = 0.80
        else:
            projects_completed = 1
            confidences["projects_completed"] = 0.0

        # -------------------------------------------------------------
        # 6. Certifications Count: Manual count > 0 wins; else resume; else default 0
        # -------------------------------------------------------------
        manual_certs = manual.get("certifications_count")
        if manual_certs is not None and int(manual_certs) > 0:
            certifications_count = int(manual_certs)
            confidences["certifications_count"] = 1.0
        elif extracted.certifications_count > 0:
            certifications_count = min(5, extracted.certifications_count)
            confidences["certifications_count"] = 0.80
        else:
            certifications_count = 0
            confidences["certifications_count"] = 0.0

        # -------------------------------------------------------------
        # 7. Build merged profile dictionary
        # -------------------------------------------------------------
        merged_profile: Dict[str, Any] = {
            "student_id": manual.get("student_id", "STU-RESUME-EXTRACTED"),
            "cgpa": cgpa,
            "academic_scores": academic_scores,
            "interests": merged_interests,
            "skills": merged_skills,
            "projects_completed": projects_completed,
            "certifications_count": certifications_count,
        }

        # -------------------------------------------------------------
        # 8. Transform to 48-feature vector using StudentDataPreprocessor
        # -------------------------------------------------------------
        feature_vector = self.preprocessor.transform_single(merged_profile)
        mapped_features: Dict[str, float] = {
            name: round(float(val), 4)
            for name, val in zip(self.feature_names, feature_vector)
        }

        return merged_profile, mapped_features, confidences, feature_vector


def merge_resume_with_manual(
    extracted: ResumeExtractionResult,
    manual_profile: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, Any], Dict[str, float], np.ndarray]:
    """
    Compatibility wrapper returning (merged_profile, mapped_features, feature_vector).
    """
    mapper = ResumeFeatureMapper()
    merged_profile, mapped_features, _, feature_vector = mapper.merge_and_map(
        extracted, manual_profile
    )
    return merged_profile, mapped_features, feature_vector
