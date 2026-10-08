"""
Unit tests for TechStackPredictor inference and recommendation ranking.
"""

import json
from pathlib import Path
import pytest

from model.recommendation.predictor import TechStackPredictor

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_PROFILES_PATH = BASE_DIR / "model" / "data" / "sample_student_profiles.json"


@pytest.fixture
def predictor():
    return TechStackPredictor.get_instance()


@pytest.fixture
def sample_profiles():
    with open(SAMPLE_PROFILES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_predictor_loads_model(predictor):
    assert predictor.model is not None
    assert len(predictor.classes) == 7
    assert len(predictor.feature_names) == 48


def test_predict_for_iot_student(predictor, sample_profiles):
    iot_student = sample_profiles[0]
    rec = predictor.predict_for_student(iot_student, top_k=3)

    assert rec["student_id"] == "SKIT/2023/CSE-IOT/001"
    assert rec["primary_recommendation"] is not None
    assert rec["primary_recommendation"]["stack_code"] == "IOT_EMBEDDED_SYSTEMS"
    assert rec["primary_recommendation"]["rank"] == 1
    assert rec["primary_recommendation"]["matchScore"] > 70.0
    assert len(rec["alternative_recommendations"]) == 2
    assert "IoT" in rec["primary_recommendation"]["whyRecommendedSnippet"]


def test_predict_for_web_student(predictor, sample_profiles):
    web_student = sample_profiles[1]
    rec = predictor.predict_for_student(web_student, top_k=3)

    assert rec["primary_recommendation"]["stack_code"] == "MERN_FULL_STACK"
    assert rec["primary_recommendation"]["matchScore"] > 80.0
    assert any(t["name"] == "React.js" for t in rec["primary_recommendation"]["technologies"])


def test_predict_for_ai_student(predictor, sample_profiles):
    ai_student = sample_profiles[2]
    rec = predictor.predict_for_student(ai_student, top_k=3)

    assert rec["primary_recommendation"]["stack_code"] == "AI_ML_ENGINEERING"
    assert rec["primary_recommendation"]["matchScore"] > 80.0


def test_predict_ranks_descending(predictor, sample_profiles):
    student = sample_profiles[0]
    rec = predictor.predict_for_student(student, top_k=5)
    all_recs = rec["all_ranked_stacks"]

    assert len(all_recs) == 5
    for i in range(len(all_recs) - 1):
        assert all_recs[i]["matchScore"] >= all_recs[i + 1]["matchScore"]
        assert all_recs[i]["rank"] == i + 1


def test_batch_prediction(predictor, sample_profiles):
    batch_results = predictor.predict_batch(sample_profiles[:3], top_k=2)
    assert len(batch_results) == 3
    for r in batch_results:
        assert r["primary_recommendation"] is not None
