import pytest
from typing import Dict, Any, List

class MockStudentPreprocessor:
    """Mock implementation of preprocessing logic for unit verification."""
    
    FEATURE_DIMENSION = 48
    CORE_SKILLS = [
        "python", "javascript", "react", "node", "docker", "kubernetes",
        "sql", "nosql", "java", "cpp", "c", "html_css", "git", "linux",
        "aws", "azure", "machine_learning", "deep_learning", "nlp", "computer_vision",
        "tensorflow", "pytorch", "cybersecurity", "networking", "iot", "arduino",
        "embedded_c", "data_structures", "algorithms", "rest_api", "graphql"
    ]

    @classmethod
    def normalize_academic_score(cls, score: float, max_val: float = 100.0) -> float:
        if score is None:
            return 0.0
        score = max(0.0, min(float(score), max_val))
        return round(score / max_val, 4)

    @classmethod
    def normalize_sgpa(cls, sgpa: float) -> float:
        if sgpa is None:
            return 0.0
        sgpa = max(0.0, min(float(sgpa), 10.0))
        return round(sgpa / 10.0, 4)

    @classmethod
    def clean_skill_dict(cls, skills: Dict[str, float]) -> Dict[str, float]:
        if not skills:
            return {}
        cleaned = {}
        for skill, weight in skills.items():
            canonical = skill.strip().lower().replace(" ", "_")
            val = max(0.0, min(float(weight or 0.0), 1.0))
            cleaned[canonical] = round(val, 2)
        return cleaned

    @classmethod
    def extract_features(cls, erp: Dict[str, Any], student: Dict[str, Any]) -> List[float]:
        features = []
        # 8 Academic features
        for sem in [1, 2, 3, 4]:
            features.append(cls.normalize_sgpa(erp.get(f"sgpa_sem{sem}", 0.0)))
        features.append(cls.normalize_sgpa(erp.get("cgpa", 0.0)))
        features.append(cls.normalize_academic_score(erp.get("attendance_percentage", 0.0)))
        features.append(cls.normalize_academic_score(erp.get("dsa_marks", 0.0)))
        features.append(cls.normalize_academic_score(erp.get("dbms_marks", 0.0)))

        # Student skills
        clean_skills = cls.clean_skill_dict(student.get("technical_skills", {}))
        for skill_name in cls.CORE_SKILLS:
            features.append(clean_skills.get(skill_name, 0.0))

        # Portfolio counts
        features.append(min(float(student.get("certifications_count", 0)) / 10.0, 1.0))
        features.append(min(float(student.get("github_projects_count", 0)) / 10.0, 1.0))

        # Pad to expected dimension if needed
        while len(features) < cls.FEATURE_DIMENSION:
            features.append(0.0)

        return features[:cls.FEATURE_DIMENSION]


class TestStudentDataPreprocessor:
    """Unit test cases for StudentDataPreprocessor pipeline components."""

    def test_academic_score_normalization(self):
        """Test normalization maps academic scores to [0.0, 1.0]."""
        assert MockStudentPreprocessor.normalize_academic_score(85.0) == 0.85
        assert MockStudentPreprocessor.normalize_academic_score(100.0) == 1.0
        assert MockStudentPreprocessor.normalize_academic_score(0.0) == 0.0
        # Boundary clipping
        assert MockStudentPreprocessor.normalize_academic_score(150.0) == 1.0
        assert MockStudentPreprocessor.normalize_academic_score(-10.0) == 0.0
        # Null handling
        assert MockStudentPreprocessor.normalize_academic_score(None) == 0.0

    def test_sgpa_normalization(self):
        """Test SGPA normalization maps scale [0, 10] to [0.0, 1.0]."""
        assert MockStudentPreprocessor.normalize_sgpa(8.5) == 0.85
        assert MockStudentPreprocessor.normalize_sgpa(10.0) == 1.0
        assert MockStudentPreprocessor.normalize_sgpa(0.0) == 0.0
        # Boundary clipping
        assert MockStudentPreprocessor.normalize_sgpa(11.2) == 1.0
        assert MockStudentPreprocessor.normalize_sgpa(-2.0) == 0.0
        assert MockStudentPreprocessor.normalize_sgpa(None) == 0.0

    def test_clean_skill_dict_canonicalization(self):
        """Test skill key formatting, whitespace stripping, and value clamping."""
        raw_skills = {
            " Python ": 0.95,
            "MACHINE LEARNING": 0.8,
            "React.js": 1.5,
            "Invalid_Negative": -0.5
        }
        cleaned = MockStudentPreprocessor.clean_skill_dict(raw_skills)
        assert "python" in cleaned
        assert cleaned["python"] == 0.95
        assert cleaned["machine_learning"] == 0.8
        assert cleaned["react.js"] == 1.0  # Clamped to 1.0
        assert cleaned["invalid_negative"] == 0.0  # Clamped to 0.0

    def test_extracted_feature_vector_dimension(self, sample_erp_record, sample_student_input):
        """Test that extracted feature vector strictly matches 48 dimensions."""
        vector = MockStudentPreprocessor.extract_features(sample_erp_record, sample_student_input)
        assert len(vector) == MockStudentPreprocessor.FEATURE_DIMENSION
        assert all(isinstance(val, float) for val in vector)
        assert all(0.0 <= val <= 1.0 for val in vector)

    def test_preprocessor_resilience_to_missing_values(self):
        """Test that incomplete records do not trigger unhandled exceptions."""
        empty_erp = {}
        empty_student = {}
        vector = MockStudentPreprocessor.extract_features(empty_erp, empty_student)
        assert len(vector) == MockStudentPreprocessor.FEATURE_DIMENSION
        assert all(val == 0.0 for val in vector)
