import { useState, useEffect, useCallback, useRef } from 'react'
import { getGroupMatches } from '@/lib/group-matches'
import type { GroupMatch } from '@/lib/group-types'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

const PAGE_SIZE = 20

export function useGroupMatches(groupId: string | null) {
  const [matches, setMatches] = useState<GroupMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const lastDocRef = useRef<QueryDocumentSnapshot | null>(null)
  const loadingMoreRef = useRef(false)

  const fetchMatches = useCallback(async () => {
    if (!groupId) {
      setMatches([])
      setLoading(false)
      setHasMore(true)
      lastDocRef.current = null
      return
    }
    setLoading(true)
    setError(null)
    lastDocRef.current = null
    try {
      const { matches: result, lastDoc } = await getGroupMatches(groupId, { limit: PAGE_SIZE })
      setMatches(result)
      lastDocRef.current = lastDoc
      setHasMore(result.length >= PAGE_SIZE)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load matches'))
      setMatches([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchMatches()
  }, [fetchMatches])

  const loadMore = useCallback(async () => {
    if (!groupId || !hasMore || loadingMoreRef.current || !lastDocRef.current) return
    loadingMoreRef.current = true
    try {
      const { matches: result, lastDoc } = await getGroupMatches(groupId, {
        limit: PAGE_SIZE,
        startAfter: lastDocRef.current,
      })
      lastDocRef.current = lastDoc
      setMatches(prev => [...prev, ...result])
      setHasMore(result.length >= PAGE_SIZE)
    } catch {
      // silently fail on load more
    } finally {
      loadingMoreRef.current = false
    }
  }, [groupId, hasMore])

  return { matches, loading, error, loadMore, hasMore, refetch: fetchMatches }
}
