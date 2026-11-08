# Resume Extraction API Contract & Integration Guide — Project F-096

**Document:** Resume Extraction API Contract & Gateway Specification  
**Project:** AI Based Tech-Stack Recommendation with ERP Integration (SKIT/DS/2023-2027/CSE-F-096)  
**Author:** Nishant Kumawat (Team Lead — AI/ML Core)  
**Target Audience:** Lakshya Jain (Node.js API Gateway Lead), Prachi Bhardwaj (Frontend Lead), Saloni Jain (QA Lead)  
**Sprint:** Sprint 4 (01/11/26 – 02/01/27) — Active  

---

## 1. Architectural Overview & Design Principles

Sprint 4 introduces automated resume parsing and competency mapping to Project F-096. Students can upload their technical resumes (or paste resume text), automatically extracting technical skills, declared/inferred domain interests, project milestones, certifications, and academic CGPA hints.

### 1.1 Core Architectural Principles

1. **Additive & Backward-Compatible:** Existing recommendation endpoints (`POST /api/v1/recommend`, `POST /api/v1/recommend/explain`, `POST /api/v1/explain`) remain completely backward compatible. Existing callers receive unchanged responses.
2. **Strict In-Memory Buffer Isolation & PII Protection:**
   - Resume buffers and extracted plain text are processed strictly in-memory.
   - Resumes are **never written to disk**, never cached to temporary files, and never logged to stdout, stderr, or system logs.
3. **Format Support & Boundary Enforcement:**
   - Formats accepted: PDF (`.pdf`), Microsoft Word (`.docx`), plain text (`.txt`), or direct pasted string payloads.
   - File size boundary: Strictly enforced at **5 MB (5,242,880 bytes)**. Larger files are rejected with HTTP 413.
   - Non-supported formats are rejected with HTTP 415.
4. **Dual Extractor Pipeline with Automatic Resilience:**
   - `RuleBasedExtractor` (Default): Offline, deterministic, regex and taxonomy-backed pattern matching. Resolves colloquialisms and aliases using `model/resume/skills_taxonomy.json`.
   - `LLMExtractor` (Optional): Enabled when an API key (e.g. `GEMINI_API_KEY` or `LLM_API_KEY`) is set in the runtime environment. Enforces strict JSON via Pydantic. If external network calls timeout, fail, or emit non-conforming JSON, the engine automatically and silently falls back to `RuleBasedExtractor`.
   - *Note on LLM Mode:* In LLM mode, resume text is transmitted to an external inference endpoint. When privacy compliance requires complete air-gapping, leave the API key unset to operate exclusively in local deterministic mode.
5. **The Precedence Rule ("Manual Wins"):**
   - Values manually specified by the student in the UI form strictly override resume-extracted values.
   - Resume extractions fill only missing profile fields.
   - If both manual and resume data omit a feature, standard training pipeline defensive imputation is applied (CGPA defaults to `0.70`, courses default to `0.70`, skills/interests to `0.0`, projects to `0.10`, certs to `0.0`).
6. **Field-Level Confidences:**
   - Every mapped feature in the 48-dimensional vector carries a confidence score:
     - Form-entered manual values: `1.0`
     - Resume-extracted values: `0.75 – 0.90` (direct skill matches: `0.85 – 0.90`, inferred domains: `0.80`, projects: `0.80`, CGPA hint: `0.80`)
     - Default imputed values: `0.0`

---

## 2. API Endpoints

### 2.1 Extraction Endpoint: `POST /api/v1/resume/extract`

Extracts skills, domains, projects, certifications, and academic hints from a resume file or text, returning the extracted metadata, mapped 48-feature vector, and field-level confidence scores.

#### Request Formats

The endpoint accepts either **Multipart Form-Data** or **Application/JSON**:

**Option A: Multipart Form-Data (File Upload or Form Text)**
- `file`: `UploadFile` (optional; `.pdf`, `.docx`, or `.txt`)
- `text`: `string` (optional; raw pasted resume text)
- `manual_profile`: `string` (optional JSON string of manual student inputs)

**Option B: Application/JSON (Pasted Text)**
```json
{
  "text": "Nishant Kumawat\nSkills: Python, Scikit-learn, Docker, React.js\nProjects: AI Tech Stack Recommender\nCGPA: 8.8",
  "manual_profile": {
    "cgpa": 9.2,
    "skills": [{"name": "python", "level": "advanced"}]
  }
}
```

#### Successful Response (`200 OK`)

```json
{
  "extraction_method": "rule_based",
  "extracted_skills": [
    {
      "name": "python",
      "level": "advanced",
      "source": "RESUME_RULE",
      "confidence": 0.9
    },
    {
      "name": "docker",
      "level": "intermediate",
      "source": "RESUME_RULE",
      "confidence": 0.9
    },
    {
      "name": "react",
      "level": "intermediate",
      "source": "RESUME_RULE",
      "confidence": 0.85
    }
  ],
  "extracted_domains": ["cloud_devops", "ai_ml", "web_development"],
  "projects_count": 2,
  "certifications_count": 1,
  "cgpa_hint": 8.8,
  "experience_level": "intermediate",
  "mapped_features": {
    "cgpa": 0.92,
    "course_web_technologies": 0.70,
    "course_dbms": 0.70,
    "course_dsa": 0.70,
    "course_iot_embedded": 0.70,
    "course_ml_math": 0.70,
    "course_cloud_computing": 0.70,
    "course_operating_systems": 0.70,
    "interest_web_development": 1.0,
    "interest_ai_ml": 1.0,
    "interest_cloud_devops": 1.0,
    "interest_iot_embedded": 0.0,
    "interest_mobile_dev": 0.0,
    "interest_data_analytics": 0.0,
    "interest_cybersecurity": 0.0,
    "skill_python": 1.0,
    "skill_docker": 0.67,
    "skill_react": 0.67,
    "projects_completed": 0.20,
    "certifications_count": 0.20
  },
  "confidences": {
    "cgpa": 1.0,
    "course_web_technologies": 0.0,
    "skill_python": 1.0,
    "skill_docker": 0.90,
    "skill_react": 0.85,
    "interest_cloud_devops": 0.80,
    "projects_completed": 0.80,
    "certifications_count": 0.80
  },
  "merged_profile": {
    "student_id": "STU-RESUME-EXTRACTED",
    "cgpa": 9.2,
    "academic_scores": {
      "web_technologies": 70.0,
      "dbms": 70.0,
      "dsa": 70.0,
      "iot_embedded": 70.0,
      "ml_math": 70.0,
      "cloud_computing": 70.0,
      "operating_systems": 70.0
    },
    "interests": ["cloud_devops", "ai_ml", "web_development"],
    "skills": [
      {"name": "python", "level": "advanced", "source": "SELF_REPORTED"},
      {"name": "docker", "level": "intermediate", "source": "RESUME_RULE"},
      {"name": "react", "level": "intermediate", "source": "RESUME_RULE"}
    ],
    "projects_completed": 2,
    "certifications_count": 1
  }
}
```

---

### 2.2 Recommendation Endpoint: `POST /api/v1/recommend/from-resume`

Performs end-to-end extraction, feature mapping, profile merging, and Random Forest inference in a single call.

#### Query Parameters
- `explain`: `boolean` (optional, default `false`). When `true`, computes exact TreeSHAP attributions and attaches an `explanation` object to each recommendation.
- `top_k`: `integer` (optional, default `3`, range `1 – 7`). Number of ranked technology stacks to return.

#### Request Formats
Accepts multipart form-data or JSON with identical parameters as `POST /api/v1/resume/extract`.

#### Successful Response (`200 OK`)

```json
{
  "student_id": "STU-RESUME-EXTRACTED",
  "model_version": "1.2.0-rf-trees-100",
  "timestamp": "2026-11-08T23:30:00.000Z",
  "primary_recommendation": {
    "id": "rec-devops-004",
    "stack_code": "CLOUD_DEVOPS",
    "title": "Cloud Native Infrastructure & DevOps",
    "category": "Cloud Infrastructure & SRE",
    "matchScore": 89.4,
    "difficulty": "Advanced",
    "estimatedTimeToLearn": "10-12 Weeks",
    "targetRoles": ["DevOps Engineer", "Cloud Architect", "Site Reliability Engineer (SRE)"],
    "technologies": [
      {"name": "Docker", "category": "Containerization"},
      {"name": "Kubernetes", "category": "Orchestration"},
      {"name": "AWS", "category": "Cloud Infrastructure"}
    ],
    "whyRecommendedSnippet": "Strong profile alignment with containerization and cloud infrastructure competencies.",
    "rank": 1,
    "roadmap": [
      {
        "phase": "Phase 1: Foundations",
        "duration": "Weeks 1-3",
        "title": "Linux, Networking, and Containerization Basics",
        "topics": ["Linux System Administration", "Docker Architecture", "Writing Dockerfiles"],
        "recommendedResource": "Linux & Docker Lab Manual"
      }
    ],
    "explanation": {
      "summary": "Recommended primarily due to demonstrated proficiency in Docker Containerization and declared interest in Cloud & DevOps.",
      "top_features": [
        {
          "feature": "skill_docker",
          "label": "Docker Containerization",
          "value": 0.67,
          "shap_value": 0.214,
          "direction": "supports"
        },
        {
          "feature": "interest_cloud_devops",
          "label": "Cloud & DevOps Interest",
          "value": 1.0,
          "shap_value": 0.186,
          "direction": "supports"
        }
      ]
    }
  },
  "alternative_recommendations": [...],
  "all_ranked_stacks": [...],
  "recommendations": [...]
}
```

---

## 3. Error Handling Contract

The microservice returns standard RFC-7807 compatible HTTP error envelopes:

| Status Code | HTTP Name | Condition | Error Detail Example |
|---|---|---|---|
| **415** | `Unsupported Media Type` | Uploaded file extension is not `.pdf`, `.docx`, or `.txt`. | `{"detail": "Unsupported file format '.exe'. Only .pdf, .docx, and .txt files are accepted."}` |
| **413** | `Content Too Large` | Uploaded file or plain text payload exceeds 5 MB. | `{"detail": "File size (6.12 MB) exceeds maximum allowed limit of 5 MB."}` |
| **422** | `Unprocessable Entity` | Empty file (0 bytes), empty text, corrupt document structure, scanned PDF with no text layers, or malformed JSON. | `{"detail": "Uploaded file is empty (0 bytes)."}` |
| **503** | `Service Unavailable` | Random Forest model weights or TreeSHAP explainer failed to initialize. | `{"detail": "Recommendation model unavailable: Model artifact not loaded."}` |

---

## 4. Gateway Integration Examples (Node.js / Express)

### 4.1 Forwarding Uploaded Resume with Multer

```javascript
// Express.js Route in backend/src/routes/resume.js
const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const router = express.Router();
// Enforce 5MB limit in multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

router.post('/extract', upload.single('resume'), async (req, res, next) => {
  try {
    const formData = new FormData();

    if (req.file) {
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
    } else if (req.body.text) {
      formData.append('text', req.body.text);
    } else {
      return res.status(422).json({ error: "Missing required 'resume' file or 'text' payload." });
    }

    if (req.body.manual_profile) {
      formData.append('manual_profile', typeof req.body.manual_profile === 'string'
        ? req.body.manual_profile
        : JSON.stringify(req.body.manual_profile));
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/api/v1/resume/extract`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: 10 * 1024 * 1024,
    });

    return res.status(200).json(aiResponse.data);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    return next(err);
  }
});

module.exports = router;
```
