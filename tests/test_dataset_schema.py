import pytest
from typing import Dict, Any, List

class TestDatasetSchema:
    """Test suite for validating dataset structure, invariants, and boundaries."""

    REQUIRED_ERP_FIELDS = [
        "student_id", "sgpa_sem1", "sgpa_sem2", "sgpa_sem3", "sgpa_sem4",
        "cgpa", "attendance_percentage", "dsa_marks", "dbms_marks", "os_marks", "cn_marks"
    ]

    REQUIRED_STUDENT_FIELDS = [
        "student_id", "domain_interests", "technical_skills",
        "certifications_count", "github_projects_count"
    ]

    def test_erp_record_schema_contains_required_fields(self, sample_erp_record: Dict[str, Any]):
        """Verify that all required ERP academic fields exist."""
        for field in self.REQUIRED_ERP_FIELDS:
            assert field in sample_erp_record, f"Missing required ERP field: {field}"

    def test_academic_score_boundaries(self, sample_erp_record: Dict[str, Any]):
        """Verify academic grades and marks fall within legitimate ranges."""
        # SGPA & CGPA range: [0.0, 10.0]
        for sem in [1, 2, 3, 4]:
            sgpa = sample_erp_record[f"sgpa_sem{sem}"]
            assert 0.0 <= sgpa <= 10.0, f"SGPA for sem {sem} out of range: {sgpa}"
        
        assert 0.0 <= sample_erp_record["cgpa"] <= 10.0, "CGPA out of range [0, 10]"

        # Attendance range: [0.0, 100.0]
        assert 0.0 <= sample_erp_record["attendance_percentage"] <= 100.0

        # Course marks range: [0, 100]
        for course in ["dsa_marks", "dbms_marks", "os_marks", "cn_marks"]:
            marks = sample_erp_record[course]
            assert 0 <= marks <= 100, f"Course marks for {course} out of range: {marks}"

    def test_student_input_schema_types(self, sample_student_input: Dict[str, Any]):
        """Verify types and bounds for student preferences and skills."""
        for field in self.REQUIRED_STUDENT_FIELDS:
            assert field in sample_student_input, f"Missing required student field: {field}"

        assert isinstance(sample_student_input["domain_interests"], list)
        assert len(sample_student_input["domain_interests"]) > 0, "Domain interests must not be empty"

        assert isinstance(sample_student_input["technical_skills"], dict)
        for skill, weight in sample_student_input["technical_skills"].items():
            assert isinstance(skill, str)
            assert 0.0 <= weight <= 1.0, f"Skill weight for {skill} must be in [0.0, 1.0]"

        assert sample_student_input["certifications_count"] >= 0
        assert sample_student_input["github_projects_count"] >= 0

    def test_target_tech_stack_classification_classes(self, expected_tech_stacks: List[str]):
        """Verify all 7 target technology stack classes are defined and unique."""
        assert len(expected_tech_stacks) == 7
        assert len(set(expected_tech_stacks)) == 7, "Duplicate tech stack category detected"
        assert "Full-Stack Web Development" in expected_tech_stacks
        assert "AI & Machine Learning" in expected_tech_stacks
        assert "Cloud Computing & DevOps" in expected_tech_stacks
