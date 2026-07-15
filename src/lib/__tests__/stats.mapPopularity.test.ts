import { describe, it, expect } from 'vitest'
import { calculateMapPopularity } from '../stats'
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
    winnerId: 'medusa',
    isDraw: false,
    userId: 'user-1',
    ...overrides,
  }
}

describe('calculateMapPopularity', () => {
  it('returns [] for an empty matches array', () => {
    expect(calculateMapPopularity([])).toEqual([])
  })

  it('returns a single entry for one match on one map', () => {
    const result = calculateMapPopularity([createMatch({ mapId: 'forest' })])
    expect(result).toEqual([{ mapId: 'forest', count: 1 }])
  })

  it('counts multiple matches on the same map correctly', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: 'forest' }),
      createMatch({ id: 'm2', mapId: 'forest' }),
      createMatch({ id: 'm3', mapId: 'forest' }),
    ]
    const result = calculateMapPopularity(matches)
    expect(result).toEqual([{ mapId: 'forest', count: 3 }])
  })

  it('sorts descending by count — 5,3,1 order', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: 'rare' }),           // count 1
      createMatch({ id: 'm2', mapId: 'common' }),          // count 5
      createMatch({ id: 'm3', mapId: 'common' }),
      createMatch({ id: 'm4', mapId: 'common' }),
      createMatch({ id: 'm5', mapId: 'common' }),
      createMatch({ id: 'm6', mapId: 'common' }),
      createMatch({ id: 'm7', mapId: 'middle' }),          // count 3
      createMatch({ id: 'm8', mapId: 'middle' }),
      createMatch({ id: 'm9', mapId: 'middle' }),
    ]
    const result = calculateMapPopularity(matches)
    expect(result.map(r => r.count)).toEqual([5, 3, 1])
    expect(result.map(r => r.mapId)).toEqual(['common', 'middle', 'rare'])
  })

  it('breaks ties alphabetically ascending by mapId', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: 'beta' }),
      createMatch({ id: 'm2', mapId: 'beta' }),
      createMatch({ id: 'm3', mapId: 'alpha' }),
      createMatch({ id: 'm4', mapId: 'alpha' }),
    ]
    const result = calculateMapPopularity(matches)
    expect(result).toEqual([
      { mapId: 'alpha', count: 2 },
      { mapId: 'beta', count: 2 },
    ])
  })

  it('skips matches with a falsy mapId (empty string)', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: '' }),
      createMatch({ id: 'm2', mapId: 'forest' }),
    ]
    const result = calculateMapPopularity(matches)
    expect(result).toEqual([{ mapId: 'forest', count: 1 }])
  })

  it('skips matches with an undefined mapId', () => {
    const matches = [
      { ...createMatch({ id: 'm1' }), mapId: undefined as unknown as string },
      createMatch({ id: 'm2', mapId: 'forest' }),
    ]
    const result = calculateMapPopularity(matches)
    expect(result).toEqual([{ mapId: 'forest', count: 1 }])
  })

  it('does not mutate the input array', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: 'x' }),
      createMatch({ id: 'm2', mapId: 'y' }),
    ]
    const copy = [...matches]
    calculateMapPopularity(matches)
    expect(matches).toEqual(copy)
  })
})
