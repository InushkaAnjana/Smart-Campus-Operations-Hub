/**
 * ================================================================
 * useApi.js - Generic API call hook with loading/error state
 * ================================================================
 * Owner: All Team Members (shared utility)
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi(resourceService.getAll)
 *   useEffect(() => { execute() }, [])
 *
 * TODO: Any member can extend this with pagination, caching, etc.
 * ================================================================
 */
import { useState, useCallback } from 'react'

const useApi = (apiFunc) => {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  const execute = useCallback(async (...args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await apiFunc(...args)
      setData(result)
      return result
    } catch (err) {
      const message = err?.message || 'An error occurred. Please try again.'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [apiFunc])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { data, loading, error, execute, reset, setData }
}

export default useApi
