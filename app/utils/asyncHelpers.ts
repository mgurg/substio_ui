export const withLoading = async (loadingRef, action, options = {}) => {
  const logMessage = options.logMessage
  const onError = options.onError

  loadingRef.value = true
  try {
    return await action()
  } catch (error) {
    if (logMessage) {
      console.error(logMessage, error)
    } else {
      console.error(error)
    }
    if (onError) {
      onError(error)
    }
    return null
  } finally {
    loadingRef.value = false
  }
}
