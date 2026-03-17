---
name: copilot-sdk
description: Use when building applications powered by GitHub Copilot using the Copilot SDK. Triggers on tasks involving programmatic Copilot integration, session management, custom tools, streaming responses, hooks, MCP server integration, BYOK providers, or deploying Copilot-backed services across Node.js, Python, Go, or .NET.
metadata:
  source: original
---

# GitHub Copilot SDK

Build applications that programmatically interact with GitHub Copilot. The SDK wraps the Copilot CLI via JSON-RPC, providing session management, custom tools, hooks, MCP server integration, and streaming across Node.js, Python, Go, and .NET.

Source: [microsoft/skills](https://github.com/microsoft/skills/tree/main/.github/skills/copilot-sdk)

## Prerequisites

- **GitHub Copilot CLI** installed and authenticated (`copilot --version`)
- **GitHub Copilot subscription** (Individual, Business, or Enterprise) — not required for BYOK
- **Runtime:** Node.js 18+ / Python 3.8+ / Go 1.21+ / .NET 8.0+

## Installation

| Language | Package | Install |
|----------|---------|---------|
| Node.js | `@github/copilot-sdk` | `npm install @github/copilot-sdk` |
| Python | `github-copilot-sdk` | `pip install github-copilot-sdk` |
| Go | `github.com/github/copilot-sdk/go` | `go get github.com/github/copilot-sdk/go` |
| .NET | `GitHub.Copilot.SDK` | `dotnet add package GitHub.Copilot.SDK` |

## Architecture

```
Your App → SDK Client → [stdio/TCP] → Copilot CLI → Model Provider
                                          ↕
                                     MCP Servers
```

| Transport | Description | Use Case |
|-----------|-------------|----------|
| **Stdio** (default) | CLI as subprocess via pipes | Local dev, single process |
| **TCP** | CLI as network server | Multi-client, backend services |

---

## Core Pattern: Client → Session → Message

### Node.js / TypeScript

```typescript
import { CopilotClient } from "@github/copilot-sdk";

const client = new CopilotClient();
const session = await client.createSession({ model: "gpt-4.1" });
const response = await session.sendAndWait({ prompt: "What is 2 + 2?" });
console.log(response?.data.content);
await client.stop();
```

### Python

```python
import asyncio
from copilot import CopilotClient

async def main():
    client = CopilotClient()
    await client.start()
    session = await client.create_session({"model": "gpt-4.1"})
    response = await session.send_and_wait({"prompt": "What is 2 + 2?"})
    print(response.data.content)
    await client.stop()

asyncio.run(main())
```

### Go

```go
client := copilot.NewClient(nil)
if err := client.Start(ctx); err != nil { log.Fatal(err) }
defer client.Stop()

session, _ := client.CreateSession(ctx, &copilot.SessionConfig{Model: "gpt-4.1"})
response, _ := session.SendAndWait(ctx, copilot.MessageOptions{Prompt: "What is 2 + 2?"})
fmt.Println(*response.Data.Content)
```

### .NET

```csharp
await using var client = new CopilotClient();
await using var session = await client.CreateSessionAsync(new SessionConfig { Model = "gpt-4.1" });
var response = await session.SendAndWaitAsync(new MessageOptions { Prompt = "What is 2 + 2?" });
Console.WriteLine(response?.Data.Content);
```

---

## Streaming Responses

```typescript
const session = await client.createSession({ model: "gpt-4.1", streaming: true });

session.on("assistant.message_delta", (event) => {
    process.stdout.write(event.data.deltaContent);
});
session.on("session.idle", () => console.log());

await session.sendAndWait({ prompt: "Tell me a joke" });
```

| Method | Description |
|--------|-------------|
| `on(handler)` | Subscribe to all events; returns unsubscribe function |
| `on(eventType, handler)` | Subscribe to specific event type (Node.js only) |

---

## Custom Tools

```typescript
import { CopilotClient, defineTool } from "@github/copilot-sdk";

const getWeather = defineTool("get_weather", {
    description: "Get the current weather for a city",
    parameters: {
        type: "object",
        properties: { city: { type: "string", description: "The city name" } },
        required: ["city"],
    },
    handler: async ({ city }) => ({ city, temperature: "72°F", condition: "sunny" }),
});

const session = await client.createSession({ model: "gpt-4.1", tools: [getWeather] });
```

**Tool requirements:**
- Handler must return JSON-serializable data
- Parameters must follow JSON Schema format
- Description should clearly state when the tool should be called

---

## Hooks

| Hook | Trigger | Use Case |
|------|---------|----------|
| `onPreToolUse` | Before tool executes | Permission control, argument modification |
| `onPostToolUse` | After tool executes | Result transformation, logging, redaction |
| `onUserPromptSubmitted` | User sends message | Prompt modification, context injection |
| `onSessionStart` | Session begins | Add context, configure session |
| `onSessionEnd` | Session ends | Cleanup, analytics |
| `onErrorOccurred` | Error happens | Custom error handling, retry logic |

```typescript
const session = await client.createSession({
    hooks: {
        onPreToolUse: async (input) => {
            if (["shell", "bash"].includes(input.toolName)) {
                return { permissionDecision: "deny", permissionDecisionReason: "Shell access not permitted" };
            }
            return { permissionDecision: "allow" };
        },
        onPostToolUse: async (input) => {
            // Redact sensitive data from results
            return null; // Pass through unchanged
        },
        onUserPromptSubmitted: async (input) => {
            return { modifiedPrompt: `[Context] ${input.prompt}` };
        },
    },
});
```

---

## MCP Server Integration

```typescript
// Local stdio server
const session = await client.createSession({
    mcpServers: {
        filesystem: {
            type: "local",
            command: "npx",
            args: ["-y", "@modelcontextprotocol/server-filesystem", "/allowed/path"],
            tools: ["*"],
        },
        github: {
            type: "http",
            url: "https://api.githubcopilot.com/mcp/",
            headers: { Authorization: "Bearer ${TOKEN}" },
            tools: ["*"],
        },
    },
});
```

**Common MCP issues:**
- Tools not appearing → Set `tools: ["*"]` and verify server responds to `tools/list`
- Server not starting → Use absolute command paths, check `cwd`
- Stdout pollution → Debug output must go to stderr, not stdout

---

## Authentication

Methods in priority order:
1. `githubToken` in constructor
2. `CAPI_HMAC_KEY` or `COPILOT_HMAC_KEY` env vars
3. `GITHUB_COPILOT_API_TOKEN` with `COPILOT_API_URL`
4. `COPILOT_GITHUB_TOKEN` → `GH_TOKEN` → `GITHUB_TOKEN` env vars
5. Stored OAuth from `copilot auth login`
6. GitHub CLI credentials

```typescript
const client = new CopilotClient({ githubToken: process.env.GITHUB_TOKEN });
```

---

## BYOK (Bring Your Own Key)

No Copilot subscription required — the CLI acts as agent runtime only.

```typescript
// OpenAI
provider: { type: "openai", baseUrl: "https://api.openai.com/v1", apiKey: process.env.OPENAI_API_KEY }

// Anthropic
provider: { type: "anthropic", baseUrl: "https://api.anthropic.com", apiKey: process.env.ANTHROPIC_API_KEY }

// Ollama (local)
provider: { type: "openai", baseUrl: "http://localhost:11434/v1" }

// Azure OpenAI
provider: {
    type: "azure",
    baseUrl: "https://my-resource.openai.azure.com",
    apiKey: process.env.AZURE_OPENAI_KEY,
    azure: { apiVersion: "2024-10-21" },
}
```

> **Note:** Bearer tokens expire (~1 hour). The SDK does not auto-refresh — create a new session when tokens expire.

---

## Session Persistence

```typescript
// Create with explicit ID
const session = await client.createSession({ sessionId: "user-123-task-456", model: "gpt-4.1" });

// Resume later
const resumed = await client.resumeSession("user-123-task-456");
await resumed.sendAndWait({ prompt: "What did we discuss?" });

// Management
const sessions = await client.listSessions();
await client.deleteSession("user-123-task-456");
```

| Data | Persisted? |
|------|------------|
| Conversation history | ✅ Yes |
| Tool call results | ✅ Yes |
| Session artifacts | ✅ Yes |
| Provider/API keys | ❌ No — must re-provide on resume |
| In-memory tool state | ❌ No — design tools to be stateless |

**Infinite sessions** (auto-compaction for long workflows):

```typescript
const session = await client.createSession({
    infiniteSessions: { enabled: true, backgroundCompactionThreshold: 0.80, bufferExhaustionThreshold: 0.95 },
});
```

---

## Custom Agents & System Message

```typescript
const session = await client.createSession({
    customAgents: [{
        name: "pr-reviewer",
        displayName: "PR Reviewer",
        description: "Reviews pull requests for best practices",
        prompt: "You are an expert code reviewer. Focus on security, performance, and maintainability.",
    }],
    systemMessage: { content: "You are a helpful assistant. Always be concise." },
});
```

---

## Skills Integration

```typescript
const session = await client.createSession({
    skillDirectories: ["./skills/code-review", "./skills/documentation"],
    disabledSkills: ["experimental-feature"],
});
```

---

## Deployment Patterns

| Pattern | Setup | Use Case |
|---------|-------|----------|
| **Local CLI** (default) | `new CopilotClient()` | Auto-manages CLI process |
| **External CLI Server** | `copilot --headless --port 4321` + `{ cliUrl: "localhost:4321" }` | Multi-client backend services |
| **Bundled CLI** | `{ cliPath: path.join(__dirname, "vendor", "copilot") }` | Desktop apps |

**Production checklist:**
- [ ] Session cleanup — periodic deletion of expired sessions
- [ ] Health checks — ping CLI server, restart if unresponsive
- [ ] Persistent storage — mount `~/.copilot/session-state/` for containers
- [ ] Secret management — use Vault/K8s Secrets for tokens
- [ ] Graceful shutdown — drain active sessions before stopping CLI

---

## SDK vs CLI Features

### Available in SDK
Session management, messaging, custom tools, tool permission hooks, MCP servers, streaming, model selection, BYOK providers, custom agents, system message, skills, infinite sessions, permission handlers, 40+ event types.

### CLI-Only
Session export (`--share`), slash commands, interactive UI, terminal rendering, YOLO mode, login/logout, `/review`, `/delegate`.

**Workarounds:** Use `session.on()` + `session.getMessages()` instead of session export; use `onPermissionRequest` instead of `--allow-all-paths`; use `infiniteSessions` instead of `/compact`.

---

## Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| `CLI not found` | CLI not installed or not in PATH | Install CLI or set `cliPath` |
| `Not authenticated` | No valid credentials | Run `copilot auth login` or provide `githubToken` |
| `Session not found` | Using session after `destroy()` | Check `listSessions()` for valid IDs |
| MCP tools missing | Server init failure | Set `tools: ["*"]`, test server independently |

## References

- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)
- [Copilot CLI Installation](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [MCP Servers Directory](https://github.com/modelcontextprotocol/servers)
