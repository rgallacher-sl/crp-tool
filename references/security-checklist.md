# Security Checklist

Quick reference for web application security. Use alongside the `security-and-hardening` skill.

## Pre-Commit Checks

- [ ] No secrets in code (`git diff --cached | grep -i "password\|secret\|api_key\|token"`)
- [ ] `.gitignore` covers: `.env`, `.env.local`, `*.pem`, `*.key`
- [ ] `.env.example` uses placeholder values (not real secrets)

## Authentication

- [ ] Passwords hashed with bcrypt (≥12 rounds), scrypt, or argon2
- [ ] Session cookies: `httpOnly`, `secure`, `sameSite: 'lax'`
- [ ] Session expiration configured (reasonable max-age)
- [ ] Rate limiting on login endpoint (≤10 attempts per 15 minutes)
- [ ] Password reset tokens: time-limited (≤1 hour), single-use
- [ ] Account lockout after repeated failures (optional, with notification)
- [ ] MFA supported for sensitive operations (optional but recommended)

## Authorization

- [ ] Every protected endpoint checks authentication
- [ ] Every resource access checks ownership/role (prevents IDOR)
- [ ] Admin endpoints require admin role verification
- [ ] API keys scoped to minimum necessary permissions
- [ ] JWT tokens validated (signature, expiration, issuer)

## Input Validation

- [ ] All user input validated at system boundaries (API routes, form handlers)
- [ ] Validation uses allowlists (not denylists)
- [ ] String lengths constrained (min/max)
- [ ] Numeric ranges validated
- [ ] Email, URL, and date formats validated with proper libraries
- [ ] File uploads: type restricted, size limited, content verified
- [ ] SQL queries parameterized (no string concatenation)
- [ ] HTML output encoded (use framework auto-escaping)
- [ ] URLs validated before redirect (prevent open redirect)

## Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 0  (disabled, rely on CSP)
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## CORS Configuration

```typescript
// Restrictive (recommended)
cors({
  origin: ['https://yourdomain.com', 'https://app.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})

// NEVER use in production:
cors({ origin: '*' })  // Allows any origin
```

## Data Protection

- [ ] Sensitive fields excluded from API responses (`passwordHash`, `resetToken`, etc.)
- [ ] Sensitive data not logged (passwords, tokens, full CC numbers)
- [ ] PII encrypted at rest (if required by regulation)
- [ ] HTTPS for all external communication
- [ ] Database backups encrypted

## Dependency Security

```bash
# Audit dependencies
npm audit

# Fix automatically where possible
npm audit fix

# Check for critical vulnerabilities
npm audit --audit-level=critical

# Keep dependencies updated
npx npm-check-updates
```

## Error Handling

```typescript
// Production: generic error, no internals
res.status(500).json({
  error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' }
});

// NEVER in production:
res.status(500).json({
  error: err.message,
  stack: err.stack,         // Exposes internals
  query: err.sql,           // Exposes database details
});
```

## OWASP Top 10 Quick Reference

| # | Vulnerability | Prevention |
|---|---|---|
| 1 | Broken Access Control | Auth checks on every endpoint, ownership verification |
| 2 | Cryptographic Failures | HTTPS, strong hashing, no secrets in code |
| 3 | Injection | Parameterized queries, input validation |
| 4 | Insecure Design | Threat modeling, spec-driven development |
| 5 | Security Misconfiguration | Security headers, minimal permissions, audit deps |
| 6 | Vulnerable Components | `npm audit`, keep deps updated, minimal deps |
| 7 | Auth Failures | Strong passwords, rate limiting, session management |
| 8 | Data Integrity Failures | Verify updates/dependencies, signed artifacts |
| 9 | Logging Failures | Log security events, don't log secrets |
| 10 | SSRF | Validate/allowlist URLs, restrict outbound requests |

## Agent Safety

### Design Phase

- [ ] Define explicit permitted actions — list what the agent IS allowed to do and what it is NOT
- [ ] Apply least-privilege access: agents get only the tools and data they actually need
- [ ] Identify high-stakes actions (deleting data, financial transactions, permission changes) that require human approval before execution
- [ ] Document escalation paths for edge cases and policy ambiguities
- [ ] Treat the agent as a distinct principal with its own identity, permissions, and audit trail — separate from the user it serves

### Implementation Phase

- [ ] Write specific, unambiguous safety instructions in the system prompt — not "be careful", but explicit rules with concrete boundaries
- [ ] Implement input validation and content classification before the model processes user input
- [ ] Add output guardrails: PII scrubbing, content safety checks, format validation before responses reach users or execute actions
- [ ] Wrap all tools with argument validation and scope checks in code — do not rely solely on the model's judgment
- [ ] Set rate limits and cost budgets per session
- [ ] Set maximum step counts and timeout limits on agent loops to prevent infinite iteration
- [ ] Log all tool calls and agent decisions for audit trails

### Attack Vector Mitigations

| Attack Vector | Description | Mitigation |
|---------------|-------------|------------|
| **Tool misuse — parameter manipulation** | Agent is manipulated into passing malicious arguments to a tool | Validate all tool arguments against strict schemas in tool code before execution |
| **Tool misuse — tool chaining abuse** | Agent combines tools in harmful sequences | Limit tool call sequences; require human approval for multi-step chains involving high-stakes actions |
| **Tool misuse — excessive tool use** | Attacker causes the agent to make thousands of API calls | Rate limit tool calls per session and per time window |
| **Data exfiltration via API calls** | Agent sends internal data to an attacker-controlled URL | Allowlist outbound domains; inspect tool call URLs before execution |
| **Data exfiltration via response** | Agent reveals sensitive data in its user-facing response | Output PII scrubbing; context-aware filtering on all responses |
| **Privilege escalation — role confusion** | Attacker tricks the agent into believing it has admin rights | Enforce role checks in the tool layer, not just in the system prompt |
| **Privilege escalation — credential leakage** | Agent is manipulated into revealing API keys or tokens | Never put credentials in the system prompt; use a secrets manager |
| **Privilege escalation — permission bypass** | Agent is manipulated into accessing restricted resources | Enforce permissions in tool code; never rely on prompt-level boundaries alone |
| **Prompt injection — direct** | User explicitly attempts to override system instructions | Detect known injection patterns with deterministic input checks before the model processes input |
| **Prompt injection — indirect** | Malicious instructions embedded in retrieved documents, emails, or web pages | Treat retrieved content as data with lower priority than system instructions; validate planned actions before execution; use a second model to review planned actions |
| **Denial of service — context stuffing** | Attacker sends inputs that fill the context window | Input length limits; summarise long inputs before processing |
| **Denial of service — resource exhaustion** | Attacker triggers expensive tool calls repeatedly | Cost budgets per session; rate limiting per time window |

### Escalation Triggers

Escalate to a human when any of the following conditions are met:

- [ ] Requested action involves financial transactions, data deletion, or permission modification
- [ ] Agent confidence is low or the request is ambiguous
- [ ] Request falls outside defined policy boundaries
- [ ] Agent has failed to resolve the task after multiple attempts
- [ ] Request involves personal, legal, or medical topics
- [ ] User has expressed frustration more than twice in the same session

### Testing Phase

- [ ] Run prompt injection tests — both direct (user input) and indirect (via retrieved content)
- [ ] Test tool misuse scenarios: malformed arguments, chained harmful calls, excessive call rates
- [ ] Verify all escalation paths trigger correctly under test conditions
- [ ] Conduct red team exercises: attempt to bypass policy instructions, exfiltrate data, and escalate privileges
- [ ] Run automated safety evals on every deployment — include boundary adherence, injection resistance, PII handling, and tool safety cases
