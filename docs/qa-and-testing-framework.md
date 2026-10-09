# Quality Assurance & Testing Framework Specification

**Author & QA Lead:** Saloni Jain (Data & Testing)  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Mentor:** Dr. Archika Jain  
**Current Date:** October 09, 2026  
**Version:** 1.0.0 — Sprints 1–3 Complete  

---

## 1. Executive Summary

This document specifies the Quality Assurance (QA) and testing framework developed for the **AI-Based Tech-Stack Recommendation with ERP Integration** system. The framework validates system behavior across the full pipeline:
1. **Data Ingestion & Integrity**: Schema compliance and domain range bounds for student academic records and skill vectors.
2. **Preprocessing Robustness**: Unit tests for normalization, missing field defaults, and canonical skill mappings.
3. **Model Inference QA**: Monotonicity of Top-K recommendations, score boundary validation, and sub-50ms latency benchmarks.
4. **API Integration Contracts**: Payload and error status compliance with REST API contracts.

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
│ test_api_integration_qa.py│ API Contracts & Errs│ 2 / 2        │
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

---

## 4. Execution Instructions

To execute all QA test suites:

```bash
python tests/run_all_qa_tests.py
# or directly via pytest:
pytest tests/test_*_qa.py tests/test_dataset_schema.py -v
```
