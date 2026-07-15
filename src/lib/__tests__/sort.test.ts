import { describe, it, expect } from 'vitest'
import { compareMatchesByRecency } from '../sort'
import type { Match } from '../types'

function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    date: '2026-01-01',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: 'Alice', heroId: 'medusa', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
    ],
    winnerId: 'medusa',
    isDraw: false,
    userId: 'user-1',
    ...overrides,
  }
}

describe('compareMatchesByRecency', () => {
  describe('primary sort — different days', () => {
    it('puts the newer day first', () => {
      const older = createMatch({ id: 'a', date: '2026-01-01' })
      const newer = createMatch({ id: 'b', date: '2026-03-15' })
      expect(compareMatchesByRecency(newer, older)).toBeLessThan(0)
      expect(compareMatchesByRecency(older, newer)).toBeGreaterThan(0)
    })

    it('returns 0 for two matches on the same day with no loggedAt', () => {
      const a = createMatch({ id: 'a', date: '2026-06-01' })
      const b = createMatch({ id: 'b', date: '2026-06-01' })
      expect(compareMatchesByRecency(a, b)).toBe(0)
    })

    it('correctly sorts an array of different-day matches newest-first', () => {
      const matches = [
        createMatch({ id: 'jan', date: '2026-01-10' }),
        createMatch({ id: 'mar', date: '2026-03-20' }),
        createMatch({ id: 'feb', date: '2026-02-05' }),
      ]
      const sorted = [...matches].sort(compareMatchesByRecency)
      expect(sorted.map(m => m.id)).toEqual(['mar', 'feb', 'jan'])
    })
  })

  describe('secondary sort — same day with loggedAt', () => {
    it('puts the most recently logged match first when dates are equal', () => {
      const loggedFirst = createMatch({
        id: 'first',
        date: '2026-06-01',
        loggedAt: '2026-06-01T10:00:00.000Z',
      })
      const loggedSecond = createMatch({
        id: 'second',
        date: '2026-06-01',
        loggedAt: '2026-06-01T18:30:00.000Z',
      })
      expect(compareMatchesByRecency(loggedSecond, loggedFirst)).toBeLessThan(0)
      expect(compareMatchesByRecency(loggedFirst, loggedSecond)).toBeGreaterThan(0)
    })

    it('correctly sorts same-day matches by loggedAt descending', () => {
      const matches = [
        createMatch({ id: 'morning', date: '2026-06-01', loggedAt: '2026-06-01T09:00:00.000Z' }),
        createMatch({ id: 'evening', date: '2026-06-01', loggedAt: '2026-06-01T20:00:00.000Z' }),
        createMatch({ id: 'noon', date: '2026-06-01', loggedAt: '2026-06-01T12:00:00.000Z' }),
      ]
      const sorted = [...matches].sort(compareMatchesByRecency)
      expect(sorted.map(m => m.id)).toEqual(['evening', 'noon', 'morning'])
    })

    it('same-day tie-breaking is the core bug fix: most-recently-logged wins', () => {
      // This is the exact bug: without loggedAt, ordering was non-deterministic
      const game1 = createMatch({ id: 'game1', date: '2026-07-04', loggedAt: '2026-07-04T15:00:00.000Z' })
      const game2 = createMatch({ id: 'game2', date: '2026-07-04', loggedAt: '2026-07-04T17:45:00.000Z' })
      const sorted = [game1, game2].sort(compareMatchesByRecency)
      expect(sorted[0].id).toBe('game2')
    })
  })

  describe('same day — one record missing loggedAt', () => {
    it('puts the record WITH loggedAt before the one without it', () => {
      const withLoggedAt = createMatch({
        id: 'has-timestamp',
        date: '2026-06-01',
        loggedAt: '2026-06-01T12:00:00.000Z',
      })
      const withoutLoggedAt = createMatch({
        id: 'no-timestamp',
        date: '2026-06-01',
        // loggedAt omitted
      })
      expect(compareMatchesByRecency(withLoggedAt, withoutLoggedAt)).toBeLessThan(0)
      expect(compareMatchesByRecency(withoutLoggedAt, withLoggedAt)).toBeGreaterThan(0)
    })

    it('two records both missing loggedAt on same day compare as equal', () => {
      const a = createMatch({ id: 'a', date: '2026-06-01' })
      const b = createMatch({ id: 'b', date: '2026-06-01' })
      expect(compareMatchesByRecency(a, b)).toBe(0)
    })
  })

  describe('missing or invalid date', () => {
    it('pushes a record with missing date to the end', () => {
      const valid = createMatch({ id: 'valid', date: '2026-01-01' })
      const noDate = createMatch({ id: 'no-date', date: '' })
      expect(compareMatchesByRecency(valid, noDate)).toBeLessThan(0)
      expect(compareMatchesByRecency(noDate, valid)).toBeGreaterThan(0)
    })

    it('pushes a record with invalid date to the end', () => {
      const valid = createMatch({ id: 'valid', date: '2026-06-15' })
      const badDate = createMatch({ id: 'bad', date: 'not-a-date' })
      expect(compareMatchesByRecency(valid, badDate)).toBeLessThan(0)
      expect(compareMatchesByRecency(badDate, valid)).toBeGreaterThan(0)
    })

    it('two records with invalid dates compare as equal', () => {
      const a = createMatch({ id: 'a', date: 'bad' })
      const b = createMatch({ id: 'b', date: '' })
      expect(compareMatchesByRecency(a, b)).toBe(0)
    })

    it('invalid dates sort after all valid dates in a mixed array', () => {
      const matches = [
        createMatch({ id: 'bad1', date: '' }),
        createMatch({ id: 'early', date: '2025-01-01' }),
        createMatch({ id: 'bad2', date: 'invalid' }),
        createMatch({ id: 'late', date: '2026-06-01' }),
      ]
      const sorted = [...matches].sort(compareMatchesByRecency)
      // Valid dates first (newest first), then invalids at the end
      expect(sorted[0].id).toBe('late')
      expect(sorted[1].id).toBe('early')
      expect(['bad1', 'bad2']).toContain(sorted[2].id)
      expect(['bad1', 'bad2']).toContain(sorted[3].id)
    })
  })

  describe('comparator symmetry (sign consistency)', () => {
    it('a < b implies b > a (sign symmetry) for different days', () => {
      const a = createMatch({ id: 'a', date: '2026-01-01' })
      const b = createMatch({ id: 'b', date: '2026-06-15' })
      const ab = compareMatchesByRecency(a, b)
      const ba = compareMatchesByRecency(b, a)
      expect(Math.sign(ab)).toBe(-Math.sign(ba))
    })

    it('sign symmetry holds for same-day loggedAt comparison', () => {
      const a = createMatch({ id: 'a', date: '2026-06-01', loggedAt: '2026-06-01T08:00:00.000Z' })
      const b = createMatch({ id: 'b', date: '2026-06-01', loggedAt: '2026-06-01T20:00:00.000Z' })
      const ab = compareMatchesByRecency(a, b)
      const ba = compareMatchesByRecency(b, a)
      expect(Math.sign(ab)).toBe(-Math.sign(ba))
    })

    it('sign symmetry holds for missing loggedAt vs present loggedAt', () => {
      const withTs = createMatch({ id: 'with', date: '2026-06-01', loggedAt: '2026-06-01T10:00:00.000Z' })
      const noTs = createMatch({ id: 'no', date: '2026-06-01' })
      const wn = compareMatchesByRecency(withTs, noTs)
      const nw = compareMatchesByRecency(noTs, withTs)
      expect(Math.sign(wn)).toBe(-Math.sign(nw))
    })

    it('produces deterministic order when sorting an array', () => {
      const matches = [
        createMatch({ id: 'c', date: '2026-06-01', loggedAt: '2026-06-01T15:00:00.000Z' }),
        createMatch({ id: 'a', date: '2026-01-01' }),
        createMatch({ id: 'b', date: '2026-06-01', loggedAt: '2026-06-01T10:00:00.000Z' }),
        createMatch({ id: 'd', date: '2026-07-01' }),
      ]
      const sorted1 = [...matches].sort(compareMatchesByRecency)
      const sorted2 = [...matches].reverse().sort(compareMatchesByRecency)
      expect(sorted1.map(m => m.id)).toEqual(sorted2.map(m => m.id))
    })
  })
})
