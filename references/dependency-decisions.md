# Dependency Decisions

When to reach for a third-party package vs build bespoke.

---

## Default to third party when

- The problem is solved and stable — reinventing it provides no advantage
- Keeping up with it yourself would be a maintenance burden (accessibility, browser quirks, security)
- The third party has more users finding bugs than you ever would alone
- It's infrastructure: tooling, testing, bundling, formatting

## Default to bespoke when

- The dependency does 10x more than you need and you're paying the weight cost
- It's a core part of the product's differentiation
- The dependency has its own opinions that fight yours over time
- You can write it in an afternoon and own it completely

## The core rule

**The closer a dependency gets to your public interface, the more it costs when it changes or you outgrow it.**

- Infrastructure (bundlers, test runners, dev tooling) — third party is fine
- Anything that touches your component API, data models, or forces structural decisions — be selective
- Your core domain logic, public API, and composition patterns should be entirely yours

## Lock-in test

Before adding a dependency, ask: *if this package disappeared tomorrow or changed its API, how much of our code would need to change?*

- Touches only config files → low risk, proceed
- Touches utility functions → medium risk, consider a thin wrapper
- Touches public API or core domain → high risk, evaluate carefully
