import { describe, it, expect } from 'vitest'
import {
  diffMatches,
  getDefaultMigrationState,
  isValidMigrationState,
  VALID_MIGRATION_STATES,
} from '../match-diff'
import type { Match } from '../types'

// --- Factory helpers ---

function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    date: '2026-01-15',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'hero-2', turnOrder: 2 },
    ],
    winnerId: 'Alice',
    isDraw: false,
    userId: 'user-1',
    ...overrides,
  }
}

function createMatchWithId(id: string, extra: Partial<Match> = {}): Match {
  return createMatch({ id, ...extra })
}

// --- diffMatches tests ---

describe('diffMatches', () => {
  describe('no changes', () => {
    it('returns empty diff when prev and next are identical', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')

      const result = diffMatches([A, B, C], [A, B, C])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
    })

    it('returns empty diff when both arrays are empty', () => {
      const result = diffMatches([], [])
      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
    })
  })

  describe('additions', () => {
    it('detects a single addition', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')

      const result = diffMatches([A, B], [A, B, C])

      expect(result.added).toEqual([C])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
    })

    it('detects all added when prev is empty (fresh user)', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')

      const result = diffMatches([], [A, B, C])

      expect(result.added).toHaveLength(3)
      expect(result.added).toEqual([A, B, C])
      expect(result.deleted).toEqual([])
    })
  })

  describe('deletions', () => {
    it('detects a single deletion', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')

      const result = diffMatches([A, B, C], [A, B])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual(['c'])
    })

    it('detects all deleted when next is empty', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')

      const result = diffMatches([A, B, C], [])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual(['a', 'b', 'c'])
    })
  })

  describe('modifications', () => {
    it('detects a modified match (same id, different data)', () => {
      const B = createMatchWithId('b', { winnerId: 'Alice' })
      const BPrime = createMatchWithId('b', { winnerId: 'Bob' })

      const result = diffMatches([B], [BPrime])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([BPrime])
      expect(result.deleted).toEqual([])
    })

    it('detects modification when date changes', () => {
      const m1 = createMatchWithId('m1', { date: '2026-01-01' })
      const m1Updated = createMatchWithId('m1', { date: '2026-02-01' })

      const result = diffMatches([m1], [m1Updated])

      expect(result.modified).toEqual([m1Updated])
    })

    it('detects modification when players array changes', () => {
      const m = createMatchWithId('m', {
        players: [{ playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 }],
      })
      const mUpdated = createMatchWithId('m', {
        players: [
          { playerName: 'Alice', heroId: 'hero-1', turnOrder: 1 },
          { playerName: 'Bob', heroId: 'hero-2', turnOrder: 2 },
        ],
      })

      const result = diffMatches([m], [mUpdated])

      expect(result.modified).toEqual([mUpdated])
    })

    it('detects modification when isDraw changes', () => {
      const m = createMatchWithId('m', { isDraw: false })
      const mUpdated = createMatchWithId('m', { isDraw: true, winnerId: undefined })

      const result = diffMatches([m], [mUpdated])

      expect(result.modified).toEqual([mUpdated])
    })
  })

  describe('complete replacement (import scenario)', () => {
    it('detects all replaced when ids completely change', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b')
      const C = createMatchWithId('c')
      const D = createMatchWithId('d')
      const E = createMatchWithId('e')
      const F = createMatchWithId('f')

      const result = diffMatches([A, B, C], [D, E, F])

      expect(result.added).toHaveLength(3)
      expect(result.added.map((m) => m.id)).toEqual(['d', 'e', 'f'])
      expect(result.deleted).toEqual(['a', 'b', 'c'])
      expect(result.modified).toEqual([])
    })
  })

  describe('mixed operations', () => {
    it('handles simultaneous add, modify, and delete', () => {
      const A = createMatchWithId('a')
      const B = createMatchWithId('b', { winnerId: 'Alice' })
      const C = createMatchWithId('c')

      const BPrime = createMatchWithId('b', { winnerId: 'Bob' })
      const D = createMatchWithId('d')

      // prev: [A, B, C] → next: [A, B', D]
      // A unchanged, B modified, C deleted, D added
      const result = diffMatches([A, B, C], [A, BPrime, D])

      expect(result.added).toEqual([D])
      expect(result.modified).toEqual([BPrime])
      expect(result.deleted).toEqual(['c'])
    })
  })

  describe('large arrays', () => {
    it('handles 500+ matches correctly', () => {
      const prev: Match[] = []
      const next: Match[] = []

      for (let i = 0; i < 500; i++) {
        prev.push(createMatchWithId(`match-${i}`))
        next.push(createMatchWithId(`match-${i}`))
      }

      // Add 50 new matches
      for (let i = 500; i < 550; i++) {
        next.push(createMatchWithId(`match-${i}`))
      }

      // Modify 10 existing matches
      for (let i = 0; i < 10; i++) {
        next[i] = createMatchWithId(`match-${i}`, { winnerId: 'Modified' })
      }

      // Delete last 5 from prev (remove from next)
      for (let i = 495; i < 500; i++) {
        const idx = next.findIndex((m) => m.id === `match-${i}`)
        next.splice(idx, 1)
      }

      const result = diffMatches(prev, next)

      expect(result.added).toHaveLength(50)
      expect(result.modified).toHaveLength(10)
      expect(result.deleted).toHaveLength(5)
    })

    it('performs reasonably with 1000 matches (no changes)', () => {
      const matches: Match[] = []
      for (let i = 0; i < 1000; i++) {
        matches.push(createMatchWithId(`match-${i}`))
      }

      const start = performance.now()
      const result = diffMatches(matches, [...matches])
      const elapsed = performance.now() - start

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
      // Should complete in well under 1 second
      expect(elapsed).toBeLessThan(1000)
    })
  })

  describe('edge cases', () => {
    it('handles duplicate match IDs in prev (last occurrence wins)', () => {
      const m1 = createMatchWithId('dup', { winnerId: 'Alice' })
      const m2 = createMatchWithId('dup', { winnerId: 'Bob' })

      // Two entries with same id in prev — last one ('Bob') is the canonical one
      const result = diffMatches([m1, m2], [m2])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
    })

    it('handles duplicate match IDs in next (last occurrence wins)', () => {
      const original = createMatchWithId('dup', { winnerId: 'Alice' })
      const dup1 = createMatchWithId('dup', { winnerId: 'Bob' })
      const dup2 = createMatchWithId('dup', { winnerId: 'Charlie' })

      // next has two entries with same id — last one wins
      const result = diffMatches([original], [dup1, dup2])

      expect(result.modified).toEqual([dup2])
    })

    it('handles match with undefined optional fields', () => {
      const m1 = createMatchWithId('m1', { winnerId: undefined, cooperativeResult: undefined })
      const m2 = createMatchWithId('m1', { winnerId: undefined, cooperativeResult: undefined })

      const result = diffMatches([m1], [m2])

      expect(result.added).toEqual([])
      expect(result.modified).toEqual([])
      expect(result.deleted).toEqual([])
    })

    it('detects change when optional field is added', () => {
      const m1 = createMatchWithId('m1', { cooperativeResult: undefined })
      const m1WithResult = createMatchWithId('m1', { cooperativeResult: 'win' })

      const result = diffMatches([m1], [m1WithResult])

      expect(result.modified).toEqual([m1WithResult])
    })

    it('handles very large match objects (many players)', () => {
      const manyPlayers = Array.from({ length: 20 }, (_, i) => ({
        playerName: `Player${i}`,
        heroId: `hero-${i}`,
        turnOrder: i + 1,
      }))

      const big = createMatchWithId('big', { players: manyPlayers })
      const bigModified = createMatchWithId('big', {
        players: [...manyPlayers, { playerName: 'Extra', heroId: 'hero-x', turnOrder: 21 }],
      })

      const result = diffMatches([big], [bigModified])

      expect(result.modified).toEqual([bigModified])
    })
  })
})

// --- Migration state tests ---

describe('Migration state', () => {
  describe('getDefaultMigrationState', () => {
    it('returns legacy-only as the default state', () => {
      expect(getDefaultMigrationState()).toBe('legacy-only')
    })
  })

  describe('isValidMigrationState', () => {
    it.each(VALID_MIGRATION_STATES)('accepts valid state: %s', (state) => {
      expect(isValidMigrationState(state)).toBe(true)
    })

    it('rejects invalid state strings', () => {
      expect(isValidMigrationState('invalid')).toBe(false)
      expect(isValidMigrationState('')).toBe(false)
      expect(isValidMigrationState('DUAL-WRITE')).toBe(false)
      expect(isValidMigrationState('legacy_only')).toBe(false)
    })

    it('valid states are exactly 4', () => {
      expect(VALID_MIGRATION_STATES).toHaveLength(4)
    })

    it('includes all expected states', () => {
      expect(VALID_MIGRATION_STATES).toContain('legacy-only')
      expect(VALID_MIGRATION_STATES).toContain('dual-write')
      expect(VALID_MIGRATION_STATES).toContain('subcollection-primary')
      expect(VALID_MIGRATION_STATES).toContain('cleanup-ready')
    })
  })
})
