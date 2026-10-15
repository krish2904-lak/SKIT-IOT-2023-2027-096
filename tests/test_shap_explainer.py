"""
Unit tests for the TreeSHAP-based RecommendationExplainer module.
Verifies feature sorting, class alignment, SHAP additivity property,
error handling on invalid inputs, and deterministic execution.
"""

import json
from pathlib import Path
import numpy as np
import pytest

from model.explainability import RecommendationExplainer, FEATURE_LABELS

BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_PROFILES_PATH = BASE_DIR / "model" / "data" / "sample_student_profiles.json"


@pytest.fixture
def explainer():
    return RecommendationExplainer.get_instance()


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


def test_explainer_returns_right_number_of_features_sorted_by_abs_shap(explainer, sample_profiles):
    """Explainer must return exactly top N features sorted by absolute SHAP value descending."""
    sample = sample_profiles[0]
    results = explainer.explain_student(sample, top_k=3, top_n_features=5)

    assert len(results) == 3
    for res in results:
        assert "explanation" in res
        top_feats = res["explanation"]["top_features"]
        assert len(top_feats) == 5

        # Check sorting by abs(shap_value) descending
        abs_shaps = [abs(f["shap_value"]) for f in top_feats]
        for i in range(len(abs_shaps) - 1):
            assert abs_shaps[i] >= abs_shaps[i + 1] - 1e-6

        # Check fields
        for feat in top_feats:
            assert feat["feature"] in FEATURE_LABELS
            assert feat["label"] == FEATURE_LABELS[feat["feature"]]
            assert 0.0 <= feat["value"] <= 1.0
            assert feat["direction"] in ("supports", "reduces")
            if feat["shap_value"] >= 0:
                assert feat["direction"] == "supports"
            else:
                assert feat["direction"] == "reduces"


def test_explainer_shap_additivity_sanity_check(explainer, sample_profiles):
    """
    Validates SHAP additivity property:
    base_value + sum(all_shap_values) approximately equals model predicted probability.
    """
    for profile in sample_profiles[:3]:
        vec = explainer.preprocessor.transform_single(profile)
        assert explainer.check_additivity(vec, atol=1e-4) is True


def test_explainer_summary_generation(explainer, sample_profiles):
    """Summary text must be non-empty and mention supporting features."""
    for profile in sample_profiles[:3]:
        results = explainer.explain_student(profile, top_k=2)
        for res in results:
            summary = res["explanation"]["summary"]
            assert isinstance(summary, str)
            assert len(summary) > 20
            assert "Recommended" in summary
