import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import supertest from "supertest";
import { getDb, closeDb, resetDb } from "../src/db/database";
import { runMigrations } from "../src/db/migrations";
import { EmployeeModel } from "../src/models/employee.model";
import { InsightsModel } from "../src/models/insights.model";
import express from "express";
import { employeeRouter } from "../src/routes/employee.routes";
import { insightsRouter } from "../src/routes/insights.routes";

process.env.DB_PATH = "./src/utils/seed/data/test-insights.db";

let request: ReturnType<typeof supertest>;
let employeeModel: EmployeeModel;

describe("Salary Insights Routes", () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
    const db = getDb();
    employeeModel = new EmployeeModel(db);
    const insightsM = new InsightsModel(db);
    const app = express();
    app.use(express.json());
    app.use("/api/employees", employeeRouter(employeeModel));
    app.use("/api/insights", insightsRouter(insightsM));
    request = supertest(app);
  });

  afterAll(() => closeDb());

  beforeEach(() => {
    getDb().exec("DELETE FROM employees");
    employeeModel.create({
      full_name: "Alice",
      email: "alice@test.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "India",
      salary: 60000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    employeeModel.create({
      full_name: "Bob",
      email: "bob@test.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "India",
      salary: 80000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    employeeModel.create({
      full_name: "Charlie",
      email: "charlie@test.com",
      job_title: "Designer",
      department: "Design",
      country: "India",
      salary: 70000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    employeeModel.create({
      full_name: "Diana",
      email: "diana@test.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "USA",
      salary: 120000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    employeeModel.create({
      full_name: "Eve",
      email: "eve@test.com",
      job_title: "Manager",
      department: "Management",
      country: "USA",
      salary: 150000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    employeeModel.create({
      full_name: "Frank",
      email: "frank@test.com",
      job_title: "Designer",
      department: "Design",
      country: "USA",
      salary: 110000,
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
  });

  describe("GET /api/insights/summary", () => {
    it("should return global summary stats", async () => {
      const res = await request.get("/api/insights/summary");
      expect(res.status).toBe(200);
      expect(res.body.total_employees).toBe(6);
      expect(res.body.total_countries).toBe(2);
      expect(res.body.total_departments).toBe(3);
      expect(res.body.global_avg_salary).toBeDefined();
    });
  });

  describe("GET /api/insights/country-stats", () => {
    it("should return salary stats per country with percentiles", async () => {
      const res = await request.get("/api/insights/country-stats");
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);

      const india = res.body.find((d: any) => d.country === "India");
      expect(india).toBeDefined();
      expect(india.min_salary).toBe(60000);
      expect(india.max_salary).toBe(80000);
      expect(india.headcount).toBe(3);
      expect(india.p50_salary).toBeDefined();
      expect(india.p90_salary).toBeDefined();
    });
  });

  describe("GET /api/insights/job-title-stats", () => {
    it("should return salary stats by job title filtered by country", async () => {
      const res = await request.get(
        "/api/insights/job-title-stats?country=India",
      );
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);

      const engineer = res.body.find((d: any) => d.job_title === "Engineer");
      expect(engineer).toBeDefined();
      expect(engineer.headcount).toBe(2);
      expect(engineer.avg_salary).toBeDefined();
    });

    it("should return all job stats when no country provided", async () => {
      const res = await request.get("/api/insights/job-title-stats");
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/insights/department-stats", () => {
    it("should return department stats", async () => {
      const res = await request.get("/api/insights/department-stats");
      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);

      const eng = res.body.find((d: any) => d.department === "Engineering");
      expect(eng).toBeDefined();
      expect(eng.headcount).toBe(3);
    });

    it("should filter by country", async () => {
      const res = await request.get(
        "/api/insights/department-stats?country=USA",
      );
      expect(res.status).toBe(200);
      const eng = res.body.find((d: any) => d.department === "Engineering");
      expect(eng.headcount).toBe(1);
    });
  });
});
