import { Router, type Request, type Response } from "express";
import { EmployeeModel } from "../models/employee.model";
import {
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  EmployeeFiltersSchema,
} from "../utils/validation";
import {
  SeedRecord,
  parseTxtPair,
  parseTxtColumns,
} from "../utils/seed/parser";
import {
  employeeOperationsTotal,
  seedOperationsTotal,
  seedRecordsTotal,
} from "../observability/metrics";

export function employeeRouter(model: EmployeeModel): Router {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    const parsed = EmployeeFiltersSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    res.json(model.findAll(parsed.data));
  });

  router.get("/meta", (_req: Request, res: Response) => {
    res.json({
      countries: model.distinctCountries(),
      departments: model.distinctDepartments(),
      jobTitles: model.distinctJobTitles(),
    });
  });

  router.get("/:id", (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const employee = model.findById(id);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.json({ data: employee });
  });

  router.post("/", (req: Request, res: Response) => {
    const parsed = CreateEmployeeSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const existing = model.findByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ error: "Email already exists" });
      return;
    }

    const employee = model.create(parsed.data);
    res.status(201).json({ data: employee });
    employeeOperationsTotal.inc({ operation: "create" });
  });

  router.patch("/:id", (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const parsed = UpdateEmployeeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const employee = model.update(id, parsed.data);
    if (!employee) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.json({ data: employee });
    employeeOperationsTotal.inc({ operation: "update" });
  });

  router.delete("/:id", (req: Request<{ id: string }>, res: Response) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const deleted = model.delete(id);
    if (!deleted) {
      res.status(404).json({ error: "Employee not found" });
      return;
    }
    res.status(204).send();
    employeeOperationsTotal.inc({ operation: "delete" });
  });

  // POST /api/employees/seed
  router.post("/seed", async (req: Request, res: Response) => {
    try {
      const {
        format = "txt_pair",
        fillMissing = true,
        firstNames,
        lastNames,
        columns,
        records,
      } = req.body as {
        format?: string;
        fillMissing?: boolean;
        firstNames?: string[];
        lastNames?: string[];
        columns?: Record<string, string[]>;
        records?: SeedRecord[];
      };

      const { seedRecords } = await import("../utils/seed/seeder");

      let parsed: { records: SeedRecord[]; warnings: string[] };

      switch (format) {
        case "txt_pair":
          if (!firstNames || !lastNames) {
            res
              .status(400)
              .json({ error: "firstNames and lastNames are required" });
            return;
          }
          parsed = parseTxtPair(firstNames.join("\n"), lastNames.join("\n"));
          break;

        case "txt_columns":
          if (!columns || typeof columns !== "object") {
            res.status(400).json({ error: "columns object is required" });
            return;
          }
          parsed = parseTxtColumns(
            Object.fromEntries(
              Object.entries(columns).map(([k, v]) => [k, v.join("\n")]),
            ),
          );
          break;

        case "txt_full":
        case "csv":
        case "json":
        case "excel":
          if (!records || !Array.isArray(records) || records.length === 0) {
            res
              .status(400)
              .json({ error: "records array is required for this format" });
            return;
          }
          parsed = { records, warnings: [] };
          break;

        default:
          res.status(400).json({ error: `Unknown format: ${format}` });
          return;
      }

      if (parsed.records.length === 0) {
        res
          .status(400)
          .json({ error: "No records to seed", warnings: parsed.warnings });
        return;
      }

      const result = seedRecords(model.db, parsed.records, fillMissing);

      res.status(201).json({
        seeded: result.inserted,
        skipped: result.skipped,
        warnings: parsed.warnings.length > 0 ? parsed.warnings : undefined,
        message: `Seeded ${result.inserted} employees (${result.skipped} skipped as duplicates)`,
      });

      seedOperationsTotal.inc({ format, status: "success" });
      seedRecordsTotal.inc({ format }, result.inserted);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Seed failed";
      res.status(500).json({ error: message });
      seedOperationsTotal.inc({
        format: req.body?.format ?? "unknown",
        status: "error",
      });
    }
  });

  return router;
}
