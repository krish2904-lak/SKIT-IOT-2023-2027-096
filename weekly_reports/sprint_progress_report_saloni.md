# Sprint Progress & Status Reports — Data & Testing (Saloni Jain)

**Project:** AI-Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Role:** Saloni Jain (Data Preparation, Testing, Quality Assurance)  
**Mentor:** Dr. Archika Jain  
**Track:** Form-3 Aligned Weekly Work Tracking  

---

## Sprint 1: Requirements Analysis & Testing Strategy Setup
- **Dates:** 10/08/2026 – 22/08/2026
- **Status:** COMPLETED
- **Activities & Deliverables:**
  - Reviewed problem statement regarding lack of personalized tech-stack recommendation for engineering students.
  - Formulated the QA and testing strategy covering schema boundaries, preprocessor resilience, and model performance (`docs/testing-strategy-sprint1-sprint2.md`).
  - Defined academic score invariant checks (SGPA, CGPA, attendance, subject marks) and skill weighting constraints ($[0.0, 1.0]$).
  - Designed mock ERP records and student profile fixtures (`tests/conftest.py`).

---

## Sprint 2: Dataset Verification & Preprocessing QA Test Suite
- **Dates:** 23/08/2026 – 30/09/2026
- **Status:** COMPLETED
- **Activities & Deliverables:**
  - Audited synthetic dataset (`model/data/student_tech_stack_dataset.csv`, 1,000 records across 48 features) for class balance and zero null values (`docs/data-validation-report.md`).
  - Implemented automated schema and boundary test suite (`tests/test_dataset_schema.py`).
  - Implemented unit test suite for `StudentDataPreprocessor` covering normalization, whitespace trimming, alias canonicalization, and missing value resilience (`tests/test_preprocessing_qa.py`).
  - Verified 100% test pass rate across data validation suites.

---

## Sprint 3: Model Inference QA, Latency Benchmarking & QA Documentation (CURRENT)
- **Dates:** 01/10/2026 – 31/10/2026
- **Status:** COMPLETED (UP TO CURRENT DATE)
- **Activities & Deliverables:**
  - Developed inference QA test suite validating Top-K monotonicity, rank ordering, and cold-start profile handling (`tests/test_model_inference_qa.py`).
  - Conducted performance benchmarking: measured sub-millisecond inference latency across 100 consecutive predictions, well within the 50ms SLA.
  - Implemented API integration and error handling test suite (`tests/test_api_integration_qa.py`).
  - Published comprehensive Quality Assurance & Testing Framework specification (`docs/qa-and-testing-framework.md`).
  - Created automated test execution runner script (`tests/run_all_qa_tests.py`).
