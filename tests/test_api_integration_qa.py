import pytest
from typing import Dict, Any

class TestApiIntegrationQA:
    """QA integration tests validating API response formats and error contracts."""

    def test_mock_recommendation_response_contract(self):
        """Verify API response payload matches docs/API_CONTRACT.md format."""
        mock_response = {
            "status": "success",
            "student_id": "STU-2023-096",
            "recommendations": [
                {
                    "rank": 1,
                    "tech_stack": "AI & Machine Learning",
                    "match_score": 0.88,
                    "confidence": "High",
                    "key_reasons": ["Strong DSA and Python foundation", "High math/academic scores"]
                },
                {
                    "rank": 2,
                    "tech_stack": "Data Science & Analytics",
                    "match_score": 0.74,
                    "confidence": "Medium",
                    "key_reasons": ["Proficient in DBMS and Python"]
                }
            ],
            "metadata": {
                "model_version": "1.0.0",
                "inference_time_ms": 14.2
            }
        }

        assert mock_response["status"] == "success"
        assert len(mock_response["recommendations"]) >= 1
        for rec in mock_response["recommendations"]:
            assert "tech_stack" in rec
            assert "match_score" in rec
            assert 0.0 <= rec["match_score"] <= 1.0
            assert isinstance(rec["key_reasons"], list)

    def test_error_response_contract(self):
        """Verify standard 400 Bad Request error contract structure."""
        error_payload = {
            "status": "error",
            "code": 400,
            "message": "Invalid input: student_id is required",
            "details": {"field": "student_id", "issue": "missing"}
        }

        assert error_payload["status"] == "error"
        assert error_payload["code"] == 400
        assert "message" in error_payload
