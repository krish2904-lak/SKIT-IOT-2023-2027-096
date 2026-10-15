"""
Evaluation module for the Tech-Stack Recommendation Model.
Computes comprehensive performance diagnostics including Stratified K-Fold
Cross-Validation, per-class classification metrics, confusion matrix analysis,
hyperparameter comparison benchmarking, and metrics serialization.
"""

import argparse
import datetime
import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import time
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split

from model.preprocessing.preprocessor import StudentDataPreprocessor
from model.training.train import load_dataset, prepare_training_data

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DATA_PATH = BASE_DIR / "model" / "data" / "student_tech_stack_dataset.csv"
DEFAULT_MODEL_DIR = BASE_DIR / "model" / "saved_models"


def format_confusion_matrix(cm: np.ndarray, classes: List[str]) -> str:
    """Formats confusion matrix into a clean, human-readable ASCII table."""
    short_names = [c[:12] for c in classes]
    col_width = max(max(len(name) for name in short_names) + 2, 7)
    header = f"{'True \\ Pred':<16}" + "".join(f"{name:>{col_width}}" for name in short_names)
    separator = "-" * len(header)
    rows = [header, separator]
    for i, row in enumerate(cm):
        row_str = f"{short_names[i]:<16}" + "".join(f"{val:>{col_width}}" for val in row)
        rows.append(row_str)
    return "\n".join(rows)


def print_classification_table(report: Dict[str, Any]) -> None:
    """Prints a nicely formatted per-class classification table."""
    print(f"\n{'Class / Technology Stack':<26} {'Precision':>10} {'Recall':>10} {'F1-Score':>10} {'Support':>10}")
    print("-" * 70)
    for key, metrics in report.items():
        if key in ("accuracy", "macro avg", "weighted avg"):
            continue
        prec = metrics.get("precision", 0.0)
        rec = metrics.get("recall", 0.0)
        f1 = metrics.get("f1-score", 0.0)
        supp = int(metrics.get("support", 0))
        print(f"{key:<26} {prec:>10.4f} {rec:>10.4f} {f1:>10.4f} {supp:>10}")
    print("-" * 70)
    if "macro avg" in report:
        m = report["macro avg"]
        print(f"{'Macro Average':<26} {m['precision']:>10.4f} {m['recall']:>10.4f} {m['f1-score']:>10.4f} {int(m['support']):>10}")
    if "weighted avg" in report:
        w = report["weighted avg"]
        print(f"{'Weighted Average':<26} {w['precision']:>10.4f} {w['recall']:>10.4f} {w['f1-score']:>10.4f} {int(w['support']):>10}")
    if "accuracy" in report:
        print(f"{'Overall Accuracy':<26} {'':>10} {'':>10} {report['accuracy']:>10.4f}")
    print("-" * 70)


def run_cross_validation(
    data_path: Path = DEFAULT_DATA_PATH,
    n_splits: int = 5,
    random_state: int = 42,
) -> Dict[str, Any]:
    """Runs Stratified K-Fold Cross Validation with multi-metric scoring."""
    df = load_dataset(data_path)
    preprocessor = StudentDataPreprocessor()
    X, y, label_encoder = prepare_training_data(df, preprocessor)

    clf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state,
        n_jobs=-1,
    )

    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)
    scoring = {
        "accuracy": "accuracy",
        "precision_macro": "precision_macro",
        "recall_macro": "recall_macro",
        "f1_macro": "f1_macro",
    }
    cv_results = cross_validate(clf, X, y, cv=skf, scoring=scoring, return_train_score=False)

    accs = [round(float(s), 4) for s in cv_results["test_accuracy"]]
    f1s = [round(float(s), 4) for s in cv_results["test_f1_macro"]]
    precs = [round(float(s), 4) for s in cv_results["test_precision_macro"]]
    recs = [round(float(s), 4) for s in cv_results["test_recall_macro"]]

    results = {
        "n_splits": n_splits,
        "fold_accuracies": accs,
        "fold_f1_macro": f1s,
        "mean_accuracy": round(float(np.mean(accs)), 4),
        "std_accuracy": round(float(np.std(accs)), 4),
        "mean_f1_macro": round(float(np.mean(f1s)), 4),
        "std_f1_macro": round(float(np.std(f1s)), 4),
        "mean_precision_macro": round(float(np.mean(precs)), 4),
        "std_precision_macro": round(float(np.std(precs)), 4),
        "mean_recall_macro": round(float(np.mean(recs)), 4),
        "std_recall_macro": round(float(np.std(recs)), 4),
    }

    print(f"\n=======================================================")
    print(f"   {n_splits}-Fold Stratified Cross-Validation Diagnostics")
    print(f"=======================================================")
    for i in range(n_splits):
        print(f"Fold {i+1}: Accuracy = {accs[i]:.4f} ({accs[i]*100:.2f}%) | F1-Macro = {f1s[i]:.4f} | Prec = {precs[i]:.4f} | Rec = {recs[i]:.4f}")
    print("-" * 55)
    print(f"Mean Accuracy:        {results['mean_accuracy']:.4f} (+/- {results['std_accuracy']:.4f})")
    print(f"Mean Precision-Macro: {results['mean_precision_macro']:.4f} (+/- {results['std_precision_macro']:.4f})")
    print(f"Mean Recall-Macro:    {results['mean_recall_macro']:.4f} (+/- {results['std_recall_macro']:.4f})")
    print(f"Mean F1-Macro:        {results['mean_f1_macro']:.4f} (+/- {results['std_f1_macro']:.4f})\n")

    return results


def compare_hyperparameters(
    data_path: Path = DEFAULT_DATA_PATH,
    n_splits: int = 5,
    random_state: int = 42,
) -> List[Dict[str, Any]]:
    """
    Evaluates multiple Random Forest hyperparameter configurations
    via Stratified K-Fold CV to benchmark and justify the production model.
    """
    df = load_dataset(data_path)
    preprocessor = StudentDataPreprocessor()
    X, y, _ = prepare_training_data(df, preprocessor)
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    configurations = [
        {"name": "Lightweight", "n_estimators": 25, "max_depth": 8, "min_samples_split": 4, "min_samples_leaf": 2},
        {"name": "Standard", "n_estimators": 50, "max_depth": 10, "min_samples_split": 4, "min_samples_leaf": 2},
        {"name": "Production (Current)", "n_estimators": 100, "max_depth": 15, "min_samples_split": 4, "min_samples_leaf": 2},
        {"name": "Deep Ensemble", "n_estimators": 150, "max_depth": 20, "min_samples_split": 2, "min_samples_leaf": 1},
        {"name": "Unbounded Depth", "n_estimators": 100, "max_depth": None, "min_samples_split": 2, "min_samples_leaf": 1},
    ]

    print(f"\n=========================================================================")
    print(f"   Hyperparameter Comparison & Benchmark ({n_splits}-Fold Cross-Validation)")
    print(f"=========================================================================")

    leaderboard = []
    for cfg in configurations:
        clf = RandomForestClassifier(
            n_estimators=cfg["n_estimators"],
            max_depth=cfg["max_depth"],
            min_samples_split=cfg["min_samples_split"],
            min_samples_leaf=cfg["min_samples_leaf"],
            class_weight="balanced",
            random_state=random_state,
            n_jobs=-1,
        )

        start_time = time.time()
        scores = cross_validate(
            clf, X, y, cv=skf, scoring=["accuracy", "f1_macro"], return_train_score=False
        )
        elapsed = time.time() - start_time

        acc_mean = float(np.mean(scores["test_accuracy"]))
        acc_std = float(np.std(scores["test_accuracy"]))
        f1_mean = float(np.mean(scores["test_f1_macro"]))
        f1_std = float(np.std(scores["test_f1_macro"]))

        entry = {
            "config_name": cfg["name"],
            "n_estimators": cfg["n_estimators"],
            "max_depth": str(cfg["max_depth"]),
            "mean_accuracy": round(acc_mean, 4),
            "std_accuracy": round(acc_std, 4),
            "mean_f1_macro": round(f1_mean, 4),
            "std_f1_macro": round(f1_std, 4),
            "cv_duration_seconds": round(elapsed, 2),
        }
        leaderboard.append(entry)

    # Sort leaderboard by mean accuracy then F1
    leaderboard.sort(key=lambda x: (x["mean_accuracy"], x["mean_f1_macro"]), reverse=True)

    header = f"{'Configuration':<22} {'Trees':>6} {'Depth':>7} {'Accuracy':>16} {'F1-Macro':>16} {'Time (s)':>10}"
    print(header)
    print("-" * len(header))
    for row in leaderboard:
        acc_str = f"{row['mean_accuracy']:.4f} (+/-{row['std_accuracy']:.3f})"
        f1_str = f"{row['mean_f1_macro']:.4f} (+/-{row['std_f1_macro']:.3f})"
        print(f"{row['config_name']:<22} {row['n_estimators']:>6} {row['max_depth']:>7} {acc_str:>16} {f1_str:>16} {row['cv_duration_seconds']:>10.2f}")
    print("-" * len(header))
    print(f"[Leaderboard Result] Optimal balance achieved by: {leaderboard[0]['config_name']}\n")

    return leaderboard


def evaluate_saved_model(
    model_dir: Path = DEFAULT_MODEL_DIR,
    data_path: Path = DEFAULT_DATA_PATH,
    holdout_split: bool = True,
    test_size: float = 0.20,
    save_path: Optional[Path] = None,
) -> Dict[str, Any]:
    """Loads saved model and produces detailed evaluation diagnostics."""
    model_file = model_dir / "rf_tech_stack_model.joblib"
    if not model_file.exists():
        raise FileNotFoundError(f"Trained model not found at {model_file}. Train model first.")

    artifacts = joblib.load(model_file)
    clf = artifacts["model"]
    classes = artifacts["classes"]

    df = load_dataset(data_path)
    preprocessor = StudentDataPreprocessor()
    X, y, label_encoder = prepare_training_data(df, preprocessor)

    if holdout_split:
        _, X_eval, _, y_eval = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        split_desc = f"Holdout Test Split ({int(len(X_eval))} samples, {int(test_size*100)}%)"
    else:
        X_eval, y_eval = X, y
        split_desc = f"Complete Dataset ({len(X_eval)} samples)"

    y_pred = clf.predict(X_eval)
    acc = accuracy_score(y_eval, y_pred)
    prec_macro = precision_score(y_eval, y_pred, average="macro", zero_division=0)
    rec_macro = recall_score(y_eval, y_pred, average="macro", zero_division=0)
    f1_macro = f1_score(y_eval, y_pred, average="macro", zero_division=0)
    report = classification_report(y_eval, y_pred, target_names=classes, output_dict=True, zero_division=0)
    cm = confusion_matrix(y_eval, y_pred)

    print(f"\n=======================================================")
    print(f"   Model Evaluation Report: {split_desc}")
    print(f"=======================================================")
    print(f"Accuracy:          {acc:.4f} ({acc*100:.2f}%)")
    print(f"Macro Precision:   {prec_macro:.4f}")
    print(f"Macro Recall:      {rec_macro:.4f}")
    print(f"Macro F1-Score:    {f1_macro:.4f}")

    print_classification_table(report)

    print("\nConfusion Matrix:")
    print(format_confusion_matrix(cm, classes))
    print()

    results = {
        "evaluation_scope": split_desc,
        "n_samples": int(len(X_eval)),
        "accuracy": round(float(acc), 4),
        "precision_macro": round(float(prec_macro), 4),
        "recall_macro": round(float(rec_macro), 4),
        "f1_macro": round(float(f1_macro), 4),
        "classification_report": report,
        "confusion_matrix": cm.tolist(),
        "evaluated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
    }

    if save_path:
        save_path = Path(save_path)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"[SUCCESS] Metrics exported to: {save_path}")

    return results


def parse_args():
    parser = argparse.ArgumentParser(description="Evaluate Tech-Stack Recommendation Model")
    parser.add_argument("--data-path", type=str, default=str(DEFAULT_DATA_PATH), help="Path to evaluation data CSV")
    parser.add_argument("--cv", action="store_true", help="Run Stratified K-Fold Cross Validation")
    parser.add_argument("--n-splits", type=int, default=5, help="Number of CV splits")
    parser.add_argument("--compare-hyperparams", action="store_true", help="Run hyperparameter comparison benchmark")
    parser.add_argument("--full-dataset", action="store_true", help="Evaluate on full dataset instead of 20% holdout")
    parser.add_argument("--save-metrics", type=str, default=None, help="File path to save JSON metrics report")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    if args.compare_hyperparams:
        compare_hyperparameters(Path(args.data_path), n_splits=args.n_splits)
    elif args.cv:
        run_cross_validation(Path(args.data_path), n_splits=args.n_splits)
    else:
        save_file = Path(args.save_metrics) if args.save_metrics else None
        evaluate_saved_model(
            data_path=Path(args.data_path),
            holdout_split=not args.full_dataset,
            save_path=save_file,
        )

