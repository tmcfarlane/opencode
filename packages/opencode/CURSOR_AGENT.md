# Cursor Agent Integration

OpenCode includes built-in support for authenticating with Cursor models via a self-contained proxy server that uses the `cursor-agent` CLI.

## Overview

OpenCode's cursor plugin provides seamless integration with Cursor's AI models by spawning an internal proxy server that translates OpenAI-compatible requests to `cursor-agent` CLI commands. This allows Cursor Ultra members to leverage their token allocation through OpenCode.

**Zero Configuration Required**: Cursor appears automatically in the provider list - no manual configuration needed!

## Prerequisites

- Active Cursor subscription (Cursor Ultra recommended)
- `cursor-agent` CLI installed on your system
- OpenCode installed

## Quick Start

Just two simple steps:

### 1. Install cursor-agent CLI

```bash
curl -fsS https://cursor.com/install | bash
```

### 2. Authenticate with OpenCode

Run the OpenCode authentication command:

```bash
opencode auth login
```

When prompted:
1. Select provider: **Cursor Agent** (appears automatically in the list)
2. Select method: **Login via cursor-agent (opens browser)**
3. Complete authentication in the browser window (via `cursor-agent login`)
4. Return to terminal once authentication is successful

That's it! OpenCode automatically discovers all available models from your Cursor CLI installation based on your subscription level.

## Advanced Configuration (Optional)

If you want to customize the Cursor provider, you can add it to your `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "cursor": {
      "models": {
        "auto": { "name": "Cursor Auto (recommended)" },
        "gpt-5.2": { "name": "GPT-5.2" }
      }
    }
  }
}
```

**Note**: Configuration is completely optional. Cursor works out-of-the-box without any config file changes.

## Usage

Once authenticated, you can use Cursor models like any other provider:

```bash
opencode --model cursor/gpt-5.2
```

Or select the model interactively in the OpenCode interface.

## Available Models

OpenCode **automatically discovers** all models available in your Cursor CLI installation. The exact models available depend on your Cursor subscription level (Free, Pro, or Business).

Common models include:
- `auto` - Automatic model selection (recommended)
- `gpt-5.2` / `gpt-5.2-codex` - Latest GPT-5 models
- `gpt-5.1` / `gpt-5.1-codex` - GPT-5.1 variants
- `sonnet-4.5` / `sonnet-4.5-thinking` - Claude Sonnet 4.5 variants
- `opus-4.5` / `opus-4.5-thinking` - Claude Opus 4.5 variants
- `gemini-3-pro` / `gemini-3-flash` - Google Gemini models
- `composer-1` - Cursor's proprietary model
- `grok` - xAI's Grok model

**Note**: Models are discovered automatically from your Cursor CLI. You don't need to configure them manually. To see which models are available to you, run:

```bash
cursor-agent models --list-models
```

## Troubleshooting

### cursor-agent CLI not installed

**Error**: "cursor-agent CLI is not installed"

**Solution**: 
```bash
curl -fsS https://cursor.com/install | bash
```

### cursor-agent not authenticated

**Error**: Authentication fails or "Not logged in"

**Solution**:
```bash
cursor-agent login
```

Then try OpenCode authentication again.

### cursor-agent whoami check

Verify your cursor-agent authentication status:

```bash
cursor-agent whoami
```

This should show your logged-in Cursor account.

## Architecture

The integration works as follows:

1. **OpenCode** → Spawns internal proxy server (Bun.serve) on localhost:32123
2. **Proxy Server** → Translates OpenAI-compatible HTTP requests to `cursor-agent` CLI commands
3. **cursor-agent CLI** → Communicates with Cursor's API using your authenticated credentials
4. **Proxy Server** → Streams responses back to OpenCode in OpenAI-compatible format

### Key Design Principles

- **Zero Configuration**: Cursor appears automatically in the provider list - no config file needed
- **Self-contained**: No external npm packages required (only `cursor-agent` CLI binary)
- **On-demand**: Proxy server spawns automatically when first needed
- **Persistent**: Server remains running for the session (stored in `globalThis`)
- **Reusable**: If another process is using port 32123, OpenCode will reuse it if it's a valid cursor proxy
- **Auto-discovery**: Models are automatically discovered from the Cursor CLI and cached for 5 minutes

### Automatic Provider Registration

Cursor is registered as a built-in provider:

1. **Provider Injection**: Cursor is automatically added to OpenCode's provider database at startup
2. **Built-in Plugin**: The Cursor authentication plugin is bundled with OpenCode
3. **No Setup Required**: Users see "Cursor Agent" in the provider list immediately

### Dynamic Model Discovery

OpenCode automatically discovers available models from your Cursor CLI installation:

1. **Discovery Process**: When you authenticate with the cursor provider, OpenCode queries the Cursor CLI to get the list of available models
2. **Caching**: Discovered models are cached for 5 minutes to avoid repeated CLI calls
3. **Subscription-Aware**: The available models reflect your Cursor subscription level (Free, Pro, Business)
4. **Zero Configuration**: You don't need to manually enumerate models in your config file
5. **Fallback**: If model discovery fails, OpenCode falls back to a known list of common models

## Security Notes

- The proxy server runs locally on your machine (localhost only)
- Your Cursor credentials are managed by the `cursor-agent` CLI (never pass through OpenCode)
- Access tokens are stored in OpenCode's encrypted credential store
- All communication happens locally - no external proxies involved

## Features

### Tool Calling Support

The proxy server automatically translates OpenAI tool-calling conventions to cursor-agent:
- Detects tool definitions in requests
- Formats prompts for cursor-agent CLI
- Parses JSON responses and converts to OpenAI tool_calls format

### Streaming Support

Full SSE (Server-Sent Events) streaming support:
- Real-time streaming of model responses
- Heartbeat pings to keep connections alive during long-running requests
- Proper error handling and cleanup

### Model Aliasing

Automatic model name normalization:
- `gpt-5` → `gpt-5.2`
- `sonnet-4` → `sonnet-4.5`

## See Also

- [cursor-agent CLI](https://cursor.com/cli)
- [OpenCode configuration docs](https://opencode.ai/docs)
- [OpenCode authentication guide](https://opencode.ai/docs/auth)
