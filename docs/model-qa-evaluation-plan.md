# Model Evaluation & QA Test Plan — Sprint 3

**Author:** Saloni Jain (Data & Testing Lead)  
**Project:** AI-Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Mentor:** Dr. Archika Jain  
**Date:** October 14, 2026  
**Status:** VERIFIED & SIGNED OFF (WEEK 6)  

---

## 1. Objectives

During Sprint 3, the focus transitions to verification of the AI Recommendation model (Random Forest Classifier). The testing framework validates:

1. **Prediction Soundness:** Invariant testing on confidence probabilities and rank ordering.
2. **Cold-Start Resilience:** Behavior when student inputs have sparse or missing skill vectors.
3. **Inference Latency:** Ensuring sub-50ms inference to satisfy frontend dashboard SLA requirements.
4. **API Integration & Boundary Assurance:** Verification that API payloads, boundary conditions, and error schemas adhere to `docs/API_CONTRACT.md`.

---

## 2. Test Verification Matrix

| Test Suite | Covered Capabilities | Assertion Criteria | SLA Target |
|---|---|---|---|
| `test_model_inference_qa.py` | Top-K Ranking, Confidence Ranges | $0.0 \le \text{confidence} \le 1.0$, Monotonicity | Passed |
| `test_model_inference_qa.py` | Inference Latency Benchmark | 100 consecutive predictions | $< 50\text{ ms}$ avg |
| `test_model_inference_qa.py` | Cold-start Profile | Handles sparse inputs gracefully | Passed |
| `test_api_integration_qa.py` | API Contract Payloads | Correct JSON format, status code mapping | Passed |
| `test_api_integration_qa.py` | Academic Boundary Scores | Valid payload at 0.0 SGPA & 10.0 CGPA | Passed |
| `test_api_integration_qa.py` | Cold-Start Fallback Payload | Uniform baseline recommendation mapping | Passed |
| `test_api_integration_qa.py` | Mandatory Field Error Mapping | 422 Unprocessable Entity error structure | Passed |

---

## 3. Verified Performance Metrics

- **Latency:** Average inference latency measured at **0.42 ms** per evaluation across 100 iterations.
- **Top-1 Accuracy:** 100% on holdout test profiles.
- **Contract Compliance:** 100% adherence to documented schemas across all 19 test cases.
- **Zero-Dependency Automation:** `tests/run_all_qa_tests.py` executes in ~50ms natively.

