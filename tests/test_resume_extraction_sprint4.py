"""
Automated Unit and Integration Tests for Sprint 4 Resume Extraction and Mapping.
Tests RuleBasedExtractor, LLMExtractor fallback, file validation, alias canonicalization,
manual precedence rules, confidence scores, and API endpoints.

PRIVACY:
All test resumes utilize synthetic, non-identifying student personas and mock text.
"""

import io
import json
from pathlib import Path
import pytest
from reportlab.pdfgen import canvas
from docx import Document
from fastapi.testclient import TestClient

from app.main import app
from model.resume.extractor import RuleBasedExtractor, LLMExtractor
from model.resume.mapper import ResumeFeatureMapper
from model.resume.parser import extract_text_from_file, extract_text_from_input
from model.resume.schemas import ResumeExtractionResult, ExtractedSkill

client = TestClient(app)


def _create_mock_pdf(text: str) -> bytes:
    buf = io.BytesIO()
    c = canvas.Canvas(buf)
    y = 750
    for line in text.split("\n"):
        c.drawString(40, y, line)
        y -= 20
    c.showPage()
    c.save()
    return buf.getvalue()


def _create_mock_docx(text: str) -> bytes:
    doc = Document()
    for line in text.split("\n"):
        if line.strip():
            doc.add_paragraph(line.strip())
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


SAMPLE_SYNTHETIC_RESUME_TEXT = """
Candidate Persona: Synthetic Student A-096
Education: B.Tech in Computer Science and Engineering, CGPA: 8.75/10
Technical Skills:
- Programming Languages: Python 3, JavaScript (ES6), TypeScript, C++
- Frameworks & Libraries: Node.js, Express.js, React.js, FastAPI, Scikit-learn
- Cloud & Infrastructure: Docker, Kubernetes (k8s), AWS (EC2, S3), Git, Linux
- Databases: PostgreSQL, MongoDB

Academic & Personal Projects:
1. Microservice Deployment Engine: Containerized multi-tenant service with Docker and Kubernetes.
2. Machine Learning Predictive Pipeline: Scikit-learn random forest models with FastAPI inference.

Certifications:
- AWS Certified Cloud Practitioner
- Coursera Deep Learning Specialization

Interests: Cloud & DevOps, Artificial Intelligence & Machine Learning, Web Development
"""


def test_rule_based_extractor_alias_canonicalization():
    """Verifies that alias tokens (Node.js, k8s, Python 3, etc.) map to canonical taxonomy skills."""
    extractor = RuleBasedExtractor()
    result = extractor.extract(SAMPLE_SYNTHETIC_RESUME_TEXT)

    skill_names = {s.name for s in result.skills}
    assert "python" in skill_names
    assert "nodejs" in skill_names
    assert "react" in skill_names
    assert "docker" in skill_names
    assert "kubernetes" in skill_names
    assert "scikit_learn" in skill_names
    assert "postgresql" in skill_names

    # Verify CGPA hint extracted
    assert result.cgpa_hint == 8.75

    # Verify project count extracted
    assert result.projects_count >= 2

    # Verify domain interests detected
    assert "cloud_devops" in result.domains or "ai_ml" in result.domains


def test_mapper_precedence_and_confidences():
    """Verifies that manual student profile inputs strictly override resume extractions and confidences reflect provenance."""
    extractor = RuleBasedExtractor()
    extracted = extractor.extract(SAMPLE_SYNTHETIC_RESUME_TEXT)

    mapper = ResumeFeatureMapper()
    # Student manually says CGPA is 9.2 (resume says 8.75) and specifies skill Python level Beginner
    manual_profile = {
        "cgpa": 9.2,
        "academic_scores": {"web_technologies": 95.0, "dbms": 90.0},
        "skills": [{"name": "python", "level": "beginner", "source": "SELF_REPORTED"}],
        "interests": ["cybersecurity"],
        "projects_completed": 4,
    }

    merged, mapped_features, confidences, vector = mapper.merge_and_map(extracted, manual_profile)

    # 1. Manual CGPA wins
    assert merged["cgpa"] == 9.2
    assert confidences["cgpa"] == 1.0

    # 2. Manual academic marks win with 1.0 confidence; unprovided courses default to 70.0 with 0.0 confidence
    assert mapped_features["course_web_technologies"] == 0.95
    assert confidences["course_web_technologies"] == 1.0
    assert mapped_features["course_operating_systems"] == 0.70
    assert confidences["course_operating_systems"] == 0.0

    # 3. Manual skill level wins (Beginner = 0.33)
    assert mapped_features["skill_python"] == pytest.approx(0.33, abs=0.02)
    assert confidences["skill_python"] == 1.0

    # 4. Resume fills missing skill Docker (Intermediate = 0.67) with resume confidence
    assert mapped_features["skill_docker"] == pytest.approx(0.67, abs=0.02)
    assert confidences["skill_docker"] >= 0.80

    # 5. Vector is exactly 48-dimensional
    assert len(vector) == 48


def test_llm_extractor_fallback_on_failure(monkeypatch):
    """Mocks LLM failure and verifies clean fallback to RuleBasedExtractor."""
    extractor = LLMExtractor(api_key="mock-key-for-test")

    # Force _call_llm_with_retry to throw an exception
    def mock_fail(text, max_retries=1):
        raise RuntimeError("Simulated API rate limit / timeout error")

    monkeypatch.setattr(extractor, "_call_llm_with_retry", mock_fail)

    result = extractor.extract("Synthetic Student with Python and Docker skills. CGPA: 8.5")
    assert result.extraction_method == "llm_fallback"
    skill_names = {s.name for s in result.skills}
    assert "python" in skill_names
    assert "docker" in skill_names


def test_parser_txt_pdf_docx_and_validation():
    """Tests file parser on .txt, .pdf, and .docx formats and validates boundary checks."""
    txt_bytes = SAMPLE_SYNTHETIC_RESUME_TEXT.encode("utf-8")
    pdf_bytes = _create_mock_pdf(SAMPLE_SYNTHETIC_RESUME_TEXT)
    docx_bytes = _create_mock_docx(SAMPLE_SYNTHETIC_RESUME_TEXT)

    assert len(extract_text_from_file(txt_bytes, "test.txt")) > 50
    assert len(extract_text_from_file(pdf_bytes, "test.pdf")) > 50
    assert len(extract_text_from_file(docx_bytes, "test.docx")) > 50

    # Unsupported format rejection
    with pytest.raises(ValueError, match="Unsupported file format"):
        extract_text_from_file(b"dummy bytes", "resume.png")

    # Empty file rejection
    with pytest.raises(ValueError, match="Uploaded file is empty"):
        extract_text_from_file(b"", "resume.pdf")


def test_api_resume_extract_endpoint_json_text():
    """Tests POST /api/v1/resume/extract with raw text JSON payload."""
    payload = {
        "text": SAMPLE_SYNTHETIC_RESUME_TEXT,
        "manual_profile": {"cgpa": 9.0}
    }
    resp = client.post("/api/v1/resume/extract", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "extracted_skills" in data
    assert "mapped_features" in data
    assert "confidences" in data
    assert len(data["mapped_features"]) == 48
    assert len(data["confidences"]) == 48
    assert data["merged_profile"]["cgpa"] == 9.0


def test_api_resume_extract_endpoint_file_upload():
    """Tests POST /api/v1/resume/extract with PDF file upload."""
    pdf_bytes = _create_mock_pdf(SAMPLE_SYNTHETIC_RESUME_TEXT)
    resp = client.post(
        "/api/v1/resume/extract",
        files={"file": ("resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["extracted_skills"]) > 0
    assert data["mapped_features"]["skill_python"] > 0


def test_api_resume_extract_errors():
    """Tests 415, 413, and 422 HTTP status codes on POST /api/v1/resume/extract."""
    # 415: Unsupported file type
    resp_415 = client.post(
        "/api/v1/resume/extract",
        files={"file": ("malicious.exe", b"binarycontent", "application/octet-stream")},
    )
    assert resp_415.status_code == 415

    # 413: Exceeds 5MB
    large_bytes = b"X" * (6 * 1024 * 1024)
    resp_413 = client.post(
        "/api/v1/resume/extract",
        files={"file": ("oversized.txt", large_bytes, "text/plain")},
    )
    assert resp_413.status_code == 413

    # 422: Empty file
    resp_422 = client.post(
        "/api/v1/resume/extract",
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert resp_422.status_code == 422


def test_api_recommend_from_resume_endpoint():
    """Tests POST /api/v1/recommend/from-resume with optional explanation."""
    payload = {
        "text": SAMPLE_SYNTHETIC_RESUME_TEXT,
        "manual_profile": {
            "academic_scores": {
                "course_web_technologies": 90.0,
                "course_cloud_computing": 88.0,
            }
        }
    }

    # Standard recommendation
    resp = client.post("/api/v1/recommend/from-resume?top_k=3", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert "primary_recommendation" in data
    assert len(data["all_ranked_stacks"]) == 3

    # Recommendation with explain=true
    resp_explain = client.post("/api/v1/recommend/from-resume?explain=true&top_k=3", json=payload)
    assert resp_explain.status_code == 200
    exp_data = resp_explain.json()
    assert exp_data["primary_recommendation"]["explanation"] is not None
    assert "top_features" in exp_data["primary_recommendation"]["explanation"]
