import type { Hooks, PluginInput } from "@opencode-ai/plugin"
import { Log } from "../util/log"

const log = Log.create({ service: "plugin.cursor" })

const CURSOR_PROVIDER_ID = "cursor"
const CURSOR_PROXY_HOST = "127.0.0.1"
const CURSOR_PROXY_DEFAULT_PORT = 32123
const CURSOR_PROXY_DEFAULT_BASE_URL = `http://${CURSOR_PROXY_HOST}:${CURSOR_PROXY_DEFAULT_PORT}/v1`

type CursorModel = {
  id: string
  displayName: string
  isThinking: boolean
}

type CachedModels = {
  models: CursorModel[]
  timestamp: number
}

const MODEL_CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes
const MODEL_LIMITS: Record<string, { context: number; output: number }> = {
  "sonnet-4.5": { context: 200000, output: 16384 },
  "sonnet-4.5-thinking": { context: 200000, output: 16384 },
  "opus-4.5": { context: 200000, output: 16384 },
  "opus-4.5-thinking": { context: 200000, output: 16384 },
  "gpt-5.2": { context: 272000, output: 16384 },
  "gpt-5.2-codex": { context: 272000, output: 16384 },
  "gpt-5.1": { context: 200000, output: 16384 },
  "gpt-5.1-codex": { context: 200000, output: 16384 },
  "gemini-3-pro": { context: 200000, output: 16384 },
  "gemini-3-flash": { context: 200000, output: 16384 },
  "composer-1": { context: 200000, output: 16384 },
  grok: { context: 256000, output: 16384 },
  auto: { context: 200000, output: 16384 },
}

type ToolDef = {
  type?: string
  function?: {
    name?: string
    description?: string
    parameters?: any
  }
}

type ToolCallPlan =
  | { action: "final"; content: string }
  | { action: "tool_call"; tool_calls: Array<{ name: string; arguments: any }> }

function openAIError(status: number, message: string, details?: string): Response {
  const body = {
    error: {
      message: details ? `${message}\n${details}` : message,
      type: "cursor_agent_error",
      param: null,
      code: null,
    },
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function normalizeCursorAgentModel(model?: string): string {
  if (!model) return "auto"

  const aliases: Record<string, string> = {
    "gpt-5": "gpt-5.2",
    "sonnet-4": "sonnet-4.5",
  }

  return aliases[model] || model
}

function summarizeTool(tool: ToolDef): string {
  const name = tool?.function?.name || "unknown"
  const description = tool?.function?.description || ""
  const params = tool?.function?.parameters

  let paramsSummary = ""
  if (params && typeof params === "object") {
    const props = params.properties && typeof params.properties === "object" ? Object.keys(params.properties) : []
    const required = Array.isArray(params.required) ? params.required : []
    paramsSummary = `args: { ${props.join(", ")} } required: [${required.join(", ")}]`
  }

  return `- ${name}${description ? `: ${description}` : ""}${paramsSummary ? ` (${paramsSummary})` : ""}`
}

function extractPromptFromChatCompletions(body: any): {
  prompt: string
  model?: string
  stream: boolean
  tools: ToolDef[]
} {
  const model = typeof body?.model === "string" ? body.model : undefined
  const stream = body?.stream === true
  const tools: ToolDef[] = Array.isArray(body?.tools) ? body.tools : []

  const messages: Array<any> = Array.isArray(body?.messages) ? body.messages : []

  const lines: string[] = []
  for (const message of messages) {
    const role = typeof message.role === "string" ? message.role : "user"

    if (role === "tool") {
      const name = typeof message.name === "string" ? message.name : "tool"
      const toolCallId = typeof message.tool_call_id === "string" ? message.tool_call_id : ""
      const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content ?? "")
      lines.push(`TOOL RESULT (${name}${toolCallId ? `, id=${toolCallId}` : ""}): ${content}`)
      continue
    }

    if (role === "assistant" && Array.isArray(message.tool_calls)) {
      lines.push(`ASSISTANT TOOL_CALLS: ${JSON.stringify(message.tool_calls)}`)
      continue
    }

    const content = message.content

    if (typeof content === "string") {
      lines.push(`${role.toUpperCase()}: ${content}`)
      continue
    }

    if (Array.isArray(content)) {
      const textParts = content
        .map((part) => {
          if (part && typeof part === "object" && part.type === "text" && typeof part.text === "string") {
            return part.text
          }
          return ""
        })
        .filter(Boolean)
      if (textParts.length) {
        lines.push(`${role.toUpperCase()}: ${textParts.join("\n")}`)
      }
      continue
    }
  }

  return { prompt: lines.join("\n\n"), model, stream, tools }
}

function parseToolCallPlan(output: string): ToolCallPlan | null {
  const start = output.indexOf("{")
  const end = output.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return null

  const jsonText = output.slice(start, end + 1)
  try {
    const parsed = JSON.parse(jsonText)
    if (parsed && parsed.action === "final" && typeof parsed.content === "string") {
      return { action: "final", content: parsed.content }
    }
    if (parsed && parsed.action === "tool_call" && Array.isArray(parsed.tool_calls)) {
      return {
        action: "tool_call",
        tool_calls: parsed.tool_calls
          .filter((t: any) => t && typeof t.name === "string")
          .map((t: any) => ({ name: t.name, arguments: t.arguments ?? {} })),
      }
    }
    return null
  } catch {
    return null
  }
}

function buildToolCallingPrompt(conversation: string, tools: ToolDef[], workspaceDirectory: string): string {
  const toolList = tools.length ? tools.map(summarizeTool).join("\n") : "(none)"

  return [
    "You are a tool-calling assistant running inside OpenCode.",
    `Workspace directory: ${workspaceDirectory}`,
    "",
    "Available tools:",
    toolList,
    "",
    "STRICT OUTPUT:",
    "- Output MUST be exactly one JSON object and nothing else.",
    "- If you output anything outside JSON, your answer is discarded.",
    "",
    "RESPONSE FORMAT:",
    "- Call tool(s):",
    '{"action":"tool_call","tool_calls":[{"name":"list","arguments":{"path":"/ABSOLUTE/PATH"}}]}',
    "- Final answer:",
    '{"action":"final","content":"..."}',
    "",
    "Task:",
    conversation,
  ].join("\n")
}

function createChatCompletionResponse(model: string, content: string) {
  return {
    id: `cursor-agent-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [
      {
        index: 0,
        message: { role: "assistant", content },
        finish_reason: "stop",
      },
    ],
  }
}

function createChatCompletionChunk(id: string, created: number, model: string, deltaContent: string, done = false) {
  return {
    id,
    object: "chat.completion.chunk",
    created,
    model,
    choices: [
      {
        index: 0,
        delta: deltaContent ? { content: deltaContent } : {},
        finish_reason: done ? "stop" : null,
      },
    ],
  }
}

function getGlobalKey(): string {
  return "__opencode_cursor_proxy_server__"
}

function getModelsCacheKey(): string {
  return "__opencode_cursor_models_cache__"
}

function parseModelLine(line: string): CursorModel | null {
  const trimmed = line.trim()
  if (!trimmed) return null
  if (trimmed.startsWith("Tip:")) return null
  if (trimmed.includes("Available") || trimmed.includes("---") || trimmed.includes("Model")) return null

  const idx = trimmed.indexOf(" - ")
  const id = (idx === -1 ? trimmed : trimmed.slice(0, idx)).trim()
  if (!id) return null

  const displayName = (idx === -1 ? trimmed : trimmed.slice(idx + 3)).trim() || id
  return { id, displayName, isThinking: id.includes("thinking") || displayName.toLowerCase().includes("thinking") }
}

async function listCursorModels($: any): Promise<CursorModel[]> {
  const g = globalThis as any
  const cacheKey = getModelsCacheKey()

  // Check cache first
  const cached: CachedModels | undefined = g[cacheKey]
  if (cached && Date.now() - cached.timestamp < MODEL_CACHE_TTL_MS) {
    log.info("using cached cursor models", { count: cached.models.length })
    return cached.models
  }

  const models = new Map<string, CursorModel>()

  const add = (model: CursorModel | null) => {
    if (!model) return
    const existing = models.get(model.id)
    // Prefer richer displayName when we have it (e.g. from "id - Name")
    if (!existing || existing.displayName === existing.id) {
      models.set(model.id, model)
    }
  }

  // Try cursor-agent models command first (newer CLI) with timeout
  try {
    const result = await Promise.race([
      $`agent models --list-models`.quiet().nothrow(),
      new Promise<{ exitCode: number; text: () => string }>((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000)
      ),
    ])
    if (result.exitCode === 0) {
      const output = result.text().trim()
      if (output) {
        // Try parsing as JSON first
        try {
          const parsed = JSON.parse(output)
          if (Array.isArray(parsed)) {
            for (const item of parsed) {
              if (typeof item === "string") add(parseModelLine(item))
              if (item && typeof item === "object") {
                const id = typeof (item as any).id === "string" ? (item as any).id : undefined
                const name = typeof (item as any).name === "string" ? (item as any).name : undefined
                if (id) add({ id, displayName: name || id, isThinking: id.includes("thinking") })
              }
            }
          } else if (parsed && Array.isArray((parsed as any).models)) {
            for (const item of (parsed as any).models) {
              if (typeof item === "string") add(parseModelLine(item))
              if (item && typeof item === "object") {
                const id = typeof (item as any).id === "string" ? (item as any).id : undefined
                const name = typeof (item as any).name === "string" ? (item as any).name : undefined
                if (id) add({ id, displayName: name || id, isThinking: id.includes("thinking") })
              }
            }
          }
        } catch {
          // Not JSON, try parsing as plain text list
          const lines = output.split("\n").map((l: string) => l.trim()).filter(Boolean)
          for (const line of lines) add(parseModelLine(line))
        }
      }
    }
  } catch {
    // Ignore errors, try fallback
  }

  // Fallback to cursor-agent if no models found (with timeout)
  if (models.size === 0) {
    try {
      const result = await Promise.race([
        $`cursor-agent --list-models`.quiet().nothrow(),
        new Promise<{ exitCode: number; text: () => string }>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3000)
        ),
      ])
      if (result.exitCode === 0) {
        const output = result.text().trim()
        if (output) {
          try {
            const parsed = JSON.parse(output)
            if (Array.isArray(parsed)) {
              for (const item of parsed) {
                if (typeof item === "string") add(parseModelLine(item))
                if (item && typeof item === "object") {
                  const id = typeof (item as any).id === "string" ? (item as any).id : undefined
                  const name = typeof (item as any).name === "string" ? (item as any).name : undefined
                  if (id) add({ id, displayName: name || id, isThinking: id.includes("thinking") })
                }
              }
            }
          } catch {
            const lines = output.split("\n").map((l: string) => l.trim()).filter(Boolean)
            for (const line of lines) add(parseModelLine(line))
          }
        }
      }
    } catch {
      // Ignore errors
    }
  }

  // If still no models, use known defaults
  if (models.size === 0) {
    log.info("no models discovered from CLI, using defaults")
    const defaultModels = [
      "auto",
      "sonnet-4.5",
      "sonnet-4.5-thinking",
      "opus-4.5",
      "opus-4.5-thinking",
      "gpt-5.2",
      "gpt-5.2-codex",
      "gpt-5.1",
      "gpt-5.1-codex",
      "gemini-3-pro",
      "gemini-3-flash",
      "composer-1",
      "grok",
    ]
    for (const id of defaultModels) {
      add({ id, displayName: id, isThinking: id.includes("thinking") })
    }
  }

  const list = Array.from(models.values())

  // Cache the results
  g[cacheKey] = {
    models: list,
    timestamp: Date.now(),
  }

  log.info("discovered cursor models", { count: list.length })
  return list
}

async function ensureCursorProxyServer(workspaceDirectory: string): Promise<string> {
  const key = getGlobalKey()
  const g = globalThis as any

  const existingBaseURL = g[key]?.baseURL
  if (typeof existingBaseURL === "string" && existingBaseURL.length > 0) {
    return existingBaseURL
  }

  // Mark as starting to avoid duplicate starts in-process
  g[key] = { baseURL: "" }

  const handler = async (req: Request): Promise<Response> => {
    try {
      const url = new URL(req.url)

      if (url.pathname === "/health") {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }

      if (url.pathname !== "/v1/chat/completions" && url.pathname !== "/chat/completions") {
        return openAIError(404, `Unsupported path: ${url.pathname}`)
      }

      const body = await req.json().catch(() => ({}))
      const { prompt, model, stream, tools } = extractPromptFromChatCompletions(body)
      let selectedModel = normalizeCursorAgentModel(model)

      // When tool-calling is enabled and model is "auto", pick a strict model
      if (tools.length && selectedModel === "auto") {
        selectedModel = "sonnet-4.5-thinking"
      }

      const effectivePrompt = tools.length ? buildToolCallingPrompt(prompt, tools, workspaceDirectory) : prompt

      const cmd = [
        "cursor-agent",
        "--print",
        "--output-format",
        "text",
        "--workspace",
        workspaceDirectory,
        "--model",
        selectedModel,
        effectivePrompt,
      ]

      const child = Bun.spawn({
        cmd,
        stdout: "pipe",
        stderr: "pipe",
        env: Bun.env,
      })

      if (!stream) {
        const [stdoutText, stderrText] = await Promise.all([
          new Response(child.stdout).text(),
          new Response(child.stderr).text(),
        ])

        const stdout = (stdoutText || "").trim()
        const stderr = (stderrText || "").trim()

        // If tools were requested and we can parse a plan, treat it as success even if exitCode != 0
        const plan = tools.length ? parseToolCallPlan(stdout) : null
        if (plan?.action === "tool_call") {
          const toolCalls = plan.tool_calls.map((tc, i) => ({
            id: `call_${Date.now()}_${i}`,
            type: "function",
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.arguments ?? {}),
            },
          }))

          const payload = {
            id: `cursor-agent-${Date.now()}`,
            object: "chat.completion",
            created: Math.floor(Date.now() / 1000),
            model: selectedModel,
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: "",
                  tool_calls: toolCalls,
                },
                finish_reason: "tool_calls",
              },
            ],
          }

          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        }

        if (plan?.action === "final") {
          const payload = createChatCompletionResponse(selectedModel, plan.content)
          return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        }

        // cursor-agent sometimes returns non-zero even with usable stdout
        // Treat stdout as success unless we have explicit stderr
        if (child.exitCode !== 0 && stderr.length > 0) {
          return openAIError(401, "cursor-agent failed.", stderr)
        }

        const payload = createChatCompletionResponse(selectedModel, stdout || stderr)
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Streaming
      const encoder = new TextEncoder()
      const id = `cursor-agent-${Date.now()}`
      const created = Math.floor(Date.now() / 1000)

      const sse = new ReadableStream({
        async start(controller) {
          let closed = false
          try {
            // Tool-calling + streaming: buffer stdout to decide whether to emit tool_calls
            if (tools.length) {
              // Keep the SSE connection alive while cursor-agent thinks
              const heartbeat = () => {
                if (closed) return
                try {
                  const pingChunk = createChatCompletionChunk(id, created, selectedModel, "", false)
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify(pingChunk)}\n\n`))
                } catch {
                  // ignore
                }
              }
              heartbeat()
              const interval = setInterval(heartbeat, 1000)

              const [stdoutText, stderrText] = await Promise.all([
                new Response(child.stdout).text(),
                new Response(child.stderr).text(),
              ]).finally(() => {
                clearInterval(interval)
              })

              const stdout = (stdoutText || "").trim()
              const stderr = (stderrText || "").trim()

              const plan = parseToolCallPlan(stdout)
              if (plan?.action === "tool_call") {
                const toolCalls = plan.tool_calls.map((tc, i) => ({
                  index: i,
                  id: `call_${Date.now()}_${i}`,
                  type: "function",
                  function: {
                    name: tc.name,
                    arguments: JSON.stringify(tc.arguments ?? {}),
                  },
                }))

                const chunk = {
                  id,
                  object: "chat.completion.chunk",
                  created,
                  model: selectedModel,
                  choices: [
                    {
                      index: 0,
                      delta: {
                        role: "assistant",
                        tool_calls: toolCalls,
                      },
                      finish_reason: "tool_calls",
                    },
                  ],
                }

                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                return
              }

              const content = plan?.action === "final" ? plan.content : stdout
              if (child.exitCode !== 0 && !plan) {
                // Don't fail hard if stdout is usable; emit it as final content
                const msg = stdout || stderr
                const finalChunk = createChatCompletionChunk(id, created, selectedModel, msg, true)
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`))
                controller.enqueue(encoder.encode("data: [DONE]\n\n"))
                return
              }

              const finalChunk = createChatCompletionChunk(id, created, selectedModel, content, true)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalChunk)}\n\n`))
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              return
            }

            // No tools: stream stdout as text deltas
            const decoder = new TextDecoder()
            const reader = (child.stdout as ReadableStream<Uint8Array>).getReader()

            while (true) {
              const { value, done } = await reader.read()
              if (done) break
              if (!value || value.length === 0) continue
              const text = decoder.decode(value, { stream: true })
              if (!text) continue

              const chunk = createChatCompletionChunk(id, created, selectedModel, text, false)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
            }

            if (child.exitCode !== 0) {
              const stderrText = await new Response(child.stderr).text()
              const msg = `cursor-agent failed: ${(stderrText || "").trim()}`
              const errChunk = createChatCompletionChunk(id, created, selectedModel, msg, true)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(errChunk)}\n\n`))
              controller.enqueue(encoder.encode("data: [DONE]\n\n"))
              return
            }

            const doneChunk = createChatCompletionChunk(id, created, selectedModel, "", true)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(doneChunk)}\n\n`))
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          } finally {
            closed = true
            controller.close()
          }
        },
      })

      return new Response(sse, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return openAIError(500, "Proxy error", message)
    }
  }

  // If another process already started a proxy on the default port, reuse it
  try {
    const res = await fetch(`http://${CURSOR_PROXY_HOST}:${CURSOR_PROXY_DEFAULT_PORT}/health`).catch(() => null)
    if (res && res.ok) {
      g[key].baseURL = CURSOR_PROXY_DEFAULT_BASE_URL
      return CURSOR_PROXY_DEFAULT_BASE_URL
    }
  } catch {
    // ignore
  }

  const startServer = (port: number) => {
    return Bun.serve({
      hostname: CURSOR_PROXY_HOST,
      port,
      fetch: handler,
    })
  }

  try {
    const server = startServer(CURSOR_PROXY_DEFAULT_PORT)
    const baseURL = `http://${CURSOR_PROXY_HOST}:${server.port}/v1`
    g[key].baseURL = baseURL
    log.info("cursor proxy server started", { port: server.port })
    return baseURL
  } catch (error) {
    const code = (error as any)?.code
    if (code !== "EADDRINUSE") {
      throw error
    }

    // Something is already bound to the default port. Only reuse it if it looks like our proxy
    try {
      const res = await fetch(`http://${CURSOR_PROXY_HOST}:${CURSOR_PROXY_DEFAULT_PORT}/health`).catch(() => null)
      if (res && res.ok) {
        g[key].baseURL = CURSOR_PROXY_DEFAULT_BASE_URL
        return CURSOR_PROXY_DEFAULT_BASE_URL
      }
    } catch {
      // ignore
    }

    // Fallback: start on a random free port
    const server = startServer(0)
    const baseURL = `http://${CURSOR_PROXY_HOST}:${server.port}/v1`
    g[key].baseURL = baseURL
    log.info("cursor proxy server started on fallback port", { port: server.port })
    return baseURL
  }
}

async function checkCursorAgentAvailable($: any): Promise<boolean> {
  try {
    const result = await $`cursor-agent --version`.quiet().nothrow()
    return result.exitCode === 0
  } catch {
    return false
  }
}

export async function CursorAuthPlugin(input: PluginInput): Promise<Hooks> {
  // Lazy initialization of proxy server - only start when actually needed
  let proxyBaseURL: string | null = null
  const getProxyBaseURL = async () => {
    if (!proxyBaseURL) {
      proxyBaseURL = await ensureCursorProxyServer(input.directory)
    }
    return proxyBaseURL
  }

  return {
    auth: {
      provider: CURSOR_PROVIDER_ID,
      async loader(getAuth, provider) {
        // Discover available models from cursor CLI
        const discoveredModels = await listCursorModels(input.$)

        // Get proxy URL (will be initialized on first use)
        const baseURL = await getProxyBaseURL()

        // Populate provider.models with discovered models
        for (const model of discoveredModels) {
          const limits = MODEL_LIMITS[model.id] || { context: 200000, output: 16384 }

          // Only add if not already defined (preserve user config)
          if (!provider.models[model.id]) {
            provider.models[model.id] = {
              id: model.id,
              providerID: CURSOR_PROVIDER_ID,
              api: {
                id: model.id,
                npm: "@ai-sdk/openai-compatible",
                url: baseURL,
              },
              status: "active" as const,
              name: model.displayName,
              family: "",
              capabilities: {
                temperature: true,
                reasoning: model.isThinking,
                attachment: true,
                toolcall: true,
                input: {
                  text: true,
                  audio: false,
                  image: true,
                  video: false,
                  pdf: false,
                },
                output: {
                  text: true,
                  audio: false,
                  image: false,
                  video: false,
                  pdf: false,
                },
                interleaved: false,
              },
              cost: {
                input: 0,
                output: 0,
                cache: {
                  read: 0,
                  write: 0,
                },
              },
              limit: limits,
              headers: {},
              options: {},
              release_date: "",
              variants: {},
            } as any
          } else {
            // Update existing model's cost to zero (Cursor subscription covers it)
            provider.models[model.id].cost = {
              input: 0,
              output: 0,
              cache: {
                read: 0,
                write: 0,
              },
            }
          }
        }

        return {}
      },
      methods: [
        {
          label: "Login via cursor-agent (opens browser)",
          type: "api",
          authorize: async () => {
            const isAvailable = await checkCursorAgentAvailable(input.$)
            if (!isAvailable) {
              log.error("cursor-agent binary not found")
              return { type: "failed" as const }
            }

            const whoami = await input.$`cursor-agent whoami`.quiet().nothrow()
            const whoamiText = whoami.text()
            if (whoamiText.includes("Not logged in")) {
              log.info("cursor-agent not logged in, initiating login flow")
              const login = await input.$`cursor-agent login`.nothrow()
              if (login.exitCode !== 0) {
                log.error("cursor-agent login failed")
                return { type: "failed" as const }
              }
            }

            return {
              type: "success" as const,
              key: "cursor-agent",
            }
          },
        },
      ],
    },

    async "chat.params"(chatInput, output) {
      if (chatInput.model.providerID !== CURSOR_PROVIDER_ID) {
        return
      }

      // Always point to the actual proxy base URL (may be dynamically allocated)
      output.options.baseURL = await getProxyBaseURL()
      output.options.apiKey = output.options.apiKey || "cursor-agent"
    },
  }
}
