import Database from "better-sqlite3";
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { seedRecords } from "../src/utils/seed/seeder";

function makeDb(): Database.Database {
  const db = new Database(":memory:");
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE employees (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT NOT NULL,
      email       TEXT NOT NULL UNIQUE,
      job_title   TEXT NOT NULL DEFAULT 'Unknown',
      department  TEXT NOT NULL DEFAULT 'Unknown',
      country     TEXT NOT NULL DEFAULT 'Unknown',
      salary      REAL NOT NULL DEFAULT 0 CHECK(salary >= 0),
      currency    TEXT NOT NULL DEFAULT 'USD',
      hire_date   TEXT NOT NULL DEFAULT (date('now')),
      status      TEXT NOT NULL DEFAULT 'active',
      created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    )
  `);
  return db;
}

describe("seedRecords", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = makeDb();
  });
  afterAll(() => db.close());

  it("inserts records and returns correct count", () => {
    const result = seedRecords(
      db,
      [{ full_name: "Alice Smith" }, { full_name: "Bob Jones" }],
      true,
    );
    expect(result.inserted).toBe(2);
    expect(result.skipped).toBe(0);
  });

  it("skips duplicates via INSERT OR IGNORE", () => {
    seedRecords(
      db,
      [{ full_name: "Alice Smith", email: "alice@test.com" }],
      false,
    );
    const result = seedRecords(
      db,
      [{ full_name: "Alice Smith", email: "alice@test.com" }],
      false,
    );
    expect(result.inserted).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it("inserts with fillMissing=false using Unknown defaults", () => {
    seedRecords(db, [{ full_name: "Jane Doe" }], false);
    const row = db.prepare("SELECT * FROM employees LIMIT 1").get() as Record<
      string,
      unknown
    >;
    expect(row.job_title).toBe("Unknown");
    expect(row.salary).toBe(0);
  });

  it("inserts with fillMissing=true with real data", () => {
    seedRecords(db, [{ full_name: "Jane Doe" }], true);
    const row = db.prepare("SELECT * FROM employees LIMIT 1").get() as Record<
      string,
      unknown
    >;
    expect(row.job_title).not.toBe("Unknown");
    expect(Number(row.salary)).toBeGreaterThan(0);
  });

  it("handles large batches efficiently", () => {
    const records = Array.from({ length: 1000 }, (_, i) => ({
      full_name: `User ${i}`,
      email: `user${i}@test.com`,
    }));
    const start = Date.now();
    const result = seedRecords(db, records, true);
    const ms = Date.now() - start;
    expect(result.inserted).toBe(1000);
    expect(ms).toBeLessThan(3000);
  });

  it("all required columns present after insert", () => {
    seedRecords(db, [{ full_name: "Test User" }], true);
    const row = db.prepare("SELECT * FROM employees LIMIT 1").get() as Record<
      string,
      unknown
    >;
    expect(row).toHaveProperty("full_name");
    expect(row).toHaveProperty("email");
    expect(row).toHaveProperty("job_title");
    expect(row).toHaveProperty("department");
    expect(row).toHaveProperty("country");
    expect(row).toHaveProperty("salary");
    expect(row).toHaveProperty("hire_date");
    expect(row).toHaveProperty("status");
  });
});
