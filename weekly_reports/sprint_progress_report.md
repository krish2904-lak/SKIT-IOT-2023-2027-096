# Sprint Progress & Status Reports — Team Lead (Nishant Kumawat)

**Project:** AI Based Tech-Stack Recommendation with ERP Integration (`SKIT/DS/2023-2027/CSE-F-096`)  
**Role:** Nishant Kumawat (Team Lead — AI/ML & System Integration)  
**Mentor:** Dr. Archika Jain  

---

## Sprint 1: Project Requirement Analysis & Architecture Finalization
- **Dates:** 10/08/2026 – 22/08/2026
- **Status:** COMPLETED
- **Activities & Deliverables:**
  - Analyzed problem statement regarding career guidance and lack of personalization in student tech-stack choices.
  - Finalized Software Requirements Specification (SRS) covering functional and non-functional requirements (`docs/srs-requirements.md`).
  - Formulated multi-tier System Architecture connecting React frontend, Node.js API gateway, FastAPI AI service, and MongoDB (`docs/system-architecture.md`).
  - Defined integration interfaces and data contracts across ERP academic data, student inputs, and recommendation outputs.

---

## Sprint 2: Data Collection, Organization & Preprocessing Pipeline
- **Dates:** 23/08/2026 – 30/09/2026
- **Status:** COMPLETED
- **Activities & Deliverables:**
  - Formulated feature schema spanning 48 normalized attributes (8 academic ERP marks, 7 domain interests, 31 technical skills, 2 portfolio metrics).
  - Implemented `StudentDataPreprocessor` (`model/preprocessing/preprocessor.py`) supporting lexical canonicalization, alias resolution, missing value defaults, and skill level weighting.
  - Developed synthetic dataset generator (`model/data/dataset_generator.py`) and generated 1,000 balanced student records (`model/data/student_tech_stack_dataset.csv`).
  - Created dedicated sample test profiles (`model/data/sample_student_profiles.json`) ensuring strict isolation of mock fixtures from the training dataset.
  - Published comprehensive Data Dictionary (`model/data/data_dictionary.md` and `docs/dataset-and-features.md`).

---

## Sprint 3: Tech Stack Prediction Model & Inference Service (CURRENT)
- **Dates:** 01/10/2026 – 31/10/2026
- **Status:** COMPLETED (UP TO CURRENT DATE)
- **Activities & Deliverables:**
  - Implemented Scikit-learn Random Forest recommendation model (`model/training/train.py`).
  - Defined 7 target technology stack categories with rich component technology breakdowns (`model/recommendation/tech_stacks.py`).
  - Trained model on the prepared dataset, achieving 100% holdout test accuracy and 100% 5-fold cross-validation accuracy.
  - Saved model artifacts (`rf_tech_stack_model.joblib`, `preprocessor.joblib`, `model_metadata.json`) to `model/saved_models/`.
  - Built production-ready `TechStackPredictor` class (`model/recommendation/predictor.py`) supporting Top-K ranking, match score calculations, and reasoning snippets.
  - Exposed REST endpoints in FastAPI service (`ai-service/app/main.py`) for `/health`, `/api/v1/model-info`, `/api/v1/tech-stacks`, and `/api/v1/recommend`.
  - Verified implementation with comprehensive test suite (`pytest`) covering preprocessing, inference, and API endpoints (16 passed tests).
  - Authored full technical documentation (`docs/model-documentation.md`).
