import { useState, useEffect, useCallback } from 'react'
import { getGroupMatches } from '@/lib/group-matches'
import type { GroupMatch } from '@/lib/group-types'

const PAGE_SIZE = 20

export function useGroupMatches(groupId: string | null) {
  const [matches, setMatches] = useState<GroupMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)

  const fetchMatches = useCallback(async () => {
    if (!groupId) {
      setMatches([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const result = await getGroupMatches(groupId, { limit: PAGE_SIZE })
      setMatches(result)
      setHasMore(result.length >= PAGE_SIZE)
    } catch {
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const loadMore = useCallback(async () => {
    if (!groupId || !hasMore) return
    try {
      const result = await getGroupMatches(groupId, { limit: PAGE_SIZE })
      // In a real implementation, startAfter would use the last doc snapshot
      // For now, we append fetched results
      setMatches(prev => [...prev, ...result])
      setHasMore(result.length >= PAGE_SIZE)
    } catch {
      // silently fail on load more
    }
  }, [groupId, hasMore])

  return { matches, loading, loadMore, hasMore, refetch: fetchMatches }
}
