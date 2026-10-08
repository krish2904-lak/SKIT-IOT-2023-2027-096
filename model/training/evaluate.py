"""
Evaluation module for the Tech-Stack Recommendation Model.
Computes comprehensive performance diagnostics including Stratified K-Fold
Cross-Validation, macro/micro classification metrics, and confusion matrix analysis.
"""

import argparse
import json
from pathlib import Path
from typing import Dict, Any
import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from sklearn.model_selection import StratifiedKFold, cross_val_score

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.training.train import load_dataset, prepare_training_data

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DATA_PATH = BASE_DIR / "model" / "data" / "student_tech_stack_dataset.csv"
DEFAULT_MODEL_DIR = BASE_DIR / "model" / "saved_models"


def run_cross_validation(data_path: Path = DEFAULT_DATA_PATH, n_splits: int = 5) -> Dict[str, Any]:
    """Runs Stratified 5-Fold Cross Validation on the dataset."""
    df = load_dataset(data_path)
    preprocessor = StudentDataPreprocessor()
    X, y, label_encoder = prepare_training_data(df, preprocessor)

    from sklearn.ensemble import RandomForestClassifier
    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1,
    )

    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    scores = cross_val_score(clf, X, y, cv=skf, scoring="accuracy")

    results = {
        "n_splits": n_splits,
        "fold_accuracies": [round(float(s), 4) for s in scores],
        "mean_accuracy": round(float(np.mean(scores)), 4),
        "std_accuracy": round(float(np.std(scores)), 4),
    }

    print(f"\n--- {n_splits}-Fold Stratified Cross-Validation ---")
    for i, s in enumerate(scores, 1):
        print(f"Fold {i} Accuracy: {s:.4f} ({s*100:.2f}%)")
    print(f"Mean Accuracy:   {results['mean_accuracy']:.4f} (+/- {results['std_accuracy']:.4f})\n")

    return results


def evaluate_saved_model(
    model_dir: Path = DEFAULT_MODEL_DIR,
    data_path: Path = DEFAULT_DATA_PATH,
) -> Dict[str, Any]:
    """Loads saved model and evaluates it against the dataset."""
    model_file = model_dir / "rf_tech_stack_model.joblib"
    if not model_file.exists():
        raise FileNotFoundError(f"Trained model not found at {model_file}. Train model first.")

    artifacts = joblib.load(model_file)
    clf = artifacts["model"]
    classes = artifacts["classes"]

    df = load_dataset(data_path)
    preprocessor = StudentDataPreprocessor()
    X, y, label_encoder = prepare_training_data(df, preprocessor)

    y_pred = clf.predict(X)
    acc = accuracy_score(y, y_pred)
    report = classification_report(y, y_pred, target_names=classes, output_dict=True, zero_division=0)
    cm = confusion_matrix(y, y_pred).tolist()

    print(f"\n--- Evaluation Summary of Saved Model ---")
    print(f"Overall Accuracy on Full Dataset: {acc:.4f} ({acc*100:.2f}%)")

    return {
        "accuracy": round(float(acc), 4),
        "classification_report": report,
        "confusion_matrix": cm,
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate Tech-Stack Recommendation Model")
    parser.add_argument("--data-path", type=str, default=str(DEFAULT_DATA_PATH), help="Path to evaluation data CSV")
    parser.add_argument("--cv", action="store_true", help="Run 5-Fold Cross Validation")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.cv:
        run_cross_validation(Path(args.data_path))
    else:
        evaluate_saved_model(data_path=Path(args.data_path))
