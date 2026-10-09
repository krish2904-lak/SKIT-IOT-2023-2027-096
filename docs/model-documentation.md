# AI / ML Tech-Stack Recommendation Model Documentation

**Project Title:** AI Based Tech-Stack Recommendation with ERP Integration  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Document Author:** Nishant Kumawat (Team Lead — AI/ML & System Integration)  
**Sprint:** Sprint 3 — Tech Stack Prediction Model (Current Sprint)  
**Date:** October 2026  

---

## 1. Overview

Sprint 3 implements the core Machine Learning recommendation engine for Project F-096. The engine uses a multi-class **Random Forest Classifier** (`sklearn.ensemble.RandomForestClassifier`) to predict personalized technology stack recommendations for engineering students using academic records, self-declared skills, and career interests.

---

## 2. Dataset

- **Source File:** `model/data/student_tech_stack_dataset.csv`
- **Volume:** 1,000 student profile instances.
- **Class Balance:** Uniformly distributed across 7 target technology stack classes.
- **Split Ratio:** 80% Training (800 records), 20% Holdout Testing (200 records), stratified by class.
- **Separation of Sample Fixtures:** Dedicated test profiles are maintained in `model/data/sample_student_profiles.json` for validation and API simulation.

---

## 3. Features & Inputs

The model operates on a **48-dimensional feature vector**:
1. **Academic ERP Marks (8 features):** `cgpa`, `course_web_technologies`, `course_dbms`, `course_dsa`, `course_iot_embedded`, `course_ml_math`, `course_cloud_computing`, `course_operating_systems`.
2. **Career Interests (7 features):** Binary flags for `web_development`, `ai_ml`, `iot_embedded`, `cloud_devops`, `mobile_dev`, `data_analytics`, `cybersecurity`.
3. **Technical Skills (31 features):** Weighted normalized indicators for languages, frameworks, databases, DevOps tools, and IoT hardware components.
4. **Experience Indicators (2 features):** Normalized project count and certification counts.

---

## 4. Preprocessing Pipeline

The preprocessing lifecycle is encapsulated in `model.preprocessing.StudentDataPreprocessor`:
1. Normalizes academic grades to `[0.0, 1.0]`.
2. Maps case-insensitive skill aliases and colloquialisms to canonical tokens.
3. Quantifies skill proficiencies (`beginner` = 0.33, `intermediate` = 0.67, `advanced` = 1.0).
4. Employs defensive imputation to safeguard against missing subject marks or incomplete inputs.
5. Emits a fixed-shape NumPy array ready for model inference.

---

## 5. Model Architecture & Hyperparameters

The model utilizes Scikit-learn's Random Forest Classifier with ensemble bagging:

| Hyperparameter | Value | Rationale |
|---|---|---|
| `n_estimators` | `100` | Ensures stable ensemble consensus and smooth class probabilities. |
| `max_depth` | `15` | Captures non-linear feature interactions without overfitting. |
| `min_samples_split`| `4` | Prevents isolated single-sample leaf splits. |
| `min_samples_leaf` | `2` | Enhances generalization across diverse skill combinations. |
| `class_weight` | `balanced` | Safeguards balanced penalization across all 7 target classes. |
| `random_state` | `42` | Ensures 100% deterministic reproducibility. |

---

## 6. Training & Serialization

Training is executed via `model/training/train.py`:
```bash
python -m model.training.train --n-estimators 100 --max-depth 15
```

Serialized artifacts are written to `model/saved_models/`:
- `rf_tech_stack_model.joblib`: Trained Random Forest model, class labels, and feature names.
- `preprocessor.joblib`: Serialized preprocessor pipeline.
- `model_metadata.json`: Model version, training timestamp, hyperparameters, and evaluation metrics.

---

## 7. Evaluation & Benchmark Results

### 7.1 Holdout Test Evaluation (200 Test Samples)
- **Accuracy:** `100.0%` (1.0000)
- **Macro Precision:** `1.0000`
- **Macro Recall:** `1.0000`
- **Macro F1-Score:** `1.0000`
- **Weighted F1-Score:** `1.0000`

### 7.2 5-Fold Stratified Cross-Validation
- **Fold 1:** 100.0%
- **Fold 2:** 100.0%
- **Fold 3:** 100.0%
- **Fold 4:** 100.0%
- **Fold 5:** 100.0%
- **Mean Accuracy:** `1.0000 (+/- 0.0000)`

### 7.3 Top Influential Features (Gini Importance)
1. `skill_pytorch` (0.0702)
2. `skill_kubernetes` (0.0598)
3. `skill_flutter` (0.0517)
4. `skill_sql` (0.0465)
5. `skill_docker` (0.0462)

---

## 8. Prediction & Recommendation Flow

The inference engine (`model.recommendation.TechStackPredictor`) executes the following pipeline:

```text
Student Profile Input (Dict / JSON / Pydantic)
                      │
                      ▼
┌───────────────────────────────────────────────┐
│     model.preprocessing.preprocessor          │
│ - Canonicalize skill & interest tokens        │
│ - Impute missing values with defensive defaults│
│ - Construct 48-dimensional float32 vector     │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────┐
│        RandomForestClassifier Inference       │
│ - clf.predict_proba(vector)                   │
│ - Multi-class probability distribution        │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
┌───────────────────────────────────────────────┐
│        Top-K Ranking & Metadata Mapping       │
│ - Sort classes by probability descending      │
│ - Calculate normalized Match Score (0 - 100%) │
│ - Attach rich stack metadata (roles, tools)   │
│ - Synthesize human-readable rationale snippet │
└─────────────────────┬─────────────────────────┘
                      │
                      ▼
Recommendation Response (JSON matching Frontend & Gateway contracts)
```

---

## 9. FastAPI Microservice Integration

The inference engine is exposed via RESTful endpoints in `ai-service/app/main.py`:
- `GET /health`: Basic health check.
- `GET /api/v1/model-info`: Status, metrics, feature count, and model version.
- `GET /api/v1/tech-stacks`: Full catalog of 7 technology stacks and component technologies.
- `POST /api/v1/recommend`: Accepts student profile, returns primary recommendation and alternatives matching `frontend/src/types/index.ts`.
