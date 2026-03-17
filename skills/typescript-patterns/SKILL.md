---
name: typescript-patterns
description: Use when writing or reviewing TypeScript — designing types, working with generics, using discriminated unions, or avoiding common TS pitfalls. Use when fighting the type system, seeing excessive `any` usage, or struggling with type inference.
metadata:
  source: original
  note: Written from scratch for this boilerplate — not derived from a public skill repository.
---

# TypeScript Patterns

## Overview

TypeScript's value comes from the types you write, not just the types you accept. Good TypeScript makes invalid states unrepresentable, guides callers toward correct usage, and narrows correctly at runtime boundaries. This skill covers type design, generics discipline, and the pitfalls that undermine type safety.

## Type Design

### Make Invalid States Unrepresentable

```typescript
// BAD: These fields can be in inconsistent combinations
interface User {
  isLoggedIn: boolean;
  userId?: string;        // What does userId mean if isLoggedIn is false?
  sessionToken?: string;
}

// GOOD: State determines which fields exist
type UserState =
  | { status: 'anonymous' }
  | { status: 'authenticated'; userId: string; sessionToken: string };
```

### Discriminated Unions Over Boolean Flags

```typescript
// BAD: Three booleans = 8 possible states, most invalid
interface AsyncData {
  loading: boolean;
  error: boolean;
  data?: User;
}

// GOOD: Four explicit, mutually exclusive states
type AsyncData<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T };

// Exhaustive switch — compiler catches missing cases
function render(state: AsyncData<User>) {
  switch (state.status) {
    case 'idle':    return <Idle />;
    case 'loading': return <Spinner />;
    case 'error':   return <Error message={state.error.message} />;
    case 'success': return <Profile user={state.data} />;
  }
}
```

### Branded Types for Semantic IDs

```typescript
// Plain strings are interchangeable — no protection against swapping IDs
function transferFunds(from: string, to: string, amount: number) { ... }
transferFunds(toAccountId, fromAccountId, amount); // Swapped! TypeScript won't catch it.

// Branded types prevent accidental mixing
type AccountId = string & { readonly __brand: 'AccountId' };
type UserId    = string & { readonly __brand: 'UserId' };

// Factory to create branded values (at the boundary where you receive raw strings)
const toAccountId = (id: string): AccountId => id as AccountId;

function transferFunds(from: AccountId, to: AccountId, amount: number) { ... }
transferFunds(userId, accountId, amount);  // ✅ Type error — caught at compile time
```

### Input/Output Types Are Different

```typescript
// What the caller provides — no server-generated fields
type CreateUserInput = {
  email: string;
  name: string;
};

// What the system returns — includes generated fields
type User = {
  id: UserId;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

// Update input — only mutable fields, all optional
type UpdateUserInput = Partial<Pick<User, 'name'>>;
```

## Generics Discipline

### Use Generics When the Type Flows Through

```typescript
// Generic makes sense: the type of the input determines the output
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

// Generic is unnecessary: the type is always the same
function parseJson(raw: string): unknown {   // Not <T>: caller can't guarantee T
  return JSON.parse(raw);
}
```

### Constrain Generics to What You Actually Need

```typescript
// BAD: Unconstrained T — can't safely access .id
function findById<T>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);  // ✅ Type error: T has no .id
}

// GOOD: Constrain to the shape you need
function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find(item => item.id === id);
}
```

### Avoid Generic Overengineering

```typescript
// Overkill for a one-off utility
function mapRecord<K extends string, V, R>(
  record: Record<K, V>,
  fn: (value: V, key: K) => R
): Record<K, R> { ... }

// If you only call it once, just write the specific version
```

## Utility Types Cheat Sheet

```typescript
// Partial<T>    — all fields optional
// Required<T>   — all fields required
// Readonly<T>   — all fields readonly
// Pick<T, K>    — subset of fields
// Omit<T, K>    — all fields except K
// Record<K, V>  — object with keys K and values V
// Extract<T, U> — members of T assignable to U
// Exclude<T, U> — members of T NOT assignable to U
// NonNullable<T>— removes null and undefined
// ReturnType<F> — return type of a function
// Parameters<F> — parameter types as a tuple

// Common patterns:
type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
type PublicUser = Omit<User, 'passwordHash' | 'resetToken'>;
type EventHandler<T> = (event: T) => void;
```

## Avoiding Common Pitfalls

### Don't Use `any` — Use `unknown` at Boundaries

```typescript
// BAD: any turns off type checking for everything downstream
function parseConfig(raw: any) {
  return raw.port;  // No error even if port doesn't exist
}

// GOOD: unknown forces you to narrow before using
function parseConfig(raw: unknown): Config {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Config must be an object');
  }
  // Use Zod or manual narrowing to extract typed data
  return ConfigSchema.parse(raw);
}
```

### Type Assertions (`as`) Are a Promise You're Making to the Compiler

```typescript
// BAD: You're telling TypeScript to trust you — it won't verify
const user = response.data as User;

// GOOD: Validate at the boundary, then the type is earned
const user = UserSchema.parse(response.data);  // throws if invalid
// Now user is genuinely a User
```

### `strictNullChecks` is Non-Negotiable

```json
// tsconfig.json — always enable
{
  "compilerOptions": {
    "strict": true  // Enables strictNullChecks + other strict checks
  }
}
```

Without `strict: true`, `string` and `string | null | undefined` are the same type. That eliminates 30% of the benefit of TypeScript.

### Don't Widen Types You Don't Need to Widen

```typescript
// BAD: status is inferred as string, losing the union
const status = 'pending';  // type: string (if in a mutable context)

// GOOD: const assertion narrows to the literal
const status = 'pending' as const;  // type: 'pending'

// For object literals:
const config = {
  method: 'GET',
  url: '/api/tasks',
} as const;
// config.method is 'GET', not string
```

### Enums vs Union Types

```typescript
// Prefer union types over enums — they're simpler and interoperate better
type Status = 'pending' | 'in_progress' | 'completed';

// Use const enums only if you need numeric values or external schema alignment
// Avoid regular enums — they compile to JS objects and have unexpected behavior
```

## Type-Safe Error Handling

```typescript
// Result type for operations that can fail without throwing
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function divide(a: number, b: number): Result<number, 'DIVISION_BY_ZERO'> {
  if (b === 0) return { ok: false, error: 'DIVISION_BY_ZERO' };
  return { ok: true, value: a / b };
}

const result = divide(10, 0);
if (!result.ok) {
  console.error(result.error);  // TypeScript knows this is 'DIVISION_BY_ZERO'
} else {
  console.log(result.value);    // TypeScript knows this is number
}
```

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll add types later" | Types added after the fact often become `any`. Types emerge from thinking about the shape — do it first. |
| "This is just a quick script, `any` is fine" | Quick scripts become long-lived utilities. `any` compounds. |
| "The generics are too complex, I'll just duplicate" | One complex generic > two copies that drift out of sync. |
| "TypeScript is fighting me, I'll cast with `as`" | When TS pushes back, it's usually right. Understand why before overriding. |

## Red Flags

- `any` outside of generated code or intentional escape hatches
- `as` casts on external data (API responses, `JSON.parse` results)
- `strict: false` in tsconfig
- Boolean flag proliferation instead of discriminated unions
- Generic functions that don't actually use the generic
- `!` (non-null assertion) on values that could genuinely be null

## Verification

- [ ] `strict: true` in tsconfig (or explicit `strictNullChecks: true`)
- [ ] No `any` — use `unknown` at boundaries, then narrow
- [ ] External data (API, JSON.parse) validated with a schema before typing
- [ ] Discriminated unions instead of boolean flag combinations
- [ ] Branded types for IDs that should not be interchangeable
- [ ] Generic constraints match the minimum shape actually needed
