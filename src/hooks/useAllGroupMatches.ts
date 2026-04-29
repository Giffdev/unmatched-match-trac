import { useState, useEffect, useCallback, useRef } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { GroupMatch } from '@/lib/group-types'

type CacheEntry = {
  matches: GroupMatch[]
  fetchedAt: number
}

// Module-level cache — shared across all component instances (tabs)
const cache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function isCacheValid(groupId: string): boolean {
  const entry = cache.get(groupId)
  if (!entry) return false
  return Date.now() - entry.fetchedAt < CACHE_TTL_MS
}

/**
 * Fetches ALL matches for a group (for stats computation).
 * Caches results in memory so switching between Players/Heroes tabs doesn't re-fetch.
 * For paginated list display, use the existing `useGroupMatches` from use-group-matches.ts.
 */
export function useAllGroupMatches(groupId: string | null) {
  const [matches, setMatches] = useState<GroupMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const abortRef = useRef<string | null>(null)

  const fetchAllMatches = useCallback(async (gid: string) => {
    // Mark this fetch so stale responses are discarded if groupId changes mid-flight
    abortRef.current = gid

    setLoading(true)
    setError(null)

    try {
      const matchesRef = collection(db, 'groups', gid, 'matches')
      const q = query(matchesRef, orderBy('date', 'desc'))
      const snap = await getDocs(q)
      const result = snap.docs.map(d => d.data() as GroupMatch)

      // Only apply if this is still the active groupId
      if (abortRef.current !== gid) return

      cache.set(gid, { matches: result, fetchedAt: Date.now() })
      setMatches(result)
    } catch (err) {
      if (abortRef.current !== gid) return
      setError(err instanceof Error ? err : new Error('Failed to load group matches'))
      setMatches([])
    } finally {
      if (abortRef.current === gid) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!groupId) {
      setMatches([])
      setLoading(false)
      setError(null)
      abortRef.current = null
      return
    }

    // Serve from cache if valid
    if (isCacheValid(groupId)) {
      setMatches(cache.get(groupId)!.matches)
      setLoading(false)
      setError(null)
      return
    }

    fetchAllMatches(groupId)
  }, [groupId, fetchAllMatches])

  const refetch = useCallback(() => {
    if (!groupId) return
    // Invalidate cache and re-fetch
    cache.delete(groupId)
    fetchAllMatches(groupId)
  }, [groupId, fetchAllMatches])

  const invalidateCache = useCallback((gid?: string) => {
    if (gid) {
      cache.delete(gid)
    } else {
      cache.clear()
    }
  }, [])

  return { matches, loading, error, refetch, invalidateCache }
}
