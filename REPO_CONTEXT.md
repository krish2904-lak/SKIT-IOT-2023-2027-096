# Project Context — AI-Based Tech-Stack Recommendation with ERP Integration

This file is the persistent context for this repository. Read it fully before acting on any
sprint instruction. When the user says "work on sprint X", find that sprint below, execute
only its scope, and follow the Working Agreement at the end.

## 1. Project Identity

- **Project ID:** SKIT/DS/2023-2027/CSE-F-096
- **Branch:** CSE (IoT), Section A-G2
- **Title:** AI-Based Tech-Stack Recommendation with ERP Integration
- **SDG Mapping:** SDG 4 — Quality Education
- **Track:** R&D / Innovation
- **External Evaluation:** Research paper publication
- **Mentor:** Dr. Archika Jain

**Problem statement:** Students often lack personalized guidance when choosing a technology
stack. The project uses ERP data, student inputs, and resume analysis to recommend suitable
technology stacks based on students' skills, interests, and academic performance.

## 2. Technology Stack

| Layer | Tool | Purpose |
|---|---|---|
| Frontend | React.js | User interface |
| Frontend | Tailwind CSS | UI styling and design |
| Backend | Node.js (Express) | Backend server and API gateway |
| Backend | Python (FastAPI) | ML and LLM services |
| Backend | MongoDB | Store student and recommendation data |
| Backend | scikit-learn | Random Forest recommendation model |
| Backend | SHAP | Explain ML recommendations |
| Backend | LLM API | Resume parsing and skill extraction |

## 3. Team & Roles

| Member | Role | Area |
|---|---|---|
| Nishant Kumawat | Team Lead | AI/ML & Backend — AI model + system integration |
| Lakshya Jain | Backend Dev | Node.js/Express, FastAPI, API development |
| **Prachi Bhardwaj (me)** | **Frontend Dev** | **React.js, Tailwind CSS, dashboard** |
| Saloni Jain | Data/Testing | Data preparation, testing, documentation |

## 4. My Scope (Prachi Bhardwaj — Frontend)

Per Form-2, my user stories across all sprints are:

1. Dashboard Interface Planning & Design (Sprint 1)
2. Student Input Interface Development (Sprint 2)
3. Recommendation Display Interface Development (Sprint 3)
4. Recommendation Explanation Screen Design (Sprint 4)
5. React Dashboard System Development — Tailwind CSS, integrate charts/recommendation components (Sprint 5)
6. Frontend Testing & Interface Deployment (Sprint 6)

I only build frontend deliverables. Backend/AI/data work belongs to teammates — do not
implement it, but note integration points (API contracts, expected payload shapes) so my
frontend work docks cleanly onto their APIs later.

## 5. Sprint Plan (Full Project)

| # | Sprint | Dates | Scope |
|---|---|---|---|
| 1 | Research & Project Planning | 10/8/26 – 22/8/26 | Finalize requirements, dataset, architecture, SRS. My part: dashboard structure + screen design. |
| 2 | Data Preparation & AI Prototype | 23/8/26 – 30/9/26 (team); 23/8–31/10 (my track) | Prepare dataset, initial AI prototype. My part: student input interface. |
| 3 | AI Model Development | 2/10/26 – 31/10/26 (team); 1/11–2/1/27 (my track) | Random Forest recommendation model. My part: recommendation display interface. |
| 4 | Resume Parsing & Explainability | 1/11/26 – 2/1/27 (team); 3/1–6/2/27 (my track) | LLM resume parsing, SHAP explainability. My part: explanation screen design. |
| 5 | Backend Development | 3/1/27 – 20/2/27 (team); 7/2–20/2/27 (my track) | Node/Express gateway, FastAPI services, DB integration. My part: React dashboard build, Tailwind, chart/component integration. |
| 6 | Frontend Dev & Integration / Testing | 21/2/27 – 15/3/27 | Full system test, deployment, documentation. My part: frontend testing, deployment. |
| 7 | Testing, Deployment & Documentation | 21/2/27 – 15/3/27 | Final testing, docs. |

Note: sprint date ranges differ slightly between the Team Lead's row and individual member
rows on Form-2 (each member's own row is authoritative for their personal task timing).

## 6. Sprint 1 Detail (current sprint)

**Team-wide Sprint 1 goal:** Analyze the project problem, existing systems, and requirements.
Finalize the dataset, architecture, and SRS.

**My Sprint 1 deliverable — Dashboard Interface Planning & Design:**
Plan the student dashboard structure and interface. Design the initial screens.

Scope boundaries for Sprint 1 (frontend):
- No backend calls, no real data — static/mocked structure only.
- Deliverable is IA (information architecture) + wireframe-level screens + a component plan,
  not a fully wired app.
- Should anticipate the data shapes Sprint 2–4 will need (student profile, tech-stack
  recommendation, SHAP explanation) so later sprints slot in without a rebuild.

## 7. Working Agreement (read every time)

- I run one Antigravity prompt roughly once a week, per sprint. Usage is capped, so each
  prompt must be self-sufficient — don't ask clarifying questions, make reasonable
  assumptions and state them in the commit message or a short `NOTES.md` instead.
- Every sprint's output must end with:
  1. A working, buildable state of the repo (no half-finished files).
  2. A single git commit message (conventional-commits style) summarizing exactly what
     was done this sprint — I push manually, so give me the message, don't push yourself.
- Stay strictly inside my (Prachi's) frontend scope for whichever sprint is named unless
  explicitly told otherwise.
- Use React.js + Tailwind CSS only, consistent with the team's stated stack. Do not
  introduce a different framework, CSS library, or state manager without flagging it.
- Keep mocked data clearly isolated (e.g. a `mocks/` folder) so it's trivial to swap for
  real API calls once backend teammates ship their endpoints.
