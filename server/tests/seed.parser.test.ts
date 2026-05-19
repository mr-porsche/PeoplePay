import { describe, it, expect } from "vitest";
import {
  parseTxtPair,
  parseTxtColumns,
  parseTxtFull,
  parseCsv,
  parseJson,
  MAX_RECORDS,
} from "../src/utils/seed/parser";

// ── parseTxtPair ──────────────────────────────────────────────────────────────
describe("parseTxtPair", () => {
  it("pairs names by index", () => {
    const { records } = parseTxtPair(
      "James\nMary\nRobert",
      "Smith\nJohnson\nWilliams",
    );
    expect(records[0].full_name).toBe("James Smith");
    expect(records[1].full_name).toBe("Mary Johnson");
    expect(records[2].full_name).toBe("Robert Williams");
  });

  it("fills Unknown when first name missing", () => {
    const { records, warnings } = parseTxtPair("James", "Smith\nJohnson");
    expect(records[1].full_name).toBe("Unknown Johnson");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("fills Unknown when last name missing", () => {
    const { records, warnings } = parseTxtPair("James\nMary", "Smith");
    expect(records[1].full_name).toBe("Mary Unknown");
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("truncates to MAX_RECORDS", () => {
    const big = Array.from(
      { length: MAX_RECORDS + 100 },
      (_, i) => `Name${i}`,
    ).join("\n");
    const { records, warnings } = parseTxtPair(big, big);
    expect(records.length).toBe(MAX_RECORDS);
    expect(warnings.some((w) => w.includes("truncated"))).toBe(true);
  });

  it("sets first_name and last_name separately", () => {
    const { records } = parseTxtPair("Alice", "Brown");
    expect(records[0].first_name).toBe("Alice");
    expect(records[0].last_name).toBe("Brown");
  });
});

// ── parseTxtColumns ───────────────────────────────────────────────────────────
describe("parseTxtColumns", () => {
  it("combines first and last name columns", () => {
    const { records } = parseTxtColumns({
      first_name: "Alice\nBob",
      last_name: "Smith\nJones",
    });
    expect(records[0].full_name).toBe("Alice Smith");
    expect(records[1].full_name).toBe("Bob Jones");
  });

  it("picks up optional columns", () => {
    const { records } = parseTxtColumns({
      first_name: "Alice",
      last_name: "Smith",
      email: "alice@test.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "India",
      salary: "80000",
      currency: "USD",
      hire_date: "2023-01-01",
      status: "active",
    });
    expect(records[0].email).toBe("alice@test.com");
    expect(records[0].job_title).toBe("Engineer");
    expect(records[0].salary).toBe(80000);
    expect(records[0].status).toBe("active");
  });

  it("returns error when no name column provided", () => {
    const { records, warnings } = parseTxtColumns({ email: "a@b.com" });
    expect(records.length).toBe(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("handles mismatched column lengths", () => {
    const { records } = parseTxtColumns({
      first_name: "Alice\nBob\nCharlie",
      last_name: "Smith",
    });
    expect(records.length).toBe(3);
    expect(records[1].full_name).toBe("Bob Unknown");
  });
});

// ── parseTxtFull ──────────────────────────────────────────────────────────────
describe("parseTxtFull", () => {
  it("parses tab-separated full rows", () => {
    const content =
      "Jane Doe\tjane@test.com\tEngineer\tEngineering\tIndia\t80000\tUSD\t2023-01-01\tactive";
    const { records } = parseTxtFull(content);
    expect(records[0].full_name).toBe("Jane Doe");
    expect(records[0].email).toBe("jane@test.com");
    expect(records[0].salary).toBe(80000);
    expect(records[0].status).toBe("active");
  });

  it("parses name-only lines (2 words)", () => {
    const { records } = parseTxtFull("James Smith\nMary Jones");
    expect(records[0].full_name).toBe("James Smith");
    expect(records[1].full_name).toBe("Mary Jones");
    expect(records[0].email).toBeUndefined();
  });

  it("skips header row when detected", () => {
    const content = "name email job_title\nJane Doe\tjane@test.com\tEngineer";
    const { records } = parseTxtFull(content);
    expect(records.length).toBe(1);
    expect(records[0].full_name).toBe("Jane Doe");
  });

  it("truncates to MAX_RECORDS", () => {
    const content = Array.from(
      { length: MAX_RECORDS + 10 },
      (_, i) => `First${i} Last${i}`,
    ).join("\n");
    const { records } = parseTxtFull(content);
    expect(records.length).toBe(MAX_RECORDS);
  });
});

// ── parseCsv ──────────────────────────────────────────────────────────────────
describe("parseCsv", () => {
  it("parses standard CSV", () => {
    const csv = `full_name,email,job_title,department,country,salary,currency,hire_date,status
Jane Doe,jane@test.com,Engineer,Engineering,India,80000,USD,2023-01-01,active
Bob Smith,bob@test.com,Designer,Design,USA,90000,USD,2023-02-01,active`;
    const { records } = parseCsv(csv);
    expect(records.length).toBe(2);
    expect(records[0].full_name).toBe("Jane Doe");
    expect(records[1].country).toBe("USA");
  });

  it("handles column name aliases", () => {
    const csv = `name,mail,title,dept,location,pay\nJane Doe,jane@test.com,Engineer,Engineering,India,80000`;
    const { records } = parseCsv(csv);
    expect(records[0].full_name).toBe("Jane Doe");
    expect(records[0].email).toBe("jane@test.com");
    expect(records[0].job_title).toBe("Engineer");
  });

  it("builds full_name from first_name + last_name columns", () => {
    const csv = `first_name,last_name,email\nAlice,Smith,alice@test.com`;
    const { records } = parseCsv(csv);
    expect(records[0].full_name).toBe("Alice Smith");
  });

  it("truncates to MAX_RECORDS", () => {
    const header = "full_name,email\n";
    const rows = Array.from(
      { length: MAX_RECORDS + 5 },
      (_, i) => `Name${i},u${i}@test.com`,
    ).join("\n");
    const { records, warnings } = parseCsv(header + rows);
    expect(records.length).toBe(MAX_RECORDS);
    expect(warnings.some((w) => w.includes("truncated"))).toBe(true);
  });

  it("returns warning when no data rows", () => {
    const { records, warnings } = parseCsv("full_name,email");
    expect(records.length).toBe(0);
    expect(warnings.length).toBeGreaterThan(0);
  });
});

// ── parseJson ─────────────────────────────────────────────────────────────────
describe("parseJson", () => {
  it("parses a JSON array", () => {
    const json = JSON.stringify([
      { full_name: "Jane Doe", email: "jane@test.com", job_title: "Engineer" },
    ]);
    const { records } = parseJson(json);
    expect(records[0].full_name).toBe("Jane Doe");
    expect(records[0].job_title).toBe("Engineer");
  });

  it("parses { data: [] } wrapper", () => {
    const json = JSON.stringify({
      data: [{ full_name: "Bob", email: "bob@test.com" }],
    });
    const { records } = parseJson(json);
    expect(records.length).toBe(1);
    expect(records[0].full_name).toBe("Bob");
  });

  it("returns warning on invalid JSON", () => {
    const { records, warnings } = parseJson("not json at all");
    expect(records.length).toBe(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("returns warning on empty array", () => {
    const { records, warnings } = parseJson("[]");
    expect(records.length).toBe(0);
    expect(warnings.length).toBeGreaterThan(0);
  });

  it("truncates to MAX_RECORDS", () => {
    const arr = Array.from({ length: MAX_RECORDS + 10 }, (_, i) => ({
      full_name: `N${i}`,
      email: `u${i}@t.com`,
    }));
    const { records, warnings } = parseJson(JSON.stringify(arr));
    expect(records.length).toBe(MAX_RECORDS);
    expect(warnings.some((w) => w.includes("truncated"))).toBe(true);
  });
});
