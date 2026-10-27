"""
Unit tests for the TreeSHAP-based ShapExplainer module.
Verifies output shape, top-5 ordering, shapValue sign vs positive/negative lists,
base confidence in [0, 1], determinism with a fixed seed, SHAP additivity,
error handling on invalid inputs, and global feature importance.
"""

import json
from pathlib import Path
import numpy as np
import pytest

from model.explainability import ShapExplainer, RecommendationExplainer, FEATURE_LABELS

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_PROFILES_PATH = BASE_DIR / "model" / "data" / "sample_student_profiles.json"


@pytest.fixture
def explainer():
    return ShapExplainer.get_instance()


@pytest.fixture
def sample_profiles():
    with open(SAMPLE_PROFILES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def test_explainer_singleton_initialization(explainer):
    """Explainer should initialize cleanly and cache TreeExplainer."""
    assert explainer is not None
    assert explainer.model is not None
    assert explainer.tree_explainer is not None
    assert len(explainer.feature_names) == 48
    assert len(explainer.classes) == 7


def test_explainer_class_order_matches_model(explainer):
    """Class order in explainer must match model.classes_ integer encoding order exactly."""
    model_classes = list(explainer.model.classes_)
    assert len(explainer.classes) == len(model_classes)
    for idx, model_cls in enumerate(model_classes):
        assert idx == model_cls
    assert len(explainer.classes) == 7
    assert "AI_ML_ENGINEERING" in explainer.classes


def test_explainer_invalid_input_length_raises_error(explainer):
    """Invalid feature vector lengths must raise clear ValueError."""
    with pytest.raises(ValueError, match="Invalid feature vector length"):
        explainer.explain_vector([0.5] * 47)

    with pytest.raises(ValueError, match="Invalid feature vector length"):
        explainer.explain_vector([0.5] * 49)


def test_explainer_output_shape_and_frontend_contract(explainer, sample_profiles):
    """
    Validates that explain_recommendation returns the exact shape expected by the frontend:
    recommendationId, recommendationTitle, baseConfidence, summaryText,
    topPositiveFactors, topNegativeFactors, and learningPrerequisites.
    """
    for profile in sample_profiles[:3]:
        explanation = explainer.explain_recommendation(profile)

        assert "recommendationId" in explanation
        assert "recommendationTitle" in explanation
        assert "baseConfidence" in explanation
        assert "summaryText" in explanation
        assert "topPositiveFactors" in explanation
        assert "topNegativeFactors" in explanation
        assert "learningPrerequisites" in explanation

        # Summary text must be 1-2 plain-English sentences
        assert isinstance(explanation["summaryText"], str)
        assert len(explanation["summaryText"]) > 20
        sentences = [s for s in explanation["summaryText"].split(".") if s.strip()]
        assert 1 <= len(sentences) <= 3


def test_ranked_explanations_include_model_catalog_prerequisites(explainer, sample_profiles):
    explanations = explainer.explain_student(sample_profiles[0], top_k=3)

    assert len(explanations) == 3
    for item in explanations:
        prerequisites = item["explanation"]["learning_prerequisites"]
        assert isinstance(prerequisites, list)
        assert all(isinstance(value, str) for value in prerequisites)


def test_explainer_base_confidence_in_bounds(explainer, sample_profiles):
    """Base confidence prior probability must strictly be in [0.0, 1.0]."""
    for profile in sample_profiles:
        for stack_code in explainer.classes:
            explanation = explainer.explain_recommendation(profile, stack_code=stack_code)
            assert 0.0 <= explanation["baseConfidence"] <= 1.0
            assert 0.0 <= explanation["predictedConfidence"] <= 1.0


def test_explainer_top_5_ordering_and_fields(explainer, sample_profiles):
    """
    Top positive factors must be ordered descending by shapValue (largest positive first, max 5).
    Top negative factors must be ordered ascending by shapValue (most negative first, max 5).
    Each factor must contain: feature, label, value, shapValue.
    """
    profile = sample_profiles[0]
    explanation = explainer.explain_recommendation(profile, stack_code="IOT_EMBEDDED_SYSTEMS", top_n=5)

    pos = explanation["topPositiveFactors"]
    neg = explanation["topNegativeFactors"]

    assert len(pos) <= 5
    assert len(neg) <= 5

    # Check required keys in each factor
    for factor in pos + neg:
        assert "feature" in factor
        assert "label" in factor
        assert "value" in factor
        assert "shapValue" in factor
        assert factor["feature"] in FEATURE_LABELS
        assert 0.0 <= factor["value"] <= 1.0

    # Positive factors descending ordering check
    for i in range(len(pos) - 1):
        assert pos[i]["shapValue"] >= pos[i + 1]["shapValue"] - 1e-6

    # Negative factors ascending ordering check (most negative first)
    for i in range(len(neg) - 1):
        assert neg[i]["shapValue"] <= neg[i + 1]["shapValue"] + 1e-6


def test_explainer_shap_value_sign_vs_positive_negative_lists(explainer, sample_profiles):
    """
    All factors in topPositiveFactors must have shapValue >= 0.0.
    All factors in topNegativeFactors must have shapValue <= 0.0.
    """
    for profile in sample_profiles:
        explanation = explainer.explain_recommendation(profile)
        for p in explanation["topPositiveFactors"]:
            assert p["shapValue"] >= 0.0, f"Positive factor has negative shapValue: {p}"
            assert p["impactDirection"] == "POSITIVE"

        for n in explanation["topNegativeFactors"]:
            assert n["shapValue"] <= 0.0, f"Negative factor has positive shapValue: {n}"
            assert n["impactDirection"] == "NEGATIVE"


def test_explainer_determinism_with_fixed_seed(explainer, sample_profiles):
    """Repeated calls with the same profile must be 100% deterministic."""
    profile = sample_profiles[0]

    run1 = explainer.explain_recommendation(profile, stack_code="MERN_FULL_STACK")
    run2 = explainer.explain_recommendation(profile, stack_code="MERN_FULL_STACK")

    assert run1["baseConfidence"] == run2["baseConfidence"]
    assert run1["predictedConfidence"] == run2["predictedConfidence"]
    assert run1["summaryText"] == run2["summaryText"]

    for f1, f2 in zip(run1["topPositiveFactors"], run2["topPositiveFactors"]):
        assert f1["feature"] == f2["feature"]
        assert f1["shapValue"] == f2["shapValue"]

    for f1, f2 in zip(run1["topNegativeFactors"], run2["topNegativeFactors"]):
        assert f1["feature"] == f2["feature"]
        assert f1["shapValue"] == f2["shapValue"]


def test_explainer_global_feature_importance(explainer):
    """Global feature importance must return top N features sorted by mean |SHAP| descending."""
    importance = explainer.get_global_feature_importance(top_n=10)

    assert len(importance) == 10
    for idx, item in enumerate(importance, start=1):
        assert item["rank"] == idx
        assert "feature" in item
        assert "label" in item
        assert "meanAbsShap" in item
        assert item["meanAbsShap"] >= 0.0

    # Verify descending ordering
    for i in range(len(importance) - 1):
        assert importance[i]["meanAbsShap"] >= importance[i + 1]["meanAbsShap"]


def test_explainer_shap_additivity_sanity_check(explainer, sample_profiles):
    """
    Validates SHAP additivity property:
    base_value + sum(all_shap_values) approximately equals model predicted probability.
    """
    for profile in sample_profiles[:3]:
        vec = explainer.preprocessor.transform_single(profile)
        assert explainer.check_additivity(vec, atol=1e-4) is True
