import { describe, it, expect } from 'vitest'
import { calculatePlayerStats, calculateHeroStats, calculateUserHeroStats, aggregateCommunityData, getAllPlayerNames, getBalancedMatchupScored } from '../stats'
import type { Match, CommunityData } from '../types'

// Test data factory
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

describe('calculatePlayerStats', () => {
  it('returns zero stats for empty matches', () => {
    const stats = calculatePlayerStats([], 'Alice')
    expect(stats.totalGames).toBe(0)
    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(0)
    expect(stats.draws).toBe(0)
    expect(stats.winRate).toBe(0)
  })

  it('correctly calculates a single win', () => {
    const matches = [createMatch()]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.totalGames).toBe(1)
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(0)
    expect(stats.winRate).toBe(100)
  })

  it('correctly calculates a single loss', () => {
    const matches = [createMatch()]
    const stats = calculatePlayerStats(matches, 'Bob')
    expect(stats.totalGames).toBe(1)
    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(1)
    expect(stats.winRate).toBe(0)
  })

  it('handles draws correctly', () => {
    const matches = [createMatch({ winnerId: undefined, isDraw: true })]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.totalGames).toBe(1)
    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(0)
    expect(stats.draws).toBe(1)
    expect(stats.winRate).toBe(0)
  })

  it('is case-insensitive for player name matching', () => {
    const matches = [createMatch()]
    const stats = calculatePlayerStats(matches, 'alice')
    expect(stats.totalGames).toBe(1)
    expect(stats.wins).toBe(1)
  })

  it('tracks heroes played', () => {
    const matches = [
      createMatch(),
      createMatch({ id: 'match-2', players: [
        { playerName: 'Alice', heroId: 'medusa', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'king-arthur', turnOrder: 2 },
      ]}),
    ]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.heroesPlayed['medusa']).toBe(2)
  })

  it('tracks hero win rates', () => {
    const matches = [
      createMatch({ id: 'm1' }),
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // Alice loses
    ]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.heroWinRates['medusa']).toEqual({ wins: 1, total: 2 })
  })

  it('tracks map stats', () => {
    const matches = [
      createMatch({ id: 'm1', mapId: 'map-a' }),
      createMatch({ id: 'm2', mapId: 'map-a', winnerId: 'sinbad' }),
      createMatch({ id: 'm3', mapId: 'map-b' }),
    ]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.mapsPlayed['map-a']).toBe(2)
    expect(stats.mapsPlayed['map-b']).toBe(1)
    expect(stats.mapWinRates['map-a']).toEqual({ wins: 1, total: 2 })
  })

  it('tracks vs player records', () => {
    const matches = [
      createMatch({ id: 'm1' }), // Alice wins
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // Bob wins
    ]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.vsPlayers['Bob']).toEqual({ wins: 1, losses: 1, draws: 0, total: 2 })
  })

  it('calculates correct win rate with mixed results', () => {
    const matches = [
      createMatch({ id: 'm1' }), // Alice wins
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // loss
      createMatch({ id: 'm3' }), // win
      createMatch({ id: 'm4', isDraw: true, winnerId: undefined }), // draw
    ]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.totalGames).toBe(4)
    expect(stats.wins).toBe(2)
    expect(stats.losses).toBe(1)
    expect(stats.draws).toBe(1)
    expect(stats.winRate).toBe(50) // 2/4 * 100
  })

  it('returns stats for player not in any matches', () => {
    const matches = [createMatch()]
    const stats = calculatePlayerStats(matches, 'Charlie')
    expect(stats.totalGames).toBe(0)
    expect(stats.winRate).toBe(0)
  })

  it('normalizes hero IDs (bruce-lee-ali -> bruce-lee)', () => {
    const matches = [createMatch({
      players: [
        { playerName: 'Alice', heroId: 'bruce-lee-ali', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
      ],
      winnerId: 'bruce-lee-ali',
    })]
    const stats = calculatePlayerStats(matches, 'Alice')
    expect(stats.heroesPlayed['bruce-lee']).toBe(1)
  })
})

describe('calculateHeroStats', () => {
  it('returns zero stats when hero has no matches', () => {
    const stats = calculateHeroStats([], 'medusa')
    expect(stats.totalGames).toBe(0)
    expect(stats.winRate).toBe(0)
  })

  it('calculates wins/losses for a hero', () => {
    const matches = [
      createMatch({ id: 'm1' }), // medusa wins
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // medusa loses
      createMatch({ id: 'm3' }), // medusa wins
    ]
    const stats = calculateHeroStats(matches, 'medusa')
    expect(stats.totalGames).toBe(3)
    expect(stats.wins).toBe(2)
    expect(stats.losses).toBe(1)
    expect(stats.winRate).toBeCloseTo(66.67, 1)
  })

  it('tracks vs matchups', () => {
    const matches = [
      createMatch({ id: 'm1' }), // medusa beats sinbad
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // sinbad beats medusa
    ]
    const stats = calculateHeroStats(matches, 'medusa')
    expect(stats.vsMatchups['sinbad']).toEqual({ wins: 1, total: 2 })
  })

  it('handles draws', () => {
    const matches = [createMatch({ isDraw: true, winnerId: undefined })]
    const stats = calculateHeroStats(matches, 'medusa')
    expect(stats.draws).toBe(1)
    expect(stats.wins).toBe(0)
    expect(stats.losses).toBe(0)
  })

  it('filters by opponent hero when filterByHeroId is provided', () => {
    const matches = [
      createMatch({ id: 'm1' }), // medusa vs sinbad
      createMatch({ id: 'm2', players: [
        { playerName: 'Alice', heroId: 'medusa', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'king-arthur', turnOrder: 2 },
      ]}), // medusa vs king-arthur
    ]
    const stats = calculateHeroStats(matches, 'medusa', 'sinbad')
    expect(stats.totalGames).toBe(1) // Only the match vs sinbad
  })

  it('normalizes hero ID aliases', () => {
    const matches = [createMatch({
      players: [
        { playerName: 'Alice', heroId: 'bruce-lee-ali', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
      ],
      winnerId: 'bruce-lee-ali',
    })]
    const stats = calculateHeroStats(matches, 'bruce-lee')
    expect(stats.totalGames).toBe(1)
    expect(stats.wins).toBe(1)
  })
})

describe('calculateUserHeroStats', () => {
  it('returns zero stats with no matches', () => {
    const stats = calculateUserHeroStats([], 'medusa')
    expect(stats.totalGames).toBe(0)
  })

  it('calculates stats for a specific player with a specific hero', () => {
    const matches = [
      createMatch({ id: 'm1' }), // Alice plays medusa, wins
      createMatch({ id: 'm2', players: [
        { playerName: 'Charlie', heroId: 'medusa', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
      ]}), // Charlie plays medusa
    ]
    const stats = calculateUserHeroStats(matches, 'medusa', 'Alice')
    expect(stats.totalGames).toBe(1) // Only Alice's games with medusa
    expect(stats.wins).toBe(1)
  })

  it('without playerName, counts all uses of the hero', () => {
    const matches = [
      createMatch({ id: 'm1' }), // Alice plays medusa
      createMatch({ id: 'm2', players: [
        { playerName: 'Charlie', heroId: 'medusa', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
      ], winnerId: 'sinbad' }), // Charlie plays medusa, loses
    ]
    const stats = calculateUserHeroStats(matches, 'medusa')
    expect(stats.totalGames).toBe(2)
    expect(stats.wins).toBe(1)
    expect(stats.losses).toBe(1)
  })

  it('handles draws', () => {
    const matches = [createMatch({ isDraw: true, winnerId: undefined })]
    const stats = calculateUserHeroStats(matches, 'medusa', 'Alice')
    expect(stats.draws).toBe(1)
  })

  it('tracks vs matchups per opponent hero', () => {
    const matches = [
      createMatch({ id: 'm1' }), // Alice/medusa beats Bob/sinbad
    ]
    const stats = calculateUserHeroStats(matches, 'medusa', 'Alice')
    expect(stats.vsMatchups['sinbad']).toEqual({ wins: 1, total: 1 })
  })
})

describe('aggregateCommunityData', () => {
  it('returns empty stats for no matches', () => {
    const data = aggregateCommunityData([])
    expect(data.totalMatches).toBe(0)
    expect(Object.keys(data.heroStats)).toHaveLength(0)
    expect(data.lastUpdated).toBeDefined()
  })

  it('aggregates stats for all heroes in matches', () => {
    const matches = [
      createMatch({ id: 'm1' }),
      createMatch({ id: 'm2', players: [
        { playerName: 'Alice', heroId: 'king-arthur', turnOrder: 1 },
        { playerName: 'Bob', heroId: 'sinbad', turnOrder: 2 },
      ], winnerId: 'king-arthur' }),
    ]
    const data = aggregateCommunityData(matches)
    expect(data.totalMatches).toBe(2)
    expect(data.heroStats['medusa']).toBeDefined()
    expect(data.heroStats['sinbad']).toBeDefined()
    expect(data.heroStats['king-arthur']).toBeDefined()
  })

  it('has correct win rates in aggregated data', () => {
    const matches = [
      createMatch({ id: 'm1' }), // medusa wins
      createMatch({ id: 'm2', winnerId: 'sinbad' }), // sinbad wins
    ]
    const data = aggregateCommunityData(matches)
    expect(data.heroStats['medusa'].wins).toBe(1)
    expect(data.heroStats['medusa'].losses).toBe(1)
    expect(data.heroStats['sinbad'].wins).toBe(1)
    expect(data.heroStats['sinbad'].losses).toBe(1)
  })

  it('includes lastUpdated as ISO string', () => {
    const data = aggregateCommunityData([createMatch()])
    expect(data.lastUpdated).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('getAllPlayerNames', () => {
  it('returns empty array for no matches', () => {
    expect(getAllPlayerNames([])).toEqual([])
  })

  it('returns unique sorted names', () => {
    const matches = [
      createMatch({ id: 'm1' }),
      createMatch({ id: 'm2', players: [
        { playerName: 'Alice', heroId: 'medusa', turnOrder: 1 },
        { playerName: 'Charlie', heroId: 'sinbad', turnOrder: 2 },
      ]}),
    ]
    expect(getAllPlayerNames(matches)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('deduplicates player names', () => {
    const matches = [
      createMatch({ id: 'm1' }),
      createMatch({ id: 'm2' }),
    ]
    const names = getAllPlayerNames(matches)
    expect(names.filter(n => n === 'Alice')).toHaveLength(1)
  })
})

describe('getBalancedMatchupScored', () => {
  // Note: This function uses Math.random() internally for softmax selection,
  // so we test the deterministic parts of the scoring logic.

  const emptyCommunityData: CommunityData = { heroStats: {}, lastUpdated: '', totalMatches: 0 }
  const noopLookup = () => undefined

  it('returns a result even with empty community data', () => {
    const result = getBalancedMatchupScored(
      ['hero-a', 'hero-b'],
      'hero-c',
      emptyCommunityData,
      noopLookup
    )
    expect(result).toBeDefined()
    expect(result.heroId).toBeDefined()
    expect(result.confidence).toBe('low')
  })

  it('excludes the opponent hero from candidates', () => {
    const result = getBalancedMatchupScored(
      ['hero-a', 'hero-b', 'hero-c'],
      'hero-c',
      emptyCommunityData,
      noopLookup
    )
    expect(result.heroId).not.toBe('hero-c')
  })

  it('returns fallback when only the opponent hero is available', () => {
    const result = getBalancedMatchupScored(
      ['hero-c'],
      'hero-c',
      emptyCommunityData,
      noopLookup
    )
    // Should still return something (fallback behavior)
    expect(result).toBeDefined()
    expect(result.score).toBe(50)
  })

  it('uses stat-proxy confidence when no match data exists', () => {
    const heroLookup = (id: string) => {
      if (id === 'hero-a') return { hp: 15, move: 3, sidekicks: [{ count: 1, hp: 5 }] }
      if (id === 'hero-b') return { hp: 14, move: 3, sidekicks: [{ count: 1, hp: 4 }] }
      if (id === 'opponent') return { hp: 15, move: 3, sidekicks: [{ count: 1, hp: 5 }] }
      return undefined
    }

    const result = getBalancedMatchupScored(
      ['hero-a', 'hero-b'],
      'opponent',
      emptyCommunityData,
      heroLookup
    )
    expect(result.reason).toBe('stat-proxy')
    expect(result.confidence).toBe('low')
  })
})
