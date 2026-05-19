import axios from "axios";
import type {
  Employee,
  CreateEmployeeInput,
  UpdateEmployeeInput,
  PaginatedEmployees,
  EmployeeFilters,
  CountryStat,
  JobTitleStat,
  DepartmentStat,
  InsightsSummary,
} from "@peoplepay/shared";

const api = axios.create({ baseURL: "/api" });

function unwrapArray<T>(res: unknown): T[] {
  if (!res || typeof res !== "object") return [];
  const r = res as Record<string, unknown>;
  if (Array.isArray(r.data)) return r.data as T[];
  if (Array.isArray(res)) return res as T[];
  return [];
}

// ── Employees ─────────────────────────────────────────────────────────────────
export const employeesApi = {
  list: (filters: EmployeeFilters = {}) =>
    api
      .get<PaginatedEmployees>("/employees", { params: filters })
      .then((r) => r.data),

  get: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then((r) => r.data),

  meta: () =>
    api
      .get<{
        countries: string[];
        departments: string[];
        jobTitles: string[];
      }>("/employees/meta")
      .then((r) => r.data),

  create: (data: CreateEmployeeInput) =>
    api.post<Employee>("/employees", data).then((r) => r.data),

  update: (id: number, data: UpdateEmployeeInput) =>
    api.patch<Employee>(`/employees/${id}`, data).then((r) => r.data),

  delete: (id: number) => api.delete(`/employees/${id}`),

  // ── Seed ──────────────────────────
  seed: (payload: {
    format:
      | "txt_names"
      | "txt_full"
      | "txt_columns"
      | "csv"
      | "json"
      | "excel"
      | string;
    fillMissing?: boolean;
    firstNames?: string[];
    lastNames?: string[];
    columns?: Record<string, string[]>;
    records?: object[];
  }) =>
    api
      .post<{
        seeded: number;
        skipped: number;
        warnings?: string[];
        message: string;
      }>("/employees/seed", payload)
      .then((r) => r.data),
};

// ── Insights ──────────────────────────────────────────────────────────────────
export const insightsApi = {
  summary: () =>
    api.get<InsightsSummary>("/insights/summary").then((r) => r.data),

  byCountry: () =>
    api
      .get("/insights/country-stats")
      .then((r) => unwrapArray<CountryStat>(r.data)),

  byJobCountry: (country?: string) =>
    api
      .get("/insights/job-title-stats", {
        params: country ? { country } : {},
      })
      .then((r) => unwrapArray<JobTitleStat>(r.data)),

  byDepartment: (country?: string) =>
    api
      .get("/insights/department-stats", {
        params: country ? { country } : {},
      })
      .then((r) => unwrapArray<DepartmentStat>(r.data)),
};
