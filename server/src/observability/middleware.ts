import { Request, Response, NextFunction } from "express";
import {
  httpRequestTotal,
  httpRequestDuration,
  httpRequestsInFlight,
} from "./metrics.js";

/**
 * Express middleware that records RED metrics for every request.
 * Attach before routes.
 */
export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Normalise route — replace IDs with :id to avoid high cardinality
  // e.g. /api/employees/123 → /api/employees/:id
  const route = req.path
    .replace(/\/\d+/g, "/:id")
    .replace(/\/[a-f0-9-]{36}/g, "/:id");

  const end = httpRequestDuration.startTimer({ method: req.method, route });
  httpRequestsInFlight.inc();

  res.on("finish", () => {
    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };
    httpRequestTotal.inc(labels);
    end(labels);
    httpRequestsInFlight.dec();
  });

  next();
}
