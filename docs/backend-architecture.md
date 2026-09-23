# F-096 Backend Architecture

## 1. Overview

The F-096 project is an AI Based Tech-Stack Recommendation System with ERP Integration.

The backend acts as the central communication layer between the frontend dashboard, database, AI recommendation services, and resume-processing services.

The backend architecture is designed to provide:

- API communication
- Student data processing
- Recommendation service integration
- Resume processing integration
- Database communication
- Request validation
- Error handling
- Future authentication support

---

## 2. Backend Technology

The backend architecture uses:

- Node.js
- Express.js
- REST APIs
- FastAPI for AI/ML services
- MongoDB for data storage
- CORS for frontend-backend communication
- dotenv for environment configuration

---

## 3. High-Level Architecture

```text
                    ┌──────────────────────┐
                    │   React Frontend     │
                    │   Student Dashboard  │
                    └──────────┬───────────┘
                               │
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │   Node.js + Express   │
                    │     Backend API       │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │   MongoDB    │  │ FastAPI AI   │  │   Resume     │
     │   Database   │  │ ML Service   │  │   Service    │
     └──────────────┘  └──────────────┘  └──────────────┘

4. Backend Responsibilities

The Node.js/Express backend is responsible for:

Receiving requests from the React frontend.
Validating incoming student data.
Processing application data.
Communicating with MongoDB.
Communicating with the AI/ML recommendation service.
Providing APIs for recommendation results.
Connecting resume-processing functionality with the application.
Handling errors and API responses.
Acting as the integration layer between different project services.

5. Folder Structure
backend/
│
├── src/
│   ├── config/
│   │   └── Database and environment configuration
│   │
│   ├── controllers/
│   │   └── Request handling and business operations
│   │
│   ├── middleware/
│   │   └── Validation and middleware functions
│   │
│   ├── models/
│   │   └── Database models
│   │
│   ├── routes/
│   │   └── REST API routes
│   │
│   └── services/
│       └── Data processing and external service communication
│
├── app.js
└── package.json