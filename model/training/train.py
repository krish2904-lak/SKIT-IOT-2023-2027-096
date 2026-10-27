"""
Training script for the Random Forest Tech-Stack Recommendation Model.
Loads training data, applies feature extraction pipeline, fits Random Forest Classifier,
evaluates performance metrics, and serializes trained artifacts.
"""

import argparse
import datetime
import json
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

from model.preprocessing.preprocessor import StudentDataPreprocessor

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DEFAULT_DATA_PATH = BASE_DIR / "model" / "data" / "student_tech_stack_dataset.csv"
DEFAULT_OUTPUT_DIR = BASE_DIR / "model" / "saved_models"


def load_dataset(data_path: Path) -> pd.DataFrame:
    """Loads dataset from CSV file."""
    if not data_path.exists():
        raise FileNotFoundError(f"Training dataset not found at {data_path}. Run dataset generator first.")
    df = pd.read_csv(data_path)
    return df


def prepare_training_data(df: pd.DataFrame, preprocessor: StudentDataPreprocessor) -> Tuple[np.ndarray, np.ndarray, LabelEncoder]:
    """Preprocesses features and encodes target classes."""
    records = []
    targets = []

    for _, row in df.iterrows():
        # Parse skills if JSON string
        raw_skills = row.get("skills", "[]")
        if isinstance(raw_skills, str):
            try:
                skills_val = json.loads(raw_skills)
            except json.JSONDecodeError:
                skills_val = [s.strip() for s in raw_skills.split(",") if s.strip()]
        else:
            skills_val = raw_skills

        record = {
            "cgpa": row.get("cgpa", 7.0),
            "academic_scores": {
                "web_technologies": row.get("web_technologies_score", 70.0),
                "dbms": row.get("dbms_score", 70.0),
                "dsa": row.get("dsa_score", 70.0),
                "iot_embedded": row.get("iot_embedded_score", 70.0),
                "ml_math": row.get("ml_math_score", 70.0),
                "cloud_computing": row.get("cloud_computing_score", 70.0),
                "operating_systems": row.get("operating_systems_score", 70.0),
            },
            "interests": row.get("interests", ""),
            "skills": skills_val,
            "projects_completed": row.get("projects_completed", 1),
            "certifications_count": row.get("certifications_count", 0),
        }
        records.append(record)
        targets.append(str(row["target_tech_stack"]))

    X = preprocessor.transform(records)
    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(targets)

    return X, y, label_encoder


def train_model(
    data_path: Path = DEFAULT_DATA_PATH,
    output_dir: Path = DEFAULT_OUTPUT_DIR,
    n_estimators: int = 100,
    max_depth: int = 15,
    random_state: int = 42,
    test_size: float = 0.20,
) -> Dict[str, Any]:
    """
    Executes full training pipeline, prints evaluation metrics,
    and persists trained model artifacts.
    """
    print(f"--- F-096 Tech-Stack Model Training Started ---")
    print(f"Loading data from: {data_path}")
    df = load_dataset(data_path)
    print(f"Loaded {len(df)} records across {df['target_tech_stack'].nunique()} target stacks.")

    preprocessor = StudentDataPreprocessor()
    X, y, label_encoder = prepare_training_data(df, preprocessor)
    print(f"Feature matrix shape: {X.shape} ({X.shape[1]} engineered features)")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    print(f"Train set: {X_train.shape[0]} samples | Test set: {X_test.shape[0]} samples")

    print(f"Training Random Forest Classifier (n_estimators={n_estimators}, max_depth={max_depth})...")
    clf = RandomForestClassifier(
        n_estimators=n_estimators,
        max_depth=max_depth,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=random_state,
        n_jobs=-1,
    )
    clf.fit(X_train, y_train)

    # Predictions & Evaluation
    y_pred = clf.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    report = classification_report(
        y_test,
        y_pred,
        target_names=label_encoder.classes_,
        output_dict=True,
        zero_division=0,
    )
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature Importances (Gini Importance)
    feature_names = preprocessor.get_feature_names()
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    top_features = [
        {"feature": feature_names[i], "importance": round(float(importances[i]), 4)}
        for i in sorted_idx[:15]
    ]

    print("\n--- Model Evaluation Results ---")
    print(f"Accuracy:          {acc:.4f} ({acc * 100:.2f}%)")
    print(f"Precision (Macro): {prec_macro:.4f}")
    print(f"Recall (Macro):    {rec_macro:.4f}")
    print(f"F1-Score (Macro):  {f1_macro:.4f}")
    print(f"F1-Score (Weight): {f1_weighted:.4f}")
    print("\nTop 5 Influential Features:")
    for tf in top_features[:5]:
        print(f"  - {tf['feature']}: {tf['importance']}")

    # Ensure output directory exists
    output_dir.mkdir(parents=True, exist_ok=True)

    # Save artifacts
    model_path = output_dir / "rf_tech_stack_model.joblib"
    preprocessor_path = output_dir / "preprocessor.joblib"
    metadata_path = output_dir / "model_metadata.json"

    artifacts = {
        "model": clf,
        "classes": label_encoder.classes_.tolist(),
        "feature_names": feature_names,
    }
    joblib.dump(artifacts, model_path)
    joblib.dump(preprocessor, preprocessor_path)

    metadata = {
        "model_type": "RandomForestClassifier",
        "model_version": "1.0.0-rf",
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "n_samples": len(df),
        "train_samples": int(X_train.shape[0]),
        "test_samples": int(X_test.shape[0]),
        "num_features": len(feature_names),
        "target_classes": label_encoder.classes_.tolist(),
        "hyperparameters": {
            "n_estimators": n_estimators,
            "max_depth": max_depth,
            "min_samples_split": 4,
            "min_samples_leaf": 2,
            "class_weight": "balanced",
            "random_state": random_state,
        },
        "metrics": {
            "accuracy": round(acc, 4),
            "precision_macro": round(prec_macro, 4),
            "precision_weighted": round(prec_weighted, 4),
            "recall_macro": round(rec_macro, 4),
            "recall_weighted": round(rec_weighted, 4),
            "f1_macro": round(f1_macro, 4),
            "f1_weighted": round(f1_weighted, 4),
        },
        "top_features": top_features,
        "classification_report": report,
        "confusion_matrix": cm,
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"\nArtifacts saved successfully:")
    print(f"  - Model:        {model_path}")
    print(f"  - Preprocessor: {preprocessor_path}")
    print(f"  - Metadata:     {metadata_path}")
    print(f"--- Training Completed Successfully ---\n")

    return metadata


def parse_args():
    parser = argparse.ArgumentParser(description="Train Tech-Stack Recommendation Model")
    parser.add_argument("--data-path", type=str, default=str(DEFAULT_DATA_PATH), help="Path to training CSV")
    parser.add_argument("--output-dir", type=str, default=str(DEFAULT_OUTPUT_DIR), help="Directory to save model artifacts")
    parser.add_argument("--n-estimators", type=int, default=100, help="Number of trees")
    parser.add_argument("--max-depth", type=int, default=15, help="Maximum tree depth")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    train_model(
        data_path=Path(args.data_path),
        output_dir=Path(args.output_dir),
        n_estimators=args.n_estimators,
        max_depth=args.max_depth,
    )
