import { useState, useEffect, useCallback, useRef } from 'react'
import { getUserMatches, setUserMatches, getUserOwnedSets, setUserOwnedSets, getMigrationState, dualWriteMatches } from '@/lib/firestore'
import type { MigrationState } from '@/lib/firestore'
import type { Match } from '@/lib/types'
import { toast } from 'sonner'

export function useUserMatches(userId: string | null) {
  const [matches, setMatchesLocal] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const loadedFromDb = useRef(false)
  const saveGeneration = useRef(0)
  const prevMatchesRef = useRef<Match[]>([])
  const migrationStateRef = useRef<MigrationState>('legacy-only')

  // Load matches from Firebase on mount / user change
  useEffect(() => {
    loadedFromDb.current = false
    if (!userId) { setMatchesLocal([]); setLoading(false); return }
    setLoading(true)

    // Load matches and migration state in parallel
    Promise.all([
      getUserMatches(userId),
      getMigrationState(userId)
    ]).then(([m, state]) => {
      setMatchesLocal(m)
      prevMatchesRef.current = m
      migrationStateRef.current = state
      setLoading(false)
      loadedFromDb.current = true
    })
  }, [userId])

  // Persist matches to Firebase whenever they change (but not on initial load).
  // Debounced to prevent race conditions from rapid state updates causing
  // out-of-order Firestore writes.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingMatches = useRef<Match[] | null>(null)

  const flushSave = useCallback((uid: string, data: Match[]) => {
    const gen = ++saveGeneration.current
    const prev = prevMatchesRef.current

    const doWrite = migrationStateRef.current === 'dual-write'
      ? dualWriteMatches(uid, prev, data)
      : setUserMatches(uid, data)

    doWrite
      .then(() => {
        prevMatchesRef.current = data
      })
      .catch(err => {
        if (gen === saveGeneration.current) {
          console.error('Failed to save matches to Firebase:', err)
          toast.error('Failed to save match data. Please try again.')
        }
      })
  }, [])

  useEffect(() => {
    if (!userId || !loadedFromDb.current) return
    pendingMatches.current = matches

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      debounceTimer.current = null
      if (pendingMatches.current) {
        flushSave(userId, pendingMatches.current)
        pendingMatches.current = null
      }
    }, 500)

    return () => {
      // On cleanup (unmount or userId change), flush immediately to avoid data loss
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
        debounceTimer.current = null
        if (pendingMatches.current) {
          flushSave(userId, pendingMatches.current)
          pendingMatches.current = null
        }
      }
    }
  }, [userId, matches, flushSave])

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
