/**
 * HeroMatchupHeatmap tests.
 *
 * Strategy: mock @/lib/data so we control the hero roster and avoid
 * image imports. Provide a minimal 1v1 match so heroesWithData is
 * non-empty, then assert row count and click behaviour.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeroMatchupHeatmap } from '../HeroMatchupHeatmap'
import type { Match } from '@/lib/types'

// Two minimal heroes — gives us a controllable set
const MOCK_HEROES = [
  { id: 'hero-a', name: 'Hero A', set: 'test', hp: 10, move: 3, attack: 'melee' as const },
  { id: 'hero-b', name: 'Hero B', set: 'test', hp: 12, move: 2, attack: 'ranged' as const },
]

vi.mock('@/lib/data', () => ({
  getSelectableHeroes: () => MOCK_HEROES,
  getHeroById: (id: string) => MOCK_HEROES.find(h => h.id === id),
}))

function createHeatmapMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: 'match-1',
    date: '2026-01-01',
    mode: '1v1',
    mapId: 'map-1',
    players: [
      { playerName: 'Alice', heroId: 'hero-a', turnOrder: 1 },
      { playerName: 'Bob', heroId: 'hero-b', turnOrder: 2 },
    ],
    winnerId: 'hero-a',
    isDraw: false,
    userId: 'user-1',
    ...overrides,
  }
}

const noop = () => {}

describe('HeroMatchupHeatmap', () => {
  describe('without focusHeroId — full matrix (backward compat)', () => {
    it('renders one data row per hero with matchup data', () => {
      render(
        <HeroMatchupHeatmap
          matches={[createHeatmapMatch()]}
          onHeroClick={noop}
          isLoading={false}
        />
      )
      // 1 header row + 2 data rows (Hero A and Hero B both have data)
      expect(screen.getAllByRole('row')).toHaveLength(3)
    })

    it('renders a row for each hero that has data', () => {
      render(
        <HeroMatchupHeatmap
          matches={[createHeatmapMatch()]}
          onHeroClick={noop}
          isLoading={false}
        />
      )
      // Both hero names should appear as row headers (cells)
      expect(screen.getByRole('cell', { name: /Hero A/i })).toBeInTheDocument()
      expect(screen.getByRole('cell', { name: /Hero B/i })).toBeInTheDocument()
    })
  })

  describe('with focusHeroId — single-hero row', () => {
    it('renders exactly one data row when focusHeroId is set', () => {
      render(
        <HeroMatchupHeatmap
          matches={[createHeatmapMatch()]}
          onHeroClick={noop}
          isLoading={false}
          focusHeroId="hero-a"
        />
      )
      // 1 header row + 1 data row
      expect(screen.getAllByRole('row')).toHaveLength(2)
    })

    it('renders only the focused hero row cell', () => {
      render(
        <HeroMatchupHeatmap
          matches={[createHeatmapMatch()]}
          onHeroClick={noop}
          isLoading={false}
          focusHeroId="hero-a"
        />
      )
      expect(screen.getByRole('cell', { name: /Hero A/i })).toBeInTheDocument()
      // Hero B should NOT appear as a row header cell (only as a column header)
      expect(screen.queryByRole('cell', { name: /Hero B/i })).not.toBeInTheDocument()
    })

    it('fires onHeroClick with the focused hero id when its row header is clicked', async () => {
      const onHeroClick = vi.fn()
      render(
        <HeroMatchupHeatmap
          matches={[createHeatmapMatch()]}
          onHeroClick={onHeroClick}
          isLoading={false}
          focusHeroId="hero-a"
        />
      )
      await userEvent.click(screen.getByRole('cell', { name: /Hero A/i }))
      expect(onHeroClick).toHaveBeenCalledOnce()
      expect(onHeroClick).toHaveBeenCalledWith('hero-a')
    })
  })

  describe('loading state', () => {
    it('renders loading message when isLoading is true', () => {
      render(
        <HeroMatchupHeatmap
          matches={[]}
          onHeroClick={noop}
          isLoading={true}
        />
      )
      expect(screen.getByText(/loading matchup data/i)).toBeInTheDocument()
    })
  })
})
