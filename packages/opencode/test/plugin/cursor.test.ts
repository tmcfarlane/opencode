import { describe, expect, test } from "bun:test"
import { Instance } from "../../src/project/instance"
import { ProviderAuth } from "../../src/provider/auth"
import { Plugin } from "../../src/plugin"
import { tmpdir } from "../fixture/fixture"

describe("plugin.cursor", () => {
  test("cursor auth plugin is registered", async () => {
    await using tmp = await tmpdir()

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const methods = await ProviderAuth.methods()
        const cursor = methods["cursor"]

        expect(cursor).toBeDefined()
        expect(cursor.length).toBeGreaterThanOrEqual(1)

        // Verify the cursor-agent CLI login method exists
        const browserMethod = cursor.find((m) => m.label === "Login via cursor-agent (opens browser)")
        expect(browserMethod).toBeDefined()
        expect(browserMethod?.type).toBe("oauth")
      },
    })
  }, 30000)

  test("cursor auth method surfaces error when cursor-agent is missing", async () => {
    await using tmp = await tmpdir()

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const plugins = await Plugin.list()
        const cursorPlugin = plugins.find((p) => p.auth?.provider === "cursor")
        expect(cursorPlugin).toBeDefined()

        const method = cursorPlugin!.auth!.methods.find((m) => m.label === "Login via cursor-agent (opens browser)")
        expect(method).toBeDefined()
        expect(method!.type).toBe("oauth")
        if (!method?.authorize) {
          throw new Error("cursor auth method missing authorize")
        }

        const prev = process.env.PATH
        process.env.PATH = ""
        try {
          await expect(method.authorize()).rejects.toThrow(/CursorAgentMissingError/)
        } finally {
          process.env.PATH = prev
        }
      },
    })
  }, 30000)

  test("cursor auth loader handles missing CLI gracefully", async () => {
    await using tmp = await tmpdir()

    await Instance.provide({
      directory: tmp.path,
      fn: async () => {
        const plugins = await Plugin.list()
        const cursorPlugin = plugins.find((p) => p.auth?.provider === "cursor")

        expect(cursorPlugin).toBeDefined()
        expect(cursorPlugin?.auth?.loader).toBeDefined()

        // Mock provider object with empty models
        const mockProvider: any = {
          id: "cursor",
          name: "Cursor",
          source: "config",
          env: [],
          options: {},
          models: {},
        }

        // Mock getAuth function
        const getAuth = async () => ({
          type: "api" as const,
          key: "test-key",
        })

        // Call loader - should not throw even if CLI is unavailable
        const result = await cursorPlugin!.auth!.loader!(getAuth, mockProvider)

        // Loader should return an empty object or minimal options
        expect(result).toBeDefined()
        expect(typeof result).toBe("object")

        // Provider should have models populated (either from CLI discovery or fallback defaults)
        expect(mockProvider.models).toBeDefined()
        expect(typeof mockProvider.models).toBe("object")

        // Should have at least the fallback default models
        const modelCount = Object.keys(mockProvider.models).length
        expect(modelCount).toBeGreaterThan(0)

        // Verify fallback models include common ones
        const modelIds = Object.keys(mockProvider.models)
        expect(modelIds.length).toBeGreaterThan(0)
        // The loader should populate at least the "auto" model
        const hasAutoModel = modelIds.some((id) => id === "auto" || id.startsWith("auto"))
        expect(hasAutoModel).toBe(true)
      },
    })
  }, 30000)
})
