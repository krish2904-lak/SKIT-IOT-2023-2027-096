import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Add ai-service to sys.path to support module importing
AI_SERVICE_DIR = Path(__file__).resolve().parent.parent / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify preserved baseline /health endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ai-service"


def test_model_info_endpoint():
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["model_type"] == "RandomForestClassifier"
    assert data["num_features"] == 48
    assert len(data["target_classes"]) == 7


def test_tech_stacks_catalog_endpoint():
    response = client.get("/api/v1/tech-stacks")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 7
    assert len(data["stacks"]) == 7
    titles = [s["title"] for s in data["stacks"]]
    assert "Modern Full-Stack Cloud Native" in titles


def test_recommendation_endpoint_valid_payload():
    payload = {
        "student_id": "SKIT/2023/CSE-IOT/096",
        "branch": "CSE (IoT)",
        "semester": 6,
        "cgpa": 8.5,
        "academic_scores": {
            "web_technologies": 70.0,
            "dbms": 75.0,
            "dsa": 80.0,
            "iot_embedded": 92.0,
            "ml_math": 70.0,
            "cloud_computing": 75.0,
            "operating_systems": 85.0,
        },
        "interests": ["iot_embedded"],
        "skills": [
            {"name": "cpp", "level": "advanced"},
            {"name": "esp32", "level": "advanced"},
            {"name": "arduino", "level": "intermediate"},
            {"name": "mqtt", "level": "intermediate"},
        ],
        "projects_completed": 3,
        "certifications_count": 1,
        "top_k": 3,
    }

    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["student_id"] == "SKIT/2023/CSE-IOT/096"
    assert data["primary_recommendation"] is not None
    assert data["primary_recommendation"]["stack_code"] == "IOT_EMBEDDED_SYSTEMS"
    assert data["primary_recommendation"]["rank"] == 1
    assert data["primary_recommendation"]["matchScore"] > 70.0
    assert len(data["alternative_recommendations"]) == 2
    assert "roadmap" in data["primary_recommendation"]
    assert len(data["primary_recommendation"]["roadmap"]) == 3


def test_recommendation_minimal_payload():
    """Minimal payload with only partial fields must succeed via defaults."""
    payload = {
        "student_id": "SKIT/MINIMAL/001",
        "cgpa": 7.5,
        "interests": ["web_development"],
        "skills": ["react", "javascript"],
    }

    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["primary_recommendation"]["stack_code"] == "MERN_FULL_STACK"
    assert "roadmap" in data["primary_recommendation"]
    assert len(data["primary_recommendation"]["roadmap"]) == 3
    # Default behavior: explanation is None/omitted
    assert data["primary_recommendation"].get("explanation") is None


def test_recommendation_with_explain_query_param():
    """When explain=true, recommendations must include SHAP explanation object."""
    payload = {
        "student_id": "SKIT/2023/CSE-IOT/096",
        "branch": "CSE (IoT)",
        "cgpa": 8.5,
        "academic_scores": {
            "iot_embedded": 90.0,
            "web_technologies": 70.0,
        },
        "interests": ["iot_embedded"],
        "skills": [{"name": "esp32", "level": "advanced"}],
    }

    response = client.post("/api/v1/recommend?explain=true", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["primary_recommendation"] is not None
    assert "explanation" in data["primary_recommendation"]
    exp = data["primary_recommendation"]["explanation"]
    assert exp is not None
    assert "summary" in exp
    assert "top_features" in exp
    assert len(exp["top_features"]) == 5
    for feat in exp["top_features"]:
        assert "feature" in feat
        assert "label" in feat
        assert "value" in feat
        assert "shap_value" in feat
        assert feat["direction"] in ("supports", "reduces")

    # Recommendations alias must also be populated
    assert "recommendations" in data
    assert len(data["recommendations"]) == len(data["all_ranked_stacks"])


def test_recommendation_explain_dedicated_endpoint():
    """Dedicated POST /api/v1/recommend/explain returns explanation by default."""
    payload = {
        "student_id": "SKIT/2023/CSE-IOT/002",
        "cgpa": 8.0,
        "interests": ["ai_ml"],
        "skills": ["python", "pytorch"],
    }

    response = client.post("/api/v1/recommend/explain", json=payload)
    assert response.status_code == 200
    data = response.json()

    primary = data["primary_recommendation"]
    assert primary is not None
    assert primary["explanation"] is not None
    assert len(primary["explanation"]["top_features"]) == 5


def test_recommendation_bad_payload_returns_422():
    """Invalid payload schema must return HTTP 422 Unprocessable Entity."""
    # CGPA out of range (> 10.0)
    bad_payload = {
        "student_id": "INVALID",
        "cgpa": 15.0,
    }
    response = client.post("/api/v1/recommend", json=bad_payload)
    assert response.status_code == 422
    err_data = response.json()
    assert "detail" in err_data

