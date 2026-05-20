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
- Generate and seed realistic employee datasets for development and testing

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
peoplepay/
├── shared/                           # Shared TypeScript types
│ ├── src/
│ │ └── types.ts
│ ├── package.json
│ └── tsconfig.json
│
│
├── server/                           # Express + TypeScript backend API
│ ├── scripts/
│ │ └── seed.ts                       # Database seeding script
│ │
│ ├── src/
│ │ ├── db/
│ │ │ ├── database.ts                 # SQLite database connection/configuration
│ │ │ └── migrations.ts               # Database schema migrations
│ │ │
│ │ ├── models/                       # Business/Database logic
│ │ │ ├── employeeModel.ts            # Employee CRUD operations
│ │ │ └── insightsModel.ts            # Aggregated analytics/insights queries
│ │ │
│ │ ├── routes/                       # Express route handlers
│ │ │ ├── employees.ts                # Employee-related API endpoints
│ │ │ └── insights.ts                 # Insights/dashboard API endpoints
│ │ │
│ │ ├── utils/                        # Utility helpers and validation logic
│ │ │ ├── seeding_data/               # Raw/mock data used for database seeding
│ │ │ │ ├── data.ts                   # Seed dataset generator/helpers
│ │ │ │ ├── first_name.txt            # First names source list
│ │ │ │ ├── last_name.txt             # Last names source list
│ │ │ │ └── parse.ts                  # Parsing utilities for seed files
│ │ │ └── validation.ts               # Zod validation schemas
│ │ │
│ │ ├── app.ts                        # Express app configuration/middleware
│ │ └── index.ts                      # Backend entry point/server bootstrap
│ │
│ ├── tests/                          # Vitest backend tests
│ │ ├── employee.model.test.ts
│ │ ├── employee.routes.test.ts
│ │ ├── insights.test.ts
│ │ ├── migration.test.ts
│ │ └── seed.test.ts
│ │
│ ├── .env                            # Environment variables (local only)
│ ├── .env.example
│ ├── package.json
│ ├── tsconfig.json
│ └── vitest.config.ts
│
│
├── client/                           # React + Vite frontend application
│ ├── src/
│ │ ├── components/                   # Reusable UI components
│ │ │
│ │ │ ├── __tests__/                  # Shared component tests
│ │ │ │ └── EmployeeForm.test.tsx     # Employee form component tests
│ │ │ │
│ │ │ ├── employees/                  # Employee management feature components
│ │ │ │
│ │ │ │ ├── __tests__/                # Employee feature component tests
│ │ │ │ │ ├── EmployeesFilters.test.tsx # Filters component tests
│ │ │ │ │ ├── EmployeesTable.test.tsx # Employee table tests
│ │ │ │ │ ├── Pagination.test.tsx    # Pagination component tests
│ │ │ │ │ └── SeedUploader.test.tsx  # Seed upload component tests
│ │ │ │ │
│ │ │ │ ├── Filters.tsx              # Employee filtering UI
│ │ │ │ ├── Pagination.tsx           # Pagination controls
│ │ │ │ ├── SeedUploader.tsx         # Upload/import seed data component
│ │ │ │ ├── Table.tsx                # Employee data table
│ │ │ │ └── TableHeader.tsx          # Table column headers/sorting UI
│ │ │ │
│ │ │ ├── insights/                  # Dashboard and analytics components
│ │ │ │
│ │ │ │ ├── __tests__/               # Insights component tests
│ │ │ │ │ ├── CountryStats.test.tsx
│ │ │ │ │ └── StatCard.test.tsx
│ │ │ │ │
│ │ │ │ ├── CountryStats.tsx         # Country-wise employee stats table
│ │ │ │ ├── DepartmentStats.tsx      # Department analytics component
│ │ │ │ ├── SalaryBarChart.tsx       # Salary visualization chart
│ │ │ │ ├── StatCard.tsx             # KPI/statistic display card
│ │ │ │ ├── AppLayout.tsx            # Dashboard layout wrapper
│ │ │ │ ├── DepartmentChart.tsx      # Department distribution chart
│ │ │ │ ├── SalaryBarChart.tsx       # Salary comparison chart
│ │ │ │ └── StatCard.tsx             # Reusable stat display component
│ │ │ │
│ │ │ ├── AppLayout.tsx              # Main application layout/navigation
│ │ │ ├── EmployeeForm.tsx           # Add/Edit employee modal form
│ │ │ └── Logo.tsx                   # Brand/logo component
│ │ │
│ │ ├── hooks/                       # Custom React hooks
│ │ │ ├── __tests__/                 # Hook tests
│ │ │ │ └── useTheme.test.ts
│ │ │ └── useTheme.ts                # Dark/light theme management hook
│ │ │
│ │ ├── lib/                         # Shared frontend utilities/services
│ │ │ ├── api.tsx                    # API client and request handlers
│ │ │ └── utils.tsx                  # General utility/helper functions
│ │ │
│ │ ├── pages/                       # Route-level page components
│ │ │ ├── EmployeesPage.tsx          # Employee management page
│ │ │ ├── InsightDashboard.tsx       # Analytics dashboard page
│ │ │ └── OverviewPage.tsx           # Application overview/home page
│ │ │
│ │ ├── test/
│ │ │ └── setup/.ts                  # Frontend test setup/configuration
│ │ │
│ │ ├── App.tsx                      # Root React application component
│ │ ├── index.css                    # Global application styles
│ │ └── main.tsx                     # Frontend application entry point
│ │
│ ├── .gitignore
│ ├── eslint.config.js
│ ├── index.html
│ ├── package.json
│ ├── tsconfig.app.json
│ ├── tsconfig.json
│ ├── tsconfig.node.json
│ └── vite.config.ts
│
│
├── .gitignore
├── package.json                     # Root workspace/monorepo configuration
└── README.md                        # Project setup, usage, and documentation
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

### Seed the database

Populate SQLite with generated employee records:

```bash
npm run seed
```

Wipe and reseed:

```bash
npm run seed:fresh
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

| Package   | Test File                  | Tests   | Description                                           |
| --------- | -------------------------- | ------- | ----------------------------------------------------- |
| server    | `migrations.test.ts`       | 5       | Database schema, indexes, and migration constraints   |
| server    | `employee.model.test.ts`   | 20      | Employee model CRUD operations and helper methods     |
| server    | `employee.routes.test.ts`  | 15      | Employee API integration tests using Supertest        |
| server    | `insights.test.ts`         | 6       | Insights aggregation and analytics endpoint tests     |
| server    | `seed.generator.test.ts`   | 7       | Random employee seed data generation utilities        |
| server    | `seed.parser.test.ts`      | 23      | Seed file parsing, validation, and truncation logic   |
| server    | `seed.seeder.test.ts`      | 6       | Database seeding workflow and insertion verification  |
| client    | `EmployeeTable.test.tsx`   | 5       | Employee table rendering and state handling           |
| client    | `Pagination.test.tsx`      | 6       | Pagination controls and callback interactions         |
| client    | `EmployeeFilters.test.tsx` | 5       | Employee filter inputs and reset behaviour            |
| client    | `SeedUploader.test.tsx`    | 9       | CSV/seed upload interactions and validation states    |
| client    | `EmployeeForm.test.tsx`    | 6       | Form rendering, validation, and edit pre-fill support |
| client    | `StatCard.test.tsx`        | 3       | Statistics card rendering and props handling          |
| client    | `CountryStats.test.tsx`    | 4       | Country statistics table rendering                    |
| client    | `useTheme.test.ts`         | 5       | Dark mode toggle and localStorage persistence         |
| **Total** |                            | **125** |                                                       |

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

### Seed Endpoint

| Method | Endpoint              | Description                               |
| ------ | --------------------- | ----------------------------------------- |
| POST   | `/api/employees/seed` | Generate and insert mock employee records |

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
| GET    | `/api/insights/department-statts` | Salary stats by department (optional `country`) |

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
- **Dedicated seed pipeline** — parser, generator, and seeder utilities are isolated and independently testable

---

## Upcoming

- DevOps — Docker, GitHub Actions CI, Prometheus + Grafana monitoring
- Currency conversion — convert multi-currency salaries to a common base for stats
