"""
Unit tests for the model evaluation module (model/training/evaluate.py).
Tests holdout validation, cross-validation, hyperparameter benchmarking,
confusion matrix formatting, and metrics serialization.
"""

import json
from pathlib import Path
import numpy as np
import pytest

from model.training.evaluate import (
    evaluate_saved_model,
    run_cross_validation,
    compare_hyperparameters,
    format_confusion_matrix,
    print_classification_table,
)


def test_format_confusion_matrix():
    """Validates ASCII confusion matrix formatting."""
    classes = ["AI_ML", "IOT", "MERN"]
    cm = np.array([
        [10, 0, 1],
        [0, 12, 0],
        [2, 0, 8],
    ])
    formatted = format_confusion_matrix(cm, classes)
    assert "True \\ Pred" in formatted
    assert "AI_ML" in formatted
    assert "IOT" in formatted
    assert "MERN" in formatted
    assert "10" in formatted
    assert "12" in formatted


def test_evaluate_saved_model_holdout():
    """Validates evaluation on 20% holdout split."""
    results = evaluate_saved_model(holdout_split=True, test_size=0.20)
    assert results["n_samples"] == 200
    assert 0.0 <= results["accuracy"] <= 1.0
    assert 0.0 <= results["precision_macro"] <= 1.0
    assert 0.0 <= results["recall_macro"] <= 1.0
    assert 0.0 <= results["f1_macro"] <= 1.0
    assert "classification_report" in results
    assert "confusion_matrix" in results
    assert len(results["confusion_matrix"]) == 7


def test_evaluate_saved_model_full_dataset():
    """Validates evaluation on the full dataset."""
    results = evaluate_saved_model(holdout_split=False)
    assert results["n_samples"] == 1000
    assert results["accuracy"] >= 0.95
    assert results["f1_macro"] >= 0.95


def test_evaluate_saved_model_json_export(tmp_path: Path):
    """Validates saving evaluation metrics to a JSON file."""
    output_json = tmp_path / "metrics.json"
    results = evaluate_saved_model(holdout_split=True, save_path=output_json)
    assert output_json.exists()
    
    with open(output_json, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert data["n_samples"] == 200
    assert "accuracy" in data
    assert "evaluated_at" in data


def test_run_cross_validation():
    """Validates stratified cross validation execution and metric calculation."""
    # Run with 3 splits for test efficiency
    results = run_cross_validation(n_splits=3)
    assert results["n_splits"] == 3
    assert len(results["fold_accuracies"]) == 3
    assert results["mean_accuracy"] >= 0.95
    assert results["mean_f1_macro"] >= 0.95
    assert results["std_accuracy"] >= 0.0


def test_compare_hyperparameters():
    """Validates hyperparameter comparison leaderboard generation."""
    # Run with 2 splits for fast testing
    leaderboard = compare_hyperparameters(n_splits=2)
    assert len(leaderboard) == 5
    config_names = [entry["config_name"] for entry in leaderboard]
    assert "Lightweight" in config_names
    assert "Standard" in config_names
    assert "Production (Current)" in config_names
    for entry in leaderboard:
        assert "mean_accuracy" in entry
        assert "mean_f1_macro" in entry
        assert "cv_duration_seconds" in entry
