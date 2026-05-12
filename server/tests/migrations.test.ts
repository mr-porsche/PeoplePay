import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { getDb, closeDb, resetDb } from '../src/db/database';
import { runMigrations } from '../src/db/migrations';

process.env.DB_PATH = './data/test-migrations.db';

describe('Database Migrations', () => {
  beforeAll(() => {
    resetDb();
    runMigrations();
  });

  afterAll(() => {
    closeDb();
  });

  beforeEach(() => {
    getDb().exec('DELETE FROM employees');
  });

  it('should create the employees table', () => {
    const db = getDb();
    const table = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='employees'`)
      .get() as { name: string } | undefined;

    expect(table).toBeDefined();
    expect(table?.name).toBe('employees');
  });

  it('should have all required columns', () => {
    const db = getDb();
    const columns = db
      .prepare(`PRAGMA table_info(employees)`)
      .all() as { name: string }[];

    const columnNames = columns.map((c) => c.name);

    expect(columnNames).toContain('id');
    expect(columnNames).toContain('full_name');
    expect(columnNames).toContain('job_title');
    expect(columnNames).toContain('department');
    expect(columnNames).toContain('country');
    expect(columnNames).toContain('salary');
    expect(columnNames).toContain('currency');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('phone');
    expect(columnNames).toContain('hire_date');
    expect(columnNames).toContain('status');
    expect(columnNames).toContain('created_at');
    expect(columnNames).toContain('updated_at');
  });

  it('should create indexes on country, job_title, and status', () => {
    const db = getDb();
    const indexes = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='employees'`)
      .all() as { name: string }[];

    const indexNames = indexes.map((i) => i.name);

    expect(indexNames).toContain('idx_employees_country');
    expect(indexNames).toContain('idx_employees_job_title');
    expect(indexNames).toContain('idx_employees_status');
  });

  it('should enforce salary > 0 constraint', () => {
    const db = getDb();
    expect(() => {
      db.prepare(`
        INSERT INTO employees (full_name, job_title, department, country, salary, email)
        VALUES ('Test User', 'Engineer', 'Engineering', 'India', -100, 'test@test.com')
      `).run();
    }).toThrow();
  });

  it('should enforce unique email constraint', () => {
    const db = getDb();
    db.prepare(`
      INSERT INTO employees (full_name, job_title, department, country, salary, email)
      VALUES ('Alice Smith', 'Engineer', 'Engineering', 'India', 50000, 'alice@test.com')
    `).run();

    expect(() => {
      db.prepare(`
        INSERT INTO employees (full_name, job_title, department, country, salary, email)
        VALUES ('Alice Clone', 'Engineer', 'Engineering', 'India', 50000, 'alice@test.com')
      `).run();
    }).toThrow();
  });
});