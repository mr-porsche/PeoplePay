import { getDb } from "./database.js";

export function runMigrations(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      job_title   TEXT    NOT NULL DEFAULT 'Unknown',
      department  TEXT    NOT NULL DEFAULT 'Unknown',
      country     TEXT    NOT NULL DEFAULT 'Unknown',
      salary      REAL    NOT NULL DEFAULT 0 CHECK(salary >= 0),
      currency    TEXT    NOT NULL DEFAULT 'USD',
      hire_date   TEXT    NOT NULL DEFAULT (date('now')),
      status      TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active','inactive')),
      created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      updated_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
    );

    CREATE INDEX IF NOT EXISTS idx_employees_country     ON employees(country);
    CREATE INDEX IF NOT EXISTS idx_employees_job_title   ON employees(job_title);
    CREATE INDEX IF NOT EXISTS idx_employees_department  ON employees(department);
    CREATE INDEX IF NOT EXISTS idx_employees_country_job ON employees(country, job_title);
    CREATE INDEX IF NOT EXISTS idx_employees_salary      ON employees(salary);
    CREATE INDEX IF NOT EXISTS idx_employees_status      ON employees(status);
  `);
}
