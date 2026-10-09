# 🚀 F-096 — AI Based Tech-Stack Recommendation with ERP Integration

<p align="center">

## 🎓 AI-Powered Technology Stack Recommendation System

### Personalized • Intelligent • Explainable • ERP Integrated

</p>

---

## 📌 Project Information

| Field | Details |
|---|---|
| **Project ID** | F-096 |
| **Project Title** | AI Based Tech-Stack Recommendation with ERP Integration |
| **Branch** | CSE (IOT) |
| **Section** | A-02 |
| **Project Track** | R&D / Innovation |
| **SDG** | SDG 4 — Quality Education |
| **External Evaluation** | Research Paper Publication |

---
# 👥 Team Members

| S. No. | Team Member |
|---|---|
| 1 | Nishant Kumawat |
| 2 | Lakshya Jain |
| 3 | Prachi Bhardwaj |
| 4 | Saloni Jain |

# 🧠 About The Project

Choosing the right technology stack is one of the most important
decisions while developing a software project.

Students often face difficulty in selecting an appropriate technology
stack according to their project requirements, technical skills,
experience, and academic background.

The **AI Based Tech-Stack Recommendation with ERP Integration**
project aims to develop an intelligent recommendation system that
analyzes project requirements, student inputs, resume information,
skills, and academic-related information to recommend suitable
technology stacks.

The proposed system combines **AI/ML-based recommendation,
resume analysis, skill extraction, explainability, and ERP
integration** to provide personalized technology recommendations.

---

# 🎯 Problem Statement

Students often lack personalized guidance when choosing a suitable
technology stack for their projects.

This project analyzes:

- Project requirements
- Student inputs
- Student skills
- Resume information
- Academic performance
- Relevant ERP information

The system uses these inputs to recommend suitable technologies
based on individual skills, project requirements, and academic
performance.

---

# 💡 Proposed Solution

The proposed system provides an intelligent platform where students
can enter information about their project and technical background.

The system processes the provided information and generates a
personalized technology-stack recommendation.

### High-Level Workflow

```text
                    👨‍🎓 Student
                        │
                        ▼
              ┌───────────────────┐
              │ Project & Student │
              │     Inputs        │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Data Processing & │
              │ Feature Extraction│
              └─────────┬─────────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
       📄 Resume Analysis     🎓 ERP / Academic
              │                   Information
              └─────────┬─────────┘
                        ▼
              ┌───────────────────┐
              │ AI / ML           │
              │ Recommendation    │
              │ Model             │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Technology Stack  │
              │ Scoring & Ranking │
              └─────────┬─────────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Recommended Stack │
              │ + Explanation     │
              └─────────┬─────────┘
                        │
                        ▼
                📊 React Dashboard
```

---

## 🏆 Sprint Status & Deliverables (Track: Nishant Kumawat)

| Sprint | Focus Area | Dates | Deliverables / Status |
|---|---|---|---|
| **Sprint 1** | Requirement Analysis & Architecture | 10/08/26 – 22/08/26 | ✅ **Completed**: System Architecture (`docs/system-architecture.md`), SRS Specification (`docs/srs-requirements.md`), ERP & Microservice Contracts. |
| **Sprint 2** | Data Collection & Preparation | 23/08/26 – 30/09/26 | ✅ **Completed**: 48-feature extraction pipeline (`model/preprocessing/`), 1,000-record dataset (`model/data/student_tech_stack_dataset.csv`), Data Dictionary (`docs/dataset-and-features.md`), Isolated Test Fixtures (`model/data/sample_student_profiles.json`). |
| **Sprint 3** | Tech Stack Prediction Model | 01/10/26 – 31/10/26 | ✅ **Completed (Current)**: Random Forest recommendation model (`model/training/train.py`), Top-K ranking engine (`model/recommendation/predictor.py`), FastAPI service (`ai-service/app/main.py`), 16 automated tests (`tests/`), Technical Docs (`docs/model-documentation.md`). |
| **Sprint 4** | Resume Parsing & Explainability | 01/11/26 – 02/01/27 | ⏳ *Planned Future Work*: SHAP explainability, LLM resume extraction. |
| **Sprint 5** | Backend API System Integration | 03/01/27 – 20/02/27 | ⏳ *Planned Future Work*: Node.js gateway integration with FastAPI. |
| **Sprint 6** | System Testing & Deployment | 21/02/27 – 15/03/27 | ⏳ *Planned Future Work*: End-to-end integration testing and deployment. |

---

## 🛠️ AI / ML Architecture & Technology Stacks

The model maps student inputs across 48 normalized features to **7 core target technology stacks**:
1. `MERN_FULL_STACK`: Modern Full-Stack Web & Cloud (React, Node.js, Express, MongoDB, Tailwind)
2. `AI_ML_ENGINEERING`: Applied AI & Intelligent Web Services (Python, FastAPI, scikit-learn, PyTorch, Pandas)
3. `IOT_EMBEDDED_SYSTEMS`: IoT Cloud Gateway & Smart Edge Systems (ESP32, C/C++, MQTT, InfluxDB, React)
4. `CLOUD_DEVOPS`: Cloud Native Infrastructure & DevOps (Docker, Kubernetes, Linux, AWS, CI/CD)
5. `MOBILE_APP_DEV`: Cross-Platform Mobile Applications (Flutter, Dart, Firebase, SQLite)
6. `DATA_ANALYTICS`: Data Engineering & Business Analytics (Python, SQL, PostgreSQL, PowerBI/Tableau)
7. `CYBERSECURITY`: Security Engineering & Network Defense (Linux, Python, Wireshark, Cryptography)

---

## 🚀 Quickstart Guide

### 1. Environment Setup
```bash
# Clone the repository
git clone https://github.com/krish2904-lak/F-096.git
cd F-096

# Create and activate virtual environment (Python 3.10+)
python -m venv .venv
# Windows:
.\.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Generate Dataset & Train Model
```bash
# Generate the 1,000-record student training dataset
python -m model.data.dataset_generator

# Train the Random Forest Classifier
python -m model.training.train --n-estimators 100 --max-depth 15

# Evaluate with 5-fold cross validation
python -m model.training.evaluate --cv
```

### 3. Run Automated Tests
```bash
pytest -v
```

### 4. Run AI Recommendation Microservice
```bash
# Start FastAPI service
uvicorn ai-service.app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`
- Recommendation Endpoint: `POST http://localhost:8000/api/v1/recommend`
