# Quality Assurance & Testing Framework Specification

**Author & QA Lead:** Saloni Jain (Data & Testing)  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Mentor:** Dr. Archika Jain  
**Current Date:** November 13, 2026  
**Version:** 1.4.0 — Sprint 4 Week 10 Validation Pass  

---

## 1. Executive Summary

This document specifies the Quality Assurance (QA) and testing framework developed for the **AI-Based Tech-Stack Recommendation with ERP Integration** system. The framework validates system behavior across the full pipeline:
1. **Data Ingestion & Integrity**: Schema compliance and domain range bounds for student academic records and skill vectors.
2. **Preprocessing Robustness**: Unit tests for normalization, missing field defaults, and canonical skill mappings.
3. **Model Inference QA**: Monotonicity of Top-K recommendations, score boundary validation, and sub-50ms latency benchmarks.
4. **API Integration Contracts & Edge Cases**: Payload contracts, boundary score behavior, cold-start fallback resilience, and error mapping compliance.
5. **Explainability & SHAP Attributions**: Schema compliance for feature impacts, positive/negative factor bounds, and prerequisite guidance.
6. **Structured Learning Roadmaps**: Invariant schema auditing across 3-phase structured roadmaps for all 7 tech stack categories.
7. **Resume Ingestion & Buffer Isolation QA**: Zero-disk persistence, file format boundaries, corrupted stream rejection, and PII safety invariants.
8. **Resume Feature Mapping & Conflict Resolution QA**: Canonical taxonomy mapping into 48-dimensional float vectors, "Manual Wins" precedence rules, and verified ERP score preservation.
9. **Model Evaluation & Empirical Benchmark QA**: Invariant auditing for 5-fold cross-validation metrics, multi-class confusion matrix, Gini feature importance rankings, TreeSHAP signed attributions, and sub-50ms inference latency SLA compliance.

---

## 2. Test Architecture & Coverage Matrix

```
┌───────────────────────────────────────────────────────────────┐
│                     Automated Test Suites                     │
├──────────────────────────┬─────────────────────┬──────────────┤
│ Test Suite               │ Focus Area          │ Tests Passed │
├──────────────────────────┼─────────────────────┼──────────────┤
│ test_dataset_schema.py   │ Schema & Bounds     │ 4 / 4        │
│ test_preprocessing_qa.py │ Normalization & QA  │ 5 / 5        │
│ test_model_inference_qa.py│ Prediction & Latency│ 5 / 5        │
│ test_api_integration_qa.py│ Contracts & Boundaries│ 5 / 5      │
│ test_explainability_qa.py │ SHAP & Feature XAI  │ 5 / 5        │
│ test_roadmap_qa.py       │ 3-Phase Roadmaps    │ 3 / 3        │
│ test_resume_qa.py        │ Ingestion & Safety  │ 5 / 5        │
│ test_resume_mapping_qa.py│ Mapping & Precedence│ 5 / 5        │
│ test_model_evaluation_qa.py│ Evaluation & Benchmarks│ 6 / 6    │
├──────────────────────────┼─────────────────────┼──────────────┤
│ TOTAL                    │ Full Pipeline QA    │ 43 / 43      │
└──────────────────────────┴─────────────────────┴──────────────┘
```

---

## 3. Detailed Test Module Breakdown

### 3.1 Dataset Schema Validation (`tests/test_dataset_schema.py`)
- **ERP Academic Checks:** Verifies SGPA, CGPA ($0.0 \le \text{grade} \le 10.0$), attendance ($0.0 \le \text{attendance} \le 100.0$), and course marks ($0 \le \text{marks} \le 100$).
- **Student Skill Vector:** Verifies skill weights are normalized in $[0.0, 1.0]$ and domain interests contain recognized category names.
- **Classification Categories:** Validates all 7 target tech stacks are present and distinct.

### 3.2 Preprocessing Pipeline QA (`tests/test_preprocessing_qa.py`)
- **Score Normalization:** Clamping logic tests verifying out-of-bound inputs are safely bounded.
- **Skill Canonicalization:** Trims whitespace, standardizes snake_case format, clamps negative or overflow values.
- **Dimensionality Invariant:** Guarantees output feature vectors are strictly 48-dimensional floats.
- **Missing Value Resilience:** Verifies incomplete or null input records produce zero-filled valid vectors rather than runtime crashes.

### 3.3 Model Inference QA (`tests/test_model_inference_qa.py`)
- **Output Invariants:** Verifies response contains ranking, confidence, and target tech stack.
- **Monotonicity:** Confirms Top-K ranks are strictly ordered by descending confidence.
- **Cold-Start Validation:** Confirms sparse profiles return uniform baseline distribution safely.
- **Latency Benchmark:** 100 consecutive predictions execute at $< 50\text{ ms}$ average latency.

### 3.4 API Integration QA (`tests/test_api_integration_qa.py`)
- Validates adherence to JSON schemas defined in `docs/API_CONTRACT.md`.
- Asserts error formats provide standard `status`, `code`, and descriptive `message`.
- **Boundary Conditions:** Verifies extreme academic boundaries (0.0 SGPA, 10.0 CGPA, 100% attendance).
- **Cold-Start Fallbacks:** Verifies sparse/empty skill profiles return safe baseline recommendations.
- **Validation Mapping:** Asserts 422 Unprocessable Entity payload structure when mandatory fields are omitted.

### 3.5 Explainability & SHAP QA (`tests/test_explainability_qa.py`)
- **Payload Schema:** Verifies required keys (`recommendationId`, `baseConfidence`, `summaryText`, `topPositiveFactors`, `topNegativeFactors`, `learningPrerequisites`).
- **Impact Direction & Bounds:** Validates mathematical sign invariants (positive factor SHAP $> 0$, negative factor SHAP $< 0$, potential boost $\in [0.0, 15.0]$).
- **Prerequisite Coverage:** Validates all 7 catalog stacks supply actionable prerequisites.
- **Cold-Start Resilience:** Confirms zero-data student profiles produce valid explainability payloads without runtime exceptions.

### 3.6 3-Phase Structured Roadmap QA (`tests/test_roadmap_qa.py`)
- **Catalog Invariants:** Asserts every technology stack defines exactly 3 sequential phases.
- **Phase Schema:** Validates mandatory non-empty fields (`phase`, `duration`, `title`, `topics`, `recommendedResource`).
- **Topic Granularity:** Guarantees each phase contains $\ge 2$ structured curriculum topics.

### 3.7 Resume Ingestion & Buffer Safety QA (`tests/test_resume_qa.py`)
- **Zero Disk Persistence:** Asserts all parsing occurs within in-memory buffers (`io.BytesIO`) without temporary disk artifact creation.
- **File Format & Boundary Validation:** Enforces case-insensitive support for `.pdf` and `.docx`, rejecting unsupported extensions (`.txt`, `.json`, `.exe`) with explicit `ValueError` responses.
- **Corrupted & Empty Payload Handling:** Guarantees zero-byte files and malformed byte streams raise descriptive parsing exceptions.
- **File Size Enforcement:** Asserts strict rejection when payload exceeds the 5MB upload boundary.
- **PII & Trace Safety:** Verifies raw binary data or unhandled document text does not leak into user-facing tracebacks or exception messages.

### 3.8 Resume Feature Mapping & Conflict Resolution QA (`tests/test_resume_mapping_qa.py`)
- **48-Dimensional Feature Invariant:** Validates mapped resume outputs strictly match the 48-feature canonical schema with bounded values in $[0.0, 1.0]$.
- **"Manual Wins" Precedence Rule:** Asserts that student self-reported skills strictly override resume-parsed skills on name collision, while novel resume skills merge with `source="RESUME_PARSED"`.
- **ERP Score Preservation:** Ensures verified institutional marks and CGPA cannot be modified or diluted by resume contents.
- **Sparse Fallback Invariance:** Confirms empty or non-technical resumes produce safe default feature vectors without NaNs or runtime errors.
- **Inference Pipeline Compatibility:** Validates merged profiles integrate directly with recommendation ranking and 3-phase roadmap engines.

### 3.9 Model Evaluation & Empirical Benchmark QA (`tests/test_model_evaluation_qa.py`)
- **Cross-Validation Invariants:** Validates that 5-fold cross-validation accuracy and macro F1-score achieve $\ge 0.95$ (observed $1.0000 \pm 0.0000$) with variance $\le 0.05$.
- **Confusion Matrix Mathematics:** Asserts $7 \times 7$ dimensionality, non-negativity across all cells, diagonal support summing to 200 holdout records, and zero misclassifications in empirical benchmark.
- **Gini Feature Importance Hierarchy:** Audits the Top-15 features (led by `skill_pytorch` $0.0702$, `skill_kubernetes` $0.0598$, `skill_flutter` $0.0517$) for positive bounded weights $\in (0.0, 1.0]$ and monotonic rank ordering.
- **TreeSHAP Attribution Boundaries:** Confirms signed impacts preserve mathematical directionality ($E[|\phi|] > 0$, signed impact bounded in $[-1.0, 1.0]$).
- **Latency SLA Benchmarking:** Enforces sub-50ms mean prediction latency (observed $29.25\text{ ms}$), sub-10ms SHAP latency (observed $1.40\text{ ms}$), and sub-120ms full pipeline SLA (observed $30.65\text{ ms}$).
- **Synthetic Dataset Distribution Invariants:** Verifies 1,000 records across 48 dimensions maintain uniform class representation ($\sim 14.2\%$ per stack).

---

## 4. Execution Instructions

To execute all QA test suites natively with zero external dependencies:

```bash
python tests/run_all_qa_tests.py
```

Or via pytest (when dev dependencies are installed):

```bash
pytest tests/test_*_qa.py tests/test_dataset_schema.py -v
```
