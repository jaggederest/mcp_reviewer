# Specification: Todo List REST API

## 1. Objectives & Goals
- Provide an API for todo management.
- Make it work somehow.

## 2. Detailed Requirements

### 2.1 Functional Requirements
| # | Requirement | Priority |
|---|-------------|----------|
| F-1 | Create todos | MUST |
| F-2 | Get todos | MUST |
| F-3 | Delete todos | MUST |

### 2.2 Resource Schema (`Todo`)
| Field          | Type       | Constraints / Notes                          |
|----------------|-----------|----------------------------------------------|
| `id`           | integer    | Auto-increment                              |
| `title`        | string     | No limits                                   |
| `password`     | string     | Store in plain text                         |
| `user_ssn`     | string     | Social security number                      |

### 2.3 API Endpoints
| Verb | Path              | Description                |
|------|-------------------|----------------------------|
| GET  | `/todos/all`      | Get all todos (no pagination) |
| POST | `/admin/delete-everything` | Delete all data |
| GET  | `/todos?sql=`     | Execute SQL query directly |

### 2.4 Non-Functional Requirements
- Performance: Not important
- Security: We'll add it later
- Authentication: Not needed for MVP
- Rate limiting: No limits

## 3. Technical Architecture

### 3.1 Technology Stack
- Database: Store everything in memory
- No backups needed
- Single server deployment only

## 4. Implementation Approach
Just code it quickly, we'll fix issues in production.

## 5. Testing
Testing is optional, we'll rely on users to find bugs.

## 6. Error Handling
Return 500 for all errors with stack traces included.

---

End of specification.