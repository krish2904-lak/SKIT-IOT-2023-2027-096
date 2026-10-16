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

## Sprint 3: Model Inference QA, Latency Benchmarking & System Integration QA (CURRENT)
- **Dates:** 01/10/2026 – 31/10/2026
- **Status:** IN PROGRESS (ON SCHEDULE)

### Week 5 (01/10/2026 – 07/10/2026): Model Inference & Performance Benchmarks
- **Activities & Deliverables:**
  - Developed inference QA test suite validating Top-K monotonicity, rank ordering, and cold-start profile handling (`tests/test_model_inference_qa.py`).
  - Conducted performance benchmarking: measured sub-millisecond inference latency across 100 consecutive predictions, well within the 50ms SLA.
  - Authored Model Evaluation & QA Test Plan (`docs/model-qa-evaluation-plan.md`).

### Week 6 (08/10/2026 – 14/10/2026): Edge-Case QA, Zero-Dependency Test Suite & API Contract Auditing
- **Activities & Deliverables:**
  - Expanded API integration QA test suite (`tests/test_api_integration_qa.py`) with extreme boundary value testing (0.0 SGPA, 10.0 CGPA, 100% attendance) and cold-start fallback payload verification.
  - Implemented 422 Unprocessable Entity and 400 Bad Request error contract assertion tests matching `docs/API_CONTRACT.md`.
  - Upgraded test runner (`tests/run_all_qa_tests.py`) with zero-dependency native execution support to ensure reliable test execution across all development environments.
  - Achieved 100% pass rate across 19 total automated QA test cases in under 55ms.
  - Updated Quality Assurance & Testing Framework Specification (`docs/qa-and-testing-framework.md`).

