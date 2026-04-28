import { describe, it, expect } from 'vitest'
import { normalizeHeroId, normalizePlayerName, normalizeMatchPlayerNames, getHeroDisplayName } from '../utils'
import type { Match, PlayerAssignment } from '../types'

describe('normalizeHeroId', () => {
  it('returns mapped ID for known alias', () => {
    expect(normalizeHeroId('bruce-lee-ali')).toBe('bruce-lee')
  })

  it('returns input unchanged for unknown IDs', () => {
    expect(normalizeHeroId('medusa')).toBe('medusa')
    expect(normalizeHeroId('king-arthur')).toBe('king-arthur')
  })

  it('returns empty string for empty string input', () => {
    expect(normalizeHeroId('')).toBe('')
  })

  it('handles special characters without crashing', () => {
    expect(normalizeHeroId('hero-with-special_chars.123')).toBe('hero-with-special_chars.123')
  })

  it('is case-sensitive (no case normalization)', () => {
    expect(normalizeHeroId('Bruce-Lee-Ali')).toBe('Bruce-Lee-Ali')
  })
})

describe('normalizePlayerName', () => {
  it('maps known lowercase names to canonical casing', () => {
    expect(normalizePlayerName('mike')).toBe('Mike')
    expect(normalizePlayerName('sarah')).toBe('Sarah')
    expect(normalizePlayerName('alex')).toBe('Alex')
    expect(normalizePlayerName('chris')).toBe('Chris')
    expect(normalizePlayerName('jordan')).toBe('Jordan')
  })

  it('trims whitespace before normalizing', () => {
    expect(normalizePlayerName('  mike  ')).toBe('Mike')
    expect(normalizePlayerName('\tmike\n')).toBe('Mike')
  })

  it('is case-insensitive for map lookups', () => {
    expect(normalizePlayerName('MIKE')).toBe('Mike')
    expect(normalizePlayerName('Mike')).toBe('Mike')
    expect(normalizePlayerName('mIkE')).toBe('Mike')
  })

  it('returns trimmed input for unknown names', () => {
    expect(normalizePlayerName('  Unknown Player  ')).toBe('Unknown Player')
  })

  it('handles empty string', () => {
    expect(normalizePlayerName('')).toBe('')
  })

  it('handles string of only whitespace', () => {
    expect(normalizePlayerName('   ')).toBe('')
  })
})

describe('normalizeMatchPlayerNames', () => {
  const baseMatch: Match = {
    id: 'test-match-1',
    date: '2026-01-01',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: '  mike  ', heroId: 'bruce-lee-ali', turnOrder: 1 },
      { playerName: 'sarah', heroId: 'medusa', turnOrder: 2 },
    ],
    winnerId: 'bruce-lee-ali',
    isDraw: false,
    userId: 'user-1',
  }

  it('normalizes player names and hero IDs in a match', () => {
    const result = normalizeMatchPlayerNames(baseMatch)
    expect(result.players[0].playerName).toBe('Mike')
    expect(result.players[0].heroId).toBe('bruce-lee')
    expect(result.players[1].playerName).toBe('Sarah')
    expect(result.players[1].heroId).toBe('medusa')
  })

  it('normalizes winnerId', () => {
    const result = normalizeMatchPlayerNames(baseMatch)
    expect(result.winnerId).toBe('bruce-lee')
  })

  it('handles null/undefined winnerId (draw)', () => {
    const drawMatch: Match = { ...baseMatch, winnerId: undefined, isDraw: true }
    const result = normalizeMatchPlayerNames(drawMatch)
    expect(result.winnerId).toBeUndefined()
  })

  it('handles empty players array', () => {
    const emptyMatch: Match = { ...baseMatch, players: [] }
    const result = normalizeMatchPlayerNames(emptyMatch)
    expect(result.players).toEqual([])
  })

  it('does not mutate the original match object', () => {
    const original = JSON.parse(JSON.stringify(baseMatch))
    normalizeMatchPlayerNames(baseMatch)
    expect(baseMatch).toEqual(original)
  })
})

describe('getHeroDisplayName', () => {
  it('returns hero name for a valid heroId', () => {
    // Using a known hero from data.ts
    const player: PlayerAssignment = { playerName: 'Mike', heroId: 'medusa', turnOrder: 1 }
    const result = getHeroDisplayName(player)
    expect(result).not.toBe('Unknown Hero')
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('returns "Unknown Hero" for invalid heroId', () => {
    const player: PlayerAssignment = { playerName: 'Mike', heroId: 'nonexistent-hero-xyz', turnOrder: 1 }
    expect(getHeroDisplayName(player)).toBe('Unknown Hero')
  })

  it('handles yennefer-triss variant correctly', () => {
    const playerTriss: PlayerAssignment = { playerName: 'Mike', heroId: 'yennefer-triss', turnOrder: 1, heroVariant: 'triss' }
    const resultTriss = getHeroDisplayName(playerTriss)
    expect(resultTriss).toContain('Triss as Hero')

    const playerYen: PlayerAssignment = { playerName: 'Mike', heroId: 'yennefer-triss', turnOrder: 1, heroVariant: 'yennefer' }
    const resultYen = getHeroDisplayName(playerYen)
    expect(resultYen).toContain('Yennefer as Hero')
  })

  it('returns base hero name when no variant specified', () => {
    const player: PlayerAssignment = { playerName: 'Mike', heroId: 'yennefer-triss', turnOrder: 1 }
    const result = getHeroDisplayName(player)
    // Without variant, should return base name (no parenthetical)
    expect(result).not.toContain('as Hero')
  })
})
