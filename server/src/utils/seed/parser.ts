import * as XLSX from "xlsx";

export const MAX_RECORDS = 15_000;

export interface SeedRecord {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
  department?: string;
  country?: string;
  salary?: number;
  currency?: string;
  hire_date?: string;
  status?: "active" | "inactive";
}

export interface ParseResult {
  records: SeedRecord[];
  warnings: string[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function lines(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function cap(arr: SeedRecord[], warn: string[]): ParseResult {
  if (arr.length > MAX_RECORDS) {
    warn.push(
      `${arr.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
    return { records: arr.slice(0, MAX_RECORDS), warnings: warn };
  }
  return { records: arr, warnings: warn };
}

function normaliseSalary(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? undefined : n;
}

function normaliseStatus(
  raw: string | undefined,
): "active" | "inactive" | undefined {
  if (!raw) return undefined;
  return raw.trim().toLowerCase() === "inactive" ? "inactive" : "active";
}

/**
 * Map a raw key-value row (from CSV/JSON/Excel) to a SeedRecord.
 * Handles common column name variations.
 */
function mapRow(row: Record<string, string>): SeedRecord {
  const get = (...aliases: string[]): string | undefined => {
    for (const alias of aliases) {
      const key = Object.keys(row).find(
        (k) =>
          k.toLowerCase().replace(/[\s_\-]/g, "") ===
          alias.toLowerCase().replace(/[\s_\-]/g, ""),
      );
      if (key && row[key]?.trim()) return row[key].trim();
    }
    return undefined;
  };

  const firstName = get("firstname", "first_name", "first");
  const lastName = get("lastname", "last_name", "last");
  const fullName =
    get("fullname", "full_name", "name") ??
    (firstName && lastName ? `${firstName} ${lastName}` : undefined);

  return {
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    email: get("email", "emailaddress", "mail"),
    job_title: get("jobtitle", "job_title", "title", "position", "role"),
    department: get("department", "dept", "team", "division"),
    country: get("country", "location", "region"),
    salary: normaliseSalary(get("salary", "pay", "compensation")),
    currency: get("currency", "curr"),
    hire_date: get(
      "hiredate",
      "hire_date",
      "startdate",
      "start_date",
      "joined",
    ),
    status: normaliseStatus(get("status", "employmentstatus")),
  };
}

// ── Public parsers ────────────────────────────────────────────────────────────

/**
 * A: Two separate name files — paired by line index.
 * first_names.txt + last_names.txt
 */
export function parseTxtPair(
  firstContent: string,
  lastContent: string,
): ParseResult {
  const firsts = lines(firstContent);
  const lasts = lines(lastContent);
  const maxLen = Math.max(firsts.length, lasts.length);
  const warn: string[] = [];
  const records: SeedRecord[] = [];

  const limit = Math.min(maxLen, MAX_RECORDS);
  if (maxLen > MAX_RECORDS) {
    warn.push(
      `${maxLen.toLocaleString()} name pairs found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  for (let i = 0; i < limit; i++) {
    const first = firsts[i]?.trim();
    const last = lasts[i]?.trim();
    if (!first) warn.push(`Row ${i + 1}: missing first name — used 'Unknown'`);
    if (!last) warn.push(`Row ${i + 1}: missing last name  — used 'Unknown'`);
    records.push({
      first_name: first ?? "Unknown",
      last_name: last ?? "Unknown",
      full_name: `${first ?? "Unknown"} ${last ?? "Unknown"}`,
    });
  }

  return { records, warnings: warn };
}

/**
 * B: Separate txt file per column.
 * Keys: first_name, last_name, email, job_title, department,
 *       country, salary, currency, hire_date, status
 */
export function parseTxtColumns(files: Record<string, string>): ParseResult {
  const columns: Record<string, string[]> = {};
  for (const [key, content] of Object.entries(files)) {
    columns[key] = lines(content);
  }

  const maxLen = Math.max(...Object.values(columns).map((a) => a.length), 0);
  const warn: string[] = [];
  const records: SeedRecord[] = [];

  if (!columns["first_name"] && !columns["full_name"]) {
    return {
      records: [],
      warnings: ["first_name.txt or full_name.txt is required"],
    };
  }

  const limit = Math.min(maxLen, MAX_RECORDS);
  if (maxLen > MAX_RECORDS) {
    warn.push(
      `${maxLen.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  for (let i = 0; i < limit; i++) {
    const first = columns["first_name"]?.[i]?.trim();
    const last = columns["last_name"]?.[i]?.trim();
    const fullName =
      columns["full_name"]?.[i]?.trim() ??
      (first && last
        ? `${first} ${last}`
        : `${first ?? "Unknown"} ${last ?? "Unknown"}`);

    records.push({
      full_name: fullName,
      first_name: first,
      last_name: last,
      email: columns["email"]?.[i]?.trim() || undefined,
      job_title: columns["job_title"]?.[i]?.trim() || undefined,
      department: columns["department"]?.[i]?.trim() || undefined,
      country: columns["country"]?.[i]?.trim() || undefined,
      salary: normaliseSalary(columns["salary"]?.[i]),
      currency: columns["currency"]?.[i]?.trim() || undefined,
      hire_date: columns["hire_date"]?.[i]?.trim() || undefined,
      status: normaliseStatus(columns["status"]?.[i]),
    });
  }

  return cap(records, warn);
}

/**
 * C: Single txt file — each line has all fields.
 * Separator: tab OR 2+ spaces.
 * Column order: full_name  email  job_title  department  country  salary  currency  hire_date  status
 * Minimal: just "FirstName LastName" on each line (single-space name, no other columns).
 */
export function parseTxtFull(content: string): ParseResult {
  const rawLines = lines(content);
  const warn: string[] = [];
  const records: SeedRecord[] = [];

  // Skip header if present
  const start = rawLines[0]?.toLowerCase().replace(/\s/g, "").includes("name")
    ? 1
    : 0;
  const data = rawLines.slice(start);

  for (let i = 0; i < Math.min(data.length, MAX_RECORDS); i++) {
    const line = data[i];
    // Split on tab or 2+ consecutive spaces
    const parts = line
      .split(/\t|  +/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (parts.length === 0) continue;

    if (parts.length === 1) {
      // Only one token — could be "FirstName" without last name
      warn.push(`Row ${i + 1}: only one token found — used as full_name`);
      records.push({ full_name: parts[0] });
      continue;
    }

    if (parts.length === 2 && !parts[1].includes("@")) {
      // Two tokens, second is not email — treat as first + last name
      records.push({
        full_name: `${parts[0]} ${parts[1]}`,
        first_name: parts[0],
        last_name: parts[1],
      });
      continue;
    }

    // Full row
    const salaryRaw = parts[5];
    records.push({
      full_name: parts[0],
      email: parts[1] || undefined,
      job_title: parts[2] || undefined,
      department: parts[3] || undefined,
      country: parts[4] || undefined,
      salary: normaliseSalary(salaryRaw),
      currency: parts[6] || undefined,
      hire_date: parts[7] || undefined,
      status: normaliseStatus(parts[8]),
    });
  }

  if (data.length > MAX_RECORDS) {
    warn.push(
      `${data.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  return { records, warnings: warn };
}

/**
 * CSV: comma-separated with header row.
 */
export function parseCsv(content: string): ParseResult {
  const rawLines = content.split("\n").filter((l) => l.trim());
  if (rawLines.length < 2)
    return { records: [], warnings: ["CSV has no data rows"] };

  const headers = rawLines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const warn: string[] = [];
  const records: SeedRecord[] = [];

  const dataLines = rawLines.slice(1);

  for (let i = 0; i < Math.min(dataLines.length, MAX_RECORDS); i++) {
    const vals = dataLines[i]
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? "";
    });
    records.push(mapRow(row));
  }

  if (dataLines.length > MAX_RECORDS) {
    warn.push(
      `${dataLines.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  return cap(records, warn);
}

/**
 * JSON: array of objects OR { data: [] }.
 */
export function parseJson(content: string): ParseResult {
  const warn: string[] = [];
  let raw: unknown;

  try {
    raw = JSON.parse(content);
  } catch {
    return { records: [], warnings: ["Invalid JSON — could not parse file"] };
  }

  const rows: Record<string, string>[] = Array.isArray(raw)
    ? (raw as Record<string, string>[])
    : (((raw as Record<string, unknown>).data ?? []) as Record<
        string,
        string
      >[]);

  if (!Array.isArray(rows) || rows.length === 0) {
    return {
      records: [],
      warnings: ["JSON must be a non-empty array or { data: [] }"],
    };
  }

  const records = rows.slice(0, MAX_RECORDS).map(mapRow);

  if (rows.length > MAX_RECORDS) {
    warn.push(
      `${rows.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  return cap(records, warn);
}

/**
 * Excel: reads first sheet, maps columns same as CSV.
 */
export function parseExcel(buffer: Buffer): ParseResult {
  const warn: string[] = [];
  let rows: Record<string, string>[];

  try {
    const wb = XLSX.read(buffer, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      defval: "",
    });
  } catch {
    return { records: [], warnings: ["Could not read Excel file"] };
  }

  if (rows.length > MAX_RECORDS) {
    warn.push(
      `${rows.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
    );
  }

  return cap(rows.slice(0, MAX_RECORDS).map(mapRow), warn);
}
