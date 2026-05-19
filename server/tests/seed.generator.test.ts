import { describe, it, expect } from "vitest";
import { generateEmployee } from "../src/utils/seed/generator";

describe("generateEmployee", () => {
  it("uses provided values when available", () => {
    const rec = {
      full_name: "Jane Doe",
      email: "jane@test.com",
      job_title: "Engineer",
      department: "Engineering",
      country: "India",
      salary: 80000,
      currency: "INR",
      hire_date: "2023-01-01",
      status: "active" as const,
    };
    const emp = generateEmployee(rec, 0, false);
    expect(emp.full_name).toBe("Jane Doe");
    expect(emp.email).toBe("jane@test.com");
    expect(emp.salary).toBe(80000);
    expect(emp.status).toBe("active");
  });

  it("fills missing fields randomly when fillMissing=true", () => {
    const emp = generateEmployee({ full_name: "Jane Doe" }, 0, true);
    expect(emp.job_title).not.toBe("Unknown");
    expect(emp.department).not.toBe("Unknown");
    expect(emp.country).not.toBe("Unknown");
    expect(emp.salary).toBeGreaterThan(0);
  });

  it("uses Unknown defaults when fillMissing=false", () => {
    const emp = generateEmployee({ full_name: "Jane Doe" }, 0, false);
    expect(emp.job_title).toBe("Unknown");
    expect(emp.department).toBe("Unknown");
    expect(emp.country).toBe("Unknown");
    expect(emp.salary).toBe(0);
  });

  it("generates email from full_name when not provided", () => {
    const emp = generateEmployee({ full_name: "Jane Doe" }, 0, false);
    expect(emp.email).toContain("jane.doe");
  });

  it("builds full_name from first_name + last_name when full_name missing", () => {
    const emp = generateEmployee(
      { first_name: "Alice", last_name: "Brown" },
      0,
      false,
    );
    expect(emp.full_name).toBe("Alice Brown");
  });

  it("defaults status to active", () => {
    const emp = generateEmployee({ full_name: "Test User" }, 0, false);
    expect(emp.status).toBe("active");
  });

  it("generates valid hire_date when fillMissing=true", () => {
    const emp = generateEmployee({ full_name: "Test User" }, 0, true);
    expect(emp.hire_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
