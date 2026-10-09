# Data Dictionary — Student Tech-Stack Recommendation System

**Project:** AI Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Sprint:** Sprint 2 — Data Collection & Preparation  
**Module:** `model/data/`  
**Dataset Artifact:** `student_tech_stack_dataset.csv`

---

## 1. Overview & Data Sources

The dataset captures student academic history, technical proficiencies, domain interests, and career milestones. It models three distinct data feeds in the production architecture:

1. **College ERP Records (Authoritative Academic Data):** Student ID, Branch, Semester, Cumulative CGPA, Coursework marks across 7 key subjects.
2. **Student Self-Assessment Inputs (Interactive Profile):** Preferred interest domains, self-declared technical skills and proficiency ratings.
3. **Resume / Portfolio Data (Sprint 4 Integration Point):** Project count, professional certifications, and validated skills.

---

## 2. Feature Schema & Data Dictionary

| Field Name | Type | Range / Format | Source | Description & Role in ML |
|---|---|---|---|---|
| `student_id` | String | e.g., `SKIT/2023/CSE/0001` | ERP | Unique identifier (excluded from training vector). |
| `branch` | Categorical | `CSE`, `CSE (IoT)`, `CSE (AI/ML)`, `IT` | ERP | Academic degree specialization. |
| `semester` | Integer | `4` to `8` | ERP | Current academic term. |
| `cgpa` | Float | `0.0` to `10.0` (typically `5.5` to `9.8`) | ERP | Cumulative Grade Point Average. Scaled to `[0, 1]`. |
| `web_technologies_score` | Float | `0.0` to `100.0` | ERP | Marks in Web Technologies / Internet Programming. |
| `dbms_score` | Float | `0.0` to `100.0` | ERP | Marks in Database Management Systems. |
| `dsa_score` | Float | `0.0` to `100.0` | ERP | Marks in Data Structures & Algorithms. |
| `iot_embedded_score` | Float | `0.0` to `100.0` | ERP | Marks in IoT & Embedded Hardware Systems. |
| `ml_math_score` | Float | `0.0` to `100.0` | ERP | Marks in Machine Learning / Linear Algebra / Probability. |
| `cloud_computing_score` | Float | `0.0` to `100.0` | ERP | Marks in Cloud Computing & Distributed Systems. |
| `operating_systems_score` | Float | `0.0` to `100.0` | ERP | Marks in Operating Systems & Systems Programming. |
| `interests` | List[String] | Comma-delimited domains | Student Input | Active career tracks chosen by student (e.g. `web_development,ai_ml`). |
| `skills` | JSON Array | `[{"name": "...", "level": "..."}]` | Student / Resume | Declared technical skills with proficiency levels: `beginner` (1.0), `intermediate` (2.0), `advanced` (3.0). |
| `projects_completed` | Integer | `0` to `10` | Student / Resume | Count of practical projects completed. Scaled to `[0, 1]`. |
| `certifications_count` | Integer | `0` to `5` | Student / Resume | Count of industry certifications achieved. Scaled to `[0, 1]`. |
| `target_tech_stack` | Target | 7 categorical classes | Labeled Target | Ground truth recommendation category for multi-class classification. |

---

## 3. Target Tech-Stack Categories

| Target Code | Display Title | Typical Core Tools | Primary Focus |
|---|---|---|---|
| `MERN_FULL_STACK` | Modern Full-Stack Web & Cloud | React, Node.js, Express, MongoDB, Tailwind | Full-stack web applications |
| `AI_ML_ENGINEERING` | Applied AI & ML Engineering | Python, FastAPI, scikit-learn, PyTorch, Pandas | Machine learning & intelligent APIs |
| `IOT_EMBEDDED_SYSTEMS` | IoT Gateway & Smart Edge Systems | ESP32, Arduino, C/C++, MQTT, InfluxDB | Embedded firmware, edge devices |
| `CLOUD_DEVOPS` | Cloud Native Infrastructure & DevOps | Docker, Kubernetes, Linux, AWS, CI/CD | Infrastructure, containers, deployment |
| `MOBILE_APP_DEV` | Cross-Platform Mobile Applications | Flutter, Dart, Firebase, REST APIs | Mobile apps (Android & iOS) |
| `DATA_ANALYTICS` | Data Engineering & Analytics | Python, SQL, PostgreSQL, PowerBI/Tableau | Data warehouses, ETL pipelines |
| `CYBERSECURITY` | Security & Network Systems | Linux, C/C++, Network Protocols, Wireshark | Security auditing, network architecture |

---

## 4. Separation of Data Fixtures

- **Training Dataset (`student_tech_stack_dataset.csv`):** 1,000 synthesized records generated using `dataset_generator.py` with reproducible random seed (`42`). Used solely for model training, validation, and benchmarking.
- **Sample Test Fixtures (`sample_student_profiles.json`):** Dedicated mock JSON profiles covering diverse student scenarios, edge cases, and incomplete records. Used for API integration testing and unit tests.
