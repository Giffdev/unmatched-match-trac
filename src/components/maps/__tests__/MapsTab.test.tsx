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
