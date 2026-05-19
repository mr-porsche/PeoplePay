import type Database from "better-sqlite3";
import type { SeedRecord } from "./parser";
import { generateEmployee } from "./generator";

const BATCH_SIZE = 500;

export interface SeedResult {
  inserted: number;
  skipped: number;
}

export function seedRecords(
  db: Database.Database,
  records: SeedRecord[],
  fillMissing: boolean,
): SeedResult {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO employees
      (full_name, email, job_title, department, country, salary, currency, hire_date, status)
    VALUES
      (@full_name, @email, @job_title, @department, @country, @salary, @currency, @hire_date, @status)
  `);

  const insertBatch = db.transaction((batch: object[]) => {
    for (const row of batch) stmt.run(row);
  });

  let inserted = 0;
  let batch: object[] = [];

  for (let i = 0; i < records.length; i++) {
    batch.push(generateEmployee(records[i], i, fillMissing));

    if (batch.length === BATCH_SIZE) {
      const before = countRows(db);
      insertBatch(batch);
      inserted += countRows(db) - before;
      batch = [];
    }
  }

  if (batch.length > 0) {
    const before = countRows(db);
    insertBatch(batch);
    inserted += countRows(db) - before;
  }

  return { inserted, skipped: records.length - inserted };
}

function countRows(db: Database.Database): number {
  return (
    db.prepare("SELECT COUNT(*) as c FROM employees").get() as { c: number }
  ).c;
}
