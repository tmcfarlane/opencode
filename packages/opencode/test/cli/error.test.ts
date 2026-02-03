import { describe, expect, test } from "bun:test"
import { FormatError } from "../../src/cli/error"

describe("cli.error", () => {
  test("formats CursorAgentMissingError data.message", () => {
    const msg = FormatError({
      name: "CursorAgentMissingError",
      data: {
        message: "cursor-agent is not installed",
      },
    })
    expect(msg).toBe("cursor-agent is not installed")
  })
})
