---
description: Checklist for designing well-formed agent tools — load alongside api-and-interface-design or when reviewing tool/function definitions
---

# Tool Design Checklist

## Naming

- [ ] Name uses verb + noun format (e.g., `search_knowledge_base`, `create_support_ticket`, `get_order_by_id`)
- [ ] Name immediately conveys the action and its target
- [ ] Name is specific enough to distinguish from similar tools (not `get_data`, `process`, `run`)

## Single Responsibility

- [ ] Each tool does exactly one thing
- [ ] Tools are not grouped by a mode/action parameter (no `manage_orders(action="create|read|update|delete")`)
- [ ] Each operation in a CRUD set is a separate tool with its own parameter schema

## Parameter Design

- [ ] Parameter names are descriptive words, not abbreviations (`query` not `q`, `max_results` not `n`)
- [ ] Every parameter has a description string
- [ ] Descriptions include format examples (e.g., `"e.g., 'ORD-12345'"`)
- [ ] Valid ranges or enums are specified for constrained parameters
- [ ] Default values are documented in the description
- [ ] Required vs. optional parameters are explicitly marked

## Tool Description

- [ ] Description states what the tool does (primary action)
- [ ] Description states when to use it (triggering conditions and context)
- [ ] Description states what it returns (output shape and key fields)
- [ ] Description states limitations (what the tool cannot do, what it does not search)

## Output Size Discipline

- [ ] Output contains only fields the agent needs for its next decision
- [ ] Raw API responses are filtered before returning to the model
- [ ] Large result sets are paginated (return a subset with option to get more)
- [ ] Long text fields are truncated or summarised
- [ ] HTTP headers, internal IDs, and audit metadata are stripped from output

## Error Messages

- [ ] Errors include a machine-readable code (e.g., `ORDER_NOT_FOUND`)
- [ ] Errors include a human-readable message that explains what went wrong
- [ ] Errors suggest a corrective action or alternative (e.g., correct ID format, try a different field)
- [ ] Auth failures and rate limits are surfaced as distinct, actionable error types

## Timeouts and Reliability

- [ ] Every external HTTP call has an explicit timeout configured
- [ ] Timeout errors return a descriptive message (not a generic exception)
- [ ] The tool does not hang indefinitely when the upstream service is slow

## Authentication

- [ ] Credentials are handled inside the tool code, not passed as parameters
- [ ] The model never sees API keys, tokens, or secrets
- [ ] Credential storage uses a secrets manager or environment variable, not hardcoded values

## Tool Count

- [ ] Total tool count is under 15 for general agents (prefer 5–10)
- [ ] If 15–30 tools are needed, tool names and descriptions are distinct enough to prevent wrong-tool selection
- [ ] If 30+ tools are needed, a two-stage category-then-tool selection approach is used

## Implementation Abstraction

- [ ] Tools wrap internal implementation details (URL structure, auth headers, request format)
- [ ] The model is not expected to know API paths, query syntax, or response schemas
- [ ] Tool interfaces are stable even if the underlying API changes

## Testability

- [ ] Each tool is tested independently before being connected to the agent
- [ ] Tool tests cover: happy path, not-found, invalid input, auth failure, timeout
