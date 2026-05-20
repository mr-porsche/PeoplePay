#!/usr/bin/env node
/**
 * Webhook receiver for Alertmanager.
 * Receives alert payloads and runs the appropriate runbook script.
 *
 * Industry standard: every alert has a runbook — automated or documented steps
 * that tell the on-call engineer exactly what to do.
 */

import { fs } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "../logs/alerts.log");

fs.mkdirSync(path.join(__dirname, "../logs"), { recursive: true });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  fs.appendFileSync(LOG_FILE, line);
}

function runRunbook(alertName, severity) {
  const script = path.join(__dirname, `runbooks/${alertName}.sh`);

  if (!fs.existsSync(script)) {
    log(`No runbook found for ${alertName} — manual intervention required`);
    return;
  }

  log(`Running runbook: ${script}`);
  exec(`bash "${script}"`, (err, stdout, stderr) => {
    if (err) {
      log(`Runbook ${alertName} failed: ${err.message}`);
      log(`stderr: ${stderr}`);
      return;
    }
    log(`Runbook ${alertName} completed: ${stdout}`);
  });
}

const server = http.createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/webhook") {
    res.writeHead(404);
    res.end();
    return;
  }

  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });
  req.on("end", () => {
    try {
      const payload = JSON.parse(body);

      for (const alert of payload.alerts ?? []) {
        const alertName = alert.labels?.alertname ?? "Unknown";
        const severity = alert.labels?.severity ?? "unknown";
        const status = alert.status; // firing | resolved

        log(
          `Alert ${status.toUpperCase()}: ${alertName} [${severity}] — ${alert.annotations?.summary ?? ""}`,
        );

        if (status === "firing") {
          runRunbook(alertName, severity);
        } else {
          log(`Alert resolved: ${alertName}`);
        }
      }

      res.writeHead(200);
      res.end("ok");
    } catch (e) {
      log(`Failed to parse webhook payload: ${e.message}`);
      res.writeHead(400);
      res.end("bad request");
    }
  });
});

server.listen(9999, () => {
  log("Webhook server listening on :9999");
});
