# Specification: Todo List REST API

## 1. Objectives & Goals
- Provide a minimal yet extensible HTTP/JSON API to Create, Read, Update and Delete (CRUD) **Todo** items.
- Serve as a reference implementation illustrating REST best-practices, clean separation of layers, and automated testing.
- Be production-ready for a small-scale deployment but easily up-gradable for additional features (auth, tagging, etc.).

## 2. Detailed Requirements

### 2.1 Functional Requirements
| # | Requirement | Priority |
|---|-------------|----------|
| F-1 | Create a new todo item. | MUST |
| F-2 | Retrieve a single todo item by `id`. | MUST |
| F-3 | Retrieve a paginated list of todo items (default 20, max 100). | MUST |
| F-4 | Update an existing todo item (full or partial). | MUST |
| F-5 | Delete a todo item. | MUST |
| F-6 | Mark a todo as complete / incomplete. | SHOULD |
| F-7 | Filter list by `status` (completed / pending). | SHOULD |
| F-8 | Sort list by `created_at` or `updated_at`. | COULD |

### 2.2 Resource Schema (`Todo`)
| Field          | Type       | Constraints / Notes                          |
|----------------|-----------|----------------------------------------------|
| `id`           | UUID       | Server-generated, immutable.                |
| `title`        | string     | 1–255 chars, REQUIRED.                      |
| `description`  | string     | 0–2048 chars, OPTIONAL.                     |
| `is_completed` | boolean    | Defaults to `false`.                        |
| `created_at`   | timestamp  | Server-generated, ISO-8601.                 |
| `updated_at`   | timestamp  | Server-generated, ISO-8601.                 |

### 2.3 API Endpoints
| Verb | Path              | Description                | Request Body | Success Code | Response Body |
|------|-------------------|----------------------------|--------------|--------------|---------------|
| POST | `/todos`          | Create todo               | `title`, `description?` | 201 | `Todo` |
| GET  | `/todos/{id}`     | Get by id                 | —            | 200 | `Todo` |
| GET  | `/todos`          | List with query params `?page`, `?size`, `?status`, `?sort` | — | 200 | Paginated list |
| PATCH| `/todos/{id}`     | Partial update            | Any updatable field | 200 | `Todo` |
| PUT  | `/todos/{id}`     | Full replace              | Entire `Todo` object | 200 | `Todo` |
| DELETE| `/todos/{id}`    | Delete                    | —            | 204 | — |
| POST | `/todos/{id}/complete`   | Mark complete   | — | 200 | `Todo` |
| POST | `/todos/{id}/incomplete` | Mark incomplete | — | 200 | `Todo` |

Standard headers:
- `Content-Type: application/json`
- `Accept: application/json`

### 2.4 Non-Functional Requirements
- Performance: ≤ 150 ms 95-percentile latency for single-item requests at 100 RPS.
- Security: HTTPS only; validate all input; prevent SQL/NoSQL injection.
- Reliability: 99.5 % monthly uptime target.
- Scalability: Horizontally scalable with stateless API layer.
- Documentation: OpenAPI 3.1 spec auto-generated and published.
- Observability: Structured JSON logging, metrics (request count/latency), and tracing.
- Internationalization: UTF-8 across the stack.
- Compliance: Follow RFC 9110 (HTTP 1.1) and OWASP ASVS L1.

## 3. Technical Architecture & Design Decisions

### 3.1 High-Level Diagram
Client → HTTP/JSON → REST Controller → Service Layer → Repository/ORM → Database

### 3.2 Technology Stack
- Language: **Node.js 20 LTS** (fast boot, large ecosystem) *or* **Python 3.12 (FastAPI)** — final choice left to implementation team.
- Web Framework: Express.js *or* FastAPI (both OpenAPI native).
- Database: SQLite in dev; PostgreSQL 15 in prod.
- ORM: Prisma (TS) / SQLModel (Python).
- Containerization: Docker, Alpine base image.
- CI/CD: GitHub Actions → Docker registry → optional Kubernetes deployment.

### 3.3 Key Design Decisions
1. **UUIDs** for identifiers to avoid enumeration attacks.
2. **PATCH** for partial updates (JSON Merge Patch RFC 7386).
3. **Pagination Cursor Style** optional for >10k rows; initial version uses page/size.
4. **Optimistic Locking** via `updated_at` timestamp to prevent lost updates.
5. **Error Model**: RFC 9457 "Problem Details" (application/problem+json).

## 4. Implementation Approach

### 4.1 Milestones & Tasks
1. Project scaffolding & dependency setup (1 day).
2. Data model & migrations (1 day).
3. Controller/routes for CRUD (2 days).
4. Validation layer with `zod` / `pydantic` (0.5 day).
5. Pagination, filtering, sorting (1 day).
6. OpenAPI generation & Swagger UI (0.5 day).
7. Unit + integration tests with mocked DB (2 days).
8. Dockerization & CI pipeline (1 day).
9. Load & security testing, hardening (1 day).
10. Documentation & code review (0.5 day).

### 4.2 Coding Conventions
- Linting: ESLint / Ruff.
- Formatting: Prettier / Black.
- Git: Conventional Commits.
- Branch strategy: trunk-based; PRs require 1 review & passing checks.

## 5. Success Criteria & Testing Requirements

### 5.1 Definition of Done
- All endpoints implemented with 95 % unit test coverage.
- All tests pass in CI, including lint and type checks.
- OpenAPI spec available at `/docs` (HTML) and `/openapi.json`.
- Manual verification against Postman collection succeeds.
- Performance benchmark meets non-functional targets.
- Security scan (OWASP ZAP or Snyk) shows no high-severity issues.
- README includes setup, run, and deploy instructions.

### 5.2 Test Matrix
| Layer | Tests | Tools |
|-------|-------|-------|
| Unit | Model validation, service logic | Jest / Pytest |
| Integration | API routes + DB (test container) | Supertest / httpx |
| E2E | Docker-compose full stack | Postman / Newman |
| Performance | 100RPS, 500RPS | k6 |
| Security | OWASP Top-10 scans | ZAP, Snyk CLI |

## 6. Edge Cases & Error Handling

| Scenario | Expected Response |
|----------|-------------------|
| Missing `title` on create | 400, problem+json `type=validation_error` |
| Invalid UUID in path | 400, `invalid_id_format` |
| Todo not found | 404, `resource_not_found` |
| Duplicate title (if unique enforced) | 409, `conflict` |
| Payload > 1 MB | 413, `payload_too_large` |
| DB connectivity loss | 503, `service_unavailable` |
| Concurrency update conflict | 409, `edit_conflict` |
| Unsupported media type | 415, `unsupported_media_type` |
| Accept header not compatible | 406, `not_acceptable` |

Problem Details object example:
```json
{
  "type": "https://example.com/probs/validation_error",
  "title": "Invalid request payload",
  "status": 400,
  "detail": "Field 'title' must not be empty",
  "instance": "/todos"
}
```

## 7. Glossary
- CRUD: Create, Read, Update, Delete
- REST: Representational State Transfer
- ORM: Object-Relational Mapper
- RPS: Requests Per Second
- RFC 9457: Problem Details for HTTP APIs

---

End of specification.