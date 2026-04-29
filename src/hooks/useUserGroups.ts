import { useGroups } from './use-groups'
import type { UserGroupMembership } from '@/lib/group-types'

/**
 * Convenience hook for getting the current user's group memberships.
 * Wraps `useGroups` with a consistent interface for use by DataContextSelector.
 */
export function useUserGroups(userId: string | null): {
  groups: UserGroupMembership[]
  loading: boolean
  error: Error | null
  refetch: () => void
} {
  return useGroups(userId)
}
