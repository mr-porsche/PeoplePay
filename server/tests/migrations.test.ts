import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { getDb, closeDb, resetDb } from "../src/db/database";
import { runMigrations } from "../src/db/migrations";

process.env.DB_PATH = "./src/utils/seed/data/test-migrations.db";

describe("Database Migrations", () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
  });

  afterAll(() => closeDb());

  beforeEach(() => {
    getDb().exec("DELETE FROM employees");
  });

  it("should create the employees table", () => {
    const db = getDb();
    const table = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='employees'`,
      )
      .get() as { name: string } | undefined;
    expect(table).toBeDefined();
    expect(table?.name).toBe("employees");
  });

  it("should have all required columns", () => {
    const db = getDb();
    const columns = db.prepare(`PRAGMA table_info(employees)`).all() as {
      name: string;
    }[];
    const names = columns.map((c) => c.name);

    expect(names).toContain("id");
    expect(names).toContain("full_name");
    expect(names).toContain("email");
    expect(names).toContain("job_title");
    expect(names).toContain("department");
    expect(names).toContain("country");
    expect(names).toContain("salary");
    expect(names).toContain("currency");
    expect(names).toContain("hire_date");
    expect(names).toContain("status");
    expect(names).toContain("created_at");
    expect(names).toContain("updated_at");
  });

  it("should create all indexes", () => {
    const db = getDb();
    const indexes = db
      .prepare(
        `SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='employees'`,
      )
      .all() as { name: string }[];
    const names = indexes.map((i) => i.name);

    expect(names).toContain("idx_employees_country");
    expect(names).toContain("idx_employees_job_title");
    expect(names).toContain("idx_employees_status");
  });

  it("should enforce salary > 0 constraint", () => {
    const db = getDb();
    expect(() => {
      db.prepare(
        `
        INSERT INTO employees (full_name, email, job_title, department, country, salary, hire_date)
        VALUES ('Test', 'test@test.com', 'Eng', 'Engineering', 'India', -100, '2024-01-01')
      `,
      ).run();
    }).toThrow();
  });

  it("should enforce unique email constraint", () => {
    const db = getDb();
    db.prepare(
      `
      INSERT INTO employees (full_name, email, job_title, department, country, salary, hire_date)
      VALUES ('Alice', 'alice@test.com', 'Eng', 'Engineering', 'India', 50000, '2024-01-01')
    `,
    ).run();

    expect(() => {
      db.prepare(
        `
        INSERT INTO employees (full_name, email, job_title, department, country, salary, hire_date)
        VALUES ('Alice 2', 'alice@test.com', 'Eng', 'Engineering', 'India', 50000, '2024-01-01')
      `,
      ).run();
    }).toThrow();
  });
});
