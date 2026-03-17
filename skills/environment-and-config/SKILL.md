---
name: environment-and-config
description: Use when managing environment variables, application configuration, secrets, or feature flags. Use when setting up .env files, handling config across multiple environments (dev/staging/production), or adding runtime configuration to a project.
metadata:
  source: original
  note: Written from scratch for this boilerplate — not derived from a public skill repository.
---

# Environment and Config Management

## Overview

Configuration is the set of things that change between deployments. Good config management means secrets never touch version control, every environment gets the right values, and the application fails loudly at startup when config is missing — not silently at runtime when a user hits the broken path.

## The Hierarchy

```
Runtime secrets (Vercel, Railway, AWS SSM, Doppler)
  ↓ override
.env.local           — local machine only, never committed
  ↓ override
.env.development      — dev defaults, can be committed (no secrets)
  ↓ override
.env                  — base defaults, no secrets, can be committed
```

**Rule**: If it's secret, it never touches git. If it can vary per environment, it's an env var.

## .env File Structure

```bash
# .env.example — COMMITTED — template with placeholder values
# Copy to .env and fill in your values
DATABASE_URL=postgresql://user:password@localhost:5432/myapp
STRIPE_SECRET_KEY=sk_test_...
NEXTAUTH_SECRET=your-secret-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```bash
# .env — NOT COMMITTED — real values
DATABASE_URL=postgresql://postgres:localpass@localhost:5432/myapp_dev
STRIPE_SECRET_KEY=sk_test_abc123...
NEXTAUTH_SECRET=a-real-random-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

```gitignore
# .gitignore — always include these
.env
.env.local
.env.*.local
*.pem
*.key
```

## Validate Config at Startup

Crash early with a clear message. Don't let missing config surface as a cryptic error at runtime.

```typescript
// lib/config.ts — validate and export all config in one place
import { z } from 'zod';

const ConfigSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),

  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),

  // Optional
  SENTRY_DSN: z.string().url().optional(),
});

const result = ConfigSchema.safeParse(process.env);
if (!result.success) {
  console.error('Invalid environment configuration:');
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);  // Fail fast — don't start with broken config
}

export const config = result.data;
```

```typescript
// Usage — import config, not process.env directly
import { config } from '@/lib/config';

const stripe = new Stripe(config.STRIPE_SECRET_KEY);
```

**Why centralize**: If you read `process.env.STRIPE_SECRET_KEY` in 12 files, you have 12 places to find typos. One schema, one place to fix.

## Environment-Specific Config

```typescript
// Different values per environment, same keys
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api',

  features: {
    // See feature flags section below
  },

  // Adjust limits per environment
  rateLimitMax: process.env.NODE_ENV === 'production' ? 100 : 1000,
};
```

## Client vs Server Config

In Next.js (and similar frameworks), client-side code can only access variables prefixed with `NEXT_PUBLIC_`:

```bash
# Server-only (never sent to browser)
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...

# Client-accessible (SAFE TO EXPOSE — treat as public)
NEXT_PUBLIC_APP_URL=https://myapp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

**Never put secrets in `NEXT_PUBLIC_` variables** — they are bundled into client JavaScript and visible to anyone.

## Feature Flags

Feature flags decouple deployment from release. Code ships dark, then turns on without a deploy.

### Simple Boolean Flags (Config-Based)

```typescript
// For flags that change per environment but not per user
export const features = {
  newCheckout: process.env.FEATURE_NEW_CHECKOUT === 'true',
  betaDashboard: process.env.FEATURE_BETA_DASHBOARD === 'true',
} as const;

// Usage
if (features.newCheckout) {
  return <NewCheckout />;
}
```

### Percentage Rollout (Simple)

```typescript
// Deterministic rollout by user ID — same user always gets same experience
function isInRollout(userId: string, flagName: string, percentage: number): boolean {
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const bucket = hash % 100;
  return bucket < percentage;
}

// 20% rollout
if (isInRollout(user.id, 'new-checkout', 20)) {
  return <NewCheckout />;
}
```

### Third-Party Flag Services

Use LaunchDarkly, Statsig, or Unleash when you need:
- Per-user targeting (beta users, specific accounts)
- Real-time flag changes without deploys
- Experimentation / A-B testing with analytics
- Audit trail of flag changes

Don't reach for a third-party service for simple environment-based flags — they add latency and a new dependency.

## Secrets in Production

### Where Secrets Live

| Platform | Where to set secrets |
|----------|---------------------|
| Vercel | Project Settings → Environment Variables |
| Railway | Service → Variables |
| AWS | SSM Parameter Store or Secrets Manager |
| Heroku | Config Vars |
| Docker | Docker secrets or env file (not in image) |

### Secret Rotation

When a secret is compromised or rotated:
1. Generate the new secret
2. Add new value to all environments via the platform UI
3. Deploy — the app picks up the new value on restart
4. Revoke the old secret at the source (Stripe, database, etc.)
5. Verify the app works with the new secret before fully revoking the old one

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "It's just a dev key, it's fine in the repo" | Dev keys get rotated to prod. Git history is forever. Leak it once, revoke, move on — but establish the habit now. |
| "I'll use .env.example to track secrets" | .env.example is for structure, not values. Never put real secrets there. |
| "Feature flags are overkill for this" | They're not — until you need an emergency shutoff at 2am and have to push a commit. |
| "process.env is fine to read directly" | Scattering `process.env` reads makes refactoring hard and misses validation. Centralize it. |

## Red Flags

- `.env` committed to git (check `git log --all -- .env`)
- `process.env.SOMETHING` read in 10+ files without a central config module
- Missing `.env.example` — new devs can't bootstrap the project
- Secrets in `NEXT_PUBLIC_` variables
- Application starts successfully when required config is missing (silent failure)
- Hardcoded URLs or API keys that differ between environments

## Verification

- [ ] `.env` is in `.gitignore` and not in git history (`git log --all -- .env`)
- [ ] `.env.example` committed with all required keys and placeholder values
- [ ] Config validated at startup — app crashes with a clear message if required vars are missing
- [ ] All `process.env` reads go through the central config module
- [ ] No secrets in `NEXT_PUBLIC_` variables
- [ ] Production secrets set via platform environment UI (not in files)
- [ ] Feature flags have a documented off-switch (how to disable if something goes wrong)
