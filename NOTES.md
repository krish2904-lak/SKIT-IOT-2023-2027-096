# Project Development Notes & Assumptions Log

This document records architectural decisions, working assumptions, and integration points established during each sprint, adhering to the Working Agreement.

---

## Sprint 1

- **Repository Layout & Project Scaffolding:**
  - Placed the React + Tailwind CSS client inside `/frontend` (Vite + TypeScript template) to keep the repository root clean for upcoming backend services (`backend/` for Node.js Express and `ai-service/` for FastAPI).
  - Added a root-level `package.json` proxying `dev`, `build`, and `lint` scripts to `frontend/` so that running `npm run dev` or `npm run build` works identically from either the root or within `/frontend`.

- **Page & Route Naming:**
  - Defined 4 primary student views mapping 1:1 with Prachi's frontend user stories across Sprints 1 to 4:
    1. **Overview Hub (`/overview`):** Shell, welcome banner, academic KPIs, recommendation highlights, and fast navigation.
    2. **Profile & Inputs (`/profile-input`):** Verified ERP academic records, self-declared interests, technical skill self-assessment, and resume upload dropzone placeholder (Sprint 2 preview).
    3. **Recommendations (`/recommendations`):** AI-recommended technology stacks with match scores, difficulty indicators, core tools, and career roles (Sprint 3 preview).
    4. **SHAP Insights (`/explanation`):** Transparent model explainability showing positive/negative feature attributions and prerequisite guidance (Sprint 4 preview).
  - Implemented lightweight client-side state in `App.tsx` (`activeTab`) to enable instantaneous switching and rendering across all 4 screens without external router baggage during the static design phase.

- **Provisional Data Shapes & Mock Isolation:**
  - Isolated all mock payloads into `frontend/src/mocks/` (`student.ts`, `recommendation.ts`, `explanation.ts`) so they can be seamlessly swapped for API gateway calls in Sprint 5.
  - Assumed student profile structure (`StudentProfile`) containing ERP fields (`erpStudentId`, `branch`, `cgpa`, `semester`, `academicYear`) plus user inputs (`interests[]`, `skills[]`, `resumeFileName`).
  - Assumed recommendation payload (`RecommendationItem`) with attributes for `id`, `title`, `category`, `matchScore` (0–100%), `difficulty`, `targetRoles[]`, and `technologies[]`.
  - Assumed SHAP explanation payload (`StackExplanation`) with `baseConfidence`, `summaryText`, `topPositiveFactors[]`, and `topNegativeFactors[]` with `shapValue` weights to anticipate Nishant's Python AI microservice.

- **Empty State Previews:**
  - Provided interactive state preview toggles on the Profile, Recommendations, and Explanation screens ("State Preview: Form/Card Layout vs. Empty State") so reviewers can inspect both empty and populated low-fidelity states directly in the browser.

- **Design System & Styling:**
  - Standardized on Tailwind CSS with a clean, academic-focused palette (Slate neutrals with Blue, Emerald, Indigo, and Rose accents).
  - Designed responsive mobile-friendly sidebar and header with persistent ERP connectivity and branch indicators (`CSE (IoT) • F-096`).

---

## Sprint 2 — Student Input Interface & Data Collection Engine

- **Modular Input Components (`frontend/src/components/inputs/`):**
  - **`DomainInterestPicker`:** Rich interactive domain catalog aligned with the ML model's 7 standardized interest domains (`web_development`, `ai_ml`, `cloud_devops`, `iot_embedded`, `data_analytics`, `cybersecurity`, `mobile_dev`). Includes category filters, fast search, CSE-IoT presets, and primary/secondary domain tracking.
  - **`SkillInputCollector`:** Standardized 35+ technical skill taxonomy mapped directly to `model/preprocessing/features.py`. Includes intelligent search autocomplete, domain-contextual quick-add recommendations, 3-tier proficiency rating (Beginner, Intermediate, Advanced), and data source provenance tagging (`ERP_COURSEWORK`, `RESUME_PARSED`, `SELF_REPORTED`).
  - **`AcademicProjectMilestones`:** Quantifiable project and certification milestone collectors matching FastAPI `StudentProfileRequest` (`projects_completed`, `certifications_count`), along with live synchronization and alignment to the 7 core ERP academic course marks.
  - **`WorkloadCommitmentCollector`:** Captures student target career role with quick suggestions, weekly dedicated hours slider (5–40 hrs/wk) with dynamic workload feedback, and 3 learning pace strategies (`Self-Paced`, `Balanced`, `Intensive`).
  - **`ResumeUploadDropzone`:** Drag-and-drop resume ingestion supporting PDF, DOCX, and TXT with animated parsing progress, text entity extraction, and instant integration into the active skills inventory.
  - **`ProfileReadinessCard`:** Live 0–100% data collection health meter evaluating vector readiness across the 5 required input categories with demo profile population and ERP baseline reset actions.

- **Unified Orchestration & State Flow (`InputFormPage.tsx` & `ProfileInputView.tsx`):**
  - Modularized `InputFormPage` to seamlessly orchestrate the 6 input components with section anchor filters, sticky action footer with real-time vector summaries, and robust client-side validation.
  - Synchronized `DashboardContext` and types (`StudentInputFormData`, `StudentProfile`, `AcademicScoresData`) for full alignment with the backend and AI microservice schemas.

---

## Sprint 4: Resume Analysis & TreeSHAP Explainability

- **Sprint Window:** 01/11/2026 – 02/01/2027 (Form-2 Evaluation Period)
- **Author:** Nishant Kumawat (Team Lead — AI/ML & System Integration)

### 1. Working Assumptions & Model Invariants
1. **Model & Dataset Preservation:** The existing 48-feature schema and trained Random Forest model (`rf_tech_stack_model.joblib`) were strictly preserved. No dataset labels or hyperparameters were modified, maintaining the 100% holdout accuracy and deterministic behavior.
2. **Explainer Caching (Singleton):** `shap.TreeExplainer` is compiled once during startup lifespan (`ShapExplainer.get_instance()`) and cached in memory. This eliminates per-request explainer compilation overhead and reduces explanation latency to $<15\text{ms}$.
3. **Multi-Class Attribution Normalization:** Handled shap version differences (3D `(N, 48, 7)` tensor in SHAP 0.53+ vs list-of-arrays in legacy SHAP) via `_extract_class_shap()`, isolating attributions for the requested/top predicted stack.
4. **Base Confidence & Metrics:** Base confidence is mapped to TreeSHAP's expected value prior probability $\phi_0 \in [0.0, 1.0]$ ($\approx 0.141$ across 7 balanced target classes). The model's posterior probability is also returned as `predictedConfidence`.
5. **PII Safety & Zero Disk Persistence:** Uploaded resume files (PDF and DOCX) are extracted strictly in-memory using `io.BytesIO`. Resume text is never logged to stdout, console logs, or written to disk.
6. **Provider-Agnostic LLM & Offline Testability:** The LLM client reads credentials strictly from environment variables (`LLM_API_KEY`, `LLM_MODEL_NAME`, `LLM_BASE_URL`). When no key is set or network fails, the system automatically falls back to `FallbackResumeExtractor` using canonical regex taxonomy matching. All unit and integration tests run 100% offline with zero external network dependencies.
7. **Conflict Resolution Rule (Manual Wins):** When merging resume-extracted skills with manual form inputs, manually entered skills and proficiencies strictly supersede resume assertions. Novel skills detected in the resume are merged with `source="RESUME_PARSED"`.

### 2. Integration Points for Lakshya Jain (Node.js API Gateway)
- **Direct Explanation Proxy:** `POST http://localhost:8000/api/v1/explain`
  - Accepts JSON payload with `profile` (student academic scores, skills, interests) and optional `stack_code`.
  - Node gateway can proxy student explanation requests directly without modifying data shapes.
- **Multipart Resume Ingestion Proxy:** `POST http://localhost:8000/api/v1/resume/parse`
  - Accepts multipart form data with `file` (binary PDF or DOCX buffer, max 5MB) and optional form field `manual_profile` (JSON string).
  - Returns `extracted_skills`, `extracted_domains`, `mapped_features` (48-feature dict), and `merged_profile`.
  - Gateway can pass the `merged_profile` directly to `/api/v1/recommend` or store it in MongoDB.
- **Combined Recommendation with Explanation:** `POST http://localhost:8000/api/v1/recommend?explain=true`
  - Generates top-K recommendations with embedded TreeSHAP feature contributions and explanation summaries in a single round-trip.
- **Global SHAP Feature Importance:** `GET http://localhost:8000/api/v1/explain/global-importance?top_n=15`
  - Exposes mean absolute SHAP feature ranking across dataset samples for model transparency reporting.

### 3. Integration Points for Prachi Bhardwaj (Frontend UI / Explanation View)
- **Exact Contract Compliance:** The response from `POST /api/v1/explain` strictly satisfies the frontend `StackExplanation` interface (`frontend/src/types/index.ts`):
  - `recommendationId`: String catalog identifier matching mock cards (e.g. `rec-mern-001`, `rec-ai-002`, `rec-iot-003`).
  - `recommendationTitle`: Human-readable stack title (e.g. `Modern Full-Stack Cloud Native`).
  - `baseConfidence`: Float between `0.0` and `1.0`.
  - `summaryText`: 1–2 plain-English sentences summarizing primary drivers and bridgeable gaps.
  - `topPositiveFactors`: Array of top 5 positive feature factors sorted descending by `shapValue`.
  - `topNegativeFactors`: Array of top 5 negative feature factors sorted ascending by `shapValue` (most negative first).
  - `learningPrerequisites`: Array of 3 prerequisite strings for curriculum ramp-up.
- **Flexible Field Access:** Each item in `topPositiveFactors` and `topNegativeFactors` includes:
  - `feature` and `featureName`: Feature token (e.g. `course_web_technologies`, `skill_react`).
  - `label` and `displayName`: Human-readable label (e.g. `Web Technologies Coursework`, `React.js Frontend Framework Skill`).
  - `value`: Student input feature value in `[0.0, 1.0]`.
  - `shapValue` and `shap_value`: Exact SHAP attribution weight (e.g. `+0.1369` or `-0.0453`).
  - `impactDirection`: `"POSITIVE"` or `"NEGATIVE"`.
  - `category`: `"ERP_ACADEMICS"`, `"STUDENT_INTEREST"`, `"EXISTING_SKILL"`, or `"PORTFOLIO_EXPERIENCE"`.
  - `explanationNote`: Formatted descriptive sentence explaining the attribution.
  - `remedyElective`: Department workshop / elective recommendation for bridging gaps.
  - `potentialBoost`: Expected match score percentage boost upon bridging the gap.
- **Resume Upload Dropzone:**
  - Prachi's dropzone on `/profile-input` can send the file to `POST /api/v1/resume/parse` and receive pre-filled skills tagged with badge `RESUME_PARSED` (emerald) alongside `SELF_REPORTED` (indigo) and `ERP_COURSEWORK` (blue).

---

## Weekly Progress Report Automation & CI Maintenance Log

- **Sprint / Week Window:** Week ending October 23, 2026 (Form-3 Weekly Evaluation)
- **Author:** Nishant Kumawat (Team Lead — AI/ML & System Integration)

### 1. Root Cause Analysis of Workflow Failure
- **Cause (a) — Re-run / Push Rejection [PRIMARY CAUSE]:**
  - In GitHub Actions (`actions/checkout@v4`), commits execute in detached `HEAD`.
  - Running bare `git push` fails when detached (`fatal: You are not currently on a branch`).
  - In a Re-run of an older commit or when commits merge to `main` concurrently, local `main` is behind `origin/main`, causing `git push` to be rejected as non-fast-forward.
  - **Resolution:** Updated workflow step to run `git pull --rebase origin main` followed by explicit `git push origin HEAD:main`.
- **Cause (b) — `.gitignore` blocking output [DISPROVED]:**
  - Tested `git check-ignore -v weekly_reports/` and `weekly_reports/<file>.pdf`; neither was ignored.
  - Maintained `git add -f weekly_reports/` as a defensive guarantee.
- **Cause (c) — Branch Protection on `main` [RUNTIME REQUIREMENT]:**
  - Commit `31232e3a` on Oct 15 demonstrates `github-actions[bot]` has write access.
  - If the repository owner (`krish2904-lak`) enforces "Require a pull request before merging" without bypassing GitHub Actions, direct pushes to `main` will fail with `GH006: Protected branch update failed`.
- **Cause (d) — `mv` glob mismatch [DISPROVED / HARMLESS]:**
  - `generate_report.py` writes directly to `weekly_reports/`. Root directory glob does not match, but was already guarded by `2>/dev/null || true`.
- **Schedule Comment Stale:**
  - Corrected schedule comment in `.github/workflows/auto_weekly_report.yml` to accurately state: `Runs every Saturday at 5:00 AM IST (Friday 23:30 UTC)` matching cron `'30 23 * * 5'`.

### 2. Multi-Branch & Author Normalization Enhancements
- **Multi-Branch Coverage:** Updated `generate_report.py` Git log query to include `--all` and removed `--no-merges`. This ensures contributions on feature branches (such as Lakshya's media commit on `origin/lakshya`) and PR merge/sync commits by Nishant are properly included in the Form-3 report.
- **Author Mapping:** Added `AUTHOR_MAPPING` dictionary mapping GitHub usernames (`Nishant1-yy`, `prachi_bhardwaj`, `krish2904-lak`) and emails to canonical student names (`Nishant Kumawat`, `Prachi Bhardwaj`, `Lakshya Jain`, `Saloni Jain`).
- **Deduplication:** Added `seen_shas` set to guarantee no commit SHA is duplicated across branch DAG traversals.
- **Encoding & Visual Polish:** Replaced non-ASCII em dash `—` with standard `-` to prevent encoding glitches in ReportLab PDF generation. Ensured chronological timeline chart ordering and added support for optional `since_override` argument.

### 3. Generated Report
- Generated Form-3 report: `weekly_reports/F-096_Weekly_Progress_Report_Form-3_2026-10-23.pdf` (2 pages, covers all 4 students, 19 total commits, with full mentor/coordinator signature blocks).
