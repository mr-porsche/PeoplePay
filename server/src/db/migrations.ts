import { getDb } from './database';

export function runMigrations(): void {
  const db = getDb();

  db.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name   TEXT    NOT NULL,
      job_title   TEXT    NOT NULL,
      department  TEXT    NOT NULL,
      country     TEXT    NOT NULL,
      salary      REAL    NOT NULL CHECK(salary > 0),
      currency    TEXT    NOT NULL DEFAULT 'USD',
      email       TEXT    NOT NULL UNIQUE,
      phone       TEXT,
      hired_at    TEXT    NOT NULL DEFAULT (date('now')),
      is_active   INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_employees_country   ON employees(country);
    CREATE INDEX IF NOT EXISTS idx_employees_job_title ON employees(job_title);
    CREATE INDEX IF NOT EXISTS idx_employees_is_active ON employees(is_active);
  `);
}