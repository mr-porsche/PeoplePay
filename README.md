# PeoplePay

Salary management tool for organizations with up to 10,000 employees. Built for HR Managers to manage employee records and gain salary insights across countries, departments, and job titles.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running the App](#running-the-app)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Development Approach](#development-approach)
- [Upcoming](#upcoming)

---

## Project Overview

PeoplePay allows HR Managers to:

- Add, view, update, and delete employee records
- Search and filter employees by name, country, department, job title, and status
- View salary insights: min, max, average, and percentile (P25/P50/P75/P90) by country
- View average salary by job title and department
- View global summary stats — total employees, countries, departments, salary range
- Toggle dark/light theme with persistent preference

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Backend    | Node.js, Express, TypeScript                  |
| Database   | SQLite via `better-sqlite3`                   |
| Validation | Zod                                           |
| Testing    | Vitest, Supertest                             |
| Frontend   | React, Vite, TypeScript                       |
| Styling    | Tailwind CSS v4                               |
| State      | TanStack Query                                |
| Forms      | React Hook Form + Zod                         |
| Charts     | Recharts                                      |
| Shared     | `@peoplepay/shared` — shared TypeScript types |

---

## Project Structure

---

```bash
PeoplePay/
├── shared/                        # Shared TypeScript types
│   └── src/
│       └── types.ts
│
├── server/                        # Express + TypeScript backend
│   ├── src/
│   │   ├── db/                    # Database connection and migrations
│   │   ├── models/                # Class-based data access layer
│   │   ├── routes/                # Express route factory functions
│   │   └── utils/                 # Zod schemas for input validation
│   ├── tests/                     # Vitest + Supertest integration tests
│   ├── data/                      # SQLite database (gitignored)
│   ├── .env.example
│   └── package.json
│
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── employees/         # EmployeeTable, Filters, Pagination, Header
│   │   │   ├── insights/          # StatCard, SalaryBarChart, CountryStatsTable, DepartmentChart
│   │   │   ├── EmployeeForm.tsx   # Add/Edit modal form
│   │   │   ├── Layout.tsx         # Sidebar layout with dark mode toggle
│   │   │   └── Logo.tsx
│   │   ├── hooks/                 # useTheme
│   │   ├── lib/                   # api.ts, utils.ts
│   │   ├── pages/                 # OverviewPage, EmployeesPage, InsightsDashboard
│   │   └── test/                  # Vitest setup
│   └── package.json
│
├── docs/                    # Architecture notes and planning artifacts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Install all dependencies

From the root of the repo:

```bash
npm install
```

### Environment setup

```bash
cp server/.env.example server/.env
```

The default `.env` works out of the box for local development.

---

## Running the App

All commands are run from the **root** of the repo.

### Start backend (server)

```bash
npm run dev:server
```

Server starts at `http://localhost:3001`

Health check:

```bash
GET http://localhost:3001/health
```

### Start frontend (client)

```bash
npm run dev:client
```

Client starts at `http://localhost:5173`

> The Vite dev server proxies all `/api` requests to `http://localhost:3001` automatically.

### Start both simultaneously

Open two terminals and run both commands above, or use a tool like `concurrently`:

```bash
npx concurrently "npm run dev:server" "npm run dev:client"
```

---

## Running Tests

### Run all tests (server + client)

```bash
npm test
```

### Run server tests only

```bash
npm run test:server
```

### Run client tests only

```bash
npm run test:client
```

### Current test coverage

| Package   | Test File                  | Tests  | Description                         |
| --------- | -------------------------- | ------ | ----------------------------------- |
| server    | `migrations.test.ts`       | 5      | Schema, indexes, constraints        |
| server    | `employee.model.test.ts`   | 20     | Class-based model CRUD + helpers    |
| server    | `employee.routes.test.ts`  | 15     | API integration tests via Supertest |
| server    | `insights.test.ts`         | 6      | Salary analytics endpoints          |
| client    | `EmployeeTable.test.tsx`   | 5      | Table render, empty, loading states |
| client    | `Pagination.test.tsx`      | 6      | Pagination controls and callbacks   |
| client    | `EmployeeFilters.test.tsx` | 5      | Filter inputs and reset behaviour   |
| client    | `EmployeeForm.test.tsx`    | 6      | Form render, validation, pre-fill   |
| client    | `StatCard.test.tsx`        | 3      | Stat card render with icon and note |
| client    | `CountryStats.test.tsx`    | 4      | Country stats table render          |
| client    | `useTheme.test.ts`         | 5      | Dark mode toggle and localStorage   |
| **Total** |                            | **80** |                                     |

---

## API Reference

### Employees

| Method | Endpoint              | Description                             |
| ------ | --------------------- | --------------------------------------- |
| GET    | `/api/employees`      | List employees (paginated + filtered)   |
| GET    | `/api/employees/meta` | Distinct countries, departments, titles |
| GET    | `/api/employees/:id`  | Get employee by ID                      |
| POST   | `/api/employees`      | Create a new employee                   |
| PATCH  | `/api/employees/:id`  | Update an employee                      |
| DELETE | `/api/employees/:id`  | Delete an employee                      |

**Query parameters for `GET /api/employees`:**

| Parameter    | Type   | Default     | Description                      |
| ------------ | ------ | ----------- | -------------------------------- |
| `country`    | string | —           | Filter by country                |
| `department` | string | —           | Filter by department             |
| `job_title`  | string | —           | Filter by job title              |
| `status`     | string | `active`    | `active` \| `inactive`           |
| `search`     | string | —           | Search name, email, or job title |
| `page`       | number | `1`         | Page number                      |
| `pageSize`   | number | `50`        | Results per page (max 200)       |
| `sortBy`     | string | `full_name` | Column to sort by                |
| `sortOrder`  | string | `asc`       | `asc` \| `desc`                  |

### Insights

| Method | Endpoint                          | Description                                     |
| ------ | --------------------------------- | ----------------------------------------------- |
| GET    | `/api/insights/summary`           | Global employee and salary stats                |
| GET    | `/api/insights/country-stats`     | Salary stats with percentiles per country       |
| GET    | `/api/insights/job-title-stats`   | Salary stats by job title (optional `country`)  |
| GET    | `/api/insights/department-statst` | Salary stats by department (optional `country`) |

---

## Development Approach

This project follows **Test Driven Development (TDD)**:

1. **Red** — Write a failing test that defines the expected behaviour.
2. **Green** — Write the minimum code to make the test pass.
3. **Refactor** — Clean up while keeping tests green.

### Commit convention

Commits will follow the below **Conventional Commits** format afterwards for every meaningful change so the git history reflects the evolution of the solution step by step:

| Prefix     | Purpose                                   |
| ---------- | ----------------------------------------- |
| `Feat`     | New feature                               |
| `Fix`      | Bug fix                                   |
| `Refactor` | Code restructure without behaviour change |
| `Test`     | Adding or updating tests                  |
| `Chore`    | Tooling, config, dependencies             |
| `Docs`     | Documentation updates                     |

### Architecture decisions

- **Monorepo** with npm workspaces — shared types, unified scripts
- **Class-based models** with constructor-injected DB — fully testable, no global state
- **Factory function routes** — models injected at startup, easy to swap for testing
- **Zod validation** on all inputs — schema-first, type-safe from request to DB
- **TanStack Query** — server state, caching, and invalidation on mutations
- **Reusable component blocks** — pages are thin orchestrators, components are independent

---

## Upcoming

- Seed script — bulk insert 10,000 employees from name lists with high-performance batching
- Currency conversion — convert multi-currency salaries to a common base for stats
