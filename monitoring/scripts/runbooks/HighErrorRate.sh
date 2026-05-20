#!/bin/bash
# Runbook: HighErrorRate / CriticalErrorRate
# Trigger: Error rate > 5% (warning) or > 20% (critical)
# Action: Capture diagnostics, check recent deploys, tail logs

set -euo pipefail

LOG="$(dirname "$0")/../logs/runbook-HighErrorRate.log"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] HighErrorRate runbook triggered" | tee -a "$LOG"

# Step 1: Capture server logs for last 5 minutes
echo "=== Server logs (last 100 lines) ===" | tee -a "$LOG"
docker logs --tail=100 --since=5m peoplepay-server 2>&1 | tee -a "$LOG"

# Step 2: Check current metrics snapshot
echo "=== Current error rate from Prometheus ===" | tee -a "$LOG"
curl -sf "http://localhost:9090/api/v1/query?query=sum(rate(http_requests_total{status_code=~'5..'}[5m]))/sum(rate(http_requests_total[5m]))" \
  2>/dev/null | tee -a "$LOG" || echo "Could not reach Prometheus" | tee -a "$LOG"

# Step 3: Check if a recent deploy happened (last git commit time)
echo "=== Recent git commits ===" | tee -a "$LOG"
git -C "$(dirname "$0")/../../.." log --oneline -5 2>/dev/null | tee -a "$LOG" || true

# Step 4: If critical (>20%), attempt rolling restart
ERROR_RATE=$(curl -sf "http://localhost:9090/api/v1/query?query=sum(rate(http_requests_total{status_code=~'5..'}[5m]))/sum(rate(http_requests_total[5m]))" \
  2>/dev/null | grep -oP '"value":\[[\d.]+,"[^"]*"\]' | grep -oP '"[\d.]+"$' | tr -d '"' || echo "0")

if (( $(echo "$ERROR_RATE > 0.20" | bc -l 2>/dev/null || echo 0) )); then
  echo "Critical error rate ($ERROR_RATE) — attempting rolling restart..." | tee -a "$LOG"
  docker compose restart server 2>&1 | tee -a "$LOG"
  sleep 10

  if curl -sf http://localhost:3001/health &>/dev/null; then
    echo "✅ Server restarted successfully" | tee -a "$LOG"
  else
    echo "❌ Server restart failed — manual intervention required" | tee -a "$LOG"
  fi
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] HighErrorRate runbook completed" | tee -a "$LOG"