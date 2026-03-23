---
description: Decision rules for CLI vs MCP, MCP security checklist, and MCP tool design — load when designing or evaluating MCP integrations
---

# MCP Decision Rules

## CLI vs MCP Decision Table

| Situation | Use CLI | Use MCP |
|-----------|---------|---------|
| Developer working locally | Yes | — |
| Well-known tool with strong LLM training data (git, docker, kubectl, gh, jq) | Yes | — |
| Single-user agent with ambient permissions acceptable | Yes | — |
| Multi-user / multi-tenant agent | — | Yes |
| Enterprise audit trail required | — | Yes |
| Per-user OAuth scoping required | — | Yes |
| High-frequency calls to a narrow, stable tool set | — | Yes (schema cost amortises) |
| Broad tool surface, occasional use | Yes | — |
| Custom internal API with no existing CLI | — | Yes |
| Tool schema or capabilities change frequently (dynamic discovery needed) | — | Yes |

**Default rule:** Start with CLI. Add MCP when you hit a specific limitation MCP solves — usually authentication, multi-tenancy, or structured tool discovery.

**Token cost difference:** CLI approaches cost approximately 1,400 tokens for a simple query. MCP approaches cost approximately 44,000 tokens (32x more) due to schema loading. A database MCP server with 106 tools can consume 54,600 tokens at initialisation before any work begins.

## Decision Flowchart

```
Does the service have a well-known CLI?
├── Yes → Does the agent need multi-user auth or audit trails?
│         ├── No  → Use CLI directly
│         └── Yes → Use MCP with OAuth
└── No  → Is there an existing, maintained MCP server from a trusted source?
          ├── Yes → Use the MCP server
          └── No  → Does the service have a REST API?
                    ├── Yes → Build an MCP server or use ADK OpenAPI tools
                    └── No  → Build a custom function tool
```

## MCP Security Checklist

- [ ] Audit which MCP servers the agent connects to — only allowlisted servers
- [ ] Review all tool schemas for overly broad permissions before connecting
- [ ] Use OAuth 2.1 with PKCE for all remote (HTTP) MCP servers
- [ ] Store secrets in a secrets manager (e.g., Google Cloud Secret Manager), not environment variables or config files
- [ ] Rotate credentials regularly; avoid long-lived static API keys
- [ ] Validate and sanitise tool outputs before the agent acts on them
- [ ] Limit tool count per server (target under 20)
- [ ] Log all tool invocations for audit trails
- [ ] Test with adversarial inputs: tool poisoning, prompt injection through tool results
- [ ] Use an API gateway (e.g., Apigee) for enterprise MCP deployments requiring rate limiting, quota, and centralised governance
- [ ] Run MCP servers in sandboxed environments where possible

## MCP Attack Vectors and Mitigations

| Attack | Description | Mitigation |
|--------|-------------|------------|
| **Tool poisoning** | Compromised MCP server returns manipulated results that cause the agent to take harmful actions | Validate tool outputs; use multiple sources for critical decisions; implement output filtering |
| **Tool shadowing** | Malicious tool mimics a legitimate one by name or description | Allowlist which MCP servers the agent connects to; review tool names on connection |
| **Excessive permissions** | MCP server exposes write operations when only read is needed | Build or use servers that expose only required operations; enforce server-side access controls |
| **Context window bloat** | Too many tools degrade agent performance and exhaust context budget | Keep tool counts per server under 20; use multiple specialised servers instead of one large one |
| **Secret exposure** | Long-lived static API keys stored in env vars or config (found in 50%+ of open-source MCP servers) | Use short-lived scoped credentials; store in a secrets manager; rotate regularly |

## MCP Tool Design Principles

### Tool count

- Target 5–20 tools per MCP server.
- Use multiple focused servers rather than one server with 50+ tools.
- Tool schema loading is the primary context cost — fewer tools per server reduces this.

### Granularity

- Prefer fine-grained tools over coarse-grained ones.
- Good: `get_user_by_id`, `list_users`, `create_user`, `update_user_email`
- Bad: `manage_users` with a `mode` parameter (`create|read|update|delete`)
- Fine-grained tools give the LLM clear, unambiguous choices.

### Naming and descriptions

- Tool name: describes the action — `search_documents_by_topic` not `search`
- Description: states when to use the tool, what it returns, and key constraints
- Parameter descriptions: include types, valid ranges, and format examples
- Error messages: help the LLM recover — `"User not found. Try searching by email instead of ID."`

### Output size discipline

- Return only what the agent needs for its next decision
- Paginate large result sets
- Summarise rather than dump raw API responses
- Use structured JSON for machine-parseable output
- Strip HTTP headers, internal IDs, and audit metadata before returning

## Transport Selection

| Question | stdio | Streamable HTTP |
|----------|-------|----------------|
| Is the server local to the agent? | Preferred | Either |
| Is remote access needed? | No | Yes |
| Is serverless deployment needed (Lambda, Cloud Functions)? | No | Yes |
| Is latency critical? | Better | Higher |

Note: The original SSE transport was deprecated in the March 2025 MCP spec revision. Use Streamable HTTP for all new remote servers.

## MCP Primitives Reference

| Primitive | What it is | Who decides to use it | Adoption (late 2025) |
|-----------|-----------|----------------------|----------------------|
| **Tools** | Functions the agent can call | The model | ~99% of MCP clients |
| **Resources** | Data the agent can read | The application or user | ~35% of MCP clients |
| **Prompts** | Reusable prompt templates | The user | ~30% of MCP clients |

In practice, Tools are the primary primitive. Design for tool support first.
