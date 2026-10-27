# Testing Strategy & Data Quality Assurance — Sprints 1 & 2

**Author:** Saloni Jain (Data & Testing Lead)  
**Project:** AI-Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Mentor:** Dr. Archika Jain  
**Date:** September 21, 2026  

---

## 1. Scope & Objective

As the Data and Testing engineer for the project, this document establishes the formal Quality Assurance (QA) and verification strategy across Sprints 1 and 2. The primary objectives are:

1. **Data Schema Integrity:** Guarantee that academic ERP records, student skill representations, and domain interest profiles adhere to standardized schemas and boundaries.
2. **Preprocessing Pipeline Robustness:** Validate normalization, handling of missing values, and numerical feature consistency before ML model ingestion.
3. **Automated Unit & Integration Testing:** Implement automated pytest test suites ensuring all modules function reliably across edge cases.

---

## 2. Test Pyramid & Methodology

```
           / \
          /   \     E2E / System Tests (API Contracts & Inference)
         /-----\
        /       \   Integration Tests (Preprocessor + Model Pipeline)
       /---------\
      /           \ Component & Schema Verification Tests (Data Types & Bounds)
     /-------------\
```

### 2.1 Test Categories

| Tier | Focus Area | Tools | Success Criteria |
|---|---|---|---|
| **Tier 1: Schema & Data Invariants** | ERP Academic Fields, Skill Bounds, Range Constraints | `pytest`, `pydantic` | 100% field coverage, zero boundary violations |
| **Tier 2: Preprocessing Unit Tests** | Lexical canonicalization, alias resolution, defaults | `pytest` | Edge-case resilience, deterministic outputs |
| **Tier 3: Model Inference QA** | Recommendation sanity, top-k ordering, confidence score range | `pytest`, `numpy` | Valid score range [0, 1], expected top categories |

---

## 3. Data Integrity & Validation Constraints

### 3.1 Academic ERP Records
- **SGPA / CGPA:** Must be strictly bounded within $[0.0, 10.0]$.
- **Attendance Percentage:** Range $[0.0, 100.0]$.
- **Course Subject Marks:** Discrete integers bounded in $[0, 100]$ across DSA, DBMS, OS, Computer Networks, and Web Tech.

### 3.2 Student Skill Vectors
- **Skill Weighting:** Continuous float bounded in $[0.0, 1.0]$.
- **Domain Interests:** Non-empty set belonging to the 7 core project domains.
- **Portfolio Counts:** Non-negative integer values for certifications, projects, and hackathons.

---

## 4. Planned Verification Deliverables

- **Sprint 1 (Completed):** Test plan definition, requirement analysis, schema boundary specifications.
- **Sprint 2 (Current):** Schema validation test suite (`tests/test_dataset_schema.py`), shared test fixtures (`tests/conftest.py`), preprocessor unit test implementation.
- **Sprint 3 (Upcoming):** Inference evaluation metrics, model QA test suite, and performance benchmarking.
