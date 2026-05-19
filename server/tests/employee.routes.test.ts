import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import supertest from "supertest";
import { getDb, closeDb, resetDb } from "../src/db/database";
import { runMigrations } from "../src/db/migrations";
import { EmployeeModel } from "../src/models/employee.model";
import { InsightsModel } from "../src/models/insights.model";
import express from "express";
import { employeeRouter } from "../src/routes/employee.routes";
import { insightsRouter } from "../src/routes/insights.routes";

process.env.DB_PATH = "./src/utils/seed/data/test-employee-routes.db";

const sample = {
  full_name: "Jane Doe",
  email: "jane.doe@example.com",
  job_title: "Software Engineer",
  department: "Engineering",
  country: "India",
  salary: 80000,
  currency: "USD",
  hire_date: "2023-01-01",
  status: "active",
};

let request: ReturnType<typeof supertest>;

describe("Employee Routes", () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
    const db = getDb();
    const employeeModel = new EmployeeModel(db);
    const insightsModel = new InsightsModel(db);
    const app = express();
    app.use(express.json());
    app.use("/api/employees", employeeRouter(employeeModel));
    app.use("/api/insights", insightsRouter(insightsModel));
    request = supertest(app);
  });

  afterAll(() => closeDb());
  beforeEach(() => getDb().exec("DELETE FROM employees"));

  describe("POST /api/employees", () => {
    it("should create an employee and return 201", async () => {
      const res = await request.post("/api/employees").send(sample);
      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(sample.email);
      expect(res.body.data.id).toBeDefined();
    });

    it("should return 400 for missing required fields", async () => {
      const res = await request
        .post("/api/employees")
        .send({ full_name: "No Email" });
      expect(res.status).toBe(400);
    });

    it("should return 409 for duplicate email", async () => {
      await request.post("/api/employees").send(sample);
      const res = await request.post("/api/employees").send(sample);
      expect(res.status).toBe(409);
    });
  });

  describe("GET /api/employees", () => {
    beforeEach(async () => {
      await request.post("/api/employees").send(sample);
      await request.post("/api/employees").send({
        ...sample,
        email: "bob@example.com",
        full_name: "Bob Smith",
        country: "USA",
      });
    });

    it("should return paginated list of employees", async () => {
      const res = await request.get("/api/employees");
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
    });

    it("should filter by country", async () => {
      const res = await request.get("/api/employees?country=India");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].country).toBe("India");
    });

    it("should search by name", async () => {
      const res = await request.get("/api/employees?search=Jane");
      expect(res.status).toBe(200);
      expect(res.body.data[0].full_name).toBe("Jane Doe");
    });

    it("should paginate results", async () => {
      const res = await request.get("/api/employees?page=1&pageSize=1");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.totalPages).toBe(2);
    });
  });

  describe("GET /api/employees/meta", () => {
    beforeEach(async () => {
      await request.post("/api/employees").send(sample);
    });

    it("should return distinct countries, departments and jobTitles", async () => {
      const res = await request.get("/api/employees/meta");
      expect(res.status).toBe(200);
      expect(res.body.countries).toContain("India");
      expect(res.body.departments).toContain("Engineering");
      expect(res.body.jobTitles).toContain("Software Engineer");
    });
  });

  describe("GET /api/employees/:id", () => {
    it("should return an employee by id", async () => {
      const created = await request.post("/api/employees").send(sample);
      const res = await request.get(`/api/employees/${created.body.data.id}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(sample.email);
    });

    it("should return 404 for non-existent id", async () => {
      const res = await request.get("/api/employees/9999");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/employees/:id", () => {
    it("should update an employee and return updated data", async () => {
      const created = await request.post("/api/employees").send(sample);
      const res = await request
        .patch(`/api/employees/${created.body.data.id}`)
        .send({ salary: 95000 });
      expect(res.status).toBe(200);
      expect(res.body.data.salary).toBe(95000);
    });

    it("should return 404 for non-existent id", async () => {
      const res = await request
        .patch("/api/employees/9999")
        .send({ salary: 1000 });
      expect(res.status).toBe(404);
    });

    it("should return 400 for invalid fields", async () => {
      const created = await request.post("/api/employees").send(sample);
      const res = await request
        .patch(`/api/employees/${created.body.data.id}`)
        .send({ salary: -500 });
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/employees/:id", () => {
    it("should delete an employee and return 204", async () => {
      const created = await request.post("/api/employees").send(sample);
      const res = await request.delete(
        `/api/employees/${created.body.data.id}`,
      );
      expect(res.status).toBe(204);
    });

    it("should return 404 for non-existent id", async () => {
      const res = await request.delete("/api/employees/9999");
      expect(res.status).toBe(404);
    });
  });
});
