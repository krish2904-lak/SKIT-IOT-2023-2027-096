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
- `GET /api/v1/tech-stacks`: Full catalog of 7 technology stacks, component technologies, and 3-phase roadmaps.
- `POST /api/v1/recommend`: Accepts student profile, returns top-K ranked recommendations, match scores, why-recommended snippets, and 3-phase learning roadmaps.
- `POST /api/v1/explain`: Accepts student profile and optional stack code, returning transparent feature attributions (SHAP weights), positive drivers, bridgeable gaps with remedies, and learning prerequisites.

```bash
# Start FastAPI AI Service (from repository root)
uvicorn --app-dir ai-service app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 10. Structured 3-Phase Learning Roadmaps

Each technology stack in `model.recommendation.tech_stacks.TECH_STACK_CATALOG` includes a concrete, 3-phase progression:
1. **Phase 1: Architecture & Foundations (Weeks 1–3/4):** Core paradigms, syntax, and foundational lab manual alignments.
2. **Phase 2: Microservices & Persistence (Weeks 4–7/8):** Database modeling, REST/telemetry streams, and middleware patterns.
3. **Phase 3: Production Deployment & Observability (Weeks 8–11/12):** Containerization, CI/CD pipelines, and cloud monitoring.

These roadmaps are surfaced directly through both the REST API and the student dashboard UI.

---

## 11. Explainable AI (XAI) & SHAP Feature Attribution

The system integrates transparent Explainable AI through **TreeSHAP** (`shap.TreeExplainer`) encapsulated in `model.explainability.RecommendationExplainer`:

### 11.1 Architecture & Implementation
- **Explainer Class:** `RecommendationExplainer` maintains a singleton instance that compiles and caches the `shap.TreeExplainer` on top of the trained `RandomForestClassifier` once during application warm-up.
- **Sub-Millisecond Inference:** Computing exact SHAP attributions across all 48 features for the top recommendations takes **~50–60ms** on standard CPU hardware.
- **Additivity Verification:** Follows cooperative game theory additivity:
  $$\text{Model Probability} \approx \text{Base Value} + \sum_{i=1}^{48} \text{SHAP}_i$$
  Sanity-checked in test suites with absolute tolerance $\le 10^{-4}$.
- **Class Alignment:** Matches the 7 target technology stack classes (`model.classes_`) exactly, handling SHAP dimensionality variations (list of arrays vs. 3D numpy ndarray) robustly.

### 11.2 Attribution Output per Recommended Stack
For each recommended technology stack, the explainer produces:
- **`top_features`:** Top N (default 5) features ranked by absolute SHAP impact $| \text{SHAP} |$:
  - `feature`: Internal token (e.g., `skill_python`, `course_ml_math`).
  - `label`: Human-readable label mapped via `model/explainability/labels.py` (e.g., "Python Programming Skill").
  - `value`: Student's input value $[0.0, 1.0]$.
  - `shap_value`: Exact TreeSHAP attribution value.
  - `direction`: `"supports"` ($\text{SHAP} \ge 0$) or `"reduces"` ($\text{SHAP} < 0$).
- **`summary`:** Deterministic, template-driven plain-language narrative summarizing the primary positive drivers and any reducing factors without requiring an external LLM.

### 11.3 API Exposure
- `POST /api/v1/recommend?explain=true`: Additive opt-in explanation parameter.
- `POST /api/v1/recommend/explain`: Dedicated explanation endpoint.
- Detailed contracts and frontend integration examples are documented in `docs/explainability-api-contract.md`.

---

## 12. Evaluation Diagnostics & Hyperparameter Benchmark

Comprehensive evaluation tools are provided via `model/training/evaluate.py`:
- **Stratified K-Fold CV:** Evaluates cross-validation accuracy, macro precision, macro recall, and macro F1 score.
- **Hyperparameter Leaderboard:** Benchmarks 5 configurations (`Lightweight`, `Standard`, `Production`, `Deep Ensemble`, `Unbounded Depth`) across execution latency and generalizability.
- **Metrics Serialization:** Outputs JSON diagnostic reports (`model/saved_models/evaluation_metrics.json`) for auditing and integration testing.

---

## 13. Resume Extraction & Competency Mapping (Sprint 4)

Sprint 4 introduces an automated resume extraction pipeline encapsulated under `model.resume`:

### 13.1 Architecture & Components
1. **Document Ingestion (`model.resume.parser`):**
   - Ingests `.pdf`, `.docx`, `.txt`, and pasted string text buffers strictly in-memory.
   - Enforces a 5 MB maximum file size limit; unsupported media types reject with HTTP 415.
   - Strict zero-persistence policy: no uploaded resume files or texts are ever written to disk or recorded in application logs.
2. **Skill Taxonomy (`model/resume/skills_taxonomy.json`):**
   - Comprehensive canonical mapping covering all 31 technical skills and 7 interest domains.
   - Resolves aliases and colloquialisms (e.g., `Node.js`, `k8s`, `Python 3`, `ES6`) into canonical feature tokens and target technology stack ecosystems.
3. **Dual Extractor Engine (`model.resume.extractor`):**
   - `RuleBasedExtractor`: Default, offline, deterministic extractor identifying technical skills, experience tiers, projects, certifications, and academic CGPA hints using regex and taxonomy matching.
   - `LLMExtractor`: Optional extractor activated when an API key (e.g. `GEMINI_API_KEY`) is set. Enforces strict JSON via Pydantic; automatically falls back to `RuleBasedExtractor` on network timeout, invalid schema, or parsing failure.
4. **Feature Mapper & Precedence Rule (`model.resume.mapper`):**
   - Merges extracted resume competencies with manually declared form inputs.
   - **The Precedence Rule ("Manual Wins"):** Manually declared student inputs strictly supersede resume extractions; resume extractions only fill missing attributes.
   - Missing features are defensively imputed using the model training pipeline defaults (CGPA `0.70`, course marks `0.70`, skills/interests `0.0`, projects `0.10`, certs `0.0`).
   - Computes a granular confidence score $[0.0, 1.0]$ for each of the 48 features.
5. **REST API Microservice Endpoints (`ai-service`):**
   - `POST /api/v1/resume/extract`: Ingests resume file or text, returning extracted competencies, 48-feature mapping, and field-level confidences.
   - `POST /api/v1/recommend/from-resume`: End-to-end ingestion, mapping, profile merging, and Random Forest inference with optional TreeSHAP explanation (`?explain=true`).
   - Detailed schema and integration examples are documented in `docs/resume-extraction-api-contract.md`.

