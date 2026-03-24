---
name: auth-security
description: Security design constraints for authentication flows — enumeration prevention, timing, password policy. Load when designing or building sign-up, sign-in, password reset, or email change.
type: reference
---

# Auth Security Constraints

Load when designing or building any authentication flow: sign-up, sign-in, password reset, email change. These are design inputs — resolve them before defining states or writing implementation.

Sources: [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html), [OWASP A07](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/), [NCSC Passwords Guidance](https://www.ncsc.gov.uk/collection/passwords/updating-your-approach)

---

## Account enumeration

Never confirm whether an email or username is registered. Applies equally to sign-up, sign-in, and password reset — all three flows can leak account existence if not handled consistently.

| Flow | Do not say | Say instead | Source |
|---|---|---|---|
| Sign-up | "An account with this email already exists" | "Unable to create your account. Please try again." | OWASP AuthN |
| Sign-in | "Incorrect password for user foo" | "Invalid user ID or password" | OWASP AuthN |
| Password reset | "No account found for that email" | "If that email address is in our database, we will send you an email to reset your password" | OWASP AuthN |

---

## Timing consistency

Auth responses must take the same time regardless of outcome. A quick-exit on "user not found" leaks account existence through response timing even when the error message is generic.

Always run the full credential check — including the hash comparison — even when no user is found.

---

## Password policy

| Rule | Do | Don't | Source |
|---|---|---|---|
| Length | Minimum 8 chars (with MFA), 15 without. Maximum at least 64. | Cap passwords short or enforce exact length | OWASP AuthN |
| Complexity | Let users use any characters including unicode | Require uppercase, symbols, numbers | NCSC, OWASP AuthN |
| Rotation | Change only on confirmed compromise | Force periodic resets | NCSC |
| Weak passwords | Check against breached password list (e.g. Have I Been Pwned) | Accept known-breached passwords silently | OWASP AuthN |
| Feedback | Show a strength indicator | Show only pass/fail | OWASP AuthN |

---

## Generic server errors

Never surface internal failure reasons to users. All unexpected failures use a single generic message: "Something went wrong. Please try again."
