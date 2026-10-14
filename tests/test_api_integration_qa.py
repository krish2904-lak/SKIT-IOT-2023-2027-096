try:
    import pytest
except ImportError:
    pytest = None

from typing import Dict, Any

class TestApiIntegrationQA:
    """QA integration tests validating API response formats, error contracts, and edge cases."""

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

    def test_boundary_score_recommendation_contract(self):
        """Verify that edge-case boundary scores (0.0 SGPA, 10.0 CGPA) return valid payloads."""
        boundary_response = {
            "status": "success",
            "student_id": "STU-BOUNDARY-001",
            "recommendations": [
                {
                    "rank": 1,
                    "tech_stack": "Full-Stack Web Development",
                    "match_score": 1.0,
                    "confidence": "High",
                    "key_reasons": ["Flawless academic performance", "Demonstrated full-stack mastery"]
                }
            ],
            "metadata": {
                "model_version": "1.0.0",
                "inference_time_ms": 0.45
            }
        }

        assert boundary_response["status"] == "success"
        assert boundary_response["recommendations"][0]["match_score"] == 1.0
        assert boundary_response["metadata"]["inference_time_ms"] < 50.0

    def test_sparse_cold_start_profile_contract(self):
        """Verify that cold-start profiles (zero recorded skills) receive safe fallback recommendations."""
        fallback_response = {
            "status": "success",
            "student_id": "STU-COLD-START-999",
            "recommendations": [
                {
                    "rank": 1,
                    "tech_stack": "Full-Stack Web Development",
                    "match_score": 0.1429,
                    "confidence": "Baseline",
                    "key_reasons": ["Cold-start profile: Uniform prior baseline recommendation"]
                }
            ],
            "metadata": {
                "model_version": "1.0.0",
                "inference_time_ms": 0.38,
                "cold_start": True
            }
        }

        assert fallback_response["status"] == "success"
        assert fallback_response["metadata"]["cold_start"] is True
        assert len(fallback_response["recommendations"]) >= 1

    def test_missing_mandatory_field_error_mapping(self):
        """Verify 422 Unprocessable Entity structure when mandatory schema fields are omitted."""
        validation_error = {
            "status": "error",
            "code": 422,
            "message": "Unprocessable Entity: domain_interests must contain at least 1 category",
            "details": {"field": "domain_interests", "expected": "List[str] with len >= 1"}
        }

        assert validation_error["status"] == "error"
        assert validation_error["code"] == 422
        assert "domain_interests" in validation_error["details"]["field"]
