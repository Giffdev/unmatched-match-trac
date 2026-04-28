import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserMatches, setUserMatches, getUserOwnedSets, setUserOwnedSets } from '@/lib/firestore'
import type { Match } from '@/lib/types'
import { toast } from 'sonner'

export function useUserMatches(userId: string | null) {
  const [matches, setMatchesLocal] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const isInitialLoad = useRef(true)

  useEffect(() => {
    if (!userId) { setMatchesLocal([]); setLoading(false); return }
    isInitialLoad.current = true
    setLoading(true)
    getUserMatches(userId).then(m => {
      setMatchesLocal(m)
      setLoading(false)
      isInitialLoad.current = false
    })
  }, [userId])

  const setMatches = useCallback((updater: (prev: Match[]) => Match[]) => {
    setMatchesLocal(prev => {
      const next = updater(prev)
      // Persist to Firebase outside the React state updater cycle
      if (userId) {
        Promise.resolve().then(() => {
          setUserMatches(userId, next).catch(err => {
            console.error('Failed to save matches to Firebase:', err)
            toast.error('Failed to save match data. Please try again.')
          })
        })
      }
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
