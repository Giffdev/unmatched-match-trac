import { describe, it, expect } from 'vitest'
import { compareHeroMapPerformance } from '../stats'
import type { HeroMapPerformance } from '../stats'

function hero(overrides: Partial<HeroMapPerformance> = {}): HeroMapPerformance {
  return {
    heroId: 'hero-a',
    heroName: 'Hero A',
    userWins: 0,
    userLosses: 0,
    userTotal: 0,
    userWinRate: 0,
    globalWins: 0,
    globalLosses: 0,
    globalTotal: 0,
    globalWinRate: 0,
    ...overrides,
  }
}

describe('compareHeroMapPerformance', () => {
  it('ranks higher globalWinRate first', () => {
    const a = hero({ heroName: 'Alpha', globalWinRate: 75, globalTotal: 10 })
    const b = hero({ heroName: 'Beta', globalWinRate: 50, globalTotal: 10 })
    const sorted = [b, a].sort(compareHeroMapPerformance)
    expect(sorted[0].heroName).toBe('Alpha')
    expect(sorted[1].heroName).toBe('Beta')
  })

  it('tiebreaks by globalTotal descending when win rates are equal', () => {
    const a = hero({ heroName: 'Alpha', globalWinRate: 60, globalTotal: 20 })
    const b = hero({ heroName: 'Beta', globalWinRate: 60, globalTotal: 8 })
    const sorted = [b, a].sort(compareHeroMapPerformance)
    expect(sorted[0].heroName).toBe('Alpha')
    expect(sorted[1].heroName).toBe('Beta')
  })

  it('tiebreaks by userTotal descending when win rate and globalTotal are equal', () => {
    const a = hero({ heroName: 'Alpha', globalWinRate: 60, globalTotal: 10, userTotal: 5 })
    const b = hero({ heroName: 'Beta', globalWinRate: 60, globalTotal: 10, userTotal: 2 })
    const sorted = [b, a].sort(compareHeroMapPerformance)
    expect(sorted[0].heroName).toBe('Alpha')
    expect(sorted[1].heroName).toBe('Beta')
  })

  it('tiebreaks alphabetically A–Z when all numeric fields are equal', () => {
    const a = hero({ heroName: 'Sinbad', globalWinRate: 50, globalTotal: 5, userTotal: 2 })
    const b = hero({ heroName: 'Medusa', globalWinRate: 50, globalTotal: 5, userTotal: 2 })
    const sorted = [a, b].sort(compareHeroMapPerformance)
    expect(sorted[0].heroName).toBe('Medusa')
    expect(sorted[1].heroName).toBe('Sinbad')
  })

  it('sinks a hero with 0 global games (globalWinRate 0) below heroes with real global data', () => {
    const noGlobal = hero({ heroName: 'NoGames', globalWinRate: 0, globalTotal: 0 })
    const hasGlobal = hero({ heroName: 'HasGames', globalWinRate: 50, globalTotal: 6 })
    const sorted = [noGlobal, hasGlobal].sort(compareHeroMapPerformance)
    expect(sorted[0].heroName).toBe('HasGames')
    expect(sorted[1].heroName).toBe('NoGames')
  })

  it('produces a fully stable sort across multiple heroes with mixed stats', () => {
    const heroes = [
      hero({ heroName: 'Zelda', globalWinRate: 40, globalTotal: 8, userTotal: 1 }),
      hero({ heroName: 'Alice', globalWinRate: 80, globalTotal: 4, userTotal: 0 }),
      hero({ heroName: 'Bob',   globalWinRate: 60, globalTotal: 12, userTotal: 3 }),
      hero({ heroName: 'Carol', globalWinRate: 60, globalTotal: 12, userTotal: 3 }),
      hero({ heroName: 'Dave',  globalWinRate: 60, globalTotal: 12, userTotal: 1 }),
    ]
    const sorted = [...heroes].sort(compareHeroMapPerformance)
    expect(sorted.map(h => h.heroName)).toEqual(['Alice', 'Bob', 'Carol', 'Dave', 'Zelda'])
  })
})
