#!/bin/bash
# Runbook: APIDown
# Trigger: No metrics from PeoplePay server for 2 minutes
# Severity: Critical
# Action: Attempt to restart the server container

set -euo pipefail

LOG="$(dirname "$0")/../logs/runbook-APIDown.log"
echo "[$(date -u +%Y-%M-%dT%H:%M:%SZ)] APIDown runbook triggered" | tee -a "$LOG"

# Step 1: Check if container is running
if docker inspect peoplepay-server &>/dev/null; then
  STATUS=$(docker inspect --format='{{.State.Status}}' peoplepay-server)
  echo "Container status: $STATUS" | tee -a "$LOG"

  if [ "$STATUS" != "running" ]; then
    echo "Container not running — attempting restart..." | tee -a "$LOG"
    docker start peoplepay-server
    sleep 5

    # Step 2: Verify health
    if curl -sf http://localhost:3001/health &>/dev/null; then
      echo "✅ Server recovered after restart" | tee -a "$LOG"
    else
      echo "❌ Server failed to recover — manual intervention required" | tee -a "$LOG"
      exit 1
    fi
  else
    echo "Container is running but not responding — checking logs..." | tee -a "$LOG"
    docker logs --tail=50 peoplepay-server 2>&1 | tee -a "$LOG"
  fi
else
  echo "Container does not exist — running docker compose up..." | tee -a "$LOG"
  cd "$(dirname "$0")/../../.."
  docker compose up -d server
fi

echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] APIDown runbook completed" | tee -a "$LOG"