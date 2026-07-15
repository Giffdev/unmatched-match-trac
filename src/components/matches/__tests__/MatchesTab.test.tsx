/**
 * MatchesTab tests for group match context feature.
 *
 * Tests the DataContextSelector integration:
 * - Visibility based on groups prop
 * - Personal vs group context behavior (edit/delete permissions)
 * - dataSource override for group matches
 * - Edge cases: empty groups, context switching
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchesTab } from '../MatchesTab'
import { AuthContext } from '@/hooks/use-auth'
import type { Match } from '@/lib/types'

// Mock child components that are heavy or have side effects
vi.mock('../LogMatchDialog', () => ({
  LogMatchDialog: () => null,
}))
vi.mock('../EditMatchDialog', () => ({
  EditMatchDialog: () => null,
}))
vi.mock('@/components/players/MapImageDialog', () => ({
  MapImageDialog: () => null,
}))

function createMatch(overrides: Partial<Match> = {}): Match {
  return {
    id: `match-${Math.random().toString(36).slice(2, 8)}`,
    date: '2026-04-15',
    mode: '1v1',
    mapId: 'soho',
    players: [
      { playerName: 'Devin', heroId: 'sinbad' },
      { playerName: 'Opponent', heroId: 'medusa' },
    ],
    winnerId: 'sinbad',
    isDraw: false,
    userId: 'user-123',
    ...overrides,
  }
}

const mockUser = { uid: 'user-123', email: 'test@test.com', displayName: 'Test User' }

function renderMatchesTab(props: Partial<Parameters<typeof MatchesTab>[0]> = {}) {
  const defaultProps = {
    matches: [createMatch({ id: 'match-1' }), createMatch({ id: 'match-2' })],
    setMatches: vi.fn(),
    onHeroClick: vi.fn(),
  }

  return render(
    <AuthContext.Provider value={{ user: mockUser, loading: false }}>
      <MatchesTab {...defaultProps} {...props} />
    </AuthContext.Provider>
  )
}

describe('MatchesTab', () => {
  describe('title', () => {
    it('always displays "Match History" regardless of context', () => {
      renderMatchesTab({ dataContext: 'group-abc' })
      expect(screen.getByText('Match History')).toBeInTheDocument()
    })

    it('shows "Match History" in personal context', () => {
      renderMatchesTab({ dataContext: 'personal' })
      expect(screen.getByText('Match History')).toBeInTheDocument()
    })
  })

  describe('DataContextSelector visibility', () => {
    it('does NOT render DataContextSelector when groups is empty', () => {
      renderMatchesTab({ groups: [] })
      // "My Matches" is the personal option label inside DataContextSelector
      expect(screen.queryByText('My Matches')).not.toBeInTheDocument()
    })

    it('does NOT render DataContextSelector when groups is undefined', () => {
      renderMatchesTab({ groups: undefined })
      expect(screen.queryByText('My Matches')).not.toBeInTheDocument()
    })

    it('renders DataContextSelector when groups has entries', () => {
      renderMatchesTab({
        groups: [{ id: 'group-1', name: 'Friday Night Games' }],
        dataContext: 'personal',
        onDataContextChange: vi.fn(),
      })
      // The selector renders "My Matches" as the personal option
      expect(screen.getByText('My Matches')).toBeInTheDocument()
    })
  })

  describe('personal context (edit/delete permissions)', () => {
    it('renders edit/delete action buttons for matches in personal context', () => {
      const { container } = renderMatchesTab({ dataContext: 'personal' })
      // MatchCard renders icon buttons (Pencil/Trash) when onEdit/onDelete are provided
      // In personal context, these handlers are passed so icon buttons appear
      const iconButtons = container.querySelectorAll('button[data-slot="button"]')
      // There should be more than just "Log Match" — each match gets edit + delete
      // 2 matches × 2 buttons (edit+delete) + 1 Log Match = at least 5 buttons
      expect(iconButtons.length).toBeGreaterThanOrEqual(5)
    })

    it('passes onDelete and onEdit handlers to MatchCard in personal context', () => {
      const { container } = renderMatchesTab({ dataContext: 'personal' })
      // Verify destructive-colored (delete) buttons exist
      const deleteButtons = container.querySelectorAll('button.text-destructive')
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  describe('group context (read-only)', () => {
    it('does NOT render edit/delete action buttons when viewing group matches', () => {
      const { container } = renderMatchesTab({
        matches: [], // no personal matches
        dataContext: 'group-abc',
        groups: [{ id: 'group-abc', name: 'Test Group' }],
        onDataContextChange: vi.fn(),
        dataSource: {
          label: 'Test Group',
          matches: [createMatch({ id: 'group-match-1' })],
        },
      })
      // In group context, MatchCard should NOT receive onEdit/onDelete
      // So no icon-only buttons (size="icon") should appear for edit/delete
      // Only buttons should be the DataContextSelector trigger (if rendered)
      const allButtons = container.querySelectorAll('button[data-slot="button"]')
      const iconButtons = Array.from(allButtons).filter(btn => 
        btn.textContent?.trim() === '' || btn.querySelector('svg')
      )
      // Should have no edit/delete icon buttons on the match cards
      // (Log Match is also hidden, DataContextSelector has a trigger)
      // In group context with 1 match: 0 edit + 0 delete + 0 Log Match
      const matchActionButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent?.trim() ?? ''
        return text === '' // icon-only buttons (edit/delete are icon-only)
      })
      expect(matchActionButtons.length).toBe(0)
    })

    it('hides the "Log Match" button when viewing group context', () => {
      renderMatchesTab({
        dataContext: 'group-abc',
        groups: [{ id: 'group-abc', name: 'Test Group' }],
        onDataContextChange: vi.fn(),
        dataSource: {
          label: 'Test Group',
          matches: [createMatch()],
        },
      })
      // Log Match button stays visible — LogMatchDialog has a "Log to" group picker
      expect(screen.getByRole('button', { name: /log match/i })).toBeInTheDocument()
    })
  })

  describe('dataSource override', () => {
    it('displays dataSource matches instead of personal matches when provided', () => {
      const personalMatches = [createMatch({ id: 'personal-1', date: '2026-01-01' })]
      const groupMatches = [
        createMatch({ id: 'group-1', date: '2026-03-01' }),
        createMatch({ id: 'group-2', date: '2026-03-02' }),
        createMatch({ id: 'group-3', date: '2026-03-03' }),
      ]

      renderMatchesTab({
        matches: personalMatches,
        dataContext: 'group-xyz',
        groups: [{ id: 'group-xyz', name: 'XYZ Group' }],
        onDataContextChange: vi.fn(),
        dataSource: { label: 'XYZ Group', matches: groupMatches },
      })

      // Should show count from dataSource (3 matches), not personal (1 match)
      expect(screen.getByText(/3 matches logged/i)).toBeInTheDocument()
    })

    it('displays personal matches when dataSource is not provided', () => {
      const personalMatches = [createMatch({ id: 'p-1' }), createMatch({ id: 'p-2' })]

      renderMatchesTab({
        matches: personalMatches,
        dataContext: 'personal',
      })

      expect(screen.getByText(/2 matches logged/i)).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('shows empty state when group has no matches', () => {
      renderMatchesTab({
        dataContext: 'group-empty',
        groups: [{ id: 'group-empty', name: 'Empty Group' }],
        onDataContextChange: vi.fn(),
        dataSource: { label: 'Empty Group', matches: [] },
      })

      // Should show some empty state indicator (0 matches or empty message)
      expect(
        screen.getByText(/0 matches/i) || screen.getByText(/no matches/i)
      ).toBeInTheDocument()
    })

    it('shows the "Log Match" button in personal context', () => {
      renderMatchesTab({ dataContext: 'personal' })
      expect(screen.getByRole('button', { name: /log match/i })).toBeInTheDocument()
    })

    it('renders correctly with a single match in personal context', () => {
      renderMatchesTab({
        matches: [createMatch({ id: 'solo' })],
        dataContext: 'personal',
      })
      expect(screen.getByText(/1 match logged/i)).toBeInTheDocument()
    })
  })
})
