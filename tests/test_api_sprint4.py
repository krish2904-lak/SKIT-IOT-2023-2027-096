"""
API endpoint integration tests for Sprint 4 deliverables:
- POST /api/v1/explain (TreeSHAP explanation endpoint)
- POST /api/v1/resume/parse (Multipart resume upload & feature mapping)
- POST /api/v1/recommend (Backward compatibility & resume feature integration)
- GET /api/v1/explain/global-importance (Research paper feature metrics)
Includes full error case validation (400, 413, 422).
"""

import io
import json
import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from docx import Document
from reportlab.pdfgen import canvas

BASE_DIR = Path(__file__).resolve().parent.parent
AI_SERVICE_DIR = BASE_DIR / "ai-service"
if str(AI_SERVICE_DIR) not in sys.path:
    sys.path.insert(0, str(AI_SERVICE_DIR))

from app.main import app

client = TestClient(app)


def _create_in_memory_pdf(text: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    y = 750
    for line in text.split("\n"):
        c.drawString(40, y, line)
        y -= 20
    c.showPage()
    c.save()
    return buf.getvalue()


def _create_in_memory_docx(text: str) -> bytes:
    doc = Document()
    for line in text.split("\n"):
        if line.strip():
            doc.add_paragraph(line.strip())
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# ----------------------------------------------------------------------
# 1. POST /api/v1/explain Tests
# ----------------------------------------------------------------------

def test_api_explain_endpoint_with_explicit_stack():
    """POST /api/v1/explain returns complete TreeSHAP explanation for requested stack."""
    payload = {
        "profile": {
            "student_id": "SKIT/TEST/EXP-01",
            "branch": "CSE (IoT)",
            "semester": 6,
            "cgpa": 8.5,
            "academic_scores": {
                "web_technologies": 94.0,
                "dbms": 88.0,
                "dsa": 82.0,
                "iot_embedded": 70.0,
                "ml_math": 70.0,
                "cloud_computing": 65.0,
                "operating_systems": 75.0,
            },
            "interests": ["web_development"],
            "skills": [
                {"name": "react", "level": "advanced"},
                {"name": "javascript", "level": "intermediate"},
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
    assert data["stackCode"] == "MERN_FULL_STACK"
    assert 0.0 <= data["baseConfidence"] <= 1.0
    assert 0.0 <= data["predictedConfidence"] <= 1.0
    assert len(data["summaryText"]) > 20
    assert len(data["topPositiveFactors"]) <= 5
    assert len(data["topNegativeFactors"]) <= 5
    assert len(data["learningPrerequisites"]) >= 1

    # Check factor schema keys
    for factor in data["topPositiveFactors"]:
        assert "feature" in factor
        assert "label" in factor
        assert "value" in factor
        assert "shapValue" in factor
        assert factor["shapValue"] >= 0.0
        assert factor["impactDirection"] == "POSITIVE"

    for factor in data["topNegativeFactors"]:
        assert "feature" in factor
        assert "label" in factor
        assert "value" in factor
        assert "shapValue" in factor
        assert factor["shapValue"] <= 0.0
        assert factor["impactDirection"] == "NEGATIVE"


def test_api_explain_endpoint_default_top_stack():
    """Omitting stack_code should automatically explain the model's top predicted recommendation."""
    payload = {
        "profile": {
            "student_id": "SKIT/TEST/EXP-AUTO",
            "academic_scores": {"iot_embedded": 95.0},
            "interests": ["iot_embedded"],
            "skills": [{"name": "esp32", "level": "advanced"}, {"name": "c", "level": "intermediate"}],
        }
    }

    response = client.post("/api/v1/explain", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["stackCode"] == "IOT_EMBEDDED_SYSTEMS"
    assert "IoT" in data["recommendationTitle"]


def test_api_explain_bad_payload_returns_422():
    """Invalid payload (e.g. semester out of range or negative cgpa) must return HTTP 422."""
    bad_payload = {
        "profile": {
            "semester": 15,  # Exceeds max 8
            "cgpa": -4.0,    # Negative
        }
    }
    response = client.post("/api/v1/explain", json=bad_payload)
    assert response.status_code == 422


# ----------------------------------------------------------------------
# 2. POST /api/v1/resume/parse Tests
# ----------------------------------------------------------------------

def test_api_resume_parse_docx_success():
    """Uploading a valid DOCX resume extracts skills and maps them to 48 features."""
    resume_text = (
        "Saloni Jain\n"
        "Technical Skills: Python, Docker, Kubernetes, AWS, Linux, Git\n"
        "Projects: Automated Cloud CI/CD Pipeline\n"
        "Certifications: AWS Solutions Architect Associate\n"
        "Interests: Cloud Computing and DevOps"
    )
    docx_bytes = _create_in_memory_docx(resume_text)

    files = {"file": ("saloni_resume.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    response = client.post("/api/v1/resume/parse", files=files)

    assert response.status_code == 200
    data = response.json()

    assert data["filename"] == "saloni_resume.docx"
    assert data["extraction_method"] in ("llm", "deterministic_fallback")
    extracted_names = [s["name"] for s in data["extracted_skills"]]
    assert "docker" in extracted_names
    assert "python" in extracted_names

    # Check 48-feature mapping
    assert len(data["mapped_features"]) == 48
    assert data["mapped_features"]["skill_docker"] > 0.0

    # Merged profile conforms to input shape
    assert "skills" in data["merged_profile"]
    assert data["merged_profile"]["resume_uploaded"] is True


def test_api_resume_parse_pdf_success():
    """Uploading a valid PDF resume extracts skills and returns HTTP 200."""
    resume_text = (
        "Lakshya Jain\n"
        "Full Stack Developer\n"
        "Skills: React, Node.js, Express, MongoDB, JavaScript, TypeScript\n"
        "Projects: MERN Stack ERP Application"
    )
    pdf_bytes = _create_in_memory_pdf(resume_text)

    files = {"file": ("lakshya_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    response = client.post("/api/v1/resume/parse", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["filename"] == "lakshya_resume.pdf"
    assert len(data["extracted_skills"]) > 0


def test_api_resume_parse_with_manual_profile_override():
    """Manual form inputs passed in multipart form must win on skill and project conflicts."""
    resume_text = (
        "Nishant Kumawat\n"
        "Skills: React, JavaScript, Python\n"
        "Projects: Project A, Project B, Project C, Project D"
    )
    docx_bytes = _create_in_memory_docx(resume_text)

    # Manual profile says React is 'beginner' and projects_completed is 1
    manual_data = {
        "student_id": "SKIT/MANUAL/01",
        "skills": [{"name": "react", "level": "beginner", "source": "SELF_REPORTED"}],
        "projects_completed": 1,
        "cgpa": 8.7,
    }

    files = {"file": ("resume.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    data_payload = {"manual_profile": json.dumps(manual_data)}

    response = client.post("/api/v1/resume/parse", files=files, data=data_payload)
    assert response.status_code == 200
    res_json = response.json()

    merged_skills = res_json["merged_profile"]["skills"]
    react_skill = next(s for s in merged_skills if s["name"] == "react")
    assert react_skill["level"] == "beginner"
    assert react_skill["source"] == "SELF_REPORTED"
    assert res_json["merged_profile"]["projects_completed"] == 1


def test_api_resume_parse_unsupported_format_returns_400():
    """Uploading an unsupported file format (.txt) must return HTTP 400."""
    files = {"file": ("notes.txt", io.BytesIO(b"Hello world"), "text/plain")}
    response = client.post("/api/v1/resume/parse", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_api_resume_parse_oversized_file_returns_413():
    """Uploading a file exceeding 5MB must return HTTP 413."""
    # Simulate 5.1 MB dummy payload
    oversized = io.BytesIO(b"A" * (5 * 1024 * 1024 + 1024))
    files = {"file": ("heavy.pdf", oversized, "application/pdf")}
    response = client.post("/api/v1/resume/parse", files=files)
    assert response.status_code == 413
    assert "exceeds maximum allowed limit" in response.json()["detail"]


def test_api_resume_parse_empty_file_returns_400():
    """Uploading an empty file must return HTTP 400."""
    files = {"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")}
    response = client.post("/api/v1/resume/parse", files=files)
    assert response.status_code == 400


# ----------------------------------------------------------------------
# 3. POST /api/v1/recommend Backward Compatibility & Explain Flag
# ----------------------------------------------------------------------

def test_api_recommend_backward_compatibility():
    """Standard recommendation request without explain flag returns ranked stacks."""
    payload = {
        "student_id": "SKIT/TEST/REC-01",
        "academic_scores": {"web_technologies": 90.0, "dbms": 85.0},
        "interests": ["web_development"],
        "skills": [{"name": "react", "level": "intermediate"}],
        "top_k": 3,
    }
    response = client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["all_ranked_stacks"]) == 3
    assert data["primary_recommendation"]["stack_code"] == "MERN_FULL_STACK"
    assert data["primary_recommendation"]["explanation"] is None


def test_api_recommend_with_explain_flag_and_resume_features():
    """Recommendation with explain=true and optional resume_features attaches TreeSHAP explanations."""
    payload = {
        "student_id": "SKIT/TEST/REC-EXP",
        "academic_scores": {"ml_math": 92.0},
        "interests": ["ai_ml"],
        "skills": [{"name": "python", "level": "advanced"}],
        "top_k": 2,
        "resume_uploaded": True,
        "resume_features": {"skill_pytorch": 1.0, "skill_fastapi": 0.67},
    }
    response = client.post("/api/v1/recommend?explain=true", json=payload)
    assert response.status_code == 200
    data = response.json()

    primary = data["primary_recommendation"]
    assert primary["explanation"] is not None
    assert "summary" in primary["explanation"]
    assert len(primary["explanation"]["top_features"]) > 0


# ----------------------------------------------------------------------
# 4. GET /api/v1/explain/global-importance Tests
# ----------------------------------------------------------------------

def test_api_global_feature_importance_endpoint():
    """GET /api/v1/explain/global-importance returns top N mean absolute SHAP importances."""
    response = client.get("/api/v1/explain/global-importance?top_n=5")
    assert response.status_code == 200
    data = response.json()

    assert data["top_n"] == 5
    assert len(data["global_feature_importance"]) == 5
    first = data["global_feature_importance"][0]
    assert "feature" in first
    assert "label" in first
    assert "meanAbsShap" in first
    assert first["meanAbsShap"] > 0.0
