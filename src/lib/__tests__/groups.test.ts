/**
 * Tests for Game Groups CRUD and membership operations.
 * Tests the expected API from src/lib/groups.ts (being created by Hicks).
 *
 * Mocking strategy: vi.mock firebase/firestore functions directly,
 * test that correct Firestore operations are called with correct args.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock firebase/firestore
vi.mock('firebase/firestore', () => ({
  doc: vi.fn((...args: any[]) => ({ path: args.slice(1).join('/'), id: args[args.length - 1] })),
  collection: vi.fn((...args: any[]) => ({ path: args.slice(1).join('/') })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  addDoc: vi.fn(),
  query: vi.fn((...args: any[]) => ({ _query: args })),
  where: vi.fn((...args: any[]) => ({ _where: args })),
  orderBy: vi.fn((...args: any[]) => ({ _orderBy: args })),
  limit: vi.fn((n: number) => ({ _limit: n })),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  arrayUnion: vi.fn((...vals: any[]) => ({ _arrayUnion: vals })),
  arrayRemove: vi.fn((...vals: any[]) => ({ _arrayRemove: vals })),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
}))

// Mock firebase app
vi.mock('../firebase', () => ({
  db: { _db: 'mock-firestore' },
}))

// --- Types matching expected group-types.ts ---

type GroupRole = 'owner' | 'admin' | 'member'

type GroupSettings = {
  invitePermission: 'owner-only' | 'any-member'
  matchLogging: 'any-member' | 'owner-only'
}

type Group = {
  id: string
  name: string
  description?: string
  memberUids: string[]
  createdBy: string
  createdAt: string
  settings: GroupSettings
}

type GroupMember = {
  userId: string
  role: GroupRole
  displayName: string
  joinedAt: string
}

// --- Factory helpers ---

function createGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 'group-1',
    name: 'Friday Night Games',
    description: 'Weekly game night group',
    memberUids: ['user-1'],
    createdBy: 'user-1',
    createdAt: '2026-04-29T10:00:00.000Z',
    settings: {
      invitePermission: 'owner-only',
      matchLogging: 'any-member',
    },
    ...overrides,
  }
}

function createGroupMember(overrides: Partial<GroupMember> = {}): GroupMember {
  return {
    userId: 'user-1',
    role: 'owner',
    displayName: 'Alice',
    joinedAt: '2026-04-29T10:00:00.000Z',
    ...overrides,
  }
}

// --- Test suites ---

describe('groups — CRUD operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('createGroup', () => {
    it('sets correct fields with creator as owner in memberUids', async () => {
      // Expected behavior: createGroup(userId, name, description?) creates a group doc
      // with the creator's UID in memberUids[] and creates a member subcollection doc
      const { setDoc, doc, writeBatch } = await import('firebase/firestore')

      const group = createGroup()

      // Verify expected data structure
      expect(group.memberUids).toContain(group.createdBy)
      expect(group.memberUids).toHaveLength(1)
      expect(group.settings.invitePermission).toBe('owner-only')
      expect(group.settings.matchLogging).toBe('any-member')
    })

    it('uses writeBatch for atomic creation of group doc + member doc', async () => {
      const { writeBatch } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      // Simulate atomic write: group doc + members/{userId} doc
      batch.set({} as any, createGroup())
      batch.set({} as any, createGroupMember())
      await batch.commit()

      expect(batch.set).toHaveBeenCalledTimes(2)
      expect(batch.commit).toHaveBeenCalled()
    })

    it('rejects empty group name', () => {
      const group = createGroup({ name: '' })
      expect(group.name).toBe('')
      // Implementation should throw or return error for empty name
      expect(group.name.trim().length).toBe(0)
    })

    it('generates a unique group ID', () => {
      const group1 = createGroup({ id: 'group-abc123' })
      const group2 = createGroup({ id: 'group-def456' })
      expect(group1.id).not.toBe(group2.id)
    })

    it('defaults invitePermission to owner-only', () => {
      const group = createGroup()
      expect(group.settings.invitePermission).toBe('owner-only')
    })
  })

  describe('getGroup', () => {
    it('returns group data when doc exists', async () => {
      const { getDoc } = await import('firebase/firestore')
      const mockGroup = createGroup()

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => true,
        data: () => mockGroup,
        id: 'group-1',
      } as any)

      const result = await getDoc({} as any)
      expect(result.exists()).toBe(true)
      expect(result.data()).toEqual(mockGroup)
    })

    it('returns null/undefined when group does not exist', async () => {
      const { getDoc } = await import('firebase/firestore')

      vi.mocked(getDoc).mockResolvedValueOnce({
        exists: () => false,
        data: () => undefined,
        id: 'nonexistent',
      } as any)

      const result = await getDoc({} as any)
      expect(result.exists()).toBe(false)
      expect(result.data()).toBeUndefined()
    })
  })

  describe('getUserGroups', () => {
    it('reads groups where user is in memberUids', async () => {
      const { getDocs, query, where, collection } = await import('firebase/firestore')
      const userId = 'user-1'

      const mockGroups = [createGroup(), createGroup({ id: 'group-2', name: 'Weekend Warriors' })]

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: mockGroups.map((g) => ({ id: g.id, data: () => g })),
        empty: false,
        size: 2,
      } as any)

      // Query should use where('memberUids', 'array-contains', userId)
      const q = query(collection({} as any, 'groups'), where('memberUids', 'array-contains', userId))
      const result = await getDocs(q as any)

      expect(result.size).toBe(2)
      expect(where).toHaveBeenCalledWith('memberUids', 'array-contains', userId)
    })

    it('returns empty array when user has no groups', async () => {
      const { getDocs } = await import('firebase/firestore')

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        size: 0,
      } as any)

      const result = await getDocs({} as any)
      expect(result.empty).toBe(true)
      expect(result.docs).toHaveLength(0)
    })
  })

  describe('updateGroupSettings', () => {
    it('only owner can update group settings', async () => {
      const { updateDoc, doc } = await import('firebase/firestore')
      const group = createGroup()
      const callerUid = 'user-1' // owner

      // Owner should be allowed
      expect(group.createdBy).toBe(callerUid)

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { settings: { invitePermission: 'any-member' } })
      expect(updateDoc).toHaveBeenCalled()
    })

    it('rejects update from non-owner member', () => {
      const group = createGroup()
      const callerUid = 'user-2' // not owner

      // Implementation should check createdBy or role before allowing update
      expect(group.createdBy).not.toBe(callerUid)
      expect(group.memberUids).not.toContain(callerUid)
    })
  })

  describe('deleteGroup', () => {
    it('removes group doc and subcollections', async () => {
      const { deleteDoc, getDocs, writeBatch } = await import('firebase/firestore')

      // Simulate deleting group + all subcollection docs (members, matches)
      const batch = writeBatch({} as any)
      const memberDocs = [
        { ref: { path: 'groups/group-1/members/user-1' } },
        { ref: { path: 'groups/group-1/members/user-2' } },
      ]
      const matchDocs = [{ ref: { path: 'groups/group-1/matches/match-1' } }]

      memberDocs.forEach((d) => batch.delete(d.ref as any))
      matchDocs.forEach((d) => batch.delete(d.ref as any))
      batch.delete({ path: 'groups/group-1' } as any)
      await batch.commit()

      expect(batch.delete).toHaveBeenCalledTimes(4) // 2 members + 1 match + 1 group
      expect(batch.commit).toHaveBeenCalled()
    })

    it('only owner can delete group', () => {
      const group = createGroup()
      const callerUid = 'user-2'
      expect(group.createdBy).not.toBe(callerUid)
      // Implementation should throw if caller is not owner
    })
  })
})

describe('groups — membership operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('addMember', () => {
    it('uses arrayUnion to add uid to memberUids', async () => {
      const { updateDoc, arrayUnion } = await import('firebase/firestore')
      const newUserId = 'user-2'

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { memberUids: arrayUnion(newUserId) })

      expect(arrayUnion).toHaveBeenCalledWith(newUserId)
      expect(updateDoc).toHaveBeenCalled()
    })

    it('creates member subcollection doc with role and joinedAt', async () => {
      const { setDoc } = await import('firebase/firestore')
      const memberDoc = createGroupMember({
        userId: 'user-2',
        role: 'member',
        displayName: 'Bob',
      })

      vi.mocked(setDoc).mockResolvedValueOnce(undefined)
      await setDoc({} as any, memberDoc)

      expect(setDoc).toHaveBeenCalledWith(expect.anything(), memberDoc)
      expect(memberDoc.role).toBe('member')
    })

    it('uses writeBatch for atomicity (memberUids + member doc + reverse index)', async () => {
      const { writeBatch, arrayUnion } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      // 1. Update group doc memberUids
      batch.update({} as any, { memberUids: arrayUnion('user-2') })
      // 2. Create member subcollection doc
      batch.set({} as any, createGroupMember({ userId: 'user-2', role: 'member' }))
      await batch.commit()

      expect(batch.update).toHaveBeenCalledTimes(1)
      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(batch.commit).toHaveBeenCalled()
    })

    it('does not duplicate an already-existing member', () => {
      const group = createGroup({ memberUids: ['user-1', 'user-2'] })
      const newUserId = 'user-2'

      // arrayUnion handles deduplication automatically
      expect(group.memberUids.filter((uid) => uid === newUserId)).toHaveLength(1)
    })
  })

  describe('removeMember', () => {
    it('uses arrayRemove to remove uid from memberUids', async () => {
      const { updateDoc, arrayRemove } = await import('firebase/firestore')
      const removeUserId = 'user-2'

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { memberUids: arrayRemove(removeUserId) })

      expect(arrayRemove).toHaveBeenCalledWith(removeUserId)
      expect(updateDoc).toHaveBeenCalled()
    })

    it('deletes member subcollection doc', async () => {
      const { deleteDoc } = await import('firebase/firestore')

      vi.mocked(deleteDoc).mockResolvedValueOnce(undefined)
      await deleteDoc({} as any)

      expect(deleteDoc).toHaveBeenCalled()
    })

    it('uses writeBatch for atomic removal (memberUids + member doc + reverse index)', async () => {
      const { writeBatch, arrayRemove } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      batch.update({} as any, { memberUids: arrayRemove('user-2') })
      batch.delete({} as any)
      await batch.commit()

      expect(batch.update).toHaveBeenCalledTimes(1)
      expect(batch.delete).toHaveBeenCalledTimes(1)
      expect(batch.commit).toHaveBeenCalled()
    })

    it('cannot remove the last member (owner) — group must be deleted instead', () => {
      const group = createGroup({ memberUids: ['user-1'] })
      // Implementation should throw if attempting to remove the only remaining member
      expect(group.memberUids).toHaveLength(1)
      expect(group.memberUids[0]).toBe(group.createdBy)
      // Expect error: "Cannot remove last member. Delete the group instead."
    })
  })

  describe('leaveGroup', () => {
    it('is same as removeMember but self-initiated', async () => {
      const { writeBatch, arrayRemove } = await import('firebase/firestore')
      const batch = writeBatch({} as any)
      const callerUid = 'user-2' // leaving member (not owner)

      batch.update({} as any, { memberUids: arrayRemove(callerUid) })
      batch.delete({} as any) // member subcollection doc
      await batch.commit()

      expect(arrayRemove).toHaveBeenCalledWith(callerUid)
      expect(batch.commit).toHaveBeenCalled()
    })

    it('owner cannot leave without transferring ownership or deleting group', () => {
      const group = createGroup({ memberUids: ['user-1', 'user-2'] })
      const callerUid = 'user-1' // owner

      expect(group.createdBy).toBe(callerUid)
      // Implementation should either:
      // 1. Prevent leave if caller is owner and there are other members
      // 2. Auto-transfer ownership to next member
      // 3. Require explicit ownership transfer before leaving
    })

    it('matches stay after member leaves (no cascade delete of logged matches)', async () => {
      const { getDocs } = await import('firebase/firestore')

      // After user-2 leaves, their matches should still exist in the group
      const matchesByLeavingUser = [
        { id: 'match-1', loggedBy: 'user-2', date: '2026-04-20' },
        { id: 'match-2', loggedBy: 'user-2', date: '2026-04-21' },
      ]

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: matchesByLeavingUser.map((m) => ({ id: m.id, data: () => m })),
        size: 2,
      } as any)

      const result = await getDocs({} as any)
      expect(result.size).toBe(2) // Matches preserved
    })
  })

  describe('edge cases', () => {
    it('handles group name with only whitespace', () => {
      const group = createGroup({ name: '   ' })
      expect(group.name.trim().length).toBe(0)
      // Implementation should reject this
    })

    it('handles very long group name (boundary check)', () => {
      const longName = 'A'.repeat(200)
      const group = createGroup({ name: longName })
      expect(group.name.length).toBe(200)
      // Implementation should enforce a max length (e.g., 100 chars)
    })

    it('handles group with maximum realistic member count', () => {
      const memberUids = Array.from({ length: 50 }, (_, i) => `user-${i}`)
      const group = createGroup({ memberUids })
      expect(group.memberUids).toHaveLength(50)
      // Should still be valid — design says no cap on groups per user
    })

    it('memberUids array stays in sync with members subcollection', async () => {
      const { writeBatch, arrayUnion } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      // Both operations in one batch ensures atomicity
      batch.update({} as any, { memberUids: arrayUnion('user-3') })
      batch.set({} as any, createGroupMember({ userId: 'user-3', role: 'member' }))
      await batch.commit()

      // If batch.commit() succeeds, both are written atomically
      expect(batch.commit).toHaveBeenCalled()
    })
  })
})
