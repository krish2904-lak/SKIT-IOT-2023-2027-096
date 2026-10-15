# Explainability API Contract — Project F-096

**Document:** Explainability API Contract & Integration Guide  
**Project:** AI Based Tech-Stack Recommendation with ERP Integration (SKIT/DS/2023-2027/CSE-F-096)  
**Author:** Nishant Kumawat (Team Lead — AI/ML Core)  
**Audience:** Lakshya Jain (Node.js Gateway), Prachi Bhardwaj (React Frontend Dashboard)  
**Status:** Sprint 4 Groundwork — Active  

---

## 1. Overview & Architectural Design

Sprint 4 introduces **TreeSHAP Explainability** to the technology stack recommendation service (`ai-service`). 
The service explains *why* a particular technology stack was recommended for an individual student by decomposing the model's multi-class Random Forest predictions into exact, additive feature attribution weights.

### Design Principles
1. **100% Backward Compatibility:** The standard `POST /api/v1/recommend` endpoint is completely unchanged by default. Existing consumers will receive the identical Sprint 3 response.
2. **Opt-in Explainability:** Clients request explanations by either appending `?explain=true` to `POST /api/v1/recommend` or calling the dedicated convenience endpoint `POST /api/v1/recommend/explain`.
3. **Deterministic & Cached:** The `shap.TreeExplainer` is compiled once during service startup and cached in-memory as a singleton. Inference + explanation completes in **~50–60ms** per student.
4. **Human-Readable Labels:** Raw feature tokens (e.g., `skill_python`, `course_ml_math`) are automatically mapped to clean user-facing labels (e.g., "Python Programming Skill", "Machine Learning & Mathematics Coursework").

---

## 2. API Endpoints

### 2.1 Primary Endpoint: `POST /api/v1/recommend`
- **Query Parameter:** `explain` (`boolean`, optional, default = `false`)
- **Headers:** `Content-Type: application/json`
- **Behavior:**
  - `explain=false` (or omitted): Returns standard recommendations without `explanation` object.
  - `explain=true`: Returns recommendations with an `explanation` object attached to each recommended tech stack.

### 2.2 Dedicated Endpoint: `POST /api/v1/recommend/explain`
- **Headers:** `Content-Type: application/json`
- **Behavior:** Dedicated alias that always includes the `explanation` object for each recommendation. Recommended for direct calls from developer dashboards and interactive explanation views.

---

## 3. Response Schema & Field Definitions

### Top-Level Response Fields
| Field | Type | Description |
|---|---|---|
| `recommendations` | `Array<RecommendationItem>` | List of top-K recommended technology stacks sorted by match score. |
| `model_version` | `string` | Version of the active Random Forest model (e.g., `"1.0.0"`). |
| `total_matched` | `integer` | Count of recommendations returned (default: 3). |

### `RecommendationItem` Fields
| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `"rec_1"`). |
| `stack_code` | `string` | Canonical technology stack identifier (e.g., `"AI_ML_ENGINEERING"`). |
| `title` | `string` | Human-readable technology stack title. |
| `category` | `string` | Domain category (e.g., `"Artificial Intelligence & Data Science"`). |
| `matchScore` | `float` | Recommendation affinity score in percentage (`0.0` – `100.0`). |
| `difficulty` | `string` | Difficulty level (`"Beginner"`, `"Intermediate"`, `"Advanced"`). |
| `topRoles` | `Array<string>` | Industry roles associated with this tech stack. |
| `coreTechnologies`| `Array<string>` | Languages, frameworks, and tools in this stack. |
| `whyRecommended` | `string` | Baseline summary string. |
| `roadmap` | `Array<Phase>` | 3-phase progression roadmap with milestones, topics, and resources. |
| `explanation` | `ExplanationObject \| null` | **(Additive)** SHAP feature attribution insights. Present only when `explain=true`. |

### `ExplanationObject` Structure
```json
{
  "summary": "Recommended mainly because of strong Python Programming Skill and Machine Learning & Mathematics Coursework.",
  "top_features": [
    {
      "feature": "skill_python",
      "label": "Python Programming Skill",
      "value": 1.0,
      "shap_value": 0.1829,
      "direction": "supports"
    }
  ]
}
```

#### Detailed Explanation Field Specifications
- **`summary`** (`string`): A deterministic, plain-language explanation synthesized from the student's top contributing factors.
- **`top_features`** (`Array<FeatureContributionItem>`): The top N (default 5) features with the highest absolute influence on this recommendation, sorted in descending order of `abs(shap_value)`.
  - **`feature`** (`string`): Internal 48-feature token name (e.g. `skill_python`, `course_ml_math`, `interest_ai_ml`).
  - **`label`** (`string`): Clean human-readable display label (e.g. "Python Programming Skill").
  - **`value`** (`float`): Normalized student input value (`0.0` to `1.0`). For skills: 0.33 = beginner, 0.67 = intermediate, 1.0 = advanced. For academic marks: percentage scaled to [0, 1]. For interests: 1.0 = declared interest, 0.0 = not selected.
  - **`shap_value`** (`float`): TreeSHAP attribution value indicating positive or negative impact on the stack's likelihood.
  - **`direction`** (`string`): Either `"supports"` (`shap_value >= 0`) or `"reduces"` (`shap_value < 0`).

---

## 4. Plain-Language Guide to Interpreting SHAP Values

SHAP (**SHapley Additive exPlanations**) originates from cooperative game theory. It calculates how each student feature contributes to the model predicting a specific tech stack over other stacks.

1. **Additivity Property:**
   $$\text{Final Model Probability} \approx \text{Base Expected Value} + \sum_{i=1}^{48} \text{SHAP}_i$$
   The sum of all 48 feature SHAP attributions added to the base population rate approximately matches the model's output probability.
2. **Direction:**
   - **`supports` (+SHAP):** The student's background in this skill, course, or interest pushed the prediction **toward** this technology stack.
   - **`reduces` (-SHAP):** The absence or lower score in this feature reduced the likelihood of recommending this technology stack compared to the population average.
3. **Magnitude:**
   - The higher the absolute value $| \text{SHAP} |$, the more decisive that factor was in the recommendation. A feature with SHAP `+0.18` had roughly triple the positive impact of a feature with SHAP `+0.06`.

---

## 5. Full Request and Response Example

### 5.1 Request
`POST /api/v1/recommend?explain=true`

```json
{
  "student_id": "SKIT/2023/CSE-AIML/015",
  "branch": "CSE (AI/ML)",
  "semester": 6,
  "cgpa": 8.85,
  "academic_scores": {
    "web_technologies": 78.0,
    "dbms": 84.0,
    "dsa": 88.0,
    "iot_embedded": 72.0,
    "ml_math": 92.0,
    "cloud_computing": 80.0,
    "operating_systems": 85.0
  },
  "interests": [
    "ai_ml",
    "data_analytics"
  ],
  "skills": [
    { "name": "python", "level": "advanced" },
    { "name": "pytorch", "level": "intermediate" },
    { "name": "fastapi", "level": "intermediate" },
    { "name": "sql", "level": "intermediate" },
    { "name": "pandas", "level": "advanced" },
    { "name": "docker", "level": "beginner" }
  ],
  "projects_completed": 3,
  "certifications_count": 2,
  "top_k": 3
}
```

### 5.2 Response (Status 200 OK)
```json
{
  "recommendations": [
    {
      "id": "rec_1",
      "stack_code": "AI_ML_ENGINEERING",
      "title": "Applied AI & Intelligent Web Services",
      "category": "Artificial Intelligence & Data Science",
      "matchScore": 96.5,
      "difficulty": "Intermediate to Advanced",
      "topRoles": [
        "AI/ML Engineer",
        "Data Scientist",
        "MLOps Engineer",
        "Applied Research Engineer"
      ],
      "coreTechnologies": [
        "Python",
        "PyTorch / TensorFlow",
        "FastAPI",
        "Pandas",
        "Scikit-Learn",
        "Docker",
        "MLflow"
      ],
      "whyRecommended": "Recommended because of strong Python and ML/Math academic performance.",
      "roadmap": [
        {
          "phaseNumber": 1,
          "title": "Phase 1: Deep Learning & Mathematical Foundations",
          "durationWeeks": 4,
          "milestone": "Implement transformer-based NLP and computer vision pipelines from scratch.",
          "topics": [
            "Vector Math & Linear Algebra",
            "PyTorch Tensor Operations",
            "Backpropagation & Optimization",
            "Convolutional & Attention Networks"
          ],
          "recommendedResource": "CS231n: Deep Learning for Computer Vision / Fast.ai"
        },
        {
          "phaseNumber": 2,
          "title": "Phase 2: Production Model Serving & APIs",
          "durationWeeks": 4,
          "milestone": "Deploy scalable PyTorch inference endpoints with FastAPI and ONNX runtime.",
          "topics": [
            "FastAPI Async Endpoints",
            "Batch Inference & Pydantic Validation",
            "Model Quantization (ONNX / TensorRT)",
            "Redis Feature Caching"
          ],
          "recommendedResource": "Full Stack Deep Learning (FSDL)"
        },
        {
          "phaseNumber": 3,
          "title": "Phase 3: MLOps, Containerization & Drift Monitoring",
          "durationWeeks": 4,
          "milestone": "Establish end-to-end automated retraining and drift monitoring pipeline.",
          "topics": [
            "Docker Multi-stage Builds for PyTorch",
            "MLflow Experiment Tracking",
            "Data & Concept Drift Monitoring (Evidently AI)",
            "Automated CI/CD for Model Artifacts"
          ],
          "recommendedResource": "Made With ML (Goku Mohandas)"
        }
      ],
      "explanation": {
        "summary": "Recommended mainly because of strong Python Programming Skill and Machine Learning & Mathematics Coursework, though lower Embedded C / C++ Programming Skill slightly reduces the match score.",
        "top_features": [
          {
            "feature": "skill_python",
            "label": "Python Programming Skill",
            "value": 1.0,
            "shap_value": 0.1829,
            "direction": "supports"
          },
          {
            "feature": "course_ml_math",
            "label": "Machine Learning & Mathematics Coursework",
            "value": 0.92,
            "shap_value": 0.1415,
            "direction": "supports"
          },
          {
            "feature": "interest_ai_ml",
            "label": "Declared Interest in AI / ML",
            "value": 1.0,
            "shap_value": 0.1102,
            "direction": "supports"
          },
          {
            "feature": "skill_pytorch",
            "label": "PyTorch Framework Skill",
            "value": 0.67,
            "shap_value": 0.0984,
            "direction": "supports"
          },
          {
            "feature": "skill_embedded_c",
            "label": "Embedded C / C++ Programming Skill",
            "value": 0.0,
            "shap_value": -0.0312,
            "direction": "reduces"
          }
        ]
      }
    }
  ],
  "model_version": "1.0.0",
  "total_matched": 1
}
```

---

## 6. Error Handling & HTTP Status Codes

| Status Code | Reason | Example Response |
|---|---|---|
| **`200 OK`** | Successful recommendation and explanation generation. | Valid recommendation JSON payload. |
| **`422 Unprocessable Entity`** | Malformed JSON, missing required fields, or invalid types. | `{"detail": [{"loc": ["body", "academic", "cgpa"], "msg": "Field required", "type": "missing"}]}` |
| **`500 Internal Server Error`** | Unhandled server exception during feature preprocessing or model inference. | `{"detail": "Internal inference error: ..."}` |

---

## 7. Teammate Integration Guide

### 7.1 For Lakshya Jain (Node.js API Gateway)
1. **Route Forwarding:** Forward incoming gateway requests from `/api/recommendations` to FastAPI `POST http://localhost:8000/api/v1/recommend`.
2. **Transparent Query Flag:** Allow the frontend to pass `?explain=true`. Forward this query parameter directly in your `axios`/`fetch` call:
   ```javascript
   // Node.js Express Gateway Handler
   app.post('/api/recommendations', async (req, res) => {
     try {
       const explainParam = req.query.explain === 'true' ? '?explain=true' : '';
       const response = await axios.post(
         `${process.env.AI_SERVICE_URL}/api/v1/recommend${explainParam}`,
         req.body
       );
       return res.status(200).json(response.data);
     } catch (err) {
       const status = err.response ? err.response.status : 500;
       return res.status(status).json(err.response ? err.response.data : { error: err.message });
     }
   });
   ```
3. **Payload Caching:** Gateway response caching can key off `student_id` and the `explain` flag.
4. **Latency Budget:** Fast response times (~58ms FastAPI processing) mean no special streaming or SSE is needed for explanation generation.

### 7.2 For Prachi Bhardwaj (React Frontend Dashboard)
1. **Calling with Explainability:**
   When the user submits the recommendation form, call:
   `POST /api/recommendations?explain=true`
2. **Displaying the Summary:**
   Directly bind `recommendation.explanation?.summary` inside an alert or callout box above the tech stack roadmap:
   ```jsx
   {rec.explanation && (
     <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
       <p className="text-sm font-medium text-blue-900">
         💡 <strong>Why this stack was recommended:</strong> {rec.explanation.summary}
       </p>
     </div>
   )}
   ```
3. **Visualizing Top Contributing Features:**
   Render the `top_features` array as a breakdown card or horizontal bar indicator:
   - **Label:** `feature.label`
   - **Badge:** 
     - If `direction === "supports"`: Green badge (`+` sign with green progress bar).
     - If `direction === "reduces"`: Amber/Red badge (`-` sign with red/gray progress bar).
   - **Student Value:** `(feature.value * 100).toFixed(0) + "%"` (proficiency level or grade).
   - **SHAP Impact:** Display formatted as `+0.18` or `-0.03`.
4. **Graceful Degradation:**
   Always use optional chaining (`rec.explanation?.top_features`). If `explanation` is undefined, simply render the default stack card as before.
