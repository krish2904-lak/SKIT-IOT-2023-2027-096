"""
Resume Feature Mapper and Manual Profile Merger.
Converts extracted resume competencies into the standardized 48-feature schema
and merges them with manual form inputs, enforcing the rule that manual inputs
win on any conflicts.
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import numpy as np

from model.preprocessing.preprocessor import StudentDataPreprocessor
from .schemas import ResumeExtractionResult, ExtractedSkill


def merge_resume_with_manual(
    extracted: ResumeExtractionResult,
    manual_profile: Optional[Dict[str, Any]] = None,
) -> Tuple[Dict[str, Any], Dict[str, float], np.ndarray]:
    """
    Merges resume extraction results with student manual profile input.
    Rule: Manual input wins on conflicts.
    
    Returns:
        merged_profile: Dictionary conforming to StudentProfileRequest
        mapped_features: Dict of {feature_name: value} across all 48 features
        feature_vector: Fixed-length 48-dimensional float32 NumPy array
    """
    preprocessor = StudentDataPreprocessor()
    manual = dict(manual_profile) if manual_profile else {}

    # 1. Merge Skills (Manual input wins on conflict)
    manual_skills = manual.get("skills", [])
    merged_skills: List[Dict[str, Any]] = []
    seen_skills: set = set()

    # First add all manual skills (they take precedence)
    for skill_item in manual_skills:
        if isinstance(skill_item, dict):
            s_name = str(skill_item.get("name", "")).strip().lower()
            s_level = str(skill_item.get("level", "intermediate")).strip().lower()
            s_source = skill_item.get("source", "SELF_REPORTED")
        else:
            s_name = str(skill_item).strip().lower()
            s_level = "intermediate"
            s_source = "SELF_REPORTED"

        if s_name and s_name not in seen_skills:
            seen_skills.add(s_name)
            merged_skills.append({
                "name": s_name,
                "level": s_level,
                "source": s_source,
            })

    # Next add resume skills ONLY if not already declared in manual input
    for r_skill in extracted.skills:
        if isinstance(r_skill, ExtractedSkill):
            r_name = r_skill.name.strip().lower()
            r_level = r_skill.level.strip().lower()
            r_source = r_skill.source or "RESUME_PARSED"
        elif isinstance(r_skill, dict):
            r_name = str(r_skill.get("name", "")).strip().lower()
            r_level = str(r_skill.get("level", "intermediate")).strip().lower()
            r_source = r_skill.get("source", "RESUME_PARSED")
        else:
            r_name = str(r_skill).strip().lower()
            r_level = "intermediate"
            r_source = "RESUME_PARSED"

        if r_name and r_name not in seen_skills:
            seen_skills.add(r_name)
            merged_skills.append({
                "name": r_name,
                "level": r_level,
                "source": "RESUME_PARSED",
            })

    # 2. Merge Interests / Domains (Combine unique domains, manual first)
    manual_interests = manual.get("interests", [])
    if isinstance(manual_interests, str):
        manual_interests = [i.strip() for i in manual_interests.split(",") if i.strip()]
    merged_interests = list(manual_interests)
    for domain in extracted.domains:
        if domain not in merged_interests:
            merged_interests.append(domain)

    # 3. Merge Projects Completed (Manual specified count > 0 wins, otherwise resume count)
    manual_projects = manual.get("projects_completed")
    if manual_projects is not None and int(manual_projects) > 0:
        projects_count = int(manual_projects)
    elif extracted.projects_count > 0:
        projects_count = min(10, extracted.projects_count)
    else:
        projects_count = 1

    # 4. Merge Certifications Count (Manual specified count > 0 wins, otherwise resume count)
    manual_certs = manual.get("certifications_count")
    if manual_certs is not None and int(manual_certs) > 0:
        certs_count = int(manual_certs)
    elif extracted.certifications_count > 0:
        certs_count = min(5, extracted.certifications_count)
    else:
        certs_count = 0

    # 5. ERP Academic Scores (Always derived from manual/ERP payload)
    academic_scores = manual.get("academic_scores", {
        "web_technologies": 70.0,
        "dbms": 70.0,
        "dsa": 70.0,
        "iot_embedded": 70.0,
        "ml_math": 70.0,
        "cloud_computing": 70.0,
        "operating_systems": 70.0,
    })
    cgpa = manual.get("cgpa", 7.5)

    merged_profile: Dict[str, Any] = {
        "student_id": manual.get("student_id", "SKIT/STUDENT/RESUME-INGEST"),
        "branch": manual.get("branch", "CSE (IoT)"),
        "semester": manual.get("semester", 6),
        "cgpa": cgpa,
        "academic_scores": academic_scores,
        "skills": merged_skills,
        "interests": merged_interests,
        "projects_completed": projects_count,
        "certifications_count": certs_count,
        "top_k": manual.get("top_k", 3),
        "resume_uploaded": True,
        "experience_level": extracted.experience_level,
    }

    # Transform to 48-feature vector
    feature_vector = preprocessor.transform_single(merged_profile)
    feature_names = preprocessor.get_feature_names()
    mapped_features = {
        feat_name: round(float(val), 4)
        for feat_name, val in zip(feature_names, feature_vector)
    }

    return merged_profile, mapped_features, feature_vector
