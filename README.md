# PeoplePay

Salary management tool for organizations with up to 10,000 employees. Built for HR Managers to manage employee records and gain salary insights across countries, departments, and job titles.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Development Approach](#development-approach)
- [Backend (Server)](#backend-server)
  - [Getting Started](#getting-started)
  - [API Endpoints](#api-endpoints)
  - [Running Tests](#running-tests)
- [Future Improvements](#future-improvements)

---

## Project Overview

PeoplePay allows HR Managers to:

- Add, view, update, and delete employee records
- Filter and search employees by country, job title, department, or name
- View salary insights: min, max, and average salary by country
- View average salary by job title within a country
- View department-level salary statistics
- View top earners across the organization
- View employee headcount by country

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Node.js, Express, TypeScript            |
| Database  | SQLite via `better-sqlite3`             |
| Validation| Zod                                     |
| Testing   | Vitest, Supertest                       |
| Frontend  | React, Vite, TypeScript _(in progress)_ |

---

## Project Structure

---

```bash
PeoplePay/
├── server/                  # Express + TypeScript backend
│   ├── src/
│   │   ├── db/              # Database connection and migrations
│   │   ├── models/          # Data access layer (employees, insights)
│   │   ├── routes/          # Express route handlers
│   │   └── validators/      # Zod schemas for input validation
│   ├── tests/               # Vitest + Supertest integration tests
│   └── data/                # SQLite database files (gitignored)
├── client/                  # React + Vite frontend (in progress)
├── docs/                    # Architecture notes and planning artifacts
└── README.md
```

---

## Development Approach

This project follows **Test Driven Development (TDD)** strictly:

1. **Red** — Write a failing test that defines the expected behaviour
2. **Green** — Write the minimum code to make the test pass
3. **Refactor** — Clean up while keeping tests green

Every meaningful change is committed separately so the git history reflects the evolution of the solution step by step. Commit messages follow the **Conventional Commits** format:

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code restructure without behaviour change
- `test` — adding or updating tests
- `chore` — tooling, config, dependencies

---

## Backend (Server)

### Getting Started

```bash
cd server
npm install
npm run dev
```

Server starts on `http://localhost:3001`

Health check:

```bash
GET http://localhost:3001/health
```

---

### API Endpoints

#### Employees

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/employees`          | List employees (paginated, filtered)|
| GET    | `/api/employees/:id`      | Get employee by ID                 |
| POST   | `/api/employees`          | Create a new employee              |
| PATCH  | `/api/employees/:id`      | Update an employee                 |
| DELETE | `/api/employees/:id`      | Delete an employee                 |

**Query parameters for `GET /api/employees`:**

| Parameter   | Type    | Description                        |
|-------------|---------|------------------------------------|
| `country`   | string  | Filter by country                  |
| `job_title` | string  | Filter by job title                |
| `department`| string  | Filter by department               |
| `search`    | string  | Search by full name                |
| `is_active` | boolean | Filter by active status            |
| `page`      | number  | Page number (default: 1)           |
| `limit`     | number  | Results per page (default: 20)     |

**Employee fields:**

| Field        | Type    | Required | Description                     |
|--------------|---------|----------|---------------------------------|
| `full_name`  | string  | Yes      | Full name (2–100 chars)         |
| `job_title`  | string  | Yes      | Job title                       |
| `department` | string  | Yes      | Department                      |
| `country`    | string  | Yes      | Country                         |
| `salary`     | number  | Yes      | Must be positive                |
| `currency`   | string  | No       | 3-letter code, default `USD`    |
| `email`      | string  | Yes      | Unique, valid email             |
| `phone`      | string  | No       | Optional phone number           |
| `hired_at`   | string  | No       | Date in `YYYY-MM-DD` format     |
| `is_active`  | boolean | No       | Default `true`                  |

---

#### Salary Insights

| Method | Endpoint                            | Description                                      |
|--------|-------------------------------------|--------------------------------------------------|
| GET    | `/api/insights/country-stats`       | Min, max, avg salary and headcount per country   |
| GET    | `/api/insights/job-title-stats`     | Avg salary by job title in a country (required)  |
| GET    | `/api/insights/department-stats`    | Salary stats grouped by department               |
| GET    | `/api/insights/top-earners`         | Top N highest paid employees (default: 5)        |
| GET    | `/api/insights/headcount`           | Employee headcount grouped by country            |

**Query parameters:**

| Endpoint              | Parameter | Required | Description                   |
|-----------------------|-----------|----------|-------------------------------|
| `country-stats`       | `country` | No       | Filter to a specific country  |
| `job-title-stats`     | `country` | Yes      | Country to filter by          |
| `top-earners`         | `limit`   | No       | Number of results (default 5) |

---

### Running Tests

```bash
cd server
npm test
```

Current test coverage:

| Test File                     | Tests | Description                        |
|-------------------------------|-------|------------------------------------|
| `migrations.test.ts`          | 5     | Schema, indexes, constraints        |
| `employee.model.test.ts`      | 14    | CRUD operations on the data layer  |
| `employee.routes.test.ts`     | 14    | API integration tests via Supertest|
| `insights.test.ts`            | 8     | Salary analytics endpoints         |
| **Total**                     | **41**|                                    |

---

## Upcoming

- Frontend (client) — React + Vite + TypeScript UI for employee management and salary insights.
- Connect frontend with backend.
- Seed script — bulk insert 10,000 employees from name lists with high-performance batching.