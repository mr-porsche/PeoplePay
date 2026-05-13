import type Database from 'better-sqlite3';
import type { CountryStat, JobTitleStat, DepartmentStat, InsightsSummary } from '@peoplepay/shared';

export class InsightsModel {
  constructor(private db: Database.Database) {}

  getSummary(): InsightsSummary {
    return this.db
      .prepare(
        `
        SELECT
          COUNT(*)                   AS total_employees,
          COUNT(DISTINCT country)    AS total_countries,
          COUNT(DISTINCT department) AS total_departments,
          ROUND(AVG(salary), 2)      AS global_avg_salary,
          MIN(salary)                AS global_min_salary,
          MAX(salary)                AS global_max_salary
        FROM employees
        WHERE status = 'active'
      `,
      )
      .get() as InsightsSummary;
  }

  getByCountry(): CountryStat[] {
    return this.db
      .prepare(
        `
        WITH ranked AS (
          SELECT
            country,
            salary,
            ROW_NUMBER() OVER (PARTITION BY country ORDER BY salary) AS rn,
            COUNT(*) OVER (PARTITION BY country) AS cnt
          FROM employees
          WHERE status = 'active'
        )
        SELECT
          country,
          COUNT(*) AS headcount,
          MIN(salary) AS min_salary,
          MAX(salary) AS max_salary,
          ROUND(AVG(salary), 2) AS avg_salary,
          ROUND((SELECT AVG(salary) FROM ranked r2
                WHERE r2.country = r1.country
                  AND r2.rn IN (CAST(FLOOR((r1.cnt - 1) * 0.25 + 1) AS INT),
                                CAST(CEIL((r1.cnt - 1)  * 0.25 + 1) AS INT))), 2) AS p25_salary,
          ROUND((SELECT AVG(salary) FROM ranked r2
                WHERE r2.country = r1.country
                  AND r2.rn IN (CAST(FLOOR((r1.cnt - 1) * 0.50 + 1) AS INT),
                                CAST(CEIL((r1.cnt - 1)  * 0.50 + 1) AS INT))), 2) AS p50_salary,
          ROUND((SELECT AVG(salary) FROM ranked r2
                WHERE r2.country = r1.country
                  AND r2.rn IN (CAST(FLOOR((r1.cnt - 1) * 0.75 + 1) AS INT),
                                CAST(CEIL((r1.cnt - 1)  * 0.75 + 1) AS INT))), 2) AS p75_salary,
          ROUND((SELECT AVG(salary) FROM ranked r2
                WHERE r2.country = r1.country
                  AND r2.rn IN (CAST(FLOOR((r1.cnt - 1) * 0.90 + 1) AS INT),
                                CAST(CEIL((r1.cnt - 1)  * 0.90 + 1) AS INT))), 2) AS p90_salary
        FROM ranked r1
        GROUP BY country
        ORDER BY avg_salary DESC
      `,
      )
      .all() as CountryStat[];
  }

  getByJobAndCountry(country?: string): JobTitleStat[] {
    const where = country ? 'WHERE status = ? AND country = ?' : 'WHERE status = ?';
    const params = country ? ['active', country] : ['active'];

    return this.db
      .prepare(
        `
        SELECT
          job_title,
          country,
          COUNT(*)               AS headcount,
          ROUND(AVG(salary), 2)  AS avg_salary,
          MIN(salary)            AS min_salary,
          MAX(salary)            AS max_salary
        FROM employees
        ${where}
        GROUP BY job_title, country
        ORDER BY country, avg_salary DESC
      `,
      )
      .all(...params) as JobTitleStat[];
  }

  getByDepartment(country?: string): DepartmentStat[] {
    const where = country ? "WHERE status = 'active' AND country = ?" : "WHERE status = 'active'";
    const params = country ? [country] : [];

    return this.db
      .prepare(
        `
        SELECT
          department,
          COUNT(*) AS headcount, country,
          ROUND(AVG(salary), 2) AS avg_salary,
          MIN(salary) AS min_salary,
          MAX(salary) AS max_salary
        FROM employees
        ${where}
        GROUP BY department
        ORDER BY avg_salary DESC
      `,
      )
      .all(...params) as DepartmentStat[];
  }
}
