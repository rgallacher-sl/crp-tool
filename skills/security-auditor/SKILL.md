---
name: security-auditor
description: Use when conducting a dedicated security audit. Covers input handling, authentication, data protection, infrastructure, and third-party integrations. Outputs findings classified by severity (Critical/High/Medium/Low/Info) with proof-of-concept and remediation steps.
metadata:
  source: original
---

# Security Auditor

## Review Scope

### 1. Input Handling
- Is all user input validated at system boundaries?
- Are there injection vectors (SQL, NoSQL, OS command, LDAP)?
- Is HTML output encoded to prevent XSS?
- Are file uploads restricted by type, size, and content?
- Are URL redirects validated against an allowlist?

### 2. Authentication & Authorization
- Are passwords hashed with a strong algorithm (bcrypt, scrypt, argon2)?
- Are sessions managed securely (httpOnly, secure, sameSite cookies)?
- Is authorization checked on every protected endpoint?
- Can users access resources belonging to other users (IDOR)?
- Are password reset tokens time-limited and single-use?
- Is rate limiting applied to authentication endpoints?
- Do error messages reveal whether an account exists (account enumeration)? — sign-up, sign-in, and reset flows all must use generic messages (OWASP AuthN Cheat Sheet)
- Do auth responses take consistent time regardless of outcome (timing attack prevention)? (OWASP AuthN Cheat Sheet)
- Is credential stuffing mitigated? (rate limiting, MFA, breach password checks) (OWASP A07)
- Is password policy free of counterproductive complexity rules and forced rotation? (NCSC)

### 3. Data Protection
- Are secrets in environment variables (not code)?
- Are sensitive fields excluded from API responses and logs?
- Is data encrypted in transit (HTTPS) and at rest (if required)?
- Is PII handled according to applicable regulations?
- Are database backups encrypted?

### 4. Infrastructure
- Are security headers configured (CSP, HSTS, X-Frame-Options)?
- Is CORS restricted to specific origins?
- Are dependencies audited for known vulnerabilities?
- Are error messages generic (no stack traces or internal details to users)?
- Is the principle of least privilege applied to service accounts?

### 5. Third-Party Integrations
- Are API keys and tokens stored securely?
- Are webhook payloads verified (signature validation)?
- Are third-party scripts loaded from trusted CDNs with integrity hashes?
- Are OAuth flows using PKCE and state parameters?

## Severity Classification

| Severity | Criteria | Action |
|----------|----------|--------|
| Critical | Exploitable remotely, leads to data breach or full compromise | Fix immediately, block release |
| High | Exploitable with some conditions, significant data exposure | Fix before release |
| Medium | Limited impact or requires authenticated access to exploit | Fix in current sprint |
| Low | Theoretical risk or defense-in-depth improvement | Schedule for next sprint |
| Info | Best practice recommendation, no current risk | Consider adopting |

## Output Format

```markdown
## Security Audit Report

### Summary
- Critical: [count]
- High: [count]
- Medium: [count]
- Low: [count]

### Findings

#### [CRITICAL] [Finding title]
- **Location:** [file:line]
- **Description:** [What the vulnerability is]
- **Impact:** [What an attacker could do]
- **Proof of concept:** [How to exploit it]
- **Recommendation:** [Specific fix with code example]

#### [HIGH] [Finding title]
...

### Positive Observations
- [Security practices done well]

### Recommendations
- [Proactive improvements to consider]
```

## Rules
1. Focus on exploitable vulnerabilities, not theoretical risks
2. Every finding must include a specific, actionable recommendation
3. Provide proof of concept or exploitation scenario for Critical/High findings
4. Acknowledge good security practices — positive reinforcement matters
5. Check the OWASP Top 10 as a minimum baseline
6. Review dependencies for known CVEs
7. Never suggest disabling security controls as a "fix"

## Sources

- OWASP Authentication Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- OWASP Top 10 A07 – Identification and Authentication Failures: https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/
- NCSC Passwords Guidance: https://www.ncsc.gov.uk/collection/passwords/updating-your-approach
- NCSC Secure Development: https://www.ncsc.gov.uk/collection/developers-collection
