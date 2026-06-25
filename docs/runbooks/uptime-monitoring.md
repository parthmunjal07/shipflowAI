# Uptime Monitoring & Alerting Runbook

To ensure ShipFlow AI remains highly available and that we are immediately notified of outages, we must configure synthetic monitoring.

## 1. The Health Endpoint

We have deployed a robust health check endpoint at:
`GET /api/health`

**Why this endpoint?**
It doesn't just return a 200 OK static response. It actively attempts to execute `SELECT 1` on the PostgreSQL database via Prisma. 
- If the app is up but the database is down, it returns a `503 Service Unavailable`.
- If both are up, it returns `200 OK`.

## 2. Setting Up BetterStack (UptimeRobot)

We recommend using BetterStack or UptimeRobot for synthetic monitoring.

### Steps to Configure:
1. Create an account at [BetterStack Uptime](https://betterstack.com/uptime).
2. Click **Create Monitor**.
3. **URL to monitor:** `https://your-production-domain.com/api/health`
4. **Monitor type:** HTTP(s)
5. **Pronounce as DOWN if:** Status code is NOT `200`.
6. **Check frequency:** 3 minutes (or 1 minute on paid plans).
7. **Advanced Settings (Timeout):** Set to 10 seconds. If the DB is hanging, we want it to fail quickly rather than waiting 30 seconds.

## 3. Configuring Alerting (Escalation Policies)

A monitor is useless if it doesn't wake someone up.

1. Go to **On-Call & Escalation Policies**.
2. Create a new policy: "ShipFlow Prod Outage".
3. **Level 1 (Immediate):** Send a message to the `#alerts-prod` Slack channel.
4. **Level 2 (After 5 minutes unacknowledged):** Send an automated Phone Call and SMS to the primary on-call engineer.
5. Link this escalation policy to your `api/health` monitor.

## 4. Staging Environments

You should duplicate the monitor for your Staging environment (`https://staging.your-domain.com/api/health`).
However, for staging:
- Set the Check Frequency to 10 minutes to save costs.
- **Do not** attach the paging escalation policy. Only alert via Slack (`#alerts-staging`) to prevent alert fatigue.
