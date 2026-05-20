import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from "prom-client";

// ── Registry ──────────────────────────────────────────────────────────────────
export const register = new Registry();
register.setDefaultLabels({ app: "peoplepay" });

// Collect default Node.js metrics (event loop, GC, memory, CPU)
collectDefaultMetrics({ register });

// ── RED Method metrics ────────────────────────────────────────────────────────

/**
 * Rate — total HTTP requests by method, route, status
 */
export const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

/**
 * Duration — request latency histogram (p50, p95, p99)
 * Buckets in seconds: 10ms, 50ms, 100ms, 250ms, 500ms, 1s, 2.5s, 5s
 */
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

/**
 * Active requests in flight
 */
export const httpRequestsInFlight = new Gauge({
  name: "http_requests_in_flight",
  help: "Number of HTTP requests currently being processed",
  registers: [register],
});

// ── Business metrics ──────────────────────────────────────────────────────────

/**
 * Employee operations
 */
export const employeeOperationsTotal = new Counter({
  name: "employee_operations_total",
  help: "Total employee CRUD operations",
  labelNames: ["operation"], // create, update, delete, seed
  registers: [register],
});

/**
 * Seed operations
 */
export const seedOperationsTotal = new Counter({
  name: "seed_operations_total",
  help: "Total seed operations",
  labelNames: ["format", "status"], // format: csv/json/txt, status: success/error
  registers: [register],
});

export const seedRecordsTotal = new Counter({
  name: "seed_records_total",
  help: "Total records seeded",
  labelNames: ["format"],
  registers: [register],
});

/**
 * DB query duration
 */
export const dbQueryDuration = new Histogram({
  name: "db_query_duration_seconds",
  help: "SQLite query duration in seconds",
  labelNames: ["operation"], // findAll, findById, create, update, delete
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5],
  registers: [register],
});

/**
 * Total employees in DB (gauge — can go up or down)
 */
export const employeeTotalGauge = new Gauge({
  name: "employee_total",
  help: "Total number of employees in the database",
  registers: [register],
});
