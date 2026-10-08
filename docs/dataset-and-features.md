# Dataset & Feature Engineering Specification

**Project Title:** AI Based Tech-Stack Recommendation with ERP Integration  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Document Author:** Nishant Kumawat (Team Lead — AI/ML & System Integration)  
**Sprint:** Sprint 2 — Data Collection & Preparation  
**Date:** September 2026  

---

## 1. Objective & Scope

Sprint 2 focuses on standardizing the data ingestion formats, identifying relevant student attributes across institutional ERP systems and student profiles, engineering feature transformations, and preparing an end-to-end reproducible preprocessing pipeline for machine learning consumption.

---

## 2. Feature Structure & Taxonomy

The feature vector consists of **48 normalized numeric dimensions** organized into four structured groups:

```text
Student Profile Input
├── 1. Academic Performance (ERP Records) — 8 Features
│   ├── cgpa [0.0 - 1.0]
│   └── 7 Course Scores [0.0 - 1.0]:
│       (web_technologies, dbms, dsa, iot_embedded, ml_math, cloud_computing, operating_systems)
│
├── 2. Interest Domains (Declared Preferences) — 7 Features
│   └── Binary indicators [0.0 or 1.0]:
│       (web_development, ai_ml, iot_embedded, cloud_devops, mobile_dev, data_analytics, cybersecurity)
│
├── 3. Technical Skills Vocabulary — 31 Features
│   └── Weighted indicators [0.0, 0.33, 0.67, 1.0] (None, Beginner, Intermediate, Advanced):
│       - Languages: python, javascript, typescript, java, cpp, c, sql, html_css
│       - Frameworks: react, nodejs, express, fastapi, django, flask, pytorch, tensorflow, scikit_learn, flutter
│       - Databases: mongodb, postgresql, mysql, influxdb
│       - DevOps: docker, kubernetes, aws, linux, git
│       - IoT: arduino, esp32, mqtt, raspberry_pi
│
└── 4. Experience & Portfolio Attributes — 2 Features
    ├── projects_completed [0.0 - 1.0] (count scaled from 0-10)
    └── certifications_count [0.0 - 1.0] (count scaled from 0-5)
```

---

## 3. Preprocessing Pipeline (`model.preprocessing`)

The `StudentDataPreprocessor` class executes the following sequential stages:

1. **Input Normalization:** Accepts raw dictionaries, JSON payloads, or Pandas DataFrames.
2. **Defensive Value Imputation:**
   - Missing CGPA defaults to `7.0 / 10.0 = 0.70`.
   - Missing subject course marks default to `70.0 / 100.0 = 0.70`.
   - Missing skills and interests initialize to empty sets.
3. **Lexical Canonicalization & Alias Resolution:**
   - Case-insensitive trimming.
   - Maps developer colloquialisms to formal tokens (e.g. `c++` -> `cpp`, `py` -> `python`, `reactjs` -> `react`, `k8s` -> `kubernetes`).
4. **Skill Weight Assignment:**
   - `beginner` -> Weight 1.0 / 3.0 = 0.33
   - `intermediate` -> Weight 2.0 / 3.0 = 0.67
   - `advanced` -> Weight 3.0 / 3.0 = 1.00
   - Plain string input defaults to intermediate weight (`2.0 / 3.0`).
5. **Vector Serialization:** Concatenates all transformed subsets into a contiguous 1D or 2D `float32` NumPy array suitable for Scikit-learn estimators.

---

## 4. Dataset Generation & Stratification

- **Training Dataset:** Generated via `model.data.dataset_generator` with seed `42` into `model/data/student_tech_stack_dataset.csv`.
- **Sample Count:** 1,000 synthetically generated student profiles modeled after Rajasthan Technical University (RTU) / SKIT curriculum standards.
- **Stratified Distribution:** Evenly split across the 7 target technology stack classes (~142 records per class) to avoid class imbalance.
- **Noise Injection:** Realistic 10-15% variance applied to academic marks and secondary interest domains to reflect real-world non-linear student capabilities.

---

## 5. Separation of Mock / Sample Fixtures

- **Training Corpus:** `model/data/student_tech_stack_dataset.csv` (used solely for model fitting and evaluation).
- **Test Fixtures:** `model/data/sample_student_profiles.json` (used for unit tests, local demonstration runs, and API integration testing).
