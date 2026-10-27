# Software Requirements Specification (SRS)

**Project Title:** AI Based Tech-Stack Recommendation with ERP Integration  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Document Author:** Nishant Kumawat (Team Lead)  
**Sprint:** Sprint 1 — Project Requirement Analysis  
**Date:** August 2026  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the software requirements for the **AI Based Tech-Stack Recommendation System with ERP Integration** (Project ID: `SKIT/DS/2023-2027/CSE-F-096`). It establishes the technical baseline, functional specifications, external interfaces, and performance standards for all project subsystems.

### 1.2 Scope
The software analyzes academic performance from college ERP records, user-declared skills, and technical interest domains to deliver personalized, probabilistic recommendations for software technology stacks. The system produces ranked recommendations accompanied by quantitative match scores, component technology breakdowns, and explainability snippets.

### 1.3 Intended Audience
- Project Mentors and External Evaluators (SKIT B.Tech Evaluation Committee)
- Team Developers (Nishant Kumawat, Lakshya Jain, Prachi Bhardwaj, Saloni Jain)

---

## 2. Overall Description

### 2.1 Product Perspective
The system operates as a distributed web application consisting of a React.js presentation layer, a Node.js API Gateway, a Python FastAPI machine learning microservice, and a MongoDB persistence store, interfacing with college ERP endpoints.

### 2.2 User Persona
- **Engineering Student (Primary):** Seeks guidance on technology stacks suited to their academic trajectory, foundational proficiencies, and career ambitions.
- **Faculty Advisor / Mentor:** Reviews recommendation distributions and student readiness analytics.
- **System Administrator:** Monitors service health, model versioning, and ERP synchronization tasks.

---

## 3. Functional Requirements (FR)

### FR-1: Student Profile & ERP Ingestion
- **FR-1.1:** The system shall ingest student academic records including Student ID, Branch (e.g. CSE, CSE-IoT), Semester, Cumulative CGPA, and course grades in core technical subjects (Web Tech, DBMS, DSA, IoT, ML/Math, Cloud, OS).
- **FR-1.2:** The system shall provide fallback default imputation for missing course records without crashing or aborting inference.

### FR-2: Student Preference & Skill Input
- **FR-2.1:** The system shall allow students to submit self-declared technical skills categorized by proficiency level (`beginner`, `intermediate`, `advanced`).
- **FR-2.2:** The system shall accept one or more career interest domains (e.g., `web_development`, `ai_ml`, `iot_embedded`, `cloud_devops`, `mobile_dev`, `data_analytics`, `cybersecurity`).

### FR-3: Feature Extraction & Preprocessing Pipeline
- **FR-3.1:** The preprocessing pipeline shall map multi-alias skill strings (e.g., `react.js`, `py`, `c++`) to standardized canonical terms.
- **FR-3.2:** The preprocessing pipeline shall transform raw records into a normalized 48-dimensional numerical feature vector bounded in `[0.0, 1.0]`.

### FR-4: AI Tech-Stack Recommendation
- **FR-4.1:** The system shall employ a trained Random Forest multi-class classifier to predict class probabilities across all supported technology stack categories.
- **FR-4.2:** The recommendation engine shall rank stacks by probability descending and output a designated `primary_recommendation` and `alternative_recommendations`.
- **FR-4.3:** The match score shall be presented on a normalized percentage scale (`0% - 100%`).

### FR-5: Technology Stack Metadata Association
- **FR-5.1:** Each recommendation item shall contain structured metadata: unique ID, title, category, match score, estimated learning duration, difficulty rating, target job roles, and component technologies categorized by tier (`Frontend`, `Backend`, `Database`, `DevOps`, `AI_ML`, `IoT`).
- **FR-5.2:** Each recommendation item shall include a synthesized natural-language rationale snippet explaining the primary basis of recommendation.

### FR-6: Model Status & Health Observability
- **FR-6.1:** The AI service shall provide a `/health` endpoint returning operational status.
- **FR-6.2:** The AI service shall expose a `/api/v1/model-info` endpoint disclosing active model version, test set evaluation metrics, feature counts, and top Gini-importance factors.

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- The recommendation inference API (`POST /api/v1/recommend`) shall complete processing and respond within 200 milliseconds under single-user load.

### NFR-2: Scalability & Modularity
- The AI service shall maintain stateless operation, enabling horizontal container scaling behind an HTTP load balancer.
- The machine learning pipeline shall be modularly separated into preprocessing, inference, and training packages.

### NFR-3: Reliability & Defensive Execution
- The inference engine shall never encounter unhandled exceptions due to unknown skills, missing scores, or out-of-range CGPA values. Sensible bounded defaults shall safeguard execution.

### NFR-4: Portability & Reproducibility
- Model training and inference shall run cross-platform on Windows, macOS, and Linux without OS-dependent path logic.
- Random seeds shall be fixed (`seed=42`) to ensure 100% deterministic reproducibility across runs.

---

## 5. System Constraints
- Python runtime: 3.10+ (tested on Python 3.12).
- Frameworks: scikit-learn >= 1.4, FastAPI >= 0.110, Pydantic >= 2.0.
- Database: MongoDB 6.0+ (managed via Node.js Gateway).
