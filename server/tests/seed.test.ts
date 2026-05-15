import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadLines(file: string): string[] {
  return readFileSync(join(__dirname, "../data/seeding_data", file), "utf-8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function pairNames(firstNames: string[], lastNames: string[]) {
  const maxLen = Math.max(firstNames.length, lastNames.length);
  return Array.from({ length: maxLen }, (_, i) => ({
    full_name: `${firstNames[i] ?? "Unknown"} ${lastNames[i] ?? "Unknown"}`,
    warned: !firstNames[i] || !lastNames[i],
  }));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(): string {
  const y = randInt(2015, 2024);
  const m = String(randInt(1, 12)).padStart(2, "0");
  const d = String(randInt(1, 28)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

describe("Seed Script", () => {
  let db: Database.Database;
  let firstNames: string[];
  let lastNames: string[];

  beforeAll(() => {
    db = new Database(":memory:");
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS employees (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name  TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        job_title  TEXT NOT NULL,
        department TEXT NOT NULL,
        country    TEXT NOT NULL,
        salary     REAL NOT NULL CHECK(salary > 0),
        currency   TEXT NOT NULL DEFAULT 'USD',
        hire_date  TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
        updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
      )
    `);
    firstNames = loadLines("first_names.txt");
    lastNames = loadLines("last_names.txt");
  });

  afterAll(() => db.close());

  it("should load first_names.txt with at least 50 names", () => {
    expect(firstNames.length).toBeGreaterThanOrEqual(50);
  });

  it("should load last_names.txt with at least 50 names", () => {
    expect(lastNames.length).toBeGreaterThanOrEqual(50);
  });

  it("should pair names by index not randomly", () => {
    const pairs = pairNames(firstNames, lastNames);
    expect(pairs[0].full_name).toBe(`${firstNames[0]} ${lastNames[0]}`);
    expect(pairs[1].full_name).toBe(`${firstNames[1]} ${lastNames[1]}`);
    expect(pairs[2].full_name).toBe(`${firstNames[2]} ${lastNames[2]}`);
  });

  it("should warn when files have different lengths", () => {
    const pairs = pairNames(["James", "Mary"], ["Smith"]);
    expect(pairs[1].warned).toBe(true);
    expect(pairs[1].full_name).toBe("Mary Unknown");
  });

  it("should fill missing first name with Unknown", () => {
    const pairs = pairNames(["James"], ["Smith", "Johnson"]);
    expect(pairs[1].full_name).toBe("Unknown Johnson");
    expect(pairs[1].warned).toBe(true);
  });

  it("should generate valid hire dates", () => {
    for (let i = 0; i < 20; i++) {
      const date = randDate();
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(date).toString()).not.toBe("Invalid Date");
    }
  });

  it("should insert paired employees in batches using transactions", () => {
    const insert = db.prepare(`
      INSERT INTO employees
        (full_name, email, job_title, department, country, salary, currency, hire_date, status)
      VALUES
        (@full_name, @email, @job_title, @department, @country, @salary, @currency, @hire_date, @status)
    `);

    const insertMany = db.transaction((rows: object[]) => {
      for (const row of rows) insert.run(row);
    });

    const pairs = pairNames(firstNames.slice(0, 50), lastNames.slice(0, 50));
    const batch = pairs.map((p, i) => ({
      full_name: p.full_name,
      email: `user${i}@test.com`,
      job_title: "Engineer",
      department: "Engineering",
      country: "India",
      salary: randInt(50000, 100000),
      currency: "INR",
      hire_date: randDate(),
      status: "active",
    }));

    insertMany(batch);

    const count = (
      db.prepare("SELECT COUNT(*) as count FROM employees").get() as {
        count: number;
      }
    ).count;
    expect(count).toBe(50);
  });

  it("should have all required columns after insert", () => {
    const row = db.prepare("SELECT * FROM employees LIMIT 1").get() as Record<
      string,
      unknown
    >;
    expect(row).toHaveProperty("id");
    expect(row).toHaveProperty("full_name");
    expect(row).toHaveProperty("email");
    expect(row).toHaveProperty("job_title");
    expect(row).toHaveProperty("department");
    expect(row).toHaveProperty("country");
    expect(row).toHaveProperty("salary");
    expect(row).toHaveProperty("currency");
    expect(row).toHaveProperty("hire_date");
    expect(row).toHaveProperty("status");
  });

  it("should enforce unique emails", () => {
    expect(() => {
      db.prepare(
        `
        INSERT INTO employees
          (full_name, email, job_title, department, country, salary, currency, hire_date, status)
        VALUES
          ('Duplicate', 'user0@test.com', 'Eng', 'Engineering', 'India', 50000, 'INR', '2023-01-01', 'active')
      `,
      ).run();
    }).toThrow();
  });

  it("should reject negative salary", () => {
    expect(() => {
      db.prepare(
        `
        INSERT INTO employees
          (full_name, email, job_title, department, country, salary, currency, hire_date, status)
        VALUES
          ('Bad', 'bad@test.com', 'Eng', 'Engineering', 'India', -1000, 'INR', '2023-01-01', 'active')
      `,
      ).run();
    }).toThrow();
  });
});
