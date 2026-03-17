---
name: system-design
description: Use when starting a new service, application, or significant subsystem. Use when a feature touches multiple services, requires scale or reliability guarantees, or involves decisions that would be expensive to reverse.
metadata:
  source: original
---

# System Design

## Overview

System design decisions happen before code is written and compound over time. A good design gives you room to grow; a poor one creates ceilings you'll hit when it's most expensive to change. The goal isn't a perfect diagram — it's making the right trade-offs explicitly and documenting why.

## The Two Laws

**Everything is a trade-off.** No architectural choice is free. If you think you've found a solution with no downsides, you haven't found the cost yet — you've just deferred the discovery.

**Why matters more than how.** The rationale behind a decision is more valuable than the diagram. Code shows what was built; only documentation captures why, what alternatives were rejected, and what constraints apply. Undocumented decisions get re-litigated. (→ [documentation-and-adrs](../documentation-and-adrs/SKILL.md))

## The Four Pillars

Every architecture has four components. Be explicit about all of them:

| Pillar | What it is | Example |
|--------|-----------|---------|
| **Structure** | The architectural style | Monolith, microservices, event-driven, layered |
| **Characteristics** | The -ilities the system must satisfy | Scalability, reliability, extensibility |
| **Decisions** | Hard rules — compliance is mandatory | "All services communicate via the API gateway" |
| **Principles** | Preferred guidelines — flexible within context | "Prefer REST; use gRPC where latency is critical" |

Decisions enforce consistency. Principles allow teams to adapt within safe boundaries.

## Architectural Characteristics (The -Ilities)

No system can optimise for all of these simultaneously. Choose the ones that matter for your context, make the trade-offs explicit, and record them in an ADR.

### Design-Time (Structural)

| Characteristic | What it means |
|---|---|
| **Composability** | Components work together in combinations you didn't anticipate |
| **Interoperability** | Communicates with other systems via standard contracts |
| **Extensibility** | New capabilities can be added without rewriting the core |
| **Modularity** | Components have clear boundaries and change independently |
| **Loose coupling** | Changes in one module don't cascade into others |
| **Testability** | The system can be verified in isolation |
| **Portability** | Can run in different environments without changes |
| **Reusability** | Components can be used across multiple contexts |

### Runtime (Behavioural)

| Characteristic | What it means |
|---|---|
| **Scalability** | Handles increased load by adding resources |
| **Reliability** | Consistently correct over time |
| **Resilience** | Faults don't escalate into systemic failures |
| **Availability** | Up when users need it (expressed as SLA/SLO) |
| **Idempotency** | The same operation can be safely repeated without side effects |
| **Durability** | Data survives failures |
| **Performance** | Fast enough for the use case (see tail latency below) |
| **Elasticity** | Scales up and back down with demand |
| **Consistency** | Data is accurate and coherent across the system |
| **Recoverability** | Returns to a known good state after failure |

### Operational

| Characteristic | What it means |
|---|---|
| **Observability** | You can understand what's happening inside → [observability-and-monitoring](../observability-and-monitoring/SKILL.md) |
| **Deployability** | Changes can be shipped safely and independently |
| **Maintainability** | Easy to run, debug, and change over time |
| **Security** | → [security-and-hardening](../security-and-hardening/SKILL.md) |

## Fault Categories

Build resilience against all three. They have different failure modes and different mitigations.

**Hardware faults** — nodes go down, disks fail. Mitigate with redundancy (multiple nodes, replicated storage), rolling upgrades, and health checks. No single node should be a single point of failure for critical paths.

**Software faults** — unlike hardware, software bugs are correlated: one bug can affect the entire fleet simultaneously. Mitigate with:
- Resource quotas (CPU/RAM/I/O limits prevent one process starving others)
- Enforced timeouts on all remote calls (unbounded waits cause cascading failures)
- Safe defaults that don't assume input purity or environmental stability

**Human error** — the dominant cause of outages. Mitigate with:
- Non-production sandboxes for safe experimentation
- Gradual rollouts (canary deploys, feature flags)
- Documented undo paths for every deployment and config change
- Telemetry that surfaces impact quickly so you know when to roll back

## Load Characterisation

Before deciding how to scale, identify *what* is actually under pressure. Scaling the wrong thing wastes resources and doesn't solve the problem.

Questions to answer before designing for scale:
- Is this read-heavy or write-heavy?
- Where is the bottleneck: compute, memory, I/O, or network?
- What is the access pattern — uniform load, bursty, or spiky around events?
- Are there outlier cases (e.g. users with 10× the typical data volume) that break the general solution?

Design for the specific load profile, not a generic "we might need to scale" assumption.

## Tail Latency

Averages lie. A system with p50 of 20ms and p99 of 800ms is performing badly for 1% of requests — which at any meaningful scale affects a significant number of users.

**Tail latency amplification**: in systems that make multiple parallel backend calls, the end user waits for the slowest response. With 10 parallel calls each at p99 = 200ms, roughly 10% of users experience that 200ms delay. Monitor p95 and p99, not just medians.

Alert when p99 exceeds 2× baseline. (→ [observability-and-monitoring](../observability-and-monitoring/SKILL.md))

## Accidental Complexity

Complexity comes in two forms:
- **Essential complexity** — inherent in the problem itself. Can't be eliminated.
- **Accidental complexity** — introduced by implementation choices. Should be actively minimised.

Every additional abstraction layer, distributed component, or custom protocol adds accidental complexity. Only introduce it when the trade-off is explicit and the alternative is worse. Accidental complexity accumulates silently — each addition seems justified individually, but the system becomes progressively harder to understand and change.

## Chaos Engineering

Resilience that isn't regularly exercised degrades silently. Fault-tolerance code that never runs in production-like conditions is code you can't trust when you need it.

Deliberately inject failures to verify that:
- Redundancy actually fails over correctly
- Timeouts and circuit breakers trigger as designed
- The system degrades gracefully rather than catastrophically

Start small: kill a single process, simulate a slow dependency, disconnect a node. Confirm the system behaves as designed before you need it to.

## Architecture Vitality

A system's design can become stale even if the code hasn't changed. Periodically question the assumptions it was built on:

- Are the core assumptions (e.g., on-premise infra, synchronous communication, single-region) still valid?
- Does the current design support the release velocity the team needs?
- Have new failure modes appeared that weren't visible at initial design time?
- Are structural health checks (fitness functions) in CI catching decay? (→ [ci-cd-and-automation](../ci-cd-and-automation/SKILL.md))

## Common Trade-off Tensions

These tensions can't be resolved — only navigated. Make the choice explicit and record it.

| Tension | Notes |
|---|---|
| Extensibility vs. security | More open interfaces are more exploitable |
| Consistency vs. availability | Under network partition, you can't have both (CAP theorem) |
| Simplicity vs. flexibility | Generic solutions carry the cost of generality |
| Scalability vs. cost | Horizontal scale adds infrastructure and operational complexity |
| Durability vs. performance | Fsyncing every write is correct but slow |
| Loose coupling vs. coordination overhead | Decoupled services require explicit contracts and versioning |
| Composability vs. performance | Layered abstractions add call overhead |

## Red Flags

- Significant structural decisions with no documented rationale
- Optimising for a scaling dimension that hasn't been measured
- All requests routed through a single synchronous path with no fault isolation
- No undo path for deployments or configuration changes
- Monitoring averages only — no p95/p99 latency tracking
- Complexity added "for future flexibility" with no concrete use case
- Resilience mechanisms that have never been tested

## Verification

Before finalising a design:

- [ ] Core -ilities identified and trade-offs between them made explicit
- [ ] Fault categories considered (hardware, software, human)
- [ ] Load characterised — what specifically is expected to grow?
- [ ] No single points of failure on critical paths
- [ ] Every hard decision documented as an ADR with trade-offs recorded
- [ ] Undo path exists for deployments and configuration changes
- [ ] p95/p99 latency tracked for all user-facing paths
- [ ] Resilience mechanisms tested, not just designed
