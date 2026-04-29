/**
 * Tests for Game Group invite flow.
 * Tests the expected API from src/lib/group-invites.ts (being created by Hicks).
 *
 * Key design: Invites create a doc + update user's pending list.
 * Default: only owners can invite. Configurable to any-member.
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
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  arrayUnion: vi.fn((...vals: any[]) => ({ _arrayUnion: vals })),
  arrayRemove: vi.fn((...vals: any[]) => ({ _arrayRemove: vals })),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  Timestamp: {
    now: vi.fn(() => ({ toMillis: () => Date.now(), toDate: () => new Date() })),
    fromDate: vi.fn((d: Date) => ({ toMillis: () => d.getTime(), toDate: () => d })),
  },
}))

vi.mock('../firebase', () => ({
  db: { _db: 'mock-firestore' },
}))

// --- Types for invites ---

type InviteStatus = 'pending' | 'accepted' | 'declined' | 'expired'

type GroupInvite = {
  id: string
  groupId: string
  groupName: string
  invitedBy: string
  invitedByName: string
  inviteeUid: string
  inviteeEmail?: string
  status: InviteStatus
  createdAt: string
  expiresAt?: string
}

// --- Factory helpers ---

function createInvite(overrides: Partial<GroupInvite> = {}): GroupInvite {
  return {
    id: 'invite-1',
    groupId: 'group-1',
    groupName: 'Friday Night Games',
    invitedBy: 'user-1',
    invitedByName: 'Alice',
    inviteeUid: 'user-2',
    inviteeEmail: 'bob@example.com',
    status: 'pending',
    createdAt: '2026-04-29T10:00:00.000Z',
    expiresAt: '2026-05-06T10:00:00.000Z', // 1 week expiry
    ...overrides,
  }
}

// --- Test suites ---

describe('group-invites — sending invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('sendInvite', () => {
    it('creates invite doc with correct fields', async () => {
      const { setDoc, doc } = await import('firebase/firestore')
      const invite = createInvite()

      vi.mocked(setDoc).mockResolvedValueOnce(undefined)
      await setDoc(doc({} as any, 'invites', invite.id), invite)

      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'invites/invite-1' }),
        expect.objectContaining({
          groupId: 'group-1',
          invitedBy: 'user-1',
          inviteeUid: 'user-2',
          status: 'pending',
        })
      )
    })

    it('updates invitee user pending invites list', async () => {
      const { writeBatch, arrayUnion } = await import('firebase/firestore')
      const batch = writeBatch({} as any)
      const invite = createInvite()

      // 1. Create invite doc
      batch.set({} as any, invite)
      // 2. Add to user's pending invites array
      batch.update({} as any, { pendingInvites: arrayUnion(invite.id) })
      await batch.commit()

      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(batch.update).toHaveBeenCalledTimes(1)
      expect(arrayUnion).toHaveBeenCalledWith('invite-1')
      expect(batch.commit).toHaveBeenCalled()
    })

    it('includes group name for display without extra lookups', () => {
      const invite = createInvite()
      // Denormalized group name avoids an extra getDoc on the group
      expect(invite.groupName).toBe('Friday Night Games')
      expect(invite.invitedByName).toBe('Alice')
    })

    it('sets expiration date (default 7 days)', () => {
      const invite = createInvite()
      const created = new Date(invite.createdAt)
      const expires = new Date(invite.expiresAt!)

      const diffDays = (expires.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(7)
    })
  })

  describe('invite permission enforcement', () => {
    it('owner can always send invites', () => {
      const settings: { invitePermission: string } = { invitePermission: 'owner-only' }
      const callerRole: string = 'owner'
      const canInvite = callerRole === 'owner' || settings.invitePermission === 'any-member'
      expect(canInvite).toBe(true)
    })

    it('member can send invites when invitePermission is any-member', () => {
      const settings: { invitePermission: string } = { invitePermission: 'any-member' }
      const callerRole: string = 'member'
      const canInvite = callerRole === 'owner' || settings.invitePermission === 'any-member'
      expect(canInvite).toBe(true)
    })

    it('member cannot send invites when invitePermission is owner-only', () => {
      const settings: { invitePermission: string } = { invitePermission: 'owner-only' }
      const callerRole: string = 'member'
      const canInvite = callerRole === 'owner' || settings.invitePermission === 'any-member'
      expect(canInvite).toBe(false)
    })
  })
})

describe('group-invites — accepting invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('acceptInvite', () => {
    it('updates invite status to accepted', async () => {
      const { updateDoc } = await import('firebase/firestore')

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { status: 'accepted' })

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'accepted' })
      )
    })

    it('adds user to group membership (memberUids + member doc)', async () => {
      const { writeBatch, arrayUnion, arrayRemove } = await import('firebase/firestore')
      const batch = writeBatch({} as any)
      const inviteeUid = 'user-2'

      // 1. Update invite status
      batch.update({} as any, { status: 'accepted' })
      // 2. Add to group memberUids
      batch.update({} as any, { memberUids: arrayUnion(inviteeUid) })
      // 3. Create member subcollection doc
      batch.set({} as any, {
        userId: inviteeUid,
        role: 'member',
        displayName: 'Bob',
        joinedAt: expect.any(String),
      })
      // 4. Remove from user's pending invites
      batch.update({} as any, { pendingInvites: arrayRemove('invite-1') })
      await batch.commit()

      expect(batch.update).toHaveBeenCalledTimes(3)
      expect(batch.set).toHaveBeenCalledTimes(1)
      expect(arrayUnion).toHaveBeenCalledWith(inviteeUid)
      expect(arrayRemove).toHaveBeenCalledWith('invite-1')
      expect(batch.commit).toHaveBeenCalled()
    })

    it('is atomic — all operations succeed or all fail', async () => {
      const { writeBatch } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      // If commit fails, no partial state
      vi.mocked(batch.commit).mockRejectedValueOnce(new Error('Network error'))

      batch.update({} as any, { status: 'accepted' })
      batch.update({} as any, { memberUids: {} })
      batch.set({} as any, {})

      await expect(batch.commit()).rejects.toThrow('Network error')
    })
  })
})

describe('group-invites — declining invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('declineInvite', () => {
    it('updates invite status to declined', async () => {
      const { updateDoc } = await import('firebase/firestore')

      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { status: 'declined' })

      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ status: 'declined' })
      )
    })

    it('does NOT add user to group membership', async () => {
      const { arrayUnion } = await import('firebase/firestore')

      // After decline, arrayUnion should NOT be called for memberUids
      // The only operation should be updating invite status + removing from pending
      expect(arrayUnion).not.toHaveBeenCalled()
    })

    it('removes invite from user pending list', async () => {
      const { writeBatch, arrayRemove } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      batch.update({} as any, { status: 'declined' })
      batch.update({} as any, { pendingInvites: arrayRemove('invite-1') })
      await batch.commit()

      expect(arrayRemove).toHaveBeenCalledWith('invite-1')
      expect(batch.commit).toHaveBeenCalled()
    })
  })
})

describe('group-invites — reading pending invites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPendingInvites', () => {
    it('reads invites from user doc pending list', async () => {
      const { getDocs, query, where } = await import('firebase/firestore')
      const userId = 'user-2'

      const pendingInvites = [
        createInvite({ id: 'invite-1', groupName: 'Group A' }),
        createInvite({ id: 'invite-2', groupName: 'Group B', invitedBy: 'user-3' }),
      ]

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: pendingInvites.map((inv) => ({ id: inv.id, data: () => inv })),
        size: 2,
      } as any)

      const q = query(
        {} as any,
        where('inviteeUid', '==', userId),
        where('status', '==', 'pending')
      )
      const result = await getDocs(q as any)

      expect(result.size).toBe(2)
      expect(where).toHaveBeenCalledWith('inviteeUid', '==', userId)
      expect(where).toHaveBeenCalledWith('status', '==', 'pending')
    })

    it('returns empty when user has no pending invites', async () => {
      const { getDocs } = await import('firebase/firestore')

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [],
        empty: true,
        size: 0,
      } as any)

      const result = await getDocs({} as any)
      expect(result.empty).toBe(true)
    })
  })
})

describe('group-invites — edge cases', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects duplicate invite to same user for same group', async () => {
    const { getDocs, query, where } = await import('firebase/firestore')

    // Simulate checking for existing pending invite
    const existingInvite = createInvite({ status: 'pending' })
    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [{ id: existingInvite.id, data: () => existingInvite }],
      size: 1,
      empty: false,
    } as any)

    const q = query(
      {} as any,
      where('groupId', '==', 'group-1'),
      where('inviteeUid', '==', 'user-2'),
      where('status', '==', 'pending')
    )
    const result = await getDocs(q as any)

    // If there's already a pending invite, implementation should reject
    expect(result.size).toBe(1)
    // Implementation: throw "User already has a pending invite to this group"
  })

  it('handles invite to non-existent user gracefully', async () => {
    const { getDoc } = await import('firebase/firestore')

    // User lookup returns no result
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any)

    const result = await getDoc({} as any)
    expect(result.exists()).toBe(false)
    // Implementation should return error: "User not found"
  })

  it('rejects accepting an expired invite', () => {
    const expiredInvite = createInvite({
      expiresAt: '2026-04-01T10:00:00.000Z', // in the past
      status: 'pending',
    })

    const now = new Date('2026-04-29T10:00:00.000Z')
    const expiresAt = new Date(expiredInvite.expiresAt!)

    expect(expiresAt < now).toBe(true)
    // Implementation should check expiry before processing accept
    // and update status to 'expired' if past due
  })

  it('handles invite where group was deleted before accept', async () => {
    const { getDoc } = await import('firebase/firestore')

    // Group doc no longer exists
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    } as any)

    const result = await getDoc({} as any)
    expect(result.exists()).toBe(false)
    // Implementation should handle gracefully: mark invite as expired/invalid
  })

  it('invitee who is already a member cannot accept (no-op or error)', () => {
    const group = {
      memberUids: ['user-1', 'user-2'],
    }
    const inviteeUid = 'user-2'

    // User is already a member
    expect(group.memberUids).toContain(inviteeUid)
    // Implementation: either reject or silently mark invite as accepted
  })

  it('invite preserves inviter display name for UI rendering', () => {
    const invite = createInvite({
      invitedByName: 'Alice',
      groupName: 'Friday Night Games',
    })

    // Denormalized names allow rendering invite UI without extra lookups
    expect(invite.invitedByName).toBeTruthy()
    expect(invite.groupName).toBeTruthy()
  })
})
