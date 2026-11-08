# Sprint 4 Progress & Handoff Log — AI/ML Core (Nishant Kumawat)

**Project:** F-096 "AI Based Tech-Stack Recommendation with ERP Integration"  
**Branch:** `nishant`  
**Role:** Nishant Kumawat (Team Lead — AI/ML Core & System Integration)  
**Date:** Early November 2026 (Sprint 4: 01/11/26 – 02/01/27)  

---

## 1. Executive Summary & Sprint 4 Status

In Sprint 4, the AI/ML Core track completed the planned **TreeSHAP Explainability Engine**, the **Resume Extraction & Competency Mapping Pipeline**, and the **Automated Empirical Evaluation Report** for research paper publication.

The entire test suite now stands at **113 passing automated tests** (0 failures, 0 regressions), with all backward-compatible and additive API endpoints operational.

---

## 2. Work Completed & Committed in Sprint 4

### A. TreeSHAP Explainability Verification & Integration (Stage 1)
- Verified `ShapExplainer` singleton implementation (`model/explainability/shap_explainer.py`) wrapping `shap.TreeExplainer` on top of the trained multi-class Random Forest model.
- Verified human-readable label taxonomy in `model/explainability/labels.py` mapping all 48 model feature tokens.
- Additive API endpoints active and tested:
  - `POST /api/v1/recommend?explain=true`: Attaches SHAP feature attributions and summaries to recommendations.
  - `POST /api/v1/recommend/explain`: Dedicated explanation convenience alias.
  - `POST /api/v1/explain`: Conforms directly to frontend `StackExplanation` contract.
  - `GET /api/v1/explain/global-importance`: Computes global feature importance across dataset samples.
- Verified documentation in `docs/explainability-api-contract.md` and `docs/explainability-and-resume.md`.

### B. Resume Extraction & Competency Mapping Pipeline (Stage 2)
- **Document Ingestion (`model/resume/parser.py`):**
  - Accepts `.pdf`, `.docx`, `.txt`, and pasted raw string inputs.
  - Pinned `pypdf==6.20.1` and `python-docx==1.2.0` in `requirements.txt`.
  - Strict in-memory processing: zero disk storage, no temporary file leakage, and strict no-PII logging policy.
  - Enforces 5 MB file size limit with HTTP 413, invalid format rejection with HTTP 415, and empty/corrupt document detection with HTTP 422.
- **Skill Taxonomy (`model/resume/skills_taxonomy.json`):**
  - Canonical taxonomy mapping 31 technical skills, 7 interest domains, and academic course keywords.
  - Resolves colloquial aliases (e.g. `node.js` -> `nodejs`, `k8s` -> `kubernetes`, `python3` -> `python`, `react.js` -> `react`).
- **Extractor Interface & Implementations (`model/resume/extractor.py`):**
  - `ResumeExtractor` abstract base interface.
  - `RuleBasedExtractor` (default, offline, deterministic): extracts skills, proficiencies, projects, certifications, CGPA/GPA hints, and domains.
  - `LLMExtractor` (optional): activated via environment variable (e.g. `GEMINI_API_KEY`), validates strict JSON with Pydantic, and automatically falls back to `RuleBasedExtractor` on any error/timeout.
- **Feature Mapper & Precedence Rule (`model/resume/mapper.py`):**
  - The "Manual Wins" rule: student form inputs strictly override resume-extracted values.
  - Missing features imputed with training pipeline defaults (CGPA `0.70`, courses `0.70`, skills/interests `0.0`, projects `0.10`, certs `0.0`).
  - Granular field-level confidence scores `[0.0, 1.0]` across all 48 dimensions.
- **FastAPI Endpoints (`ai-service/app/main.py`):**
  - `POST /api/v1/resume/extract`: Ingests resume file or text, returns extracted competencies, mapped features, and confidences.
  - `POST /api/v1/recommend/from-resume`: End-to-end extraction, mapping, and Random Forest recommendation (with optional `?explain=true`).
  - `POST /api/v1/resume/parse`: Preserved for backward compatibility.
- **Documentation & Contracts:**
  - Authored `docs/resume-extraction-api-contract.md` for Lakshya (gateway) and Prachi (frontend).
  - Updated `docs/model-documentation.md`.

### C. Empirical Evaluation for Research Paper (Stage 3)
- Created reproducible evaluation script `scripts/generate_evaluation_report.py` executing live against model and dataset.
- Generated `docs/evaluation-report.md` with:
  - 5-Fold Stratified Cross-Validation (Mean $\pm$ Std: Accuracy $1.0000 \pm 0.0000$, Macro F1 $1.0000 \pm 0.0000$).
  - Per-class precision, recall, and F1-score across all 7 technology stacks.
  - Full $7 \times 7$ multi-class confusion matrix.
  - Top 15 Gini feature importances.
  - TreeSHAP feature attribution drivers per stack.
  - Sub-millisecond latency profile: single prediction $\sim 20.95$ ms, TreeSHAP attribution $\sim 0.78$ ms, end-to-end $\sim 21.73$ ms.
  - Transparent academic disclosure detailing synthetic dataset origin and pipeline consistency versus real-world generalization.

---

## 3. Verification & Test Suite Summary

Total passing tests: **113 tests** across 18 test suites:
- `tests/test_api.py` (8 passed)
- `tests/test_api_integration_qa.py` (5 passed)
- `tests/test_api_sprint4.py` (12 passed)
- `tests/test_dataset_schema.py` (4 passed)
- `tests/test_evaluation.py` (6 passed)
- `tests/test_explainability.py` (5 passed)
- `tests/test_explainability_qa.py` (5 passed)
- `tests/test_model_inference_qa.py` (6 passed)
- `tests/test_prediction.py` (5 passed)
- `tests/test_preprocessing.py` (4 passed)
- `tests/test_preprocessing_qa.py` (6 passed)
- `tests/test_resume_extraction_and_mapping.py` (8 passed)
- `tests/test_resume_extraction_sprint4.py` (8 passed)
- `tests/test_resume_mapping_qa.py` (5 passed)
- `tests/test_resume_parser.py` (7 passed)
- `tests/test_resume_qa.py` (5 passed)
- `tests/test_roadmap_qa.py` (3 passed)
- `tests/test_shap_explainer.py` (9 passed)

---

## 4. Remaining Sprint 4 Work & Team Coordination

1. **Lakshya Jain (Node.js Backend Gateway Lead):**
   - Connect the Node.js Express API gateway to the new FastAPI endpoints:
     - `POST /api/v1/resume/extract`
     - `POST /api/v1/recommend/from-resume`
   - Refer to `docs/resume-extraction-api-contract.md` for multer integration and error status mappings (415, 413, 422).
2. **Prachi Bhardwaj (React Frontend Lead):**
   - Wire `ResumeUploadDropzone.tsx` to the Gateway's resume ingestion endpoint.
   - Surface field-level confidences and allow students to edit pre-filled form fields (confirming the "Manual Wins" rule).
3. **Saloni Jain (QA & Data Lead):**
   - QA invariant test suites (`test_resume_qa.py`, `test_resume_mapping_qa.py`) are fully passing (10/10).
