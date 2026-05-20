#!/bin/bash
# Runbook: DiskSpaceCritical
# Trigger: Disk > 95% full
# Severity: Critical
# Action: Clean up Docker unused resources, logs, old DB backups

set -euo pipefail

LOG="$(dirname "$0")/../logs/runbook-DiskSpaceCritical.log"
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] DiskSpaceCritical runbook triggered" | tee -a "$LOG"

echo "=== Disk usage before cleanup ===" | tee -a "$LOG"
df -h | tee -a "$LOG"

# Step 1: Remove unused Docker resources
echo "Pruning Docker unused images, containers, volumes..." | tee -a "$LOG"
docker system prune -f --volumes 2>&1 | tee -a "$LOG"

# Step 2: Truncate large log files older than 7 days
echo "Cleaning old logs..." | tee -a "$LOG"
find /var/log -name "*.log" -mtime +7 -exec truncate -s 0 {} \; 2>/dev/null || true
find "$(dirname "$0")/../logs" -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Step 3: Rotate alert logs
ALERT_LOG="$(dirname "$0")/../logs/alerts.log"
if [ -f "$ALERT_LOG" ] && [ "$(wc -c < "$ALERT_LOG")" -gt 10485760 ]; then
  mv "$ALERT_LOG" "${ALERT_LOG}.$(date +%Y%m%d)"
  gzip "${ALERT_LOG}.$(date +%Y%m%d)"
  echo "Rotated alert log" | tee -a "$LOG"
fi

echo "=== Disk usage after cleanup ===" | tee -a "$LOG"
df -h | tee -a "$LOG"

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] DiskSpaceCritical runbook completed" | tee -a "$LOG"