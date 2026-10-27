# F-096 Backend

The Express API owns profile data, resume metadata, and persisted recommendation runs. It validates externally issued HS256 bearer tokens, scopes student records to the token subject, and proxies recommendation and resume-parsing requests to the FastAPI model service. The browser never calls FastAPI directly.

## Runtime requirements

- Node.js 20.19 or later
- MongoDB
- Python dependencies from `ai-service/requirements.txt` and a working model setup
- An external identity provider that issues compatible HS256 access tokens

There is no registration, login, or token-issuance endpoint. Configure `JWT_SECRET` to the same secret used by the trusted issuer. It must contain at least 32 UTF-8 bytes. The API accepts tokens with a non-empty `sub`, integer `iat` and `exp`, valid HS256 signature, and an age no greater than 15 minutes.

## Local setup

1. Copy `.env.example` to `.env`. Set `MONGODB_URI` and `JWT_SECRET`. Do not commit `.env` or share its secret.
2. Start the model service from `ai-service/`:

   ```powershell
   python -m pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

3. Start Express from `backend/`:

   ```powershell
   npm ci
   npm run dev
   ```

4. Start the frontend from `frontend/` with `npm ci` and `npm run dev`. The Vite development server proxies `/api` to `http://127.0.0.1:5000`; `VITE_API_BASE_URL` can override the frontend API base URL.

`GET /api/health` reports database readiness. The API needs a trusted ERP snapshot before recommendations can be generated. No institutional ERP connector is configured, so `POST /api/profile/erp` returns `503 SERVICE_UNAVAILABLE`. For local-only synthetic testing, `npm run seed` creates a clearly synthetic profile and ERP record while `NODE_ENV=development`; it does not create an account or issue a token.

## API behavior

All success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code", "message", "details", "requestId" } }`.

| Route | Behavior |
|---|---|
| `GET /api/health` | Public liveness and MongoDB readiness. |
| `GET /api/profile` | Returns the authenticated user's profile, linked trusted ERP snapshot, and latest parsed-resume metadata. |
| `PUT /api/profile` | Creates or updates editable profile fields. Browser-submitted skills are always self-reported and unverified; existing ERP/resume-sourced skills are preserved. |
| `POST /api/profile/erp` | Returns `503` until a trusted ERP connector is configured. |
| `POST /api/profile/resume` | Parses one PDF or DOCX up to 5 MiB and returns `201`. The file is held in memory for parsing and is not retained; parsed metadata and skill names are persisted. |
| `GET /api/recommendations` | Lists the authenticated user's stored candidates; supports `page`, `limit` (1–100), and exact `category`. |
| `POST /api/recommendations` | Calls FastAPI using canonical profile/ERP/resume data and stores the returned candidates. A trusted ERP snapshot is required. |
| `GET /api/recommendations/:id` | Returns an owned recommendation. |
| `GET /api/recommendations/:id/explanation` | Returns the stored model explanation. |
| `GET /api/recommendations/:id/roadmap` | Returns the stored roadmap. |
| `GET /api/history` | Lists one latest-ranked summary per generated run; history is automatic and has no separate save operation. |

Recommendation model scores are returned on a `0_TO_100` scale but are marked `UNCALIBRATED`; they are not probabilities, confidence, or outcome guarantees. The separate `confidence.value` remains `null`. SHAP contributions are model attributions on the model's probability output scale, not score boosts. Missing matched ERP subject scores are omitted by the adapter, then currently receive FastAPI's schema default of `70.0`; disclose this model-side default rather than presenting it as an ERP fact. The adapter supplies the actual ERP CGPA and other canonical values.

## Tests

From `backend/`, run:

```powershell
npm test
```
