import {describe, expect, it} from "vitest"
import {formatDate} from "../../app/utils/formatDate"

describe("formatDate", () => {
  it("returns empty string for falsy input", () => {
    expect(formatDate("")).toBe("")
    expect(formatDate(null)).toBe("")
    expect(formatDate(undefined)).toBe("")
  })

  it("formats a valid date string", () => {
    const result = formatDate("2024-02-10T12:30:00Z")
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
  })

  it("returns input when date parsing fails", () => {
    const value = "not-a-date"
    expect(formatDate(value)).toBe(value)
  })
})
