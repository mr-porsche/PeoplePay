import { COUNTRIES, DEPARTMENTS, JOB_TITLES } from "./data";
import type { SeedRecord } from "./parser";

export interface GeneratedEmployee {
  full_name: string;
  email: string;
  job_title: string;
  department: string;
  country: string;
  salary: number;
  currency: string;
  hire_date: string;
  status: "active" | "inactive";
}

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
    "corp.net",
  ];
  return `${clean}.${index}@${pick(domains)}`;
}

/**
 * Converts a SeedRecord into a complete GeneratedEmployee.
 * Missing fields are filled randomly if fillMissing=true, otherwise use safe defaults.
 */
export function generateEmployee(
  record: SeedRecord,
  index: number,
  fillMissing: boolean,
): GeneratedEmployee {
  const fullName =
    record.full_name ??
    `${record.first_name ?? "Unknown"} ${record.last_name ?? "Unknown"}`;

  const country = fillMissing ? pick(COUNTRIES) : null;

  return {
    full_name: fullName,
    email: record.email ?? generateEmail(fullName, index),
    job_title: record.job_title ?? (fillMissing ? pick(JOB_TITLES) : "Unknown"),
    department:
      record.department ?? (fillMissing ? pick(DEPARTMENTS) : "Unknown"),
    country: record.country ?? (fillMissing ? country!.name : "Unknown"),
    salary: record.salary ?? (fillMissing ? randInt(...country!.range) : 0),
    currency: record.currency ?? (fillMissing ? country!.currency : "USD"),
    hire_date:
      record.hire_date ??
      (fillMissing ? randDate() : new Date().toISOString().slice(0, 10)),
    status: record.status ?? "active",
  };
}
