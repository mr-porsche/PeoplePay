import { getDb } from '../db/database';
import { CreateEmployeeInput, UpdateEmployeeInput } from '../validators/employee.validator';
import { Employee, EmployeeFilters, PaginatedEmployees } from '@peoplepay/shared';

export type { Employee, EmployeeFilters, PaginatedEmployees };

export function getAllEmployees(filters: EmployeeFilters = {}): PaginatedEmployees {
  const db = getDb();

  const {
    country,
    job_title,
    department,
    status,
    search,
    page  = 1,
    pageSize = 20,
  } = filters;

  const conditions: string[] = [];
  const params: unknown[] = [];

  if (country){
      conditions.push('country = ?');
      params.push(country);
    }
    
  if (job_title){
      conditions.push('job_title = ?');
      params.push(job_title);
    }
    
  if (department){
      conditions.push('department = ?');
      params.push(department);
    }
    
  if (status){
      conditions.push('status = ?');
      params.push(status);
    }
    
  if (search){
      conditions.push('full_name LIKE ?');
      params.push(`%${search}%`);
    }
    

  const whereClause  =
    conditions.length > 0
      ? `WHERE ${conditions.join(' AND ')}`
      : '';
  
  const offset = (page - 1) * pageSize;

  const totalQuery =`
    SELECT COUNT(*) as count
    FROM employees
    ${whereClause}
  `;

  const dataQuery = `
    SELECT *
    FROM employees
    ${whereClause}
    ORDER BY full_name ASC
    LIMIT ? OFFSET ?
  `;
  
  const total = (
    db.prepare(totalQuery).get(...params) as {
      count: number;
    }
  ).count;

  const data = db
    .prepare(dataQuery)
    .all(...params, pageSize, offset) as Employee[];

  return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export function getEmployeeById(id: number): Employee | undefined {
  return getDb()
    .prepare('SELECT * FROM employees WHERE id = ?')
    .get(id) as Employee | undefined;
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
    phone = null,
    hire_date = new Date().toISOString().split('T')[0],
    status = 'active', 
  } = input;

  const resultQuery = `
    INSERT INTO employees (
      full_name,
      job_title,
      department,
      country,
      salary,
      currency,
      email,
      phone,
      hire_date,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = db.prepare(resultQuery).run(
    full_name,
    job_title,
    department,
    country,
    salary,
    currency,
    email,
    phone,
    hire_date,
    status
  );

  return getEmployeeById(result.lastInsertRowid as number)!;
}

export function updateEmployee(id: number, input: UpdateEmployeeInput): Employee | undefined {
  const db = getDb();
  const existingEmployee = getEmployeeById(id);
  if (!existingEmployee) return undefined;

  const fields = Object.keys(input) as (keyof UpdateEmployeeInput)[];
  if (fields.length === 0) return existingEmployee;

  const setClauses = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => input[field] ?? null);

  const updateQuery = `
    UPDATE employees
    SET ${setClauses}, updated_at = datetime('now')
    WHERE id = ?
  `;
  
  db.prepare(updateQuery).run(...values, id);
  return getEmployeeById(id);
}

export function deleteEmployee(id: number): boolean {
  const result = getDb().prepare('DELETE FROM employees WHERE id = ?').run(id);
  return result.changes > 0;
}