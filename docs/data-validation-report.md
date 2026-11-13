# Dataset Validation & Quality Audit Report — Sprints 2 & 4

**Lead QA / Data Reviewer:** Saloni Jain (Data & Testing)  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Mentor:** Dr. Archika Jain  
**Date:** November 13, 2026  
**Status:** VERIFIED & CERTIFIED FOR RESEARCH PAPER & RELEASE CANDIDATE  

---

## 1. Executive Summary

This report documents the validation, statistical health, data quality verification, and empirical benchmark audit performed on the student dataset (`model/data/student_tech_stack_dataset.csv`), the Resume Extraction and Feature Mapping pipeline, and the Random Forest classification models across 7 distinct career/tech-stack tracks.

Originally certified for training during Sprint 2, this updated Sprint 4 audit verifies full-pipeline stability, 5-fold cross-validation performance, TreeSHAP feature attributions, and in-memory resume parsing safety invariants.

---

## 2. Dataset Health & Summary Statistics

| Metric | Target | Observed Value | Result |
|---|---|---|---|
| **Total Record Count** | 1,000 | 1,000 records | PASSED |
| **Total Features** | 48 attributes | 48 normalized attributes | PASSED |
| **Missing Values / Nulls** | 0% | 0 (0.00%) | PASSED |
| **Duplicate Records** | 0 | 0 duplicates | PASSED |
| **Class Distribution** | Balanced (~142 per class) | Balanced (14.2% per class) | PASSED |

---

## 3. Data Integrity & Boundary Audits

### 3.1 ERP Academic Fields
- **SGPA S1 to S4:** Verified strictly in range $[5.2, 9.8]$, mean $= 7.84$, std $= 0.81$.
- **CGPA:** Verified in range $[5.8, 9.9]$, strictly positive.
- **Attendance Percentage:** Range $[62.0\%, 98.5\%]$.
- **Core Subject Marks:** DSA, DBMS, OS, Computer Networks all within $[40, 99]$.

### 3.2 Technical Skill Ratings & Weights
- 31 skill indicators normalized between $[0.0, 1.0]$.
- Canonical names verified to resolve casing variants (e.g., `Python` vs `python`).
- Verified zero negative values and zero values exceeding upper threshold.

---

## 4. Test Suite Execution Results

All 43 automated QA test cases pass natively with zero external dependencies:

```
======================================================================
  SKIT-IOT-2023-2027-096: AUTOMATED QA & TESTING SUITE
  Lead: Saloni Jain (Data & Testing)
  Sprint 4 / Week 10: Model Evaluation & End-to-End System QA Pass
======================================================================

[SUITE 1/9] Running Dataset Schema & Invariant Tests...
  -> 4/4 schema invariant checks PASSED.
[SUITE 2/9] Running Preprocessing QA Tests...
  -> 5/5 preprocessing unit checks PASSED.
[SUITE 3/9] Running Model Inference & Latency Benchmark Tests...
  -> 5/5 model inference & latency benchmark checks PASSED.
[SUITE 4/9] Running API Contract Integration & Edge Case Tests...
  -> 5/5 API contract & boundary checks PASSED.
[SUITE 5/9] Running Explainability (SHAP) QA Tests...
  -> 5/5 explainability & attribution invariant checks PASSED.
[SUITE 6/9] Running 3-Phase Structured Roadmap QA Tests...
  -> 3/3 roadmap structural & phase invariant checks PASSED.
[SUITE 7/9] Running Resume Ingestion & Buffer Safety QA Tests...
  -> 5/5 resume ingestion & safety checks PASSED.
[SUITE 8/9] Running Resume Feature Mapping & Conflict Resolution QA Tests...
  -> 5/5 resume feature mapping & conflict resolution checks PASSED.
[SUITE 9/9] Running Model Evaluation & Benchmark Invariant QA Tests...
  -> 6/6 model evaluation & benchmark invariant checks PASSED.

======================================================================
  SUMMARY: 43/43 QA TESTS PASSED SUCCESSFULLY (100% PASS RATE)
  Execution Time: 3518.93 ms
  Status: All dataset, preprocessor, model inference, API, explainability,
          roadmap, resume ingestion, conflict resolution & evaluation benchmark checks verified.
======================================================================
```

---

## 5. Sprint 4 Empirical Model Evaluation & Cross-Validation Audit

| Evaluation Metric | Target Threshold | Observed Value (5-Fold CV) | Result |
|---|:---:|:---:|:---:|
| **Mean Accuracy** | $\ge 0.9500$ | **$1.0000 \pm 0.0000$** | PASSED |
| **Macro Precision** | $\ge 0.9500$ | **$1.0000 \pm 0.0000$** | PASSED |
| **Macro Recall** | $\ge 0.9500$ | **$1.0000 \pm 0.0000$** | PASSED |
| **Macro F1-Score** | $\ge 0.9500$ | **$1.0000 \pm 0.0000$** | PASSED |
| **Inference Latency** | $< 50\text{ ms}$ | **$29.25\text{ ms}$** | PASSED |
| **TreeSHAP Latency** | $< 10\text{ ms}$ | **$1.40\text{ ms}$** | PASSED |
| **Holdout Confusion Matrix** | Zero false positives/negatives | $200 / 200$ correct diagonal | PASSED |

---

## 6. Resume Feature Extraction & Taxonomy Alignment Quality Audit

- **In-Memory Safety:** 100% in-memory processing (`io.BytesIO`); verified zero file leaks to disk.
- **Taxonomy Normalization:** Aliases (`node.js` -> `nodejs`, `k8s` -> `kubernetes`, `react.js` -> `react`) cleanly map into 48-feature canonical vector.
- **Conflict Precedence ("Manual Wins"):** Self-reported student form ratings strictly override resume-extracted values upon conflict, while novel resume skills are appended with `source="RESUME_PARSED"`.
- **ERP Score Immutability:** Academic scores (SGPA, CGPA, attendance, subject marks) remain untampered regardless of resume text contents.

---

## 7. Final QA Certification & Sign-Off

The dataset, machine learning model evaluation benchmarks, and resume extraction pipelines satisfy all Form-3 and Form-4 academic and engineering criteria. Certified for full production integration and research paper documentation.
