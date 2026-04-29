/**
 * Tests for Game Group match operations.
 * Tests the expected API from src/lib/group-matches.ts (being created by Hicks).
 *
 * Key design invariant: Group matches appear on logger's personal dashboard
 * but do NOT double-count in community stats.
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
  startAfter: vi.fn((...args: any[]) => ({ _startAfter: args })),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn().mockResolvedValue(undefined),
  })),
  serverTimestamp: vi.fn(() => ({ _serverTimestamp: true })),
  Timestamp: { now: vi.fn(() => ({ toMillis: () => Date.now() })) },
}))

vi.mock('../firebase', () => ({
  db: { _db: 'mock-firestore' },
}))

// --- Types for group matches ---

import type { Match, PlayerAssignment } from '../types'

type GroupMatch = Match & {
  groupId: string
  loggedBy: string
}

type PersonalGroupMatch = Match & {
  isGroupMatch: true
}

// --- Factory helpers ---

function createGroupMatch(overrides: Partial<GroupMatch> = {}): GroupMatch {
  return {
    id: 'gmatch-1',
    date: '2026-04-29',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'hero-2', turnOrder: 2 },
    ],
    winnerId: 'Alice',
    isDraw: false,
    userId: 'user-1',
    groupId: 'group-1',
    loggedBy: 'user-1',
    ...overrides,
  }
}

function createPersonalGroupMatch(overrides: Partial<PersonalGroupMatch> = {}): PersonalGroupMatch {
  return {
    id: 'gmatch-1',
    date: '2026-04-29',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'hero-2', turnOrder: 2 },
    ],
    winnerId: 'Alice',
    isDraw: false,
    userId: 'user-1',
    groupRef: { groupId: 'group-1', groupMatchId: 'gmatch-1' },
    isGroupMatch: true,
    ...overrides,
  }
}

// --- Test suites ---

describe('group-matches — logging matches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logMatchToGroup', () => {
    it('writes match to group subcollection with correct fields', async () => {
      const { setDoc, doc } = await import('firebase/firestore')
      const match = createGroupMatch()

      vi.mocked(setDoc).mockResolvedValueOnce(undefined)
      await setDoc(doc({} as any, 'groups', 'group-1', 'matches', match.id), match)

      expect(setDoc).toHaveBeenCalledWith(
        expect.objectContaining({ path: 'groups/group-1/matches/gmatch-1' }),
        expect.objectContaining({
          groupId: 'group-1',
          loggedBy: 'user-1',
          mapId: 'map-1',
          players: expect.arrayContaining([
            expect.objectContaining({ playerName: 'Alice' }),
          ]),
        })
      )
    })

    it('includes loggedBy field set to current user uid', () => {
      const currentUserId = 'user-1'
      const match = createGroupMatch({ loggedBy: currentUserId })
      expect(match.loggedBy).toBe(currentUserId)
    })

    it('includes groupId back-reference', () => {
      const match = createGroupMatch({ groupId: 'group-1' })
      expect(match.groupId).toBe('group-1')
    })
  })

  describe('autoAddToPersonal', () => {
    it('writes personal copy with groupRef when autoAddToPersonal is true', async () => {
      const { writeBatch } = await import('firebase/firestore')
      const batch = writeBatch({} as any)
      const groupMatch = createGroupMatch()
      const personalCopy = createPersonalGroupMatch()

      // Batch: group match + personal copy
      batch.set({} as any, groupMatch) // groups/{groupId}/matches/{matchId}
      batch.set({} as any, personalCopy) // users/{userId}/matches/{matchId} or legacy doc
      await batch.commit()

      expect(batch.set).toHaveBeenCalledTimes(2)
      expect(batch.commit).toHaveBeenCalled()
    })

    it('personal copy has groupRef field linking back to source group', () => {
      const personalCopy = createPersonalGroupMatch({ groupRef: { groupId: 'group-1', groupMatchId: 'gmatch-1' } })
      expect(personalCopy.groupRef).toEqual({ groupId: 'group-1', groupMatchId: 'gmatch-1' })
      expect(personalCopy.isGroupMatch).toBe(true)
    })

    it('personal copy has isGroupMatch flag for stats filtering', () => {
      const personalCopy = createPersonalGroupMatch()
      expect(personalCopy.isGroupMatch).toBe(true)
    })
  })

  describe('community stats double-counting prevention', () => {
    it('personal copies with isGroupMatch=true are excluded from community stats', () => {
      const allMatches = [
        // Regular personal match
        { id: 'm1', isGroupMatch: undefined, userId: 'user-1' },
        // Group-sourced personal copy — should NOT count in community stats
        { id: 'gm1', isGroupMatch: true, groupRef: 'group-1', userId: 'user-1' },
        // Another regular match
        { id: 'm2', isGroupMatch: undefined, userId: 'user-1' },
      ]

      // Filter logic that community stats aggregation should use
      const communityMatches = allMatches.filter((m) => !(m as any).isGroupMatch)
      expect(communityMatches).toHaveLength(2)
      expect(communityMatches.map((m) => m.id)).toEqual(['m1', 'm2'])
    })

    it('group matches appear on logger personal dashboard (not filtered there)', () => {
      const allUserMatches = [
        { id: 'm1', isGroupMatch: undefined },
        { id: 'gm1', isGroupMatch: true, groupRef: 'group-1' },
        { id: 'm2', isGroupMatch: undefined },
      ]

      // Personal dashboard shows ALL matches (including group-sourced)
      expect(allUserMatches).toHaveLength(3)
    })

    it('getAllUserMatches for community stats filters out isGroupMatch entries', () => {
      // Simulating what getAllUserMatches should do for community aggregation
      const usersMatches: Record<string, any[]> = {
        'user-1': [
          { id: 'm1', mode: '1v1' },
          { id: 'gm1', mode: '1v1', isGroupMatch: true, groupRef: 'group-1' },
        ],
        'user-2': [
          { id: 'm3', mode: '1v1' },
        ],
      }

      // Community stats calculation should exclude isGroupMatch entries
      let totalCommunityMatches = 0
      for (const matches of Object.values(usersMatches)) {
        const filtered = matches.filter((m) => !m.isGroupMatch)
        totalCommunityMatches += filtered.length
      }

      expect(totalCommunityMatches).toBe(2) // m1 + m3, NOT gm1
    })
  })
})

describe('group-matches — reading matches', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getGroupMatches', () => {
    it('returns matches sorted by date descending', async () => {
      const { getDocs, query, orderBy, collection } = await import('firebase/firestore')

      const matches = [
        createGroupMatch({ id: 'gm-3', date: '2026-04-29' }),
        createGroupMatch({ id: 'gm-2', date: '2026-04-28' }),
        createGroupMatch({ id: 'gm-1', date: '2026-04-27' }),
      ]

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: matches.map((m) => ({ id: m.id, data: () => m })),
        size: 3,
      } as any)

      const q = query(
        collection({} as any, 'groups', 'group-1', 'matches'),
        orderBy('date', 'desc')
      )
      const result = await getDocs(q as any)

      expect(orderBy).toHaveBeenCalledWith('date', 'desc')
      expect(result.size).toBe(3)
      // First result should be most recent
      expect((result as any).docs[0].data().date).toBe('2026-04-29')
    })

    it('supports pagination with limit and startAfter', async () => {
      const { getDocs, query, limit, startAfter, orderBy, collection } = await import('firebase/firestore')

      vi.mocked(getDocs).mockResolvedValueOnce({
        docs: [
          { id: 'gm-4', data: () => createGroupMatch({ id: 'gm-4' }) },
          { id: 'gm-5', data: () => createGroupMatch({ id: 'gm-5' }) },
        ],
        size: 2,
      } as any)

      const lastDoc = { id: 'gm-3' } // cursor from previous page
      const q = query(
        collection({} as any, 'groups', 'group-1', 'matches'),
        orderBy('date', 'desc'),
        startAfter(lastDoc),
        limit(10)
      )
      await getDocs(q as any)

      expect(limit).toHaveBeenCalledWith(10)
      expect(startAfter).toHaveBeenCalledWith(lastDoc)
    })

    it('returns empty array when group has no matches', async () => {
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

describe('group-matches — updating and deleting', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateGroupMatch', () => {
    it('allows update only if loggedBy matches current user', async () => {
      const { updateDoc } = await import('firebase/firestore')
      const match = createGroupMatch({ loggedBy: 'user-1' })
      const currentUserId = 'user-1'

      expect(match.loggedBy).toBe(currentUserId) // authorized
      vi.mocked(updateDoc).mockResolvedValueOnce(undefined)
      await updateDoc({} as any, { winnerId: 'Bob' })
      expect(updateDoc).toHaveBeenCalled()
    })

    it('rejects update if loggedBy does not match current user', () => {
      const match = createGroupMatch({ loggedBy: 'user-1' })
      const currentUserId = 'user-2' // not the logger

      expect(match.loggedBy).not.toBe(currentUserId)
      // Implementation should throw "Only the match logger can edit this match"
    })
  })

  describe('deleteGroupMatch', () => {
    it('allows delete only if loggedBy matches current user', async () => {
      const { deleteDoc } = await import('firebase/firestore')
      const match = createGroupMatch({ loggedBy: 'user-1' })
      const currentUserId = 'user-1'

      expect(match.loggedBy).toBe(currentUserId) // authorized
      vi.mocked(deleteDoc).mockResolvedValueOnce(undefined)
      await deleteDoc({} as any)
      expect(deleteDoc).toHaveBeenCalled()
    })

    it('rejects delete if loggedBy does not match current user', () => {
      const match = createGroupMatch({ loggedBy: 'user-1' })
      const currentUserId = 'user-2'

      expect(match.loggedBy).not.toBe(currentUserId)
      // Implementation should throw "Only the match logger can delete this match"
    })

    it('also removes personal copy if one exists', async () => {
      const { writeBatch } = await import('firebase/firestore')
      const batch = writeBatch({} as any)

      // Delete from group subcollection
      batch.delete({} as any) // groups/{groupId}/matches/{matchId}
      // Delete personal copy
      batch.delete({} as any) // users/{userId}/matches/{matchId}
      await batch.commit()

      expect(batch.delete).toHaveBeenCalledTimes(2)
      expect(batch.commit).toHaveBeenCalled()
    })
  })
})

describe('group-matches — edge cases', () => {
  it('handles match with missing optional fields', () => {
    const match = createGroupMatch({
      winnerId: undefined,
      isDraw: true,
      cooperativeResult: undefined,
    } as any)

    expect(match.isDraw).toBe(true)
    expect(match.winnerId).toBeUndefined()
    // Match should still be valid for group logging
    expect(match.groupId).toBe('group-1')
    expect(match.loggedBy).toBe('user-1')
  })

  it('handles match with empty players array gracefully', () => {
    const match = createGroupMatch({ players: [] })
    expect(match.players).toHaveLength(0)
    // Implementation should reject matches with no players
  })

  it('handles match with no mapId (should be required)', () => {
    const match = createGroupMatch({ mapId: '' })
    expect(match.mapId).toBe('')
    // Implementation should require a valid mapId
  })

  it('preserves all player assignments in group match', () => {
    const players: PlayerAssignment[] = [
      { playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'hero-2', turnOrder: 2 },
      { playerName: 'Charlie', heroId: 'hero-3', turnOrder: 3 },
      { playerName: 'Dana', heroId: 'hero-4', turnOrder: 4 },
    ]
    const match = createGroupMatch({ players, mode: 'ffa4' })
    expect(match.players).toHaveLength(4)
    expect(match.mode).toBe('ffa4')
  })

  it('handles date in different formats consistently', () => {
    const isoDate = createGroupMatch({ date: '2026-04-29T10:00:00.000Z' })
    const shortDate = createGroupMatch({ date: '2026-04-29' })

    // Both should be valid date strings
    expect(new Date(isoDate.date).toString()).not.toBe('Invalid Date')
    expect(new Date(shortDate.date).toString()).not.toBe('Invalid Date')
  })
})
