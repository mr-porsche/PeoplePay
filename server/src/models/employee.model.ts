import { getDb } from '../db/database';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../validators/employee.validator';
import { Employee, EmployeeFilters, PaginatedEmployees } from '@peoplepay/shared';

export function getAllEmployees(filters: EmployeeFilters = {}): PaginatedEmployees {
  const db = getDb();
  const {
    country,
    job_title,
    department,
    is_active,
    search,
    page  = 1,
    limit = 20,
  } = filters;

  const conditions: string[] = [];
  const params: unknown[]    = [];

  if (country)    { conditions.push('country = ?');    params.push(country); }
  if (job_title)  { conditions.push('job_title = ?');  params.push(job_title); }
  if (department) { conditions.push('department = ?'); params.push(department); }
  if (is_active !== undefined) {
                    conditions.push('is_active = ?');  params.push(is_active ? 1 : 0); }
  if (search)     { conditions.push('full_name LIKE ?'); params.push(`%${search}%`); }

  const where  = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const total = (db.prepare(`SELECT COUNT(*) as count FROM employees ${where}`).get(...params) as { count: number }).count;
  const data  = db.prepare(`SELECT * FROM employees ${where} ORDER BY full_name ASC LIMIT ? OFFSET ?`).all(...params, limit, offset) as Employee[];

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export function getEmployeeById(id: number): Employee | undefined {
  return getDb().prepare('SELECT * FROM employees WHERE id = ?').get(id) as Employee | undefined;
}

export function createEmployee(input: CreateEmployeeInput): Employee {
  const db = getDb();
  const {
    full_name,
    job_title,
    department,
    country,
    salary,
    currency = 'USD',
    email,
    phone    = null,
    hired_at = new Date().toISOString().split('T')[0],
    is_active = true,
  } = input;

  const result = db.prepare(`
    INSERT INTO employees (full_name, job_title, department, country, salary, currency, email, phone, hired_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(full_name, job_title, department, country, salary, currency, email, phone, hired_at, is_active ? 1 : 0);

  return getEmployeeById(result.lastInsertRowid as number)!;
}

export function updateEmployee(id: number, input: UpdateEmployeeInput): Employee | undefined {
  const db       = getDb();
  const existing = getEmployeeById(id);
  if (!existing) return undefined;

  const fields = Object.keys(input) as (keyof UpdateEmployeeInput)[];
  if (fields.length === 0) return existing;

  const setClauses = fields.map((f) => `${f} = ?`).join(', ');
  const values     = fields.map((f) => {
    if (f === 'is_active') return (input[f] ? 1 : 0);
    return input[f] ?? null;
  });

  db.prepare(`UPDATE employees SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`).run(...values, id);
  return getEmployeeById(id);
}

export function deleteEmployee(id: number): boolean {
  const result = getDb().prepare('DELETE FROM employees WHERE id = ?').run(id);
  return result.changes > 0;
}