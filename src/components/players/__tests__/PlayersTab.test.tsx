import { beforeAll, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ContextType } from 'react'
import { PlayersTab } from '../PlayersTab'
import { AuthContext } from '@/hooks/use-auth'
import type { Match } from '@/lib/types'

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
})

type AuthUser = ContextType<typeof AuthContext>['user']

function match(id: string, first: string, second: string): Match {
  return {
    id, mapId: 'soho', date: '2026-11-18', mode: '1v1', userId: 'user-1', isDraw: false,
    players: [
      { playerName: first, heroId: 'sinbad', turnOrder: 1 },
      { playerName: second, heroId: 'medusa', turnOrder: 2 },
    ],
    winnerId: 'sinbad',
  }
}

// Sorted player names: Alice, Devin Sinha, Zed
const MATCHES = [match('m1', 'Alice', 'Devin Sinha'), match('m2', 'Devin Sinha', 'Zed')]

const signedIn = (playerName?: string): AuthUser =>
  ({ uid: 'user-1', email: 'devin@example.com', displayName: 'Devin', playerName })

function ui(user: AuthUser, props: Partial<Parameters<typeof PlayersTab>[0]> = {}) {
  return (
    <AuthContext.Provider value={{ user, loading: false }}>
      <PlayersTab matches={MATCHES} {...props} />
    </AuthContext.Provider>
  )
}

const playerSelect = () => screen.getByRole('combobox')

async function pickPlayer(user: ReturnType<typeof userEvent.setup>, name: string) {
  await user.click(playerSelect())
  await user.click(screen.getByRole('option', { name }))
  expect(playerSelect()).toHaveTextContent(name)
}

describe('PlayersTab default player', () => {
  it.each([
    ['personal matches', 'Devin Sinha', {}],
    ['personal matches with a differently cased, padded profile name', '  devin SINHA ', {}],
    ['group matches', 'Devin Sinha', { matches: [], dataSource: { label: 'Friday Night', matches: MATCHES } }],
  ])('defaults to the profile player in %s even when not first alphabetically', (_, playerName, props) => {
    render(ui(signedIn(playerName), props))
    expect(playerSelect()).toHaveTextContent('Devin Sinha')
  })

  it.each([
    ['signed out', null],
    ['there is no profile player name', signedIn()],
    ['the profile name is not in the matches', signedIn('Nobody')],
  ])('falls back to the first player alphabetically when %s', (_, authUser) => {
    render(ui(authUser))
    expect(playerSelect()).toHaveTextContent('Alice')
  })

  it('selects the profile player when matches arrive after the first render', () => {
    const { rerender } = render(ui(signedIn('Devin Sinha'), { matches: [] }))
    expect(screen.getByText('No player data')).toBeInTheDocument()
    rerender(ui(signedIn('Devin Sinha')))
    expect(playerSelect()).toHaveTextContent('Devin Sinha')
  })

  it('selects the profile player when the profile name loads after the first render', () => {
    const { rerender } = render(ui(signedIn()))
    expect(playerSelect()).toHaveTextContent('Alice')
    rerender(ui(signedIn('Devin Sinha')))
    expect(playerSelect()).toHaveTextContent('Devin Sinha')
  })

  it('keeps a hand-picked player while they remain in the list, including across a group switch', async () => {
    const user = userEvent.setup()
    const { rerender } = render(ui(signedIn('Devin Sinha')))
    await pickPlayer(user, 'Zed')

    rerender(ui(signedIn('Alice'), { matches: [...MATCHES, match('m3', 'Alice', 'Zed')] }))
    expect(playerSelect()).toHaveTextContent('Zed')

    // Group matches are empty until fetched
    rerender(ui(signedIn('Alice'), { dataSource: { label: 'Friday Night', matches: [] } }))
    rerender(ui(signedIn('Alice'), { dataSource: { label: 'Friday Night', matches: [match('g1', 'Alice', 'Zed')] } }))
    expect(playerSelect()).toHaveTextContent('Zed')
  })

  it('returns to the profile player once the hand-picked player leaves the list', async () => {
    const user = userEvent.setup()
    const { rerender } = render(ui(signedIn('Devin Sinha')))
    await pickPlayer(user, 'Alice')

    rerender(ui(signedIn('Devin Sinha'), { dataSource: { label: 'Friday Night', matches: [match('g1', 'Bob', 'Devin Sinha')] } }))
    expect(playerSelect()).toHaveTextContent('Devin Sinha')

    rerender(ui(signedIn('Devin Sinha')))
    expect(playerSelect()).toHaveTextContent('Devin Sinha')
  })
})
