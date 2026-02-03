# Contributing Cursor Provider to models.dev

This document explains how to contribute the Cursor provider to the public models.dev database.

## Overview

Currently, Cursor appears in OpenCode through hardcoded provider injection in `src/provider/provider.ts`. The long-term solution is to add Cursor to the public models.dev database so it's available to all tools in the ecosystem.

## Files

- **`cursor.toml`**: Provider definition file for models.dev
- Contains all common Cursor models with proper metadata
- All costs are set to 0 (covered by Cursor subscription)

## Contribution Steps

### 1. Fork the Repository

```bash
git clone https://github.com/sst/models.dev
cd models.dev
```

### 2. Add the Cursor Provider

```bash
# Copy the cursor.toml file to the providers directory
cp /path/to/opencode/packages/opencode/cursor.toml providers/cursor.toml
```

### 3. Test the Provider Locally

```bash
# Build the models.dev database
bun run build

# Verify cursor appears in the output
cat dist/api.json | jq '.cursor'
```

### 4. Submit Pull Request

Create a PR with:
- **Title**: "Add Cursor provider"
- **Description**:
  ```markdown
  # Add Cursor Provider
  
  This PR adds the Cursor provider to models.dev, enabling integration with Cursor's AI backend.
  
  ## About Cursor
  
  Cursor is an AI-powered code editor that provides access to multiple frontier models including GPT-5, Claude Sonnet/Opus 4.5, Gemini 3, and more through a local CLI tool (`cursor-agent`).
  
  ## Provider Details
  
  - **Provider ID**: `cursor`
  - **API Endpoint**: `http://localhost:32123/v1` (local proxy)
  - **Authentication**: Via `cursor-agent` CLI
  - **Models**: 13 models including auto, GPT-5.2, Claude Sonnet/Opus 4.5, Gemini 3, etc.
  - **Cost**: $0 (covered by Cursor subscription)
  
  ## Integration
  
  OpenCode already has built-in support for Cursor through a plugin that:
  - Spawns a local proxy server
  - Translates OpenAI-compatible requests to cursor-agent CLI
  - Dynamically discovers available models based on user subscription
  
  Adding this provider to models.dev will make it available to the broader ecosystem.
  
  ## Testing
  
  Tested with OpenCode integration - provider appears automatically and all models work correctly.
  ```

### 5. After Merge

Once the PR is merged and models.dev is updated:

1. Remove the hardcoded provider injection from OpenCode:
   ```typescript
   // Delete this section from src/provider/provider.ts (around line 725-761):
   database["cursor"] = { ... }
   ```

2. The provider will now come from models.dev automatically
3. Users will continue to see Cursor in the provider list without any code changes

## Benefits of models.dev Integration

- **Ecosystem-wide availability**: Cursor becomes available to all tools using models.dev
- **Centralized maintenance**: Model updates happen in one place
- **Community contributions**: Others can help maintain the provider definition
- **No hardcoding**: OpenCode doesn't need special-case code for Cursor

## Related Links

- models.dev repository: https://github.com/sst/models.dev
- Cursor CLI: https://cursor.com/cli
- OpenCode Cursor integration: https://opencode.ai/docs/providers/cursor
