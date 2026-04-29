import { useState, useEffect, useCallback } from 'react'
import { getUserGroups, getGroup } from '@/lib/groups'
import { getPendingInvites } from '@/lib/group-invites'
import type { UserGroupMembership, GameGroup, GroupInvite } from '@/lib/group-types'

export function useGroups(userId: string | null) {
  const [groups, setGroups] = useState<UserGroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setGroups([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await getUserGroups(userId)
      setGroups(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch groups'))
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  return { groups, loading, error, refetch: fetchGroups }
}

export function useGroup(groupId: string | null) {
  const [group, setGroup] = useState<GameGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchGroup = useCallback(async () => {
    if (!groupId) {
      setGroup(null)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await getGroup(groupId)
      setGroup(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch group'))
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchGroup()
  }, [fetchGroup])

  return { group, loading, error, refetch: fetchGroup }
}

export function usePendingInvites(userId: string | null) {
  const [invites, setInvites] = useState<GroupInvite[]>([])
  const [loading, setLoading] = useState(true)

  const fetchInvites = useCallback(async () => {
    if (!userId) {
      setInvites([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const result = await getPendingInvites(userId)
      setInvites(result)
    } catch {
      setInvites([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  return { invites, loading, count: invites.length, refetch: fetchInvites }
}
