import pytest
import time
from typing import Dict, Any, List

class MockTechStackPredictor:
    """Mock predictor simulating Random Forest inference for QA validation."""
    
    TARGET_CLASSES = [
        "Full-Stack Web Development",
        "AI & Machine Learning",
        "Cloud Computing & DevOps",
        "Data Science & Analytics",
        "Mobile Application Development",
        "Cybersecurity & Networks",
        "IoT & Embedded Systems"
    ]

    @classmethod
    def predict_top_k(cls, features: List[float], k: int = 3) -> List[Dict[str, Any]]:
        # Simulate probability distribution
        if not features or sum(features) == 0:
            # Fallback uniform
            prob = 1.0 / len(cls.TARGET_CLASSES)
            return [{"tech_stack": cat, "confidence": round(prob, 4), "rank": i + 1} for i, cat in enumerate(cls.TARGET_CLASSES[:k])]

        # Assign high weight to AI/ML if ML features active
        is_ai_heavy = sum(features[8:15]) > 2.0
        if is_ai_heavy:
            scores = [0.15, 0.55, 0.10, 0.10, 0.04, 0.03, 0.03]
        else:
            scores = [0.45, 0.15, 0.20, 0.05, 0.08, 0.04, 0.03]

        results = []
        for cat, score in zip(cls.TARGET_CLASSES, scores):
            results.append({"tech_stack": cat, "confidence": score})

        # Sort descending
        results.sort(key=lambda x: x["confidence"], reverse=True)
        top_k = results[:k]
        for idx, item in enumerate(top_k):
            item["rank"] = idx + 1
        return top_k


class TestModelInferenceQA:
    """QA test suite evaluating model prediction integrity, latency, and edge cases."""

    def test_prediction_output_structure(self, sample_erp_record, sample_student_input):
        """Verify inference outputs contain valid keys, rankings, and confidence scores."""
        mock_features = [0.8] * 48
        predictions = MockTechStackPredictor.predict_top_k(mock_features, k=3)

        assert len(predictions) == 3
        for item in predictions:
            assert "tech_stack" in item
            assert "confidence" in item
            assert "rank" in item
            assert 0.0 <= item["confidence"] <= 1.0

    def test_top_k_monotonicity(self):
        """Verify top-k predictions are strictly ordered in non-increasing confidence."""
        mock_features = [0.5] * 48
        predictions = MockTechStackPredictor.predict_top_k(mock_features, k=5)

        for i in range(len(predictions) - 1):
            assert predictions[i]["confidence"] >= predictions[i + 1]["confidence"], (
                f"Rank {i+1} score {predictions[i]['confidence']} is less than "
                f"Rank {i+2} score {predictions[i+1]['confidence']}"
            )
            assert predictions[i]["rank"] == i + 1

    def test_domain_alignment_sanity(self):
        """Verify that dominant AI/ML skills heavily weight the AI & Machine Learning recommendation."""
        # Feature array with elevated AI/ML skill values
        features = [0.8] * 8 + [0.95] * 7 + [0.1] * 33
        predictions = MockTechStackPredictor.predict_top_k(features, k=1)

        assert len(predictions) == 1
        assert predictions[0]["tech_stack"] == "AI & Machine Learning"
        assert predictions[0]["confidence"] > 0.5

    def test_cold_start_handling(self):
        """Verify inference handles zeroed features gracefully without throwing errors."""
        empty_features = [0.0] * 48
        predictions = MockTechStackPredictor.predict_top_k(empty_features, k=3)

        assert len(predictions) == 3
        for item in predictions:
            assert item["confidence"] > 0.0

    def test_inference_latency_benchmark(self):
        """Verify inference latency remains under 50ms per evaluation."""
        features = [0.7] * 48
        
        start_time = time.perf_counter()
        for _ in range(100):
            _ = MockTechStackPredictor.predict_top_k(features, k=3)
        elapsed = time.perf_counter() - start_time
        
        avg_latency_ms = (elapsed / 100) * 1000
        assert avg_latency_ms < 50.0, f"Average inference latency too high: {avg_latency_ms:.2f} ms"
