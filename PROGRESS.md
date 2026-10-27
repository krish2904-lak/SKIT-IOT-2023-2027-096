# Sprint 3 Progress & Handoff Log — AI/ML Core (Nishant Kumawat)

**Project:** F-096 "AI Based Tech-Stack Recommendation with ERP Integration"  
**Branch:** `nishant`  
**Role:** Nishant Kumawat (Team Lead — AI/ML & System Integration)  
**Date:** October 2026  

---

## 1. Work Completed & Committed in this Session

1. **Model Evaluation & Benchmarking Module (`model/training/evaluate.py`):**
   - Stratified K-Fold Cross-Validation with multi-metric scoring (Accuracy, Macro Precision, Macro Recall, Macro F1).
   - Hyperparameter comparison benchmark leaderboard testing 5 ensemble configurations (`Lightweight`, `Standard`, `Production`, `Deep Ensemble`, `Unbounded Depth`).
   - Holdout test split evaluation (200 holdout samples) + full dataset evaluation option.
   - ASCII Confusion Matrix formatter and per-class classification table.
   - Serialized evaluation metrics to JSON (`model/saved_models/evaluation_metrics.json`).
   - CLI flags: `--compare-hyperparams`, `--cv`, `--n-splits`, `--full-dataset`, `--save-metrics`.

2. **Evaluation Automated Test Suite (`tests/test_evaluation.py`):**
   - 6 unit tests covering holdout evaluation, full dataset validation, JSON export, cross-validation, hyperparameter benchmarking, and confusion matrix formatting.

3. **3-Phase Structured Learning Roadmaps (`model/recommendation/tech_stacks.py`):**
   - Designed and populated rich, actionable 3-phase roadmaps across all 7 technology stacks (Phase 1: Foundations & Architecture, Phase 2: Microservices & Data Persistence, Phase 3: Deployment & Cloud Observability).
   - Integrated `roadmap` into `TechStackPredictor` output and `RecommendationItemResponse` Pydantic schema in FastAPI.

4. **Explainable AI (XAI) Engine & REST API (`model/recommendation/explainability.py`):**
   - Implemented `TechStackExplainer` providing SHAP-aligned feature attribution.
   - Calculates top positive drivers (ERP subject marks, student career interests, existing skills).
   - Identifies bridgeable skill gaps with projected score boosts (+3.8% to +6.8%) and institutional remedies (e.g. SKIT IoT lab workshops, departmental electives).
   - Provides stack-specific foundational learning prerequisites.
   - Exposed `POST /api/v1/explain` in FastAPI microservice (`ai-service/app/main.py`) with schemas in `ai-service/app/schemas.py`.

5. **Explainability Test Suite (`tests/test_explainability.py`):**
   - 5 unit and integration tests covering singleton initialization, primary recommendation explanation, specific stack code explanation, `FeatureImpact` schema compliance, and HTTP API endpoint `/api/v1/explain`.

6. **Full Test Suite Status:**
   - 28 automated tests passing across 5 test suites (`test_preprocessing.py`, `test_prediction.py`, `test_api.py`, `test_evaluation.py`, `test_explainability.py`).

7. **Documentation Updates:**
   - Updated `docs/model-documentation.md` and `weekly_reports/sprint_progress_report.md`.

---

## 2. Verification & Running Instructions

### Run the Complete Test Suite
```bash
.\.venv\Scripts\pytest -v
```

### Run Model Evaluation
```bash
# Holdout test split evaluation (200 test samples)
python -m model.training.evaluate

# Run 5-fold Stratified Cross-Validation
python -m model.training.evaluate --cv --n-splits 5

# Run Hyperparameter Benchmarking Leaderboard
python -m model.training.evaluate --compare-hyperparams

# Export metrics JSON report
python -m model.training.evaluate --save-metrics model/saved_models/evaluation_metrics.json
```

### Launch the AI Microservice
```bash
uvicorn --app-dir ai-service app.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger docs: `http://localhost:8000/docs`

---

## 3. Remaining Roadmap & Planned Future Work

- **Sprint 4 (Planned):** LLM-based PDF resume parser for automated skill extraction into student profile vectors.
- **Sprint 5 (Planned):** Node.js Express API gateway integration connecting MongoDB and the FastAPI AI service.
- **Sprint 6 (Planned):** End-to-end integration and load testing.
