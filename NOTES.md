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
