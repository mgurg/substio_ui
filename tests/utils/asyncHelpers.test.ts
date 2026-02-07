import {describe, expect, it, vi} from "vitest"
import {ref} from "vue"
import {withLoading} from "../../app/utils/asyncHelpers"

describe("withLoading", () => {
  it("sets loading true during success and resets to false", async () => {
    const loading = ref(false)

    const result = await withLoading(loading, async () => "ok")

    expect(result).toBe("ok")
    expect(loading.value).toBe(false)
  })

  it("logs and calls onError on failure, then resets loading", async () => {
    const loading = ref(false)
    const onError = vi.fn()
    const logSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await withLoading(
      loading,
      async () => {
        throw new Error("boom")
      },
      {
        logMessage: "Error fetching:",
        onError,
      }
    )

    expect(result).toBeNull()
    expect(loading.value).toBe(false)
    expect(onError).toHaveBeenCalledOnce()
    expect(logSpy).toHaveBeenCalled()

    logSpy.mockRestore()
  })
})
