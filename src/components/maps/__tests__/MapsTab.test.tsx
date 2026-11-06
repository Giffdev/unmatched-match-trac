import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MapsTab } from '../MapsTab'
import { getAllUserMatches } from '@/lib/firestore'
import type { Match } from '@/lib/types'

vi.mock('@/lib/firestore', () => ({ getAllUserMatches: vi.fn() }))
vi.mock('@/hooks/use-auth', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('@/lib/data', async importOriginal => {
  const original = await importOriginal<typeof import('@/lib/data')>()
  const maps = [
    { id: 'trio', name: 'Trio Arena', set: 'Team Set', minPlayers: 3, maxPlayers: 4 },
    { id: 'duel', name: 'Duel Arena', set: 'Duel Set', minPlayers: 2, maxPlayers: 2 },
    { id: 'coop', name: 'Co-op Arena', set: 'Adventure Set', minPlayers: 1, maxPlayers: 4 },
    { id: 'group', name: 'Group Arena', set: 'Team Set', minPlayers: 2, maxPlayers: 4 },
  ]
  return { ...original, MAPS: maps, getMapById: (id: string) => maps.find(map => map.id === id) }
})

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
  vi.stubGlobal('ResizeObserver', class {
    observe() {}
    unobserve() {}
    disconnect() {}
  })
})

beforeEach(() => {
  vi.mocked(getAllUserMatches).mockResolvedValue([])
})

function match(id: string, mapId = 'group'): Match {
  return {
    id, mapId, date: '2026-11-06', mode: '1v1', userId: 'user-1', isDraw: false,
    players: [
      { heroId: 'sinbad', playerName: 'Winner', turnOrder: 1 },
      { heroId: 'medusa', playerName: 'Opponent', turnOrder: 2 },
    ],
    winnerId: 'sinbad',
  }
}

async function chooseCount(user: ReturnType<typeof userEvent.setup>, label: string) {
  await user.click(screen.getByRole('combobox', { name: 'Supported player count' }))
  await user.click(screen.getByRole('option', { name: label }))
}

async function openMaps(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('combobox', { name: 'Select map' }))
  return screen.getByRole('listbox')
}

describe('MapsTab', () => {
  it.each([
    ['Your Most Played Maps', 'Group Arena', '1 match (yours)'],
    ['Most Popular Globally', 'Duel Arena', '2 matches (all users)'],
  ])('selects a map and its performance from %s', async (heading, mapName, summary) => {
    const user = userEvent.setup()
    vi.mocked(getAllUserMatches).mockResolvedValue([match('global-1', 'duel'), match('global-2', 'duel')])
    render(<MapsTab matches={[match('personal')]} />)
    const card = screen.getByText(heading).closest('[data-slot="card"]') as HTMLElement
    await user.click(await within(card).findByRole('button', { name: `Select ${mapName}` }))
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent(mapName)
    expect(screen.getByRole('heading', { name: mapName })).toBeInTheDocument()
    expect(screen.getByText('Hero Performance on This Map')).toBeInTheDocument()
    expect(screen.getByText(summary)).toBeInTheDocument()
    const list = await openMaps(user)
    expect(within(list).getByRole('option', { name: new RegExp(mapName) })).toBeInTheDocument()
  })

  it.each(['{Enter}', ' '])('selects a ranking row using %s', async key => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('personal')]} />)
    screen.getByRole('button', { name: 'Select Group Arena' }).focus()
    await user.keyboard(key)
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Group Arena')
    expect(screen.getByText('1 match (yours)')).toBeInTheDocument()
  })

  it('places the count label after the map dropdown before and after selection', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('personal')]} />)
    const expectOrder = () => {
      const dropdown = screen.getByRole('combobox', { name: 'Select map' })
      const label = screen.getByText('Supported player count')
      expect(dropdown.compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    expectOrder()
    await user.click(screen.getByRole('button', { name: 'Select Group Arena' }))
    expectOrder()
  })

  it('preserves compatible search/count when a ranking click only needs to disable exact mode', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('personal')]} />)
    await chooseCount(user, '2 players')
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    await openMaps(user)
    await user.type(screen.getByPlaceholderText('Search maps...'), 'team')
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Select Group Arena' }))
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Group Arena')
    expect(screen.getByRole('combobox', { name: 'Supported player count' })).toHaveTextContent('2 players')
    expect(screen.getByRole('checkbox', { name: 'Only this player count' })).not.toBeChecked()
    const list = await openMaps(user)
    expect(screen.getByPlaceholderText('Search maps...')).toHaveValue('team')
    expect(within(list).getAllByRole('option')).toHaveLength(1)
    expect(within(list).getByRole('option', { name: /Group Arena/ })).toBeInTheDocument()
  })

  it('resets incompatible search and count on a global ranking click', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllUserMatches).mockResolvedValue([match('global', 'duel')])
    render(<MapsTab matches={[]} />)
    await chooseCount(user, '4 players')
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    await openMaps(user)
    await user.type(screen.getByPlaceholderText('Search maps...'), 'team')
    await user.keyboard('{Escape}')
    await user.click(await screen.findByRole('button', { name: 'Select Duel Arena' }))
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Duel Arena')
    expect(screen.getByRole('combobox', { name: 'Supported player count' })).toHaveTextContent('All players')
    const checkbox = screen.getByRole('checkbox', { name: 'Only this player count' })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeDisabled()
    const list = await openMaps(user)
    expect(screen.getByPlaceholderText('Search maps...')).toHaveValue('')
    expect(within(list).getByRole('option', { name: /Duel Arena/ })).toBeInTheDocument()
  })

  it('resets only conflicting search while preserving compatible exact count', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('personal', 'duel')]} />)
    await chooseCount(user, '2 players')
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    await openMaps(user)
    await user.type(screen.getByPlaceholderText('Search maps...'), 'team')
    await user.keyboard('{Escape}')
    await user.click(screen.getByRole('button', { name: 'Select Duel Arena' }))
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Duel Arena')
    expect(screen.getByRole('combobox', { name: 'Supported player count' })).toHaveTextContent('2 players')
    expect(screen.getByRole('checkbox', { name: 'Only this player count' })).toBeChecked()
    const list = await openMaps(user)
    expect(screen.getByPlaceholderText('Search maps...')).toHaveValue('')
    expect(within(list).getAllByRole('option')).toHaveLength(1)
  })

  it('preserves selection for matching search and clears it for an incompatible search', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('personal')]} />)
    await user.click(screen.getByRole('button', { name: 'Select Group Arena' }))
    await openMaps(user)
    const search = screen.getByPlaceholderText('Search maps...')
    await user.type(search, 'team')
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Group Arena')
    expect(screen.getByText('Hero Performance on This Map')).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'duel')
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Select map...')
    expect(screen.queryByText('Hero Performance on This Map')).not.toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Duel Arena/ })).toBeInTheDocument()
  })

  it('keeps unknown map rankings visible without an invalid selection button', async () => {
    vi.mocked(getAllUserMatches).mockResolvedValue([match('global', 'unknown-global')])
    render(<MapsTab matches={[match('personal', 'unknown-personal')]} />)
    expect(screen.getByText('unknown-personal')).toBeInTheDocument()
    expect(await screen.findByText('unknown-global')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Select unknown/ })).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Select map...')
  })

  it.each([
    ['1 player', ['Co-op Arena']],
    ['2 players', ['Co-op Arena', 'Duel Arena', 'Group Arena']],
    ['3 players', ['Co-op Arena', 'Group Arena', 'Trio Arena']],
    ['4 players', ['Co-op Arena', 'Group Arena', 'Trio Arena']],
  ])('filters %s inclusively by each map range', async (count, names) => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    await chooseCount(user, count)
    const list = await openMaps(user)
    const options = within(list).getAllByRole('option')
    expect(options).toHaveLength(names.length)
    names.forEach((name, index) => expect(options[index]).toHaveTextContent(name))
  })

  it('defaults to inclusive ranges and toggles exact player count with the keyboard', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    const checkbox = screen.getByRole('checkbox', { name: 'Only this player count' })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeDisabled()
    await chooseCount(user, '2 players')
    await user.tab()
    expect(checkbox).toHaveFocus()
    await user.keyboard(' ')
    expect(checkbox).toBeChecked()
    const list = await openMaps(user)
    expect(within(list).getAllByRole('option')).toHaveLength(1)
    expect(within(list).getByRole('option', { name: /Duel Arena/ })).toBeInTheDocument()
    expect(within(list).queryByRole('option', { name: /Group Arena/ })).not.toBeInTheDocument()
  })

  it.each(['3 players', '4 players'])('shows an informative empty list for exact %s, not wider ranges', async count => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    await chooseCount(user, count)
    await user.click(screen.getByText('Only this player count'))
    const list = await openMaps(user)
    expect(within(list).queryAllByRole('option')).toHaveLength(0)
    expect(within(list).getByText(
      `No maps support only ${count}. Try another count or turn off the checkbox.`
    )).toBeInTheDocument()
  })

  it('clears exact mode on All players and keeps it off when choosing another count', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    await chooseCount(user, '2 players')
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    await chooseCount(user, 'All players')
    const checkbox = screen.getByRole('checkbox', { name: 'Only this player count' })
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeDisabled()
    let list = await openMaps(user)
    expect(within(list).getAllByRole('option')).toHaveLength(4)
    await user.keyboard('{Escape}')
    await chooseCount(user, '3 players')
    expect(checkbox).not.toBeChecked()
    expect(checkbox).toBeEnabled()
    list = await openMaps(user)
    expect(within(list).getAllByRole('option')).toHaveLength(3)
  })

  it('composes exact count with name and set search', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    await chooseCount(user, '2 players')
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    const list = await openMaps(user)
    const search = screen.getByPlaceholderText('Search maps...')
    await user.type(search, 'team')
    expect(within(list).queryAllByRole('option')).toHaveLength(0)
    expect(within(list).getByText('No map found.')).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'duel set')
    expect(within(list).getByRole('option', { name: /Duel Arena/ })).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'duel arena')
    expect(within(list).getAllByRole('option')).toHaveLength(1)
  })

  it('clears ranged selection on exact mode but preserves an exact selection and its performance', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('ranged'), match('exact', 'duel')]} />)
    await chooseCount(user, '2 players')
    await openMaps(user)
    await user.click(screen.getByRole('option', { name: /Group Arena/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    expect(screen.queryByText('Hero Performance on This Map')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Select map...')
    await openMaps(user)
    await user.click(screen.getByRole('option', { name: /Duel Arena/ }))
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    await user.click(screen.getByRole('checkbox', { name: 'Only this player count' }))
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Duel Arena')
    expect(screen.getByText('Hero Performance on This Map')).toBeInTheDocument()
    expect(screen.getByText('1 match (yours)')).toBeInTheDocument()
    await chooseCount(user, '3 players')
    expect(screen.queryByText('Hero Performance on This Map')).not.toBeInTheDocument()
  })

  it('composes player count with name/set search and restores all maps on reset', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[]} />)
    await chooseCount(user, '4 players')
    await openMaps(user)
    const search = screen.getByPlaceholderText('Search maps...')
    await user.type(search, 'duel')
    expect(screen.getByText('No map found.')).toBeInTheDocument()
    await user.clear(search)
    await user.type(search, 'team')
    expect(screen.getAllByRole('option')).toHaveLength(2)
    expect(screen.getByRole('option', { name: /Group Arena/ })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /Trio Arena/ })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await chooseCount(user, 'All players')
    await openMaps(user)
    expect(screen.getAllByRole('option')).toHaveLength(2)
    await user.clear(screen.getByPlaceholderText('Search maps...'))
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('clears incompatible selected map details rather than showing stale performance', async () => {
    const user = userEvent.setup()
    render(<MapsTab matches={[match('duel-match', 'duel')]} />)
    await openMaps(user)
    await user.click(screen.getByRole('option', { name: /Duel Arena/ }))
    expect(screen.getByText('Hero Performance on This Map')).toBeInTheDocument()
    await chooseCount(user, '4 players')
    expect(screen.queryByText('Hero Performance on This Map')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Select map' })).toHaveTextContent('Select map...')
    await chooseCount(user, 'All players')
    const list = await openMaps(user)
    expect(within(list).getByRole('option', { name: /Duel Arena/ })).toBeInTheDocument()
  })

  it('alphabetizes performance after loading community data and preserves compatible selection and stats', async () => {
    const user = userEvent.setup()
    vi.mocked(getAllUserMatches).mockResolvedValue([match('global-1'), match('global-2')])
    render(<MapsTab matches={[match('personal')]} />)
    await openMaps(user)
    await user.click(screen.getByRole('option', { name: /Group Arena/ }))
    await chooseCount(user, '4 players')
    const panel = screen.getByText('Hero Performance on This Map').closest('[data-slot="card"]') as HTMLElement
    const names = Array.from(panel.querySelectorAll('.font-medium.text-sm')).map(node => node.textContent)
    expect(names).toEqual(['Medusa', 'Sinbad'])
    expect(within(panel).getByText('0W–1L (1) 0%')).toBeInTheDocument()
    expect(within(panel).getByText('0W–2L (2) 0%')).toBeInTheDocument()
    expect(within(panel).getByText('1W–0L (1) 100%')).toBeInTheDocument()
    expect(within(panel).getByText('2W–0L (2) 100%')).toBeInTheDocument()
    expect(screen.getByText('1 match (yours)')).toBeInTheDocument()
    expect(screen.getByText('2 matches (all users)')).toBeInTheDocument()
    expect(screen.getByText('Recent Matches')).toBeInTheDocument()
  })
})
