"""
Automated QA & Validation Suite for Resume Feature Mapping & Conflict Resolution
Author: Saloni Jain (Data & Testing Lead)
Project: AI-Based Tech-Stack Recommendation with ERP Integration (SKIT-IOT-2023-2027-096)
Sprint: Sprint 3 / Week 8 Deliverable
"""

from typing import Dict, Any, List

try:
    import pytest
except ImportError:
    pytest = None

from model.preprocessing.preprocessor import StudentDataPreprocessor
from app.resume.schemas import ResumeExtractionResult, ExtractedSkill
from app.resume.mapper import merge_resume_with_manual
from model.recommendation.tech_stacks import TECH_STACK_CATALOG


class TestResumeMappingQA:
    """
    Quality assurance suite for resume feature mapping, taxonomy alignment,
    48-dimensional vector invariance, and the 'Manual Wins' conflict resolution rule.
    """

    def setUp(self):
        self.preprocessor = StudentDataPreprocessor()
        self.canonical_features = self.preprocessor.get_feature_names()

    def test_canonical_taxonomy_mapping_and_48d_invariance(self):
        """Validates that resume competencies map into a strictly 48-dimensional bounded feature vector."""
        extracted = ResumeExtractionResult(
            skills=[
                ExtractedSkill(name="python", level="advanced", source="RESUME_PARSED"),
                ExtractedSkill(name="docker", level="intermediate", source="RESUME_PARSED"),
                ExtractedSkill(name="react", level="intermediate", source="RESUME_PARSED"),
                ExtractedSkill(name="aws", level="beginner", source="RESUME_PARSED"),
            ],
            domains=["cloud_devops", "full_stack"],
            projects=["Cloud Microservice Deployment with Docker"],
            projects_count=3,
            certifications_count=1,
            experience_level="intermediate",
            extraction_method="deterministic_fallback"
        )

        merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
            extracted=extracted,
            manual_profile=None
        )

        # Invariant 1: Fixed 48-dimensional float32 vector
        assert len(feature_vector) == 48, f"Expected 48-dimensional vector, got {len(feature_vector)}"
        assert len(mapped_features) == 48, f"Expected 48 mapped features, got {len(mapped_features)}"

        # Invariant 2: Schema key consistency
        for feature_name in self.canonical_features:
            assert feature_name in mapped_features, f"Missing canonical feature: '{feature_name}'"
            val = mapped_features[feature_name]
            assert 0.0 <= val <= 1.0, f"Feature '{feature_name}' value {val} out of bounds [0.0, 1.0]"

    def test_manual_wins_conflict_resolution_invariant(self):
        """Enforces that manually entered student inputs strictly supersede resume-parsed skills."""
        manual_profile = {
            "student_id": "STU-SALONI-096",
            "branch": "CSE (IoT)",
            "cgpa": 8.75,
            "skills": [
                {"name": "python", "level": "expert", "source": "SELF_REPORTED"},
                {"name": "sql", "level": "advanced", "source": "SELF_REPORTED"}
            ],
            "interests": ["data_science"],
            "projects_completed": 4,
            "certifications_count": 2
        }

        # Conflicting resume extraction (lower level for python, different source)
        extracted = ResumeExtractionResult(
            skills=[
                ExtractedSkill(name="python", level="intermediate", source="RESUME_PARSED"),  # Conflict
                ExtractedSkill(name="docker", level="intermediate", source="RESUME_PARSED"),  # Novel skill
                ExtractedSkill(name="kubernetes", level="beginner", source="RESUME_PARSED")   # Novel skill
            ],
            domains=["cloud_devops"],
            projects_count=2,
            certifications_count=1,
            experience_level="intermediate",
            extraction_method="deterministic_fallback"
        )

        merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
            extracted=extracted,
            manual_profile=manual_profile
        )

        merged_skills = merged_profile["skills"]
        skill_map = {s["name"]: s for s in merged_skills}

        # Assertion 1: Python level and source preserved from manual input (Manual Wins)
        assert "python" in skill_map
        assert skill_map["python"]["level"] == "expert", "Manual skill level was overwritten by resume!"
        assert skill_map["python"]["source"] == "SELF_REPORTED", "Manual skill source was overwritten!"

        # Assertion 2: Novel skills from resume merged with RESUME_PARSED
        assert "docker" in skill_map
        assert skill_map["docker"]["source"] == "RESUME_PARSED"
        assert "kubernetes" in skill_map
        assert skill_map["kubernetes"]["source"] == "RESUME_PARSED"

        # Assertion 3: Combined unique interests/domains
        assert "data_science" in merged_profile["interests"]
        assert "cloud_devops" in merged_profile["interests"]

    def test_erp_academic_score_preservation_invariant(self):
        """Verifies student verified ERP academic scores cannot be diluted by resume contents."""
        manual_profile = {
            "student_id": "STU-VERIFIED-096",
            "cgpa": 9.25,
            "academic_scores": {
                "web_technologies": 91.0,
                "dbms": 89.0,
                "dsa": 94.0,
                "iot_embedded": 85.0,
                "ml_math": 92.0,
                "cloud_computing": 88.0,
                "operating_systems": 90.0,
            }
        }

        extracted = ResumeExtractionResult(
            skills=[ExtractedSkill(name="python", level="intermediate", source="RESUME_PARSED")],
            domains=["ai_ml"],
            projects_count=1,
            certifications_count=0,
            experience_level="beginner",
            extraction_method="deterministic_fallback"
        )

        merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
            extracted=extracted,
            manual_profile=manual_profile
        )

        # ERP fields strictly preserved
        assert merged_profile["cgpa"] == 9.25
        assert merged_profile["academic_scores"]["dsa"] == 94.0
        assert merged_profile["academic_scores"]["ml_math"] == 92.0

        # Mapped normalized feature reflects academic strength (94 / 100 = 0.94)
        assert mapped_features["course_dsa"] == 0.94
        assert mapped_features["course_ml_math"] == 0.92

    def test_sparse_and_empty_resume_fallback_resilience(self):
        """Validates that completely empty or non-technical resumes produce safe default feature vectors."""
        empty_extraction = ResumeExtractionResult(
            skills=[],
            domains=[],
            projects=[],
            projects_count=0,
            certifications_count=0,
            experience_level="beginner",
            extraction_method="deterministic_fallback"
        )

        merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
            extracted=empty_extraction,
            manual_profile=None
        )

        # Must produce valid vector with zero NaNs or infinities
        assert len(feature_vector) == 48
        assert not any(val is None or val != val for val in feature_vector)
        assert merged_profile["resume_uploaded"] is True
        assert len(merged_profile["skills"]) == 0

    def test_end_to_end_prediction_compatibility_with_merged_profile(self):
        """Validates that merged profile payload conforms directly to inference and roadmap expectations."""
        extracted = ResumeExtractionResult(
            skills=[
                ExtractedSkill(name="react", level="advanced", source="RESUME_PARSED"),
                ExtractedSkill(name="nodejs", level="advanced", source="RESUME_PARSED"),
                ExtractedSkill(name="mongodb", level="intermediate", source="RESUME_PARSED"),
            ],
            domains=["web_development"],
            projects=["Full-Stack E-Commerce Portal with MERN Stack"],
            projects_count=2,
            certifications_count=1,
            experience_level="intermediate",
            extraction_method="deterministic_fallback"
        )

        merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
            extracted=extracted,
            manual_profile={"student_id": "STU-MERN-096", "branch": "CSE (IoT)", "top_k": 3}
        )

        # Contract assertions matching recommendation engine API
        assert merged_profile["top_k"] == 3
        assert "MERN_FULL_STACK" in TECH_STACK_CATALOG
        stack_meta = TECH_STACK_CATALOG["MERN_FULL_STACK"]
        assert "roadmap" in stack_meta
        assert len(stack_meta["roadmap"]) == 3
        for phase in stack_meta["roadmap"]:
            assert "topics" in phase
            assert len(phase["topics"]) >= 2
