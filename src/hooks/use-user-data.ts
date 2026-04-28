import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserMatches, setUserMatches, getUserOwnedSets, setUserOwnedSets } from '@/lib/firestore'
import type { Match } from '@/lib/types'
import { toast } from 'sonner'

export function useUserMatches(userId: string | null) {
  const [matches, setMatchesLocal] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const loadedFromDb = useRef(false)
  const saveGeneration = useRef(0)

  // Load matches from Firebase on mount / user change
  useEffect(() => {
    loadedFromDb.current = false
    if (!userId) { setMatchesLocal([]); setLoading(false); return }
    setLoading(true)
    getUserMatches(userId).then(m => {
      setMatchesLocal(m)
      setLoading(false)
      // Mark loaded so the persist effect doesn't re-save the initial load
      loadedFromDb.current = true
    })
  }, [userId])

  // Persist matches to Firebase whenever they change (but not on initial load)
  useEffect(() => {
    if (!userId || !loadedFromDb.current) return
    const gen = ++saveGeneration.current
    setUserMatches(userId, matches).catch(err => {
      // Only show error for the latest save attempt
      if (gen === saveGeneration.current) {
        console.error('Failed to save matches to Firebase:', err)
        toast.error('Failed to save match data. Please try again.')
      }
    })
  }, [userId, matches])

  const setMatches = useCallback((updater: (prev: Match[]) => Match[]) => {
    setMatchesLocal(updater)
  }, [])

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
