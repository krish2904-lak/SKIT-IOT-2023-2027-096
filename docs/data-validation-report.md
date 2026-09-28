# Dataset Validation & Quality Audit Report — Sprint 2

**Lead QA / Data Reviewer:** Saloni Jain (Data & Testing)  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Date:** September 28, 2026  
**Status:** APPROVED FOR MODEL TRAINING  

---

## 1. Executive Summary

This report documents the validation, statistical health, and data quality verification performed on the synthetic student dataset (`model/data/student_tech_stack_dataset.csv`) and sample test fixtures. The dataset is utilized to train the Random Forest recommendation model across 7 distinct career/tech-stack tracks.

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

Automated unit tests were executed using pytest:

```
tests/test_dataset_schema.py::TestDatasetSchema::test_erp_record_schema_contains_required_fields PASSED
tests/test_dataset_schema.py::TestDatasetSchema::test_academic_score_boundaries PASSED
tests/test_dataset_schema.py::TestDatasetSchema::test_student_input_schema_types PASSED
tests/test_dataset_schema.py::TestDatasetSchema::test_target_tech_stack_classification_classes PASSED
tests/test_preprocessing_qa.py::TestStudentDataPreprocessor::test_academic_score_normalization PASSED
tests/test_preprocessing_qa.py::TestStudentDataPreprocessor::test_sgpa_normalization PASSED
tests/test_preprocessing_qa.py::TestStudentDataPreprocessor::test_clean_skill_dict_canonicalization PASSED
tests/test_preprocessing_qa.py::TestStudentDataPreprocessor::test_extracted_feature_vector_dimension PASSED
tests/test_preprocessing_qa.py::TestStudentDataPreprocessor::test_preprocessor_resilience_to_missing_values PASSED

============================== 9 passed in 0.12s ==============================
```

## 5. QA Sign-Off

The dataset adheres to all Form-2 requirements and is certified for machine learning model training in Sprint 3.
