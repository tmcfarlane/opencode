import { describe, expect, test } from "bun:test"

import { extractHeadlessAssistantText, mergeHeadlessText, parseHeadlessJsonResult } from "../../src/plugin/cursor"

describe("plugin.cursor headless parsing", () => {
  test("parseHeadlessJsonResult extracts .result string", () => {
    expect(parseHeadlessJsonResult('{"result":"Hello"}')).toBe("Hello")
  })

  test("parseHeadlessJsonResult returns trimmed text for non-JSON", () => {
    expect(parseHeadlessJsonResult("  hi  ")).toBe("hi")
  })

  test("extractHeadlessAssistantText returns assistant delta", () => {
    const line = JSON.stringify({
      type: "assistant",
      message: { content: [{ text: "A" }] },
    })
    expect(extractHeadlessAssistantText(line)).toBe("A")
  })

  test("extractHeadlessAssistantText ignores non-assistant events", () => {
    expect(extractHeadlessAssistantText(JSON.stringify({ type: "system" }))).toBeNull()
  })

  test("mergeHeadlessText handles cumulative updates", () => {
    const a = mergeHeadlessText("", "Hi")
    expect(a.text).toBe("Hi")
    expect(a.delta).toBe("Hi")

    const b = mergeHeadlessText(a.text, "Hi!")
    expect(b.text).toBe("Hi!")
    expect(b.delta).toBe("!")
  })

  test("mergeHeadlessText handles delta updates", () => {
    const a = mergeHeadlessText("Hi", "!")
    expect(a.text).toBe("Hi!")
    expect(a.delta).toBe("!")
  })
})
