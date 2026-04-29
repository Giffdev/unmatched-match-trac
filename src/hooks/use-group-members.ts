import { useState, useEffect, useCallback } from 'react'
import { getGroupMembers } from '@/lib/groups'
import type { GroupMember } from '@/lib/group-types'

export function useGroupMembers(groupId: string | null) {
  const [members, setMembers] = useState<GroupMember[]>([])
  const [loading, setLoading] = useState(true)

  const fetchMembers = useCallback(async () => {
    if (!groupId) {
      setMembers([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const result = await getGroupMembers(groupId)
      setMembers(result)
    } catch {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }, [groupId])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  return { members, loading, refetch: fetchMembers }
}
