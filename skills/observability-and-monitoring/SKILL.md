---
name: observability-and-monitoring
description: Use when adding logging, error tracking, metrics, or alerting to an application. Use when integrating Sentry, setting up structured logging, instrumenting a feature for production visibility, or diagnosing issues that only appear in production.
metadata:
  source: original
  note: Written from scratch for this boilerplate — not derived from a public skill repository.
---

# Observability and Monitoring

## Overview

If you can't see what your application is doing in production, you're flying blind. Observability means structured logs you can query, errors that report themselves, and metrics that tell you when something degrades before users complain. This skill covers the three pillars: logs, errors, and metrics.

## The Three Pillars

| Pillar | What it answers | Tool examples |
|--------|----------------|---------------|
| **Logs** | What happened and when | Winston, Pino, console (structured) |
| **Errors** | What went wrong and where | Sentry, Bugsnag, Rollbar |
| **Metrics** | How the system is performing | Datadog, Prometheus, Vercel Analytics |

Logs answer "what happened". Errors surface "what broke". Metrics reveal "how it's trending". You need all three.

## Structured Logging

### Log as JSON, Not Strings

```typescript
// BAD: Unstructured — not queryable, no context
console.log(`User ${userId} created task ${taskId}`);

// GOOD: Structured — every field is queryable in your log platform
logger.info('task.created', {
  userId,
  taskId,
  title: task.title,
  durationMs: Date.now() - startTime,
});
```

### Log Levels

```typescript
// Use levels consistently
logger.debug('db.query', { sql, params, durationMs });     // Dev only — high volume
logger.info('task.created', { taskId, userId });            // Normal operations
logger.warn('rate_limit.approaching', { userId, count });   // Investigate soon
logger.error('payment.failed', { userId, error: err.message, code: err.code }); // Needs action
```

**Never log at `error` for expected failures** (e.g., 404s, validation errors). Reserve `error` for unexpected failures that need investigation.

### Request Context

Every log line for a request should include a request ID so you can trace the full request lifecycle:

```typescript
// Middleware: attach a request ID to every request
import { randomUUID } from 'crypto';

app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] as string ?? randomUUID();
  res.setHeader('x-request-id', req.requestId);
  next();
});

// In route handlers
app.post('/api/tasks', async (req, res) => {
  const log = logger.child({ requestId: req.requestId, userId: req.user?.id });

  log.info('task.create.start', { title: req.body.title });
  const task = await taskService.create(req.body);
  log.info('task.create.success', { taskId: task.id, durationMs });
});
```

### What NOT to Log

```typescript
// NEVER log sensitive data
logger.info('user.login', {
  userId,
  // email: user.email,       ❌ PII
  // password: input.password, ❌ Secret
  // token: session.token,     ❌ Credential
});

// Log the outcome, not the secret
logger.info('user.login.success', { userId, method: 'email' });
logger.warn('user.login.failed', { reason: 'invalid_password', userId });
```

## Error Tracking (Sentry)

### Basic Setup

```typescript
// Next.js / Node — initialize early
import * as Sentry from '@sentry/nextjs';  // or @sentry/node

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Don't send in development unless debugging Sentry integration
  enabled: process.env.NODE_ENV === 'production',
  tracesSampleRate: 0.1,  // 10% of transactions — adjust per volume
});
```

### Capture Errors with Context

```typescript
// Automatic: unhandled errors in API routes are caught by Sentry's SDK
// Manual: add context for known failure points

try {
  await paymentService.charge(userId, amount);
} catch (error) {
  Sentry.withScope(scope => {
    scope.setUser({ id: userId });
    scope.setExtra('amount', amount);
    scope.setTag('feature', 'payments');
    Sentry.captureException(error);
  });
  throw error;  // Re-throw — let the route handler return the error response
}
```

### Set User Context Early

```typescript
// After authentication, identify the user for all subsequent errors
app.use(authenticate, (req, res, next) => {
  if (req.user) {
    Sentry.setUser({ id: req.user.id });
  }
  next();
});
```

### Ignore Expected Errors

```typescript
Sentry.init({
  beforeSend(event, hint) {
    const error = hint.originalException;
    // Don't send 404s or validation errors — these are expected
    if (error instanceof NotFoundError) return null;
    if (error instanceof ValidationError) return null;
    return event;
  },
});
```

## Metrics and Alerting

### What to Measure

| Metric | Why |
|--------|-----|
| Request latency (p50, p95, p99) | Slow percentiles catch tail latency that averages hide |
| Error rate (5xx %) | The primary health signal |
| Queue depth | For async jobs — high depth = processing lag |
| DB query time | Catches slow queries before they become outages |
| External API latency | Third-party degradation shows up here first |

### Instrumentation Pattern

```typescript
// Wrap operations with timing + error counting
async function withMetrics<T>(
  name: string,
  fn: () => Promise<T>,
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    metrics.timing(`${name}.duration`, Date.now() - start, { status: 'success' });
    return result;
  } catch (error) {
    metrics.timing(`${name}.duration`, Date.now() - start, { status: 'error' });
    metrics.increment(`${name}.errors`);
    throw error;
  }
}

// Usage
const task = await withMetrics('task.create', () => taskService.create(input));
```

### Health Check Endpoint

Every service should expose a health endpoint for load balancers and uptime monitors:

```typescript
app.get('/health', async (req, res) => {
  try {
    // Check critical dependencies
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'degraded', reason: 'database unreachable' });
  }
});
```

## Alerting Thresholds (Starting Points)

| Signal | Alert when |
|--------|------------|
| Error rate | > 1% of requests over 5 minutes |
| p99 latency | > 2× baseline over 5 minutes |
| Health check | Fails for > 1 minute |
| Queue depth | > 1000 items or growing for > 10 minutes |
| Crash-free rate | Drops below 99.5% (mobile / Sentry) |

Start conservative — too many alerts causes alert fatigue. Tune thresholds based on your baseline.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll add monitoring after launch" | You won't know what broke during launch without it. Add it before. |
| "console.log is fine for now" | Unstructured logs are unsearchable at scale. Switch early. |
| "We get error emails from users" | Users report 1 in 10 errors. Silent failures are the norm. |
| "Sentry is too expensive" | Sentry has a generous free tier. The cost of a silent outage is higher. |
| "This endpoint is simple, no need to instrument it" | Simple endpoints have the most unexpected failures. |

## Red Flags

- `console.log` with interpolated strings (not structured)
- Logging passwords, tokens, or PII
- No error tracking in production
- Catch blocks that swallow errors silently (`catch (e) {}`)
- No request IDs — can't trace a request through logs
- Health check that doesn't test the database connection
- Error rate alert but no latency alert (latency degrades before errors spike)

## Verification

After adding observability to a feature:

- [ ] Structured logs use key-value pairs, not string interpolation
- [ ] No PII or secrets in log output
- [ ] Request IDs present in all log lines for a given request
- [ ] Sentry (or equivalent) initialized with `environment` tag
- [ ] Expected errors (404, validation) excluded from error tracking
- [ ] Health check endpoint responds correctly under normal conditions
- [ ] Critical operations have timing instrumentation
- [ ] At least one alert configured for error rate or health check
