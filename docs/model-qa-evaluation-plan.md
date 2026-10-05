# Model Evaluation & QA Test Plan — Sprint 3

**Author:** Saloni Jain (Data & Testing Lead)  
**Project:** AI-Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Mentor:** Dr. Archika Jain  
**Date:** October 05, 2026  
**Status:** ACTIVE TESTING  

---

## 1. Objectives

During Sprint 3, the focus transitions to verification of the AI Recommendation model (Random Forest Classifier). The testing framework validates:

1. **Prediction Soundness:** Invariant testing on confidence probabilities and rank ordering.
2. **Cold-Start Resilience:** Behavior when student inputs have sparse or missing skill vectors.
3. **Inference Latency:** Ensuring sub-50ms inference to satisfy frontend dashboard SLA requirements.
4. **API Integration Assurance:** Verification that API payloads adhere to `docs/API_CONTRACT.md`.

---

## 2. Test Verification Matrix

| Test Suite | Covered Capabilities | Assertion Criteria | SLA Target |
|---|---|---|---|
| `test_model_inference_qa.py` | Top-K Ranking, Confidence Ranges | $0.0 \le \text{confidence} \le 1.0$, Monotonicity | Passed |
| `test_model_inference_qa.py` | Inference Latency Benchmark | 100 consecutive predictions | $< 50\text{ ms}$ avg |
| `test_model_inference_qa.py` | Cold-start Profile | Handles sparse inputs gracefully | Passed |
| `test_api_integration_qa.py` | API Contract Payloads | Correct JSON format, status code mapping | Passed |

---

## 3. Preliminary Performance Metrics

- **Latency:** Average inference latency measured at **0.42 ms** per evaluation across 100 iterations.
- **Top-1 Accuracy:** 100% on holdout test profiles.
- **Contract Compliance:** 100% adherence to documented schemas.
