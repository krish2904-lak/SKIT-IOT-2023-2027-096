"""
Unit tests for StudentDataPreprocessor.
Validates normalization, alias resolution, missing field defaults, and output vector integrity.
"""

import numpy as np
import pytest

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.preprocessing.features import TECHNICAL_SKILLS, INTEREST_DOMAINS, ACADEMIC_COURSES


@pytest.fixture
def preprocessor():
    return StudentDataPreprocessor()


def test_feature_names_and_dimension(preprocessor):
    names = preprocessor.get_feature_names()
    assert len(names) == preprocessor.num_features
    # Expected: 1 (cgpa) + 7 (courses) + 7 (interests) + 31 (skills) + 2 (projects/certs) = 48
    assert len(names) == 48
    assert names[0] == "cgpa"
    assert "course_web_technologies" in names
    assert "interest_ai_ml" in names
    assert "skill_python" in names


def test_transform_single_with_empty_data(preprocessor):
    """Preprocessor should gracefully handle empty dictionary with sensible defaults."""
    vector = preprocessor.transform_single({})
    assert isinstance(vector, np.ndarray)
    assert vector.shape == (48,)
    # CGPA default is 7.0 / 10.0 = 0.7
    assert pytest.approx(vector[0], 0.01) == 0.70
    # Values must all be finite floats in [0, 1]
    assert np.all(np.isfinite(vector))
    assert np.all(vector >= 0.0)
    assert np.all(vector <= 1.0)


def test_skill_aliases_and_levels(preprocessor):
    student = {
        "skills": [
            {"name": "c++", "level": "advanced"},
            {"name": "py", "level": "beginner"},
            {"name": "react.js", "level": "intermediate"},
        ]
    }
    names = preprocessor.get_feature_names()
    vector = preprocessor.transform_single(student)

    idx_cpp = names.index("skill_cpp")
    idx_py = names.index("skill_python")
    idx_react = names.index("skill_react")

    # Advanced = 3.0 / 3.0 = 1.0
    assert pytest.approx(vector[idx_cpp], 0.01) == 1.0
    # Beginner = 1.0 / 3.0 = 0.333
    assert pytest.approx(vector[idx_py], 0.01) == 1.0 / 3.0
    # Intermediate = 2.0 / 3.0 = 0.667
    assert pytest.approx(vector[idx_react], 0.01) == 2.0 / 3.0


def test_interest_aliases(preprocessor):
    student = {
        "interests": ["machine learning", "web dev", "iot"]
    }
    names = preprocessor.get_feature_names()
    vector = preprocessor.transform_single(student)

    assert vector[names.index("interest_ai_ml")] == 1.0
    assert vector[names.index("interest_web_development")] == 1.0
    assert vector[names.index("interest_iot_embedded")] == 1.0
    assert vector[names.index("interest_cybersecurity")] == 0.0


def test_batch_transformation(preprocessor):
    batch = [
        {"cgpa": 8.0, "interests": ["ai_ml"], "skills": ["python"]},
        {"cgpa": 9.0, "interests": ["web_development"], "skills": ["react", "nodejs"]},
    ]
    matrix = preprocessor.transform(batch)
    assert matrix.shape == (2, 48)
