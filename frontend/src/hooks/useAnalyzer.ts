import { useState } from 'react'
import type { AnalyzeResponse } from '../types'

export function useAnalyzer() {
  const [path, setPath] = useState('./bag/turtlebot_walking_bag')
  const [comparePaths, setComparePaths] = useState(['', ''])
  const [showCompare, setShowCompare] = useState(false)
  const [data, setData] = useState<AnalyzeResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)

  const analyze = async () => {
    if (!path) return
    setLoading(true)
    setError(null)
    setExpandedTopic(null)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setData(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
  }

  const compare = async () => {
    if (!comparePaths[0] || !comparePaths[1]) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paths: comparePaths }),
      })
      const result = await res.json()
      if (result.error) {
        setError(result.error)
      } else {
        setData(result)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
    setLoading(false)
  }

  return {
    path, setPath,
    comparePaths, setComparePaths,
    showCompare, setShowCompare,
    data,
    error,
    loading,
    expandedTopic, setExpandedTopic,
    analyze,
    compare,
  }
}
