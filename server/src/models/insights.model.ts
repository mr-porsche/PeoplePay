import { getDb } from '../db/database';

export interface CountryStat {
  country:        string;
  min_salary:     number;
  max_salary:     number;
  avg_salary:     number;
  employee_count: number;
}

export interface JobTitleStat {
  job_title:      string;
  avg_salary:     number;
  min_salary:     number;
  max_salary:     number;
  employee_count: number;
}

export interface DepartmentStat {
  department:     string;
  avg_salary:     number;
  min_salary:     number;
  max_salary:     number;
  employee_count: number;
}

export interface TopEarner {
  id:         number;
  full_name:  string;
  job_title:  string;
  department: string;
  country:    string;
  salary:     number;
}

export interface HeadcountStat {
  country:        string;
  employee_count: number;
}

export function getCountryStats(country?: string): CountryStat[] {
  const db = getDb();
  const where = country ? `WHERE country = ?` : '';
  const params = country ? [country] : [];

  return db.prepare(`
    SELECT
      country,
      MIN(salary)   AS min_salary,
      MAX(salary)   AS max_salary,
      AVG(salary)   AS avg_salary,
      COUNT(*)      AS employee_count
    FROM employees
    ${where}
    GROUP BY country
    ORDER BY country ASC
  `).all(...params) as CountryStat[];
}

export function getJobTitleStats(country: string): JobTitleStat[] {
  const db = getDb();

  return db.prepare(`
    SELECT
      job_title,
      AVG(salary) AS avg_salary,
      MIN(salary) AS min_salary,
      MAX(salary) AS max_salary,
      COUNT(*)    AS employee_count
    FROM employees
    WHERE country = ?
    GROUP BY job_title
    ORDER BY avg_salary DESC
  `).all(country) as JobTitleStat[];
}

export function getDepartmentStats(): DepartmentStat[] {
  const db = getDb();

  return db.prepare(`
    SELECT
      department,
      AVG(salary) AS avg_salary,
      MIN(salary) AS min_salary,
      MAX(salary) AS max_salary,
      COUNT(*)    AS employee_count
    FROM employees
    GROUP BY department
    ORDER BY avg_salary DESC
  `).all() as DepartmentStat[];
}

export function getTopEarners(limit: number = 5): TopEarner[] {
  const db = getDb();

  return db.prepare(`
    SELECT id, full_name, job_title, department, country, salary
    FROM employees
    ORDER BY salary DESC
    LIMIT ?
  `).all(limit) as TopEarner[];
}

export function getHeadcountByCountry(): HeadcountStat[] {
  const db = getDb();

  return db.prepare(`
    SELECT
      country,
      COUNT(*) AS employee_count
    FROM employees
    GROUP BY country
    ORDER BY employee_count DESC
  `).all() as HeadcountStat[];
}