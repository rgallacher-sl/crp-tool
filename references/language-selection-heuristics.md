---
description: Language selection guidance for agentic projects — covers training data tiers, agent blind spots, and constraint-based override conditions. Load when choosing a stack or asking an agent for language advice.
---

# Language Selection Heuristics

## Training data tiers

Code generation quality correlates with training data depth. Use this as a starting point, not a mandate — the planning session should make the final call with project context.

| Tier | Languages | Agent output quality |
|------|-----------|----------------------|
| 1 | Python, TypeScript/JavaScript | Strong — deep ecosystem and pattern knowledge, reliable debugging assistance |
| 2 | Java, C#, Go | Good — idiomatic knowledge is solid, narrower edge case coverage |
| 3 | Rust, Ruby, PHP | Usable — model knows the language but makes confident mistakes more often |
| 4 | Kotlin, Swift, C/C++ | Unreliable — coverage is fragmented, debugging assistance is weaker |

## The agent-first inversion

The common framing is that agent language bias is a flaw to work around. For workflows where the agent is the primary author, it's closer to a signal to follow.

When a human writes the code, language choice is about ergonomics, runtime performance, and team familiarity. When an agent writes the code, training data depth *is* capability — it affects every file, every function, and every debugging session. A theoretically better language that the agent writes poorly is a real and ongoing cost.

Tier 1 languages are the justified default for agent-first projects. Deviate when a constraint requires it, not when a better option exists in theory.

## Hard constraints that justify deviating from Tier 1

- Output must run in a browser or at the edge
- A required SDK or library only exists in another language
- Binary size or startup time is a hard requirement
- The existing production stack is already in another language and interop cost is high

## Agent blind spots on language selection

Without project constraints, agents will default to Tier 1 regardless of fit. Providing constraints upfront narrows the search space:

| Constraint | Why it matters |
|-----------|----------------|
| Deployment target | Edge, container, single binary, and serverless have different runtime requirements |
| Performance requirements | Throughput, latency SLA, or concurrency model may rule out interpreted languages |
| Existing stack | Interop and consistency costs are real — don't ignore them |
| SDK/ecosystem requirements | Some providers only have first-class SDKs in specific languages |
| Build and distribution | Artifact size, CI pipeline, and dependency footprint all affect the decision |

## Framework vs direct API calls

Agents default to recommending established frameworks (orchestration libraries, full-stack frameworks) even when simpler options would serve better. Before accepting a framework recommendation, check whether the use case actually needs what the framework provides. If the task is a small number of sequential steps or direct tool calls, the framework adds complexity without benefit.
