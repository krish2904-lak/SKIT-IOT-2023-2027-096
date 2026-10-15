"""
Unit tests for the Explainability Engine (TechStackExplainer) and /api/v1/explain API endpoint.
Validates SHAP-aligned feature attribution, positive factors, bridgeable gaps, remedies,
and prerequisite roadmaps.
"""

import json
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

BASE_DIR = Path(__file__).resolve().parent.parent
AI_SERVICE_DIR = BASE_DIR / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from model.recommendation.explainability import TechStackExplainer
from app.main import app

SAMPLE_PROFILES_PATH = BASE_DIR / "model" / "data" / "sample_student_profiles.json"

client = TestClient(app)


@pytest.fixture
def explainer():
    return TechStackExplainer.get_instance()


@pytest.fixture
def sample_profiles():
    with open(SAMPLE_PROFILES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_explainer_initialization(explainer):
    assert explainer is not None
    assert explainer.predictor is not None
    assert explainer.preprocessor is not None


def test_explainer_primary_recommendation_explanation(explainer, sample_profiles):
    iot_student = sample_profiles[0]
    result = explainer.explain_recommendation(iot_student)

    assert "recommendationId" in result
    assert "recommendationTitle" in result
    assert result["recommendationId"] == "rec-iot-003"
    assert result["baseConfidence"] > 0.0
    assert "IoT Systems" in result["summaryText"] or "Random Forest" in result["summaryText"]
    assert len(result["topPositiveFactors"]) >= 1
    assert len(result["topNegativeFactors"]) >= 1
    assert len(result["learningPrerequisites"]) >= 1


def test_explainer_specific_stack(explainer, sample_profiles):
    web_student = sample_profiles[1]
    result = explainer.explain_recommendation(web_student, stack_code="MERN_FULL_STACK")

    assert result["recommendationId"] == "rec-mern-001"
    assert result["recommendationTitle"] == "Modern Full-Stack Cloud Native"
    # Verify positive factors include academic web tech marks
    pos_features = [f["featureName"] for f in result["topPositiveFactors"]]
    assert any("web" in f or "academic" in f for f in pos_features)


def test_factor_impact_fields(explainer, sample_profiles):
    ai_student = sample_profiles[2]
    result = explainer.explain_recommendation(ai_student, stack_code="AI_ML_ENGINEERING")

    for factor in result["topPositiveFactors"]:
        assert "featureName" in factor
        assert "displayName" in factor
        assert factor["shapValue"] > 0.0
        assert factor["impactDirection"] == "POSITIVE"
        assert factor["category"] in ("ERP_ACADEMICS", "STUDENT_INTEREST", "EXISTING_SKILL", "INDUSTRY_DEMAND")
        assert len(factor["explanationNote"]) > 10

    for factor in result["topNegativeFactors"]:
        assert "featureName" in factor
        assert "displayName" in factor
        assert factor["shapValue"] < 0.0
        assert factor["impactDirection"] == "NEGATIVE"
        assert factor["category"] in ("ERP_ACADEMICS", "STUDENT_INTEREST", "EXISTING_SKILL", "INDUSTRY_DEMAND")
        assert "remedyElective" in factor
        assert factor["potentialBoost"] > 0.0


def test_api_explain_endpoint():
    payload = {
        "profile": {
            "student_id": "SKIT/TEST/EXP-01",
            "branch": "CSE (IoT)",
            "semester": 6,
            "cgpa": 8.7,
            "academic_scores": {
                "web_technologies": 92.0,
                "dbms": 86.0,
                "dsa": 80.0,
                "iot_embedded": 70.0,
                "ml_math": 70.0,
                "cloud_computing": 65.0,
                "operating_systems": 78.0,
            },
            "interests": ["web_development"],
            "skills": [
                {"name": "react", "level": "intermediate"},
                {"name": "javascript", "level": "advanced"},
            ],
            "projects_completed": 2,
            "certifications_count": 1,
        },
        "stack_code": "MERN_FULL_STACK",
    }

    response = client.post("/api/v1/explain", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["recommendationId"] == "rec-mern-001"
    assert data["recommendationTitle"] == "Modern Full-Stack Cloud Native"
    assert data["baseConfidence"] > 0.0
    assert len(data["topPositiveFactors"]) > 0
    assert len(data["topNegativeFactors"]) > 0
    assert len(data["learningPrerequisites"]) == 3
