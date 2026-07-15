/**
 * CommunityTab tests.
 *
 * Strategy: mock the three sub-components that call Firebase so we never hit
 * real Firestore. Verify that CommunityTab renders the expected sub-tab
 * triggers and that clicking them shows the right panel.
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CommunityTab } from '../CommunityTab'

// Mock the three community sub-components — they each call Firebase internally
vi.mock('@/components/auth/GlobalStats', () => ({
  GlobalStats: () => <div data-testid="global-stats">GlobalStats</div>,
}))
vi.mock('@/components/auth/PublicHeroBrowser', () => ({
  PublicHeroBrowser: ({ selectedHeroId }: { selectedHeroId: string | null }) => (
    <div data-testid="public-hero-browser" data-selected={selectedHeroId ?? ''}>
      PublicHeroBrowser
    </div>
  ),
}))
vi.mock('@/components/auth/PublicHeatmap', () => ({
  PublicHeatmap: ({ onHeroClick }: { onHeroClick: (id: string) => void }) => (
    <div data-testid="public-heatmap">
      <button onClick={() => onHeroClick('medusa')}>medusa-cell</button>
    </div>
  ),
}))

describe('CommunityTab', () => {
  describe('sub-tab triggers', () => {
    it('renders all three sub-tab triggers', () => {
      render(<CommunityTab />)
      // Desktop labels (visible on sm+ screens)
      expect(screen.getByRole('tab', { name: /community stats/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /hero browser/i })).toBeInTheDocument()
      expect(screen.getByRole('tab', { name: /matchup heatmap/i })).toBeInTheDocument()
    })

    it('starts on the Stats tab by default', () => {
      render(<CommunityTab />)
      expect(screen.getByRole('tab', { name: /community stats/i })).toHaveAttribute(
        'data-state',
        'active'
      )
    })
  })

  describe('Stats sub-tab', () => {
    it('renders GlobalStats component by default', () => {
      render(<CommunityTab />)
      expect(screen.getByTestId('global-stats')).toBeInTheDocument()
    })
  })

  describe('Hero Browser sub-tab', () => {
    it('renders PublicHeroBrowser when the Heroes tab is selected', async () => {
      render(<CommunityTab />)
      await userEvent.click(screen.getByRole('tab', { name: /hero browser/i }))
      expect(screen.getByTestId('public-hero-browser')).toBeInTheDocument()
    })
  })

  describe('Matchup Heatmap sub-tab', () => {
    it('renders PublicHeatmap when the Heatmap tab is selected', async () => {
      render(<CommunityTab />)
      await userEvent.click(screen.getByRole('tab', { name: /matchup heatmap/i }))
      expect(screen.getByTestId('public-heatmap')).toBeInTheDocument()
    })

    it('switches to Hero Browser tab when onHeroClick is fired from heatmap', async () => {
      render(<CommunityTab />)
      await userEvent.click(screen.getByRole('tab', { name: /matchup heatmap/i }))

      // Simulate clicking a hero cell in the heatmap
      await userEvent.click(screen.getByRole('button', { name: 'medusa-cell' }))

      // Should have navigated to the Heroes tab
      expect(screen.getByRole('tab', { name: /hero browser/i })).toHaveAttribute(
        'data-state',
        'active'
      )
      // The HeroBrowser should now be visible with the hero pre-selected
      expect(screen.getByTestId('public-hero-browser')).toHaveAttribute(
        'data-selected',
        'medusa'
      )
    })
  })

  describe('tab label text', () => {
    it('renders short mobile labels inside triggers', () => {
      render(<CommunityTab />)
      // The component renders both a <span class="sm:hidden"> short label and
      // a <span class="hidden sm:inline"> full label. Both are in the DOM.
      expect(screen.getByText('Stats')).toBeInTheDocument()
      expect(screen.getByText('Heroes')).toBeInTheDocument()
      expect(screen.getByText('Heatmap')).toBeInTheDocument()
    })
  })
})
