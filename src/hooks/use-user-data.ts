import { useState, useEffect, useCallback } from 'react'
import { getUserMatches, setUserMatches, getUserOwnedSets, setUserOwnedSets } from '@/lib/firestore'
import type { Match } from '@/lib/types'

export function useUserMatches(userId: string | null) {
  const [matches, setMatchesLocal] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setMatchesLocal([]); setLoading(false); return }
    setLoading(true)
    getUserMatches(userId).then(m => { setMatchesLocal(m); setLoading(false) })
  }, [userId])

  const setMatches = useCallback((updater: (prev: Match[]) => Match[]) => {
    setMatchesLocal(prev => {
      const next = updater(prev)
      if (userId) setUserMatches(userId, next)
      return next
    })
  }, [userId])

  return { matches, setMatches, loading }
}

export function useUserOwnedSets(userId: string | null) {
  const [ownedSets, setOwnedSetsLocal] = useState<string[]>([])

  useEffect(() => {
    if (!userId) { setOwnedSetsLocal([]); return }
    getUserOwnedSets(userId).then(s => setOwnedSetsLocal(s))
  }, [userId])

  const setOwnedSets = useCallback((updater: (prev: string[]) => string[]) => {
    setOwnedSetsLocal(prev => {
      const next = updater(prev)
      if (userId) setUserOwnedSets(userId, next)
      return next
    })
  }, [userId])

  return { ownedSets, setOwnedSets }
}
