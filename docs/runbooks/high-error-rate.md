# Runbook: High Error Rate

## Alert

- `HighErrorRate` — error rate > 5% for 2 minutes (Warning)
- `CriticalErrorRate` — error rate > 20% for 1 minute (Critical)

## Impact

Users are receiving 5xx errors. API is degraded or down.

## Automated response

The webhook server automatically runs `HighErrorRate.sh` which:

1. Captures last 100 lines of server logs
2. Queries current error rate from Prometheus
3. If critical (>20%), attempts rolling restart of server container

## Manual steps if automated response fails

1. Check server logs:

```bash
   docker logs --tail=200 peoplepay-server
```

2. Check if a bad deploy caused it:

```bash
   git log --oneline -10
   docker images mrporsch3/peoplepay-server
```

3. Rollback to previous image:

```bash
   docker compose stop server
   docker run -d --name peoplepay-server mrporsch3/peoplepay-server:previous-sha
```

4. Check DB health:

```bash
   docker exec peoplepay-server wget -qO- http://localhost:3001/health
```

## Resolution

Alert resolves automatically when error rate drops below threshold for 5 minutes.
