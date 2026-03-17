---
name: database-and-migrations
description: Use when designing database schemas, writing migrations, working with ORMs (Prisma, Drizzle, TypeORM), or writing queries. Use when creating new tables, altering existing schema, setting up relationships, or optimizing slow queries.
metadata:
  source: original
  note: Written from scratch for this boilerplate — not derived from a public skill repository.
---

# Database and Migrations

## Overview

Design schemas you can evolve safely. Write migrations that are reversible and idempotent. Query data efficiently without N+1 problems. The goal is a data layer that is correct, fast enough, and easy to change as requirements shift.

## Choosing Your Data Model

The data model is one of the most consequential decisions in a system — it defines the limits of what's natural to query, how the schema can evolve, and where complexity ends up. Make this choice deliberately.

| Model | Best fit | Watch out for |
|---|---|---|
| **Relational** | Structured data with clear relationships, ACID requirements, complex queries | Schema migrations require planning; impedance mismatch with nested objects |
| **Document** | Heterogeneous records where every row may differ; data loaded as a unit | Locality penalty: loading a 1MB document to read one field is wasteful; poor fit when relationships become primary |
| **Graph** | Highly connected data where the connections themselves are the feature (social graphs, recommendation engines, permission trees) | Operational complexity; overkill for simple parent-child relationships |

**Schema-on-write vs. schema-on-read:**
- *Schema-on-write* (relational) — structure enforced at write time. Like static types: catches problems early, migrations are explicit.
- *Schema-on-read* (document) — structure interpreted at read time. Like dynamic types: flexible for heterogeneous data, but validation is your responsibility.

**The convergence point**: PostgreSQL supports JSON columns natively. For most applications, a relational schema with selective JSON columns covers both cases — relational strictness where structure is known, document flexibility where it isn't. Reach for a pure document or graph store only when the relational model genuinely fights you.

## Schema Design Principles

### Name Things Clearly

```sql
-- Good: plural table names, snake_case, explicit foreign keys
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 200),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### Index What You Query

Add indexes for columns used in WHERE, JOIN, and ORDER BY clauses. Don't over-index — every index slows writes.

```sql
-- Index foreign keys (often missed — causes full table scans on JOINs)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);

-- Index status for filtering
CREATE INDEX idx_tasks_status ON tasks(status);

-- Composite index when you always filter by both
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
```

### Soft Deletes (Use Sparingly)

Soft deletes add complexity to every query. Only use them when you have genuine audit or recovery requirements.

```sql
-- Only add deleted_at if you have a real need for it
deleted_at TIMESTAMPTZ NULL  -- NULL means active, non-NULL means deleted

-- Every query must then filter: WHERE deleted_at IS NULL
-- Consider a view to hide the complexity:
CREATE VIEW active_tasks AS SELECT * FROM tasks WHERE deleted_at IS NULL;
```

## Migrations

### One Direction: Forward Only

Write migrations that move forward. Rollbacks should be a separate migration, not an automatic reversal.

```
migrations/
  0001_create_users.sql
  0002_create_tasks.sql
  0003_add_task_priority.sql   -- Add optional column, safe
  0004_backfill_priority.sql   -- Backfill data
  0005_make_priority_required.sql  -- Now make it NOT NULL
```

### Safe Schema Changes

| Change | Safe? | Notes |
|--------|-------|-------|
| Add nullable column | ✅ Yes | No downtime |
| Add column with default | ✅ Yes | Postgres rewrites table in old versions |
| Add index `CONCURRENTLY` | ✅ Yes | Non-blocking |
| Drop column | ⚠️ Deploy app first | Stop reading the column, then drop it |
| Rename column | ❌ Breaking | Add new column, migrate data, drop old |
| Change column type | ❌ Usually breaking | Add new column, cast, swap |
| Add NOT NULL without default | ❌ Breaking | Backfill first, then add constraint |

### Migration Template

```sql
-- Migration: 0003_add_task_priority
-- Description: Add priority field to tasks (optional, backfilled later)

BEGIN;

ALTER TABLE tasks
  ADD COLUMN priority TEXT
  CHECK (priority IN ('low', 'medium', 'high'));

-- Index for future filtering
CREATE INDEX CONCURRENTLY idx_tasks_priority ON tasks(priority);

COMMIT;
```

## ORM Patterns (Prisma)

### Schema First

```prisma
// schema.prisma — define the schema, generate the client
model Task {
  id        String   @id @default(cuid())
  userId    String
  title     String
  status    TaskStatus @default(PENDING)
  priority  Priority?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([userId, status])
}

enum TaskStatus { PENDING IN_PROGRESS COMPLETED CANCELLED }
enum Priority  { LOW MEDIUM HIGH }
```

### Avoid N+1 Queries

```typescript
// BAD: N+1 — one query per task to fetch the user
const tasks = await prisma.task.findMany();
for (const task of tasks) {
  const user = await prisma.user.findUnique({ where: { id: task.userId } });
  // This is N+1 queries
}

// GOOD: Include related data in one query
const tasks = await prisma.task.findMany({
  include: { user: { select: { id: true, email: true } } },
});
```

### Transactions for Multi-Step Operations

```typescript
// Use transactions when multiple writes must succeed together
const [task, activity] = await prisma.$transaction([
  prisma.task.update({ where: { id }, data: { status: 'COMPLETED' } }),
  prisma.activityLog.create({ data: { taskId: id, action: 'COMPLETED', userId } }),
]);
```

### Select Only What You Need

```typescript
// BAD: Fetches all columns including large text fields
const tasks = await prisma.task.findMany({ where: { userId } });

// GOOD: Select only what the caller needs
const tasks = await prisma.task.findMany({
  where: { userId },
  select: { id: true, title: true, status: true, createdAt: true },
});
```

## Query Patterns

### Pagination (Cursor-Based for Large Tables)

```typescript
// Offset pagination — simple but slow on large tables
const tasks = await prisma.task.findMany({
  skip: (page - 1) * pageSize,
  take: pageSize,
  orderBy: { createdAt: 'desc' },
});

// Cursor pagination — O(1) regardless of offset, preferred for feeds
const tasks = await prisma.task.findMany({
  take: pageSize,
  skip: cursor ? 1 : 0,           // Skip the cursor itself
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

### Filtering

```typescript
// Build filters dynamically — only apply what's provided
const where: Prisma.TaskWhereInput = { userId };
if (status) where.status = status;
if (search) where.title = { contains: search, mode: 'insensitive' };

const tasks = await prisma.task.findMany({ where });
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "We'll add indexes later when it's slow" | Adding indexes on large tables requires `CONCURRENTLY` and careful timing. Plan them with the schema. |
| "We can just rollback the migration" | Schema migrations don't always roll back cleanly, especially after data is written. Test rollbacks in staging. |
| "Soft deletes are safer" | They leak complexity into every query forever. Hard deletes with audit logs are usually better. |
| "We'll denormalize later for performance" | Normalize first. Denormalize only after profiling shows it's necessary. |
| "The ORM handles query optimization" | ORMs write the query; you're responsible for indexes and N+1 patterns. |

## Red Flags

- Raw string concatenation in SQL queries (injection risk)
- Migrations without transactions around DDL changes
- Missing indexes on foreign key columns
- `SELECT *` in production queries
- N+1 queries in loops (query inside a loop over query results)
- Dropping or renaming columns without a deployment strategy
- No updated_at column on mutable tables

## Verification

After schema/migration work:

- [ ] Migration runs cleanly on a fresh database
- [ ] Migration is wrapped in a transaction (or uses `CONCURRENTLY` for indexes)
- [ ] Foreign key columns have indexes
- [ ] No N+1 queries in the code touching this schema
- [ ] `SELECT` only fetches needed columns
- [ ] Breaking changes follow the expand-contract pattern (add column → migrate → remove old)
- [ ] `.env` / connection string not hardcoded in migration files
