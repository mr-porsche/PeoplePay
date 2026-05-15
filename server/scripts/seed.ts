import "dotenv/config";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import { runMigrations } from "../src/db/migrations";
import {
  COUNTRIES,
  DEPARTMENTS,
  JOB_TITLES,
} from "../src/utils/seeding_data/data";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────────────────────────
const BATCH_SIZE = 500;
const DB_PATH = process.env.DB_PATH ?? join(__dirname, "../data/peoplepay.db");
const WIPE_FIRST = process.argv.includes("--fresh");

// ── Load name files ───────────────────────────────────────────────────────────
function loadLines(file: string): string[] {
  return readFileSync(
    join(__dirname, "../src/utils/seeding_data", file),
    "utf-8",
  )
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function pairNames(
  firstNames: string[],
  lastNames: string[],
): { full_name: string; warned: boolean }[] {
  const maxLen = Math.max(firstNames.length, lastNames.length);
  const pairs: { full_name: string; warned: boolean }[] = [];

  for (let i = 0; i < maxLen; i++) {
    const first = firstNames[i];
    const last = lastNames[i];
    const warned = !first || !last;
    const fullName = `${first ?? "Unknown"} ${last ?? "Unknown"}`;
    pairs.push({ full_name: fullName, warned });
  }

  return pairs;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDate(startYear = 2015, endYear = 2026): string {
  const y = randInt(startYear, endYear);
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
    "corp.net",
  ];
  return `${clean}.${index}@${pick(domains)}`;
}

// function generateEmployee(index: number) {
//   const first = pick(firstNames);
//   const last = pick(lastNames);
//   const fullName = `${first} ${last}`;
//   const country = pick(COUNTRIES);
//   const salary = randInt(...country.salaryRange);
//   const status = Math.random() > 0.1 ? "active" : "inactive";

//   return {
//     full_name: fullName,
//     email: generateEmail(fullName, index),
//     job_title: pick(JOB_TITLES),
//     department: pick(DEPARTMENTS),
//     country: country.name,
//     salary,
//     currency: country.currency,
//     hire_date: randDate(),
//     status,
//   };
// }

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🌱 PeoplePay Seed Script`);
  console.log(`DB path : ${DB_PATH}`);
  console.log(`Batch : ${BATCH_SIZE}`);
  console.log(
    ` Mode : ${WIPE_FIRST ? "fresh (wipe + reseed)" : "additive (skip if exists)"}\n`,
  );

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  runMigrations();

  const existing = (
    db.prepare("SELECT COUNT(*) as count FROM employees").get() as {
      count: number;
    }
  ).count;

  if (existing > 0 && !WIPE_FIRST) {
    console.log(
      `⚠️   Database already has ${existing.toLocaleString()} employees.`,
    );
    console.log(`    Run with --fresh to wipe and reseed.\n`);
    db.close();
    return;
  }

  if (WIPE_FIRST && existing > 0) {
    console.log(`🗑️   Wiping ${existing.toLocaleString()} existing employees…`);
    db.exec("DELETE FROM employees");
    db.exec('DELETE FROM sqlite_sequence WHERE name = "employees"');
    console.log(`    Done.\n`);
  }

  // ── Load + pair names ───────────────────────────────────────────────────────
  const firstNames = loadLines("first_names.txt");
  const lastNames = loadLines("last_names.txt");
  const pairs = pairNames(firstNames, lastNames);
  const warned = pairs.filter((p) => p.warned);

  if (warned.length > 0) {
    console.log(
      `⚠️   ${warned.length} name(s) could not be fully paired — filled with 'Unknown'`,
    );
  }

  const TOTAL = pairs.length;
  console.log(`    Total    : ${TOTAL.toLocaleString()} employees to seed\n`);

  // ── Prepare insert ──────────────────────────────────────────────────────────
  const insert = db.prepare(`
    INSERT OR IGNORE INTO employees
      (full_name, email, job_title, department, country, salary, currency, hire_date, status)
    VALUES
      (@full_name, @email, @job_title, @department, @country, @salary, @currency, @hire_date, @status)
  `);

  const insertMany = db.transaction((rows: object[]) => {
    for (const row of rows) insert.run(row);
  });

  // ── Seed in batches ─────────────────────────────────────────────────────────
  const startTime = Date.now();
  let inserted = 0;
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
      const pct = Math.round((inserted / TOTAL) * 100);
      process.stdout.write(
        `\r    Progress: ${inserted.toLocaleString()} / ${TOTAL.toLocaleString()} (${pct}%)`,
      );
    }
  }

  if (batch.length > 0) {
    insertMany(batch);
    inserted += batch.length;
    process.stdout.write(
      `\r    Progress: ${inserted.toLocaleString()} / ${TOTAL.toLocaleString()} (100%)`,
    );
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(
    `\n\n✅  Seeded ${inserted.toLocaleString()} employees in ${elapsed}s\n`,
  );
  db.close();
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
