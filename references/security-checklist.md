# Agent Safety Checklist

Reference for building safe agentic systems. Use alongside the `security-and-hardening` skill when designing or implementing agents, tools, or pipelines.

## Design Phase

- [ ] Define explicit permitted actions — list what the agent IS allowed to do and what it is NOT
- [ ] Apply least-privilege access: agents get only the tools and data they actually need
- [ ] Identify high-stakes actions (deleting data, financial transactions, permission changes) that require human approval before execution
- [ ] Document escalation paths for edge cases and policy ambiguities
- [ ] Treat the agent as a distinct principal with its own identity, permissions, and audit trail

## Implementation Phase

- [ ] Write specific, unambiguous safety instructions in the system prompt
- [ ] Implement input validation and content classification before the model processes user input
- [ ] Add output guardrails: PII scrubbing, content safety checks, format validation
- [ ] Wrap all tools with argument validation and scope checks in code
- [ ] Set rate limits and cost budgets per session
- [ ] Set maximum step counts and timeout limits on agent loops
- [ ] Log all tool calls and agent decisions for audit trails

## Attack Vector Mitigations

| Attack Vector | Description | Mitigation |
|---------------|-------------|------------|
| Tool misuse — parameter manipulation | Agent passes malicious arguments to a tool | Validate all tool arguments against strict schemas in tool code |
| Tool misuse — tool chaining abuse | Agent combines tools in harmful sequences | Limit sequences; require human approval for high-stakes chains |
| Tool misuse — excessive tool use | Agent makes thousands of API calls | Rate limit tool calls per session |
| Data exfiltration via API calls | Agent sends internal data to attacker-controlled URL | Allowlist outbound domains |
| Data exfiltration via response | Agent reveals sensitive data in response | Output PII scrubbing; context-aware filtering |
| Privilege escalation — role confusion | Attacker tricks agent into believing it has admin rights | Enforce role checks in the tool layer |
| Privilege escalation — credential leakage | Agent reveals API keys or tokens | Never put credentials in the system prompt |
| Privilege escalation — permission bypass | Agent accesses restricted resources | Enforce permissions in tool code |
| Prompt injection — direct | User attempts to override system instructions | Detect injection patterns before the model processes input |
| Prompt injection — indirect | Malicious instructions in retrieved documents | Treat retrieved content as lower-priority data |
| Denial of service — context stuffing | Inputs fill the context window | Input length limits |
| Denial of service — resource exhaustion | Attacker triggers expensive tool calls | Cost budgets per session |

## Escalation Triggers

- [ ] Requested action involves financial transactions, data deletion, or permission modification
- [ ] Agent confidence is low or the request is ambiguous
- [ ] Request falls outside defined policy boundaries
- [ ] Agent has failed to resolve the task after multiple attempts
- [ ] Request involves personal, legal, or medical topics
- [ ] User has expressed frustration more than twice in the same session

## Testing Phase

- [ ] Run prompt injection tests — both direct and indirect
- [ ] Test tool misuse scenarios: malformed arguments, chained harmful calls, excessive call rates
- [ ] Verify all escalation paths trigger correctly
- [ ] Conduct red team exercises
- [ ] Run automated safety evals on every deployment
