import { describe, it, expect } from 'vitest'
import { mergeMatchupRows } from '../stats'
import type { MatchupRow } from '../stats'

describe('mergeMatchupRows', () => {
  it('returns [] when both dictionaries are empty', () => {
    const result = mergeMatchupRows({}, {})
    expect(result).toEqual([])
  })

  it('includes an opponent present only in user side', () => {
    const result = mergeMatchupRows(
      { 'sinbad': { wins: 2, total: 3 } },
      {}
    )
    expect(result).toHaveLength(1)
    expect(result[0].opponentId).toBe('sinbad')
  })

  it('includes an opponent present only in global side', () => {
    const result = mergeMatchupRows(
      {},
      { 'sinbad': { wins: 5, total: 8 } }
    )
    expect(result).toHaveLength(1)
    expect(result[0].opponentId).toBe('sinbad')
  })

  it('unions opponent keys — user-only, global-only, and shared all appear', () => {
    const result = mergeMatchupRows(
      { 'medusa': { wins: 1, total: 2 }, 'alice': { wins: 3, total: 4 } },
      { 'sinbad': { wins: 2, total: 5 }, 'alice': { wins: 7, total: 10 } }
    )
    const ids = result.map(r => r.opponentId).sort()
    expect(ids).toEqual(['alice', 'medusa', 'sinbad'])
  })

  it('sets user to null when user has zero total games vs that opponent', () => {
    const result = mergeMatchupRows(
      { 'sinbad': { wins: 0, total: 0 } },
      { 'sinbad': { wins: 3, total: 5 } }
    )
    const row = result.find(r => r.opponentId === 'sinbad') as MatchupRow
    expect(row.user).toBeNull()
  })

  it('sets global to null when global has zero total games vs that opponent', () => {
    const result = mergeMatchupRows(
      { 'sinbad': { wins: 2, total: 4 } },
      { 'sinbad': { wins: 0, total: 0 } }
    )
    const row = result.find(r => r.opponentId === 'sinbad') as MatchupRow
    expect(row.global).toBeNull()
  })

  it('sets user to null (not {wins:0,total:0}) when opponent is absent from user side', () => {
    const result = mergeMatchupRows(
      {},
      { 'sinbad': { wins: 4, total: 6 } }
    )
    expect(result[0].user).toBeNull()
    expect(result[0].user).not.toEqual({ wins: 0, total: 0 })
  })

  it('sets global to null (not {wins:0,total:0}) when opponent is absent from global side', () => {
    const result = mergeMatchupRows(
      { 'sinbad': { wins: 1, total: 3 } },
      {}
    )
    expect(result[0].global).toBeNull()
  })

  it('populates both sides with correct wins/total/losses/winRate when both have data', () => {
    const result = mergeMatchupRows(
      { 'sinbad': { wins: 3, total: 4 } },
      { 'sinbad': { wins: 6, total: 10 } }
    )
    const row = result.find(r => r.opponentId === 'sinbad') as MatchupRow

    expect(row.user).not.toBeNull()
    expect(row.user!.wins).toBe(3)
    expect(row.user!.total).toBe(4)
    expect(row.user!.losses).toBe(1)
    expect(row.user!.winRate).toBeCloseTo(75)

    expect(row.global).not.toBeNull()
    expect(row.global!.wins).toBe(6)
    expect(row.global!.total).toBe(10)
    expect(row.global!.losses).toBe(4)
    expect(row.global!.winRate).toBeCloseTo(60)
  })

  it('handles user-only side with valid data correctly (global is null)', () => {
    const result = mergeMatchupRows(
      { 'medusa': { wins: 1, total: 1 } },
      {}
    )
    const row = result[0]
    expect(row.user).not.toBeNull()
    expect(row.user!.wins).toBe(1)
    expect(row.user!.total).toBe(1)
    expect(row.global).toBeNull()
  })

  it('handles global-only side with valid data correctly (user is null)', () => {
    const result = mergeMatchupRows(
      {},
      { 'medusa': { wins: 2, total: 3 } }
    )
    const row = result[0]
    expect(row.global).not.toBeNull()
    expect(row.global!.wins).toBe(2)
    expect(row.global!.total).toBe(3)
    expect(row.user).toBeNull()
  })
})
