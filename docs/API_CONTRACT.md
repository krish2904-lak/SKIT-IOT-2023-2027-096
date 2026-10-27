# F-096 API Contract

**Status:** Implemented MVP contract. The Express API is the only browser-facing service; FastAPI is an internal recommendation and resume-parsing dependency. Examples are synthetic and must not be treated as real student records.

## Trust and data rules

- The API accepts externally issued HS256 bearer tokens only. There are no registration, login, refresh, or token-issuance routes. `JWT_SECRET` must match the trusted issuer's secret and contain at least 32 UTF-8 bytes. Tokens require a non-empty `sub`, integer `iat` and `exp`, a valid signature, and a maximum age of 15 minutes.
- Protected records are scoped to the token `sub`; clients cannot select another user or submit ERP identity, grades, or trusted provenance.
- Profile skills submitted by the browser are stored as `SELF_REPORTED` and `UNVERIFIED`. Existing `ERP_COURSEWORK` and `RESUME_PARSED` skills are preserved when profile edits replace self-reported skills.
- No trusted institutional ERP connector is configured. `POST /api/profile/erp` returns `503 SERVICE_UNAVAILABLE`. Recommendations require a trusted ERP snapshot already linked to the authenticated user's profile. The development seed is explicitly synthetic and must not be used as real ERP evidence.
- Resume upload accepts one PDF or DOCX file of at most 5 MiB. Its bytes are held in memory for parsing and are not saved; parsed skill names, counts, filename, and file metadata are persisted.
- The backend sends no account ID, ERP ID, name, or raw resume to the recommendation endpoint. It sends a constant anonymous model identifier and canonical structured features.

## Common response conventions

Success:

```json
{ "success": true, "data": {} }
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [],
    "requestId": "server-generated-id"
  }
}
```

List responses include `meta.pagination` with one-based `page`, `limit`, `total`, and `totalPages`. The default limit is 20; the maximum is 100. All student endpoints except health require `Authorization: Bearer <external-access-token>`.

## Routes

### Health

`GET /api/health` is public. It returns `200` only when MongoDB is connected; otherwise it returns `503`.

### Profile

`GET /api/profile` returns `{ profile, erpData, resume }` for the authenticated subject, or `404` when profile setup is required.

`PUT /api/profile` creates or updates the subject's editable profile:

```json
{
  "displayName": "Example Student",
  "college": "Example Technical Institute",
  "skills": [{ "name": "JavaScript", "level": "INTERMEDIATE" }],
  "interests": [{ "domain": "Web Development", "priority": 1 }],
  "projectsCompleted": 1,
  "certificationsCount": 0,
  "preferences": {
    "preferredCareer": "Frontend Developer",
    "preferredDomains": ["Web Development"],
    "weeklyStudyHours": 8,
    "learningPace": "BALANCED"
  }
}
```

`skills` and `interests` are required arrays (maximum 50 and 20 items). `learningPace` is `SELF_PACED`, `BALANCED`, or `INTENSIVE`. Identity and provenance fields supplied in the request are ignored; skills become unverified self-reports, and interests become student-selected.

`POST /api/profile/erp` requests a trusted refresh. It currently returns `503 SERVICE_UNAVAILABLE` because no connector is configured.

`POST /api/profile/resume` accepts multipart form field `file` (PDF or DOCX, at most 5 MiB) and returns `201` with parsed resume metadata. Parsing completes before the response; original file bytes are not retained.

### Recommendations

`POST /api/recommendations` accepts optional generation preferences:

```json
{
  "options": {
    "requestedCount": 3,
    "preferredCareer": "Frontend Developer",
    "preferredDomains": ["Web Development"],
    "weeklyStudyHours": 8,
    "learningPace": "BALANCED"
  }
}
```

`requestedCount` must be an integer from 1 to 5. The backend reloads the caller's profile, trusted ERP snapshot, and parsed resume; browser-provided academic data is not accepted. A missing trusted ERP snapshot returns `422 VALIDATION_ERROR`. Successful generation returns `201` with `{ runId, generatedAt, items }` and persists every returned item.

`GET /api/recommendations` lists stored items and supports `page`, `limit`, and exact `category`. `GET /api/recommendations/:id`, `GET /api/recommendations/:id/explanation`, and `GET /api/recommendations/:id/roadmap` return only records owned by the caller; absent or unowned IDs return `404`.

A recommendation includes its `runId`, model metadata, stack, rank, reasons, optional explanation and roadmap, plus:

```json
{
  "modelScore": {
    "value": 82.4,
    "scale": "0_TO_100",
    "calibrationStatus": "UNCALIBRATED"
  },
  "confidence": {
    "value": null,
    "status": "UNCALIBRATED",
    "scale": "0_TO_1"
  }
}
```

The model's returned score is a probability-derived ranking score clamped by the predictor, not calibrated confidence or a likelihood of success. Keep the uncalibrated label wherever the score is displayed. Explanation factors contain SHAP attribution values on the model's probability output scale; they are not percentage-point score boosts. Roadmap phases and prerequisites come from model-service catalog output, and external resource URLs are limited to an HTTPS host allowlist.

### History

`GET /api/history` is paginated and returns one highest-ranked recommendation summary per generated run, newest first. Generation creates history automatically; there is no save/delete-history operation. Each entry includes `modelScore` separately from nullable `confidence`.

## Model input defaults and limitations

The backend derives academic subject scores only from matching subjects in the trusted ERP snapshot. When no subject matches a supported academic feature, the backend omits that field; FastAPI's request schema currently supplies `70.0` as its default. This is a model input default, not an observed student grade. The adapter always supplies actual ERP CGPA, branch, and semester. If the preprocessor receives missing features directly, it defaults CGPA to `7.0`, academic scores to `70.0`, and project count to `1`; these must not be presented as verified ERP or student data. Model inputs cap project and certification counts at 20 and 10 respectively.

The current model consumes selected domains, skills, matched academic scores, CGPA, branch/semester, project count, and certification count. `preferredCareer`, `weeklyStudyHours`, and `learningPace` are persisted profile preferences but are not model features or roadmap-duration controls in this implementation.

The ERP connector is not implemented, so a fresh profile cannot generate a recommendation until a trusted ERP integration provisions a snapshot. The external token issuer is also outside this repository. These are deployment/integration requirements, not capabilities supplied by this MVP.

## Error codes

| HTTP | Code | Meaning |
|---:|---|---|
| 400 | `VALIDATION_ERROR` | Invalid body, query, or field. |
| 401 | `AUTHENTICATION_REQUIRED` | Missing, expired, malformed, or invalid bearer token. |
| 404 | `NOT_FOUND` | Profile or caller-owned resource not found. |
| 413 | `FILE_TOO_LARGE` | Resume exceeds the 5 MiB limit. |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Resume is not PDF or DOCX. |
| 422 | `VALIDATION_ERROR` | A trusted ERP snapshot is unavailable or model inputs are rejected. |
| 502 | `UPSTREAM_SERVICE_ERROR` | Model or parser returned an invalid response. |
| 503 | `SERVICE_UNAVAILABLE` | Required service unavailable, ERP connector absent, or explanation unavailable. |
| 500 | `INTERNAL_ERROR` | Unexpected server failure; no stack trace or secret is returned. |
