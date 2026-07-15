import { describe, it, expect } from 'vitest'
import { countCommunityMembers } from '../stats'
import type { Match } from '../types'

function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    date: '2026-01-01',
    mode: '1v1',
    mapId: 'map-a',
    players: [
      { playerName: 'Alice', heroId: 'medusa', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
    ],
    isDraw: false,
    userId: 'user-1',
    ...overrides,
  }
}

describe('countCommunityMembers', () => {
  it('returns 0 for an empty matches array', () => {
    expect(countCommunityMembers([])).toBe(0)
  })

  it('counts repeated userId across N matches as 1', () => {
    const matches = [
      createMatch({ id: 'm1', userId: 'user-42' }),
      createMatch({ id: 'm2', userId: 'user-42' }),
      createMatch({ id: 'm3', userId: 'user-42' }),
    ]
    expect(countCommunityMembers(matches)).toBe(1)
  })

  it('counts 3 distinct userIds as 3', () => {
    const matches = [
      createMatch({ id: 'm1', userId: 'user-a' }),
      createMatch({ id: 'm2', userId: 'user-b' }),
      createMatch({ id: 'm3', userId: 'user-c' }),
    ]
    expect(countCommunityMembers(matches)).toBe(3)
  })

  it('does not count matches with an empty string userId', () => {
    const matches = [
      createMatch({ id: 'm1', userId: '' }),
      createMatch({ id: 'm2', userId: '' }),
    ]
    expect(countCommunityMembers(matches)).toBe(0)
  })

  it('does not count matches with an undefined userId', () => {
    const matches = [
      { ...createMatch({ id: 'm1' }), userId: undefined as unknown as string },
      { ...createMatch({ id: 'm2' }), userId: undefined as unknown as string },
    ]
    expect(countCommunityMembers(matches)).toBe(0)
  })

  it('counts only distinct valid userIds in a mixed set', () => {
    const matches = [
      createMatch({ id: 'm1', userId: 'user-x' }),
      createMatch({ id: 'm2', userId: 'user-y' }),
      createMatch({ id: 'm3', userId: '' }),
      { ...createMatch({ id: 'm4' }), userId: undefined as unknown as string },
      createMatch({ id: 'm5', userId: 'user-x' }),
    ]
    expect(countCommunityMembers(matches)).toBe(2)
  })
})
