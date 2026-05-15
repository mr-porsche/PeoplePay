import type Database from "better-sqlite3";
import type {
  Employee,
  PaginatedEmployees,
  EmployeeFilters,
} from "@peoplepay/shared";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "../utils/validation";
import { COUNTRIES, DEPARTMENTS, JOB_TITLES } from "../utils/seeding_data/data";

export class EmployeeModel {
  constructor(private db: Database.Database) {}

  findAll(filters: EmployeeFilters = {}): PaginatedEmployees {
    const {
      country,
      department,
      job_title,
      status = "active",
      search,
      page = 1,
      pageSize = 50,
      sortBy = "full_name",
      sortOrder = "asc",
    } = filters;

    const safePage = page > 0 ? page : 1;
    const safePageSize = pageSize > 0 ? pageSize : 50;
    const offset = (safePage - 1) * safePageSize;

    const allowedSortCols = new Set([
      "full_name",
      "email",
      "job_title",
      "department",
      "country",
      "salary",
      "hire_date",
      "status",
      "created_at",
    ]);
    const safeSort = allowedSortCols.has(sortBy ?? "") ? sortBy : "full_name";
    const safeOrder = sortOrder?.toLowerCase() === "desc" ? "DESC" : "ASC";

    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    if (status) {
      conditions.push("status = @status");
      params.status = status;
    }
    if (country) {
      conditions.push("country = @country");
      params.country = country;
    }
    if (department) {
      conditions.push("department = @department");
      params.department = department;
    }
    if (job_title) {
      conditions.push("job_title = @job_title");
      params.job_title = job_title;
    }
    if (search) {
      conditions.push(
        "(full_name LIKE @search OR email LIKE @search OR job_title LIKE @search)",
      );
      params.search = `%${search}%`;
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const total = (
      this.db
        .prepare(`SELECT COUNT(*) as count FROM employees ${where}`)
        .get(params) as {
        count: number;
      }
    ).count;

    const rows = this.db
      .prepare(
        `SELECT * FROM employees ${where} ORDER BY ${safeSort} ${safeOrder} LIMIT @limit OFFSET @offset`,
      )
      .all({ ...params, limit: safePageSize, offset }) as Employee[];

    return {
      data: rows,
      total,
      page: safePage,
      pageSize: safePageSize,
      totalPages: Math.ceil(total / safePageSize),
    };
  }

  findById(id: number): Employee | undefined {
    return this.db.prepare("SELECT * FROM employees WHERE id = ?").get(id) as
      | Employee
      | undefined;
  }

  findByEmail(email: string): Employee | undefined {
    return this.db
      .prepare("SELECT * FROM employees WHERE email = ?")
      .get(email) as Employee | undefined;
  }

  create(input: CreateEmployeeInput): Employee {
    const payload = {
      ...input,
      currency: input.currency ?? "USD",
      hire_date: input.hire_date ?? new Date().toISOString().slice(0, 10),
      status: input.status ?? "active",
    };

    const result = this.db
      .prepare(
        `
      INSERT INTO employees
        (full_name, email, job_title, department, country, salary, currency, hire_date, status)
      VALUES
        (@full_name, @email, @job_title, @department, @country, @salary, @currency, @hire_date, @status)
    `,
      )
      .run(payload);

    return this.findById(result.lastInsertRowid as number)!;
  }

  update(id: number, input: UpdateEmployeeInput): Employee | undefined {
    const current = this.findById(id);
    if (!current) return undefined;

    const fields = Object.keys(input) as (keyof UpdateEmployeeInput)[];
    if (fields.length === 0) return current;

    const setClauses = fields.map((f) => `${f} = @${f}`).join(", ");
    const params = { ...input, id };

    this.db
      .prepare(
        `
      UPDATE employees
      SET ${setClauses}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
      WHERE id = @id
    `,
      )
      .run(params);

    return this.findById(id)!;
  }

  delete(id: number): boolean {
    return (
      this.db.prepare("DELETE FROM employees WHERE id = ?").run(id).changes > 0
    );
  }

  distinctCountries(): string[] {
    return (
      this.db
        .prepare(
          "SELECT DISTINCT country FROM employees WHERE status = 'active' ORDER BY country",
        )
        .all() as { country: string }[]
    ).map((r) => r.country);
  }

  distinctDepartments(): string[] {
    return (
      this.db
        .prepare(
          "SELECT DISTINCT department FROM employees WHERE status = 'active' ORDER BY department",
        )
        .all() as { department: string }[]
    ).map((r) => r.department);
  }

  distinctJobTitles(): string[] {
    return (
      this.db
        .prepare(
          "SELECT DISTINCT job_title FROM employees WHERE status = 'active' ORDER BY job_title",
        )
        .all() as { job_title: string }[]
    ).map((r) => r.job_title);
  }

  seedFromPairs(pairs: { full_name: string; warned: boolean }[]): number {
    // const { JOB_TITLES, DEPARTMENTS, COUNTRIES } =
    //   require("../data/seeding_data/data") as {
    //     JOB_TITLES: string[];
    //     DEPARTMENTS: string[];
    //     COUNTRIES: {
    //       name: string;
    //       salaryRange: [number, number];
    //       currency: string;
    //     }[];
    //   };

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

    function generateEmail(fullName: string, index: number): string {
      const clean = fullName
        .toLowerCase()
        .replace(/\s+/g, ".")
        .replace(/[^a-z.]/g, "");
      const domains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "company.io",
        "work.co",
      ];
      return `${clean}.${index}@${pick(domains)}`;
    }

    const insert = this.db.prepare(`
    INSERT OR IGNORE INTO employees
      (full_name, email, job_title, department, country, salary, currency, hire_date, status)
    VALUES
      (@full_name, @email, @job_title, @department, @country, @salary, @currency, @hire_date, @status)
  `);

    const BATCH_SIZE = 500;
    let inserted = 0;

    const insertMany = this.db.transaction((rows: object[]) => {
      for (const row of rows) insert.run(row);
    });

    let batch: object[] = [];

    for (let i = 0; i < pairs.length; i++) {
      const country = pick(COUNTRIES);
      batch.push({
        full_name: pairs[i].full_name,
        email: generateEmail(pairs[i].full_name, i),
        job_title: pick(JOB_TITLES),
        department: pick(DEPARTMENTS),
        country: country.name,
        salary: randInt(...country.salaryRange),
        currency: country.currency,
        hire_date: randDate(),
        status: Math.random() > 0.1 ? "active" : "inactive",
      });

      if (batch.length === BATCH_SIZE) {
        insertMany(batch);
        inserted += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      insertMany(batch);
      inserted += batch.length;
    }

    return inserted;
  }
}
