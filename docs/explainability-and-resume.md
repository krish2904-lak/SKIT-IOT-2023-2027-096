# Sprint 4 Specification: TreeSHAP Explainability & Resume Skill Extraction

**Project Title:** AI Based Tech-Stack Recommendation with ERP Integration  
**Project ID:** SKIT/DS/2023-2027/CSE-F-096  
**Document Author:** Nishant Kumawat (Team Lead — AI/ML & System Integration)  
**Sprint Window:** Sprint 4 (Form-2: 01/11/2026 – 02/01/2027)  
**Status:** ✅ Fully Implemented, Integrated, and Verified with 95 Automated Tests  

---

## 1. Executive Summary & Design Overview

Sprint 4 introduces two core intelligence capabilities to the F-096 platform:
1. **Mathematical TreeSHAP Explainability Engine:** Replaces heuristic rules with exact, multi-class Shapley additive feature attributions computed directly via `shap.TreeExplainer` on the trained Random Forest classifier (7 classes, 48 features).
2. **Resume Parsing & Skill Extraction Pipeline:** Ingests student resumes in PDF and DOCX formats, extracts technical competencies, project experience, and certifications via a provider-agnostic LLM client (with automatic single-retry and deterministic regex/taxonomy fallback), and maps them into the canonical 48-feature schema while prioritizing manual student inputs during conflict resolution.

### System Architecture Flow

```mermaid
flowchart TD
    A[Student Resume (PDF / DOCX)] --> B[Document Parser (pypdf / python-docx)]
    B -->|Clean Text in Memory| C{LLM API Key Set?}
    C -->|Yes| D[LLM Resume Extractor (Strict JSON + Pydantic)]
    C -->|No / Failed| E[Deterministic Fallback Extractor (Taxonomy)]
    D -->|Extracted Skills & Domains| F[Feature Mapper & Conflict Resolver]
    E -->|Extracted Skills & Domains| F
    G[Manual Form Inputs / ERP Record] --> F
    F -->|Manual Inputs Win on Conflict| H[Merged Profile (48-Feature Vector)]
    H --> I[Random Forest Recommendation Model]
    H --> J[TreeSHAP Explainer (shap.TreeExplainer)]
    I --> K[Top-K Ranked Tech Stacks]
    J --> L[Positive & Negative SHAP Attributions]
    K --> M[FastAPI Service Response]
    L --> M
    M --> N[React Dashboard (Explanation View)]
```

---

## 2. SHAP Explainability Engine Design

### 2.1 Theoretical Foundation & Multi-Class Handling
SHAP (SHapley Additive exPlanations) grounds feature importance in cooperative game theory. For tree ensemble models, `TreeSHAP` computes polynomial-time exact attributions:
$$f(x) = \phi_0 + \sum_{j=1}^{M} \phi_j(x)$$
where $\phi_0$ is the base expected value (prior probability of the target technology stack across training data) and $\phi_j$ is the attribution of feature $j$.

In multi-class settings (7 target technology stacks), SHAP output dimensions vary across library versions:
- **SHAP $\ge$ 0.40 / 0.53:** Produces a 3D ndarray or `Explanation` object of shape `(N, n_features, n_classes)`.
- **Legacy SHAP:** Produces a Python list of `n_classes` matrices each of shape `(N, n_features)`.

The `ShapExplainer` class (`model/explainability/shap_explainer.py`) normalizes these representations through `_extract_class_shap()`, reliably extracting the 1D attribution slice for the predicted or requested technology stack.

### 2.2 Response Contract & Ordering Invariants
For any target stack:
- **Base Confidence (`baseConfidence`):** The expected prior probability $\phi_0 \in [0.0, 1.0]$.
- **Predicted Confidence (`predictedConfidence`):** The Random Forest posterior probability $P(Y = \text{stack} \mid X) \in [0.0, 1.0]$.
- **Top 5 Positive Factors (`topPositiveFactors`):** Sorted descending by `shapValue` (largest positive attributions first, where $\phi_j \ge 0.0$).
- **Top 5 Negative Factors (`topNegativeFactors`):** Sorted ascending by `shapValue` (most negative attributions first, where $\phi_j \le 0.0$).
- **Factor Fields:** Each factor contains `feature`, `label` (human-readable), `value` (normalized student input), `shapValue` (weight), `category`, `explanationNote`, and optional `remedyElective` and `potentialBoost`.
- **Summary Text (`summaryText`):** 1–2 plain-English sentences synthesizing primary drivers and bridgeable gaps.
- **Learning Prerequisites (`learningPrerequisites`):** Actionable curriculum prerequisites for the stack.

### 2.3 Global Feature Importance
The explainer calculates mean absolute SHAP values across samples:
$$I_j = \frac{1}{N} \sum_{i=1}^{N} |\phi_{i, j}|$$
Top influential global features identified:
1. `interest_cybersecurity` (Mean $|SHAP| \approx 0.0283$)
2. `skill_pytorch` (Mean $|SHAP| \approx 0.0239$)
3. `skill_linux` (Mean $|SHAP| \approx 0.0233$)
4. `skill_javascript` (Mean $|SHAP| \approx 0.0185$)
5. `interest_ai_ml` (Mean $|SHAP| \approx 0.0184$)

---

## 3. Resume Analysis & Skill Extraction Pipeline

### 3.1 Document Ingestion (`app.resume.parser`)
- **PDF Extraction:** Built with `pypdf.PdfReader`. Iterates over document pages in memory. Detects empty pages or scanned/image-only PDFs lacking OCR text layers.
- **DOCX Extraction:** Built with `python-docx.Document`. Extracts paragraphs and table rows.
- **File Size Guardrail:** Strict 5 MB file size limit. Exceeding files trigger HTTP 413 `Payload Too Large`.
- **PII & Privacy Protection:** Uploaded resume files are never saved to disk. Extracted text buffers are processed in memory and are never logged to console or disk logs.

### 3.2 Provider-Agnostic LLM Client (`app.resume.llm_client`)
- Reads `LLM_API_KEY`, `LLM_MODEL_NAME`, and `LLM_BASE_URL` from environment variables.
- Uses standard HTTP chat completion endpoints compatible with OpenAI, Gemini, or self-hosted LLM endpoints.
- Enforces strict JSON output conforming to `ResumeExtractionResult`.
- **Automatic Retry:** If the LLM produces malformed JSON or fails Pydantic schema validation, the client retries once with an explicit error correction prompt.
- **Graceful Fallback:** If the LLM request fails or no API key is provided, the system automatically delegates to the deterministic fallback extractor without raising an error to the user.

### 3.3 Deterministic Fallback Extractor (`app.resume.fallback_extractor`)
- Covers all 31 technical skills, aliases, and 7 target tech stack ecosystems using robust word-boundary regex patterns (accounting for non-word delimiters such as `C++`, `C#`, and single-letter `C`).
- Identifies experience levels (`beginner`, `intermediate`, `advanced`) from surrounding contextual windows.
- Extracts domain interests, project counts, and certification milestones.

### 3.4 Feature Mapper & Conflict Resolution (`app.resume.mapper`)
- **Conflict Rule:** Manual student input wins on any conflict.
  - If a student manually enters `React` at `beginner` level, and the resume mentions `React` at `advanced` level, the manual entry (`beginner`, source `SELF_REPORTED`) is retained.
  - Novel skills detected in the resume that were omitted from manual input are added with source `RESUME_PARSED`.
  - Manual project counts and certification counts take precedence if greater than zero.
  - ERP academic coursework marks always supersede resume assertions.
- Maps the merged profile into the canonical 48-feature float32 vector ready for inference.

---

## 4. API Specification & Contract Examples

### 4.1 POST `/api/v1/explain`
Calculates TreeSHAP feature attributions and explanation summary.

**Request Payload:**
```json
{
  "profile": {
    "student_id": "SKIT/2026/096",
    "branch": "CSE (IoT)",
    "semester": 6,
    "cgpa": 8.7,
    "academic_scores": {
      "web_technologies": 92.0,
      "dbms": 86.0,
      "dsa": 80.0,
      "iot_embedded": 75.0,
      "ml_math": 70.0,
      "cloud_computing": 68.0,
      "operating_systems": 78.0
    },
    "interests": ["web_development"],
    "skills": [
      {"name": "react", "level": "intermediate"},
      {"name": "javascript", "level": "advanced"}
    ],
    "projects_completed": 2,
    "certifications_count": 1
  },
  "stack_code": "MERN_FULL_STACK"
}
```

**Response Payload (HTTP 200):**
```json
{
  "recommendationId": "rec-mern-001",
  "recommendationTitle": "Modern Full-Stack Cloud Native",
  "stackCode": "MERN_FULL_STACK",
  "baseConfidence": 0.141,
  "predictedConfidence": 0.6631,
  "summaryText": "Recommended mainly because of strong JavaScript Programming Skill and React.js Frontend Framework Skill. Developing experience in HTML/CSS & Web Layout Skill will further strengthen this match.",
  "topPositiveFactors": [
    {
      "feature": "skill_javascript",
      "featureName": "skill_javascript",
      "label": "JavaScript Programming Skill",
      "displayName": "JavaScript Programming Skill",
      "value": 1.0,
      "shapValue": 0.1369,
      "shap_value": 0.1369,
      "impactDirection": "POSITIVE",
      "category": "EXISTING_SKILL",
      "explanationNote": "Demonstrated skill proficiency in JavaScript Programming Skill (Advanced) strengthens ramp-up speed.",
      "remedyElective": null,
      "potentialBoost": null
    },
    {
      "feature": "skill_react",
      "featureName": "skill_react",
      "label": "React.js Frontend Framework Skill",
      "displayName": "React.js Frontend Framework Skill",
      "value": 0.6667,
      "shapValue": 0.0695,
      "shap_value": 0.0695,
      "impactDirection": "POSITIVE",
      "category": "EXISTING_SKILL",
      "explanationNote": "Demonstrated skill proficiency in React.js Frontend Framework Skill (Intermediate) strengthens ramp-up speed.",
      "remedyElective": null,
      "potentialBoost": null
    }
  ],
  "topNegativeFactors": [
    {
      "feature": "skill_html_css",
      "featureName": "skill_html_css",
      "label": "HTML/CSS & Web Layout Skill",
      "displayName": "HTML/CSS & Web Layout Skill",
      "value": 0.0,
      "shapValue": -0.0453,
      "shap_value": -0.0453,
      "impactDirection": "NEGATIVE",
      "category": "EXISTING_SKILL",
      "explanationNote": "HTML/CSS & Web Layout Skill (metric: 0.0) weakens practical execution capacity.",
      "remedyElective": null,
      "potentialBoost": 4.5
    }
  ],
  "learningPrerequisites": [
    "Data Structures & Algorithms (OOP)",
    "Relational Database Management (DBMS)",
    "Command-Line & Git Version Control"
  ]
}
```

### 4.2 POST `/api/v1/resume/parse`
Multipart form upload accepting a PDF or DOCX resume with optional manual profile JSON.

**Form Data:**
- `file`: Binary file (`.pdf` or `.docx`, max 5 MB).
- `manual_profile` (optional): JSON string representing manual form inputs to merge.

**Response Payload (HTTP 200):**
```json
{
  "filename": "student_resume.pdf",
  "extraction_method": "deterministic_fallback",
  "extracted_skills": [
    {"name": "python", "level": "advanced", "source": "RESUME_PARSED"},
    {"name": "fastapi", "level": "intermediate", "source": "RESUME_PARSED"},
    {"name": "docker", "level": "intermediate", "source": "RESUME_PARSED"},
    {"name": "postgresql", "level": "intermediate", "source": "RESUME_PARSED"}
  ],
  "extracted_domains": ["ai_ml", "cloud_devops"],
  "projects_count": 2,
  "certifications_count": 1,
  "experience_level": "intermediate",
  "mapped_features": {
    "cgpa": 0.75,
    "course_web_technologies": 0.7,
    "course_dbms": 0.7,
    "course_dsa": 0.7,
    "course_iot_embedded": 0.7,
    "course_ml_math": 0.7,
    "course_cloud_computing": 0.7,
    "course_operating_systems": 0.7,
    "interest_ai_ml": 1.0,
    "interest_cloud_devops": 1.0,
    "skill_python": 1.0,
    "skill_fastapi": 0.6667,
    "skill_docker": 0.6667,
    "skill_postgresql": 0.6667,
    "projects_completed": 0.2,
    "certifications_count": 0.2
  },
  "merged_profile": {
    "student_id": "SKIT/STUDENT/RESUME-INGEST",
    "branch": "CSE (IoT)",
    "semester": 6,
    "cgpa": 7.5,
    "skills": [
      {"name": "python", "level": "advanced", "source": "RESUME_PARSED"},
      {"name": "fastapi", "level": "intermediate", "source": "RESUME_PARSED"},
      {"name": "docker", "level": "intermediate", "source": "RESUME_PARSED"},
      {"name": "postgresql", "level": "intermediate", "source": "RESUME_PARSED"}
    ],
    "interests": ["ai_ml", "cloud_devops"],
    "projects_completed": 2,
    "certifications_count": 1,
    "resume_uploaded": true
  }
}
```

### 4.3 POST `/api/v1/recommend` (Updated)
Maintains 100% backward compatibility. When `?explain=true` query parameter is provided, it populates `explanation` inside each recommended stack. Also accepts optional `resume_features` in the profile body.

---

## 5. Environment Configuration

Create a `.env` file in the repository root by copying `.env.example`:

```bash
cp .env.example .env
```

| Variable | Description | Default | Required? |
|---|---|---|---|
| `LLM_API_KEY` | API secret key for LLM provider (OpenAI, Gemini, etc.) | Empty string | No (deterministic fallback runs if unset) |
| `LLM_MODEL_NAME` | Model identifier | `gpt-4o-mini` | No |
| `LLM_BASE_URL` | Base API endpoint URL | `https://api.openai.com/v1` | No |
| `AI_SERVICE_PORT` | Port for FastAPI server | `8000` | No |
| `AI_SERVICE_HOST` | Host binding for FastAPI server | `0.0.0.0` | No |

---

## 6. Known Limitations & Future Roadmap

1. **Scanned PDF Images:** Image-only scanned PDFs without embedded text layers cannot be extracted by `pypdf`. Future sprints may integrate Tesseract OCR.
2. **Context Window on Multi-Page Resumes:** Very large multi-page resumes (>10 pages) should be pre-filtered to technical sections before LLM transmission.
3. **Complex Multi-Class SHAP Computation:** Computing exact TreeSHAP values for large batches of students scales with tree count ($100 \times \text{nodes}$). Caching the TreeExplainer singleton ensures individual student requests resolve in $<15\text{ms}$.
