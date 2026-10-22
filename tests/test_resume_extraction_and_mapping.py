"""
Unit tests for Resume Extraction (Fallback & LLM) and Feature Mapping / Merging.
Verifies taxonomy skill extraction, experience estimation, domain detection,
mapper merge conflict rules (manual input wins), and mocked LLM client paths.
"""

import json
from unittest.mock import MagicMock
import httpx
import pytest

from app.resume.schemas import ResumeExtractionResult, ExtractedSkill
from app.resume.fallback_extractor import FallbackResumeExtractor
from app.resume.llm_client import LLMResumeExtractor
from app.resume.mapper import merge_resume_with_manual


# ----------------------------------------------------------------------
# 1. Fallback Extractor Tests
# ----------------------------------------------------------------------

SAMPLE_MERN_RESUME = """
Prachi Bhardwaj
Full-Stack Web Developer & UI Engineer
Email: prachi@example.com

SUMMARY:
Passionate engineer with experience developing full-stack web applications.
Proficient in React, JavaScript, Node.js, Express, and MongoDB. Familiar with Docker.

TECHNICAL SKILLS:
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3, Python
- Frameworks: React.js, Express.js, Tailwind CSS
- Databases: MongoDB, MySQL
- Tools & Cloud: Git, Docker, Linux, Postman

PROJECTS:
1. Campus ERP Portal: Built responsive dashboard using React, Tailwind, and Node.js.
2. E-Commerce Storefront: Fullstack MERN application with Stripe payment integration.
3. Telemetry Visualizer: Real-time sensor dashboard connected via REST API.

CERTIFICATIONS:
- Coursera Meta Frontend Developer Specialization
- HackerRank JavaScript Gold Badge
"""

SAMPLE_AI_IOT_RESUME = """
Nishant Kumawat
Undergraduate Student | CSE (IoT)
Phone: +91-9876543210

OBJECTIVE:
Seeking internship in Machine Learning and Embedded IoT Systems.

SKILLS:
- Hardware: ESP32, Arduino Uno, Raspberry Pi, MQTT broker
- Languages: Python, C, C++
- AI/ML: PyTorch, Scikit-learn, Pandas, NumPy, FastAPI
- DevOps: Docker, Linux shell

PROJECTS:
• Smart Environmental Node: ESP32 wireless sensor telemetry publishing to InfluxDB via MQTT.
• Predictive Maintenance: PyTorch deep learning classifier for anomaly detection.

CERTIFICATIONS:
- NPTEL Embedded Systems Design
- DeepLearning.AI Specialization
"""


def test_fallback_extractor_mern_profile():
    """Fallback extractor correctly detects MERN stack technologies and web domains."""
    res = FallbackResumeExtractor.extract(SAMPLE_MERN_RESUME)

    skill_names = [s.name for s in res.skills]
    assert "react" in skill_names
    assert "nodejs" in skill_names
    assert "express" in skill_names
    assert "mongodb" in skill_names
    assert "javascript" in skill_names
    assert "docker" in skill_names

    assert "web_development" in res.domains
    assert res.projects_count >= 2
    assert res.certifications_count >= 1
    assert res.extraction_method == "deterministic_fallback"


def test_fallback_extractor_ai_iot_profile():
    """Fallback extractor correctly detects IoT hardware, C++, and Python ML libraries."""
    res = FallbackResumeExtractor.extract(SAMPLE_AI_IOT_RESUME)

    skill_names = [s.name for s in res.skills]
    assert "esp32" in skill_names
    assert "arduino" in skill_names
    assert "mqtt" in skill_names
    assert "pytorch" in skill_names
    assert "fastapi" in skill_names
    assert "cpp" in skill_names

    assert "iot_embedded" in res.domains or "ai_ml" in res.domains
    assert res.projects_count >= 2
    assert res.certifications_count >= 1


# ----------------------------------------------------------------------
# 2. Mapper & Merge Rules Tests (Manual Input Wins on Conflict)
# ----------------------------------------------------------------------

def test_mapper_merge_manual_input_wins_on_skill_conflict():
    """
    If the student manually declared a skill (e.g. React as 'beginner'),
    and the resume extracted it as 'advanced', manual input must prevail.
    """
    extracted = ResumeExtractionResult(
        skills=[
            ExtractedSkill(name="react", level="advanced", source="RESUME_PARSED"),
            ExtractedSkill(name="docker", level="intermediate", source="RESUME_PARSED"),
        ],
        projects_count=4,
        certifications_count=2,
        domains=["web_development"],
        extraction_method="deterministic_fallback",
    )

    manual_input = {
        "student_id": "SKIT/2026/001",
        "skills": [
            {"name": "react", "level": "beginner", "source": "SELF_REPORTED"},  # Conflict!
        ],
        "interests": ["web_development"],
        "projects_completed": 1,  # Conflict: manual 1 vs resume 4
        "certifications_count": 0,
        "academic_scores": {"web_technologies": 95.0},
        "cgpa": 8.9,
    }

    merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
        extracted=extracted,
        manual_profile=manual_input,
    )

    # 1. Skill conflict check: React must remain 'beginner' (SELF_REPORTED)
    react_skills = [s for s in merged_profile["skills"] if s["name"] == "react"]
    assert len(react_skills) == 1
    assert react_skills[0]["level"] == "beginner"
    assert react_skills[0]["source"] == "SELF_REPORTED"

    # 2. Non-conflicting skill check: Docker from resume should be added
    docker_skills = [s for s in merged_profile["skills"] if s["name"] == "docker"]
    assert len(docker_skills) == 1
    assert docker_skills[0]["level"] == "intermediate"
    assert docker_skills[0]["source"] == "RESUME_PARSED"

    # 3. Project count check: Manual specified count (1) wins over resume (4)
    assert merged_profile["projects_completed"] == 1

    # 4. Feature vector invariant checks
    assert len(feature_vector) == 48
    assert len(mapped_features) == 48
    # React as beginner normalized = 1.0 / 3.0 ≈ 0.3333
    assert abs(mapped_features["skill_react"] - (1.0 / 3.0)) < 1e-3
    # Docker as intermediate normalized = 2.0 / 3.0 ≈ 0.6667
    assert abs(mapped_features["skill_docker"] - (2.0 / 3.0)) < 1e-3


def test_mapper_without_manual_profile():
    """Mapper must construct a complete valid profile when manual profile is None."""
    extracted = ResumeExtractionResult(
        skills=[
            ExtractedSkill(name="python", level="advanced", source="RESUME_PARSED"),
            ExtractedSkill(name="sql", level="intermediate", source="RESUME_PARSED"),
        ],
        projects_count=3,
        certifications_count=1,
        domains=["data_analytics"],
        experience_level="intermediate",
        extraction_method="deterministic_fallback",
    )

    merged_profile, mapped_features, feature_vector = merge_resume_with_manual(
        extracted=extracted,
        manual_profile=None,
    )

    assert merged_profile["student_id"] is not None
    assert len(merged_profile["skills"]) == 2
    assert "data_analytics" in merged_profile["interests"]
    assert len(feature_vector) == 48
    assert mapped_features["skill_python"] == 1.0  # Advanced = 3/3 = 1.0


# ----------------------------------------------------------------------
# 3. Mocked LLM Client Tests (Strict JSON, Retry, and Fallback)
# ----------------------------------------------------------------------

def test_llm_client_fallback_when_no_api_key():
    """When LLM_API_KEY is unset or empty, client must directly use deterministic fallback."""
    client = LLMResumeExtractor(api_key="")
    assert client.is_available is False

    res = client.extract(SAMPLE_MERN_RESUME)
    assert res.extraction_method == "deterministic_fallback"
    assert len(res.skills) > 0


def test_llm_client_successful_parsing_with_mocked_http():
    """When LLM returns valid strict JSON, it should be validated and parsed correctly."""
    mock_llm_json = {
        "skills": [
            {"name": "python", "level": "advanced"},
            {"name": "fastapi", "level": "intermediate"},
            {"name": "docker", "level": "beginner"},
        ],
        "projects": ["High-throughput async API"],
        "projects_count": 1,
        "certifications_count": 1,
        "experience_level": "intermediate",
        "domains": ["ai_ml", "cloud_devops"],
    }

    mock_http_client = MagicMock()
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "choices": [
            {"message": {"content": json.dumps(mock_llm_json)}}
        ]
    }
    mock_http_client.post.return_value = mock_response

    extractor = LLMResumeExtractor(
        api_key="sk-mock-key-for-testing",
        model_name="gpt-4o-mini",
        http_client=mock_http_client,
    )
    assert extractor.is_available is True

    result = extractor.extract("Fake resume text here")
    assert result.extraction_method == "llm"
    assert len(result.skills) == 3
    assert result.skills[0].name == "python"
    assert result.skills[0].level == "advanced"
    assert "cloud_devops" in result.domains
    assert mock_http_client.post.call_count == 1


def test_llm_client_retries_once_on_bad_json():
    """If first call returns malformed JSON and second returns valid JSON, single retry must succeed."""
    valid_json = {
        "skills": [{"name": "kubernetes", "level": "intermediate"}],
        "projects": ["Cluster deployment"],
        "projects_count": 1,
        "certifications_count": 0,
        "experience_level": "intermediate",
        "domains": ["cloud_devops"],
    }

    mock_http_client = MagicMock()
    # First response: malformed JSON (unterminated string)
    bad_resp = MagicMock()
    bad_resp.status_code = 200
    bad_resp.json.return_value = {
        "choices": [{"message": {"content": "{ 'skills': [ unterminated json"}}]
    }

    # Second response: clean valid JSON
    good_resp = MagicMock()
    good_resp.status_code = 200
    good_resp.json.return_value = {
        "choices": [{"message": {"content": json.dumps(valid_json)}}]
    }

    mock_http_client.post.side_effect = [bad_resp, good_resp]

    extractor = LLMResumeExtractor(
        api_key="sk-mock-key-for-testing",
        http_client=mock_http_client,
    )

    result = extractor.extract("Sample resume text")
    assert mock_http_client.post.call_count == 2
    assert result.extraction_method == "llm"
    assert result.skills[0].name == "kubernetes"


def test_llm_client_falls_back_when_llm_call_raises_exception():
    """If LLM call raises an HTTP error or connection failure, it must gracefully fall back to regex."""
    mock_http_client = MagicMock()
    mock_http_client.post.side_effect = httpx.ConnectError("Connection refused by provider")

    extractor = LLMResumeExtractor(
        api_key="sk-mock-key-for-testing",
        http_client=mock_http_client,
    )

    # Must NOT raise exception; must gracefully return fallback result
    result = extractor.extract(SAMPLE_AI_IOT_RESUME)
    assert result.extraction_method == "deterministic_fallback"
    assert len(result.skills) > 0
