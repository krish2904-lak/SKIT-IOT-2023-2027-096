# F-096 Backend Foundation

## Purpose

This is the independently runnable Node.js API foundation for F-096. It provides an Express health endpoint, shared 404/error handling, MongoDB connection management, and the initial student profile/ERP data models. Authentication, student APIs, recommendations, ML, and AI are not implemented.

The API uses the response and error conventions in [`../docs/API_CONTRACT.md`](../docs/API_CONTRACT.md). In particular, successful responses are wrapped in `{ "success": true, "data": ... }`; unexpected HTTP 500 errors use the contract's `INTERNAL_ERROR` code.

## Tech Stack

- Node.js (20.19.0 or later)
- Express
- dotenv
- cors
- helmet
- morgan
- Mongoose

## Folder Structure

```text
backend/
├── src/
│   ├── config/       Environment and MongoDB connection configuration
│   ├── controllers/  HTTP request/response handling
│   ├── middleware/   404 and centralized error handling
│   ├── models/      StudentProfile and ERPRecord schemas
│   ├── routes/       Route definitions
│   ├── services/    Reserved for future business logic; currently empty
│   ├── utils/        Reserved for shared utilities
│   ├── app.js        Express middleware and route setup
│   └── server.js     HTTP server startup
├── scripts/
│   └── seed.js      Explicit development-only synthetic seed
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

The `services` and `utils` directories are intentionally empty until their features are approved for a later phase.

## Phase 3 Database Design

`StudentProfile` stores the account reference expected by the API contract, display identity, student-declared skills/interests, and learning preferences. Academic facts are kept in separate `ERPRecord` snapshots so trusted ERP data is not mixed with editable profile input and can evolve for future feature extraction. `User` is deferred because authentication is out of scope; `userId` is currently an opaque string reference. Resume metadata/storage is also deferred until its upload lifecycle is implemented. Recommendations/history are not modeled in this phase.

Indexes are deliberately limited:

- `StudentProfile.userId` is unique because profile lookups are by account and one profile belongs to one user.
- `ERPRecord.profileId + syncedAt` supports loading a student's most recent ERP snapshot.
- `ERPRecord.source + externalStudentId` supports lookup during trusted ERP synchronization; it is non-unique because snapshots may be retained over time.

Schema validation covers required identity and academic fields, enum values, unique interest priorities/domains, CGPA against its configured scale, bounded semester and score/attendance ranges, and Mongoose timestamps.

## Installation

From this directory:

```bash
npm install
```

MongoDB must be running and reachable before the backend starts. Copy `.env.example` to `.env` for local configuration. Do not commit `.env` or place credentials in source code.

For a local MongoDB instance, the example URI is:

```text
mongodb://localhost:27017/f096_stack_recommendation
```

Set `MONGODB_URI` to a private MongoDB Atlas URI only in your local environment if using Atlas. No Atlas account or cloud resource is created by this project.

## Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `5000` | HTTP listening port; must be an integer from 1 to 65535. |
| `NODE_ENV` | `development` | Runtime environment included in the health response. |
| `MONGODB_URI` | None; required | MongoDB connection URI. The server fails startup if it is missing or unreachable. |

## Development Command

```bash
npm run dev
```

Uses Node's built-in `--watch` mode; nodemon is not required.
MongoDB connection must succeed before the HTTP server begins listening.

## Production Command

```bash
npm start
```

Production startup also requires a reachable MongoDB instance and `MONGODB_URI`.

## Development Seed

With `NODE_ENV=development` and MongoDB available, run:

```bash
npm run seed
```

This explicitly upserts one synthetic `Demo Student` profile and its ERP snapshot. It is never run automatically at server startup. Stable seed keys and `$setOnInsert` prevent duplicate records and avoid overwriting existing seed data on repeated runs. The script refuses to run unless `NODE_ENV=development`.

## Database Models

- `StudentProfile`: opaque `userId`, display name, college, current ERP record reference, skills, interests, career/learning preferences, and timestamps.
- `ERPRecord`: profile reference, source and external record key, branch/section, semester/year, CGPA and scale, attendance, subjects/marks/grades/credits, sync status/time, and timestamps.

CGPA and semester belong to ERP records per the API contract, not to editable profile fields. No password or resume file is stored in either model.

## Health Endpoint

`GET http://localhost:5000/api/health` is public and returns HTTP 200 only while Mongoose reports an active database connection. If MongoDB disconnects after startup, the endpoint returns HTTP 503 using the contract error envelope. It never reports `database: "connected"` based on configuration alone.

Example response:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "message": "F-096 backend is running",
    "service": "backend",
    "environment": "development",
    "database": "connected",
    "timestamp": "2026-10-01T09:30:00.000Z"
  }
}
```

Unknown paths return HTTP 404 with the API contract error envelope and code `NOT_FOUND`. Unexpected HTTP 500 responses use code `INTERNAL_ERROR` and do not expose stack traces.