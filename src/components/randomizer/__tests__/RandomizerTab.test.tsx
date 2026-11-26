import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RandomizerTab } from '../RandomizerTab'
import { getHeroById, getMapById } from '@/lib/data'
import { getAllUserMatches } from '@/lib/firestore'
import type { GameMode, Match, PlayerAssignment } from '@/lib/types'
import { toast } from 'sonner'

vi.mock('@/lib/firestore', () => ({ getAllUserMatches: vi.fn() }))
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock('@/components/players/MapImageDialog', () => ({ MapImageDialog: () => null }))
vi.mock('@/components/matches/LogMatchDialog', () => ({
  LogMatchDialog: ({ prefilled }: { prefilled: { mode: GameMode; mapId: string; players: PlayerAssignment[] } }) =>
    <output data-testid="match">{JSON.stringify(prefilled)}</output>,
}))

const legends = 'Battle of Legends, Volume One'
const fog = 'Cobble & Fog'
const accessory = 'Neoprene Battlefields: Sherwood Forest / Yukon 1900'
type GeneratedMatch = { mode: GameMode; mapId: string; players: PlayerAssignment[] }
const generated = (): GeneratedMatch => JSON.parse(screen.getByTestId('match').textContent!)
const generate = () => screen.getByRole('button', { name: 'Generate Random Matchup' })

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.setPointerCapture = vi.fn()
  Element.prototype.releasePointerCapture = vi.fn()
})

beforeEach(() => {
  vi.mocked(getAllUserMatches).mockResolvedValue([])
  vi.clearAllMocks()
})

afterEach(() => vi.restoreAllMocks())

async function pick(user: ReturnType<typeof userEvent.setup>, label: string, option: string) {
  await user.click(screen.getByRole('combobox', { name: label }))
  await user.click(screen.getByRole('option', { name: option }))
}

function setup(ownedSets = [legends, fog]) {
  const user = userEvent.setup()
  render(<RandomizerTab ownedSets={ownedSets} setMatches={vi.fn()} />)
  return user
}

describe('Randomizer locks and set pool', () => {
  it('uses the entire collection by default and allows the full catalog with an empty collection', async () => {
    const user = setup([])
    expect(screen.getByText('No heroes available')).toBeInTheDocument()
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith('Select at least one set in the randomization pool')
    await user.click(screen.getByRole('switch', { name: 'Use only heroes and maps from my collection' }))
    await user.click(generate())
    expect(generated().players).toHaveLength(2)
    expect(getMapById(generated().mapId)).toBeDefined()
  })

  it('defaults all owned sets to selected and applies a narrower pool to generation and rerolls', async () => {
    const user = setup()
    expect(screen.getByRole('checkbox', { name: legends })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: fog })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: fog }))
    for (let i = 0; i < 3; i++) {
      await user.click(generate())
      expect(generated().players.every(p => getHeroById(p.heroId)?.set === legends)).toBe(true)
      expect(getMapById(generated().mapId)?.set).toBe(legends)
    }
    const previous = generated()
    await user.click(screen.getByRole('button', { name: `Reroll ${getHeroById(previous.players[0].heroId)?.name}` }))
    const rerolled = generated()
    expect(rerolled.players[0].heroId).not.toBe(previous.players[0].heroId)
    expect(getHeroById(rerolled.players[0].heroId)?.set).toBe(legends)
    expect(rerolled.players[1]).toEqual(previous.players[1])
    await user.click(screen.getByRole('button', { name: 'Reroll' }))
    expect(getMapById(generated().mapId)?.set).toBe(legends)
    await user.click(screen.getByRole('button', { name: 'Select All Sets' }))
    expect(screen.getByRole('checkbox', { name: fog })).toBeChecked()
  })

  it('preserves a chosen second-slot hero outside the pool and locks a generated first-slot hero', async () => {
    const user = setup()
    await pick(user, 'Player 2', 'Dracula')
    await user.click(screen.getByRole('checkbox', { name: fog }))
    await user.click(generate())
    expect(generated().players[1]).toEqual({ playerName: '', heroId: 'dracula', turnOrder: 2 })
    expect(getHeroById(generated().players[0].heroId)?.set).toBe(legends)
    expect(getMapById(generated().mapId)?.set).toBe(legends)
    expect(screen.getByRole('button', { name: 'Reroll Dracula' })).toBeDisabled()
    const firstHero = generated().players[0]
    await user.click(screen.getByRole('button', { name: `Lock ${getHeroById(firstHero.heroId)?.name}` }))
    await user.click(screen.getByRole('button', { name: 'Generate New' }))
    expect(generated().players[0]).toEqual(firstHero)
    expect(generated().players[1].heroId).toBe('dracula')
    await user.click(screen.getByRole('button', { name: 'Unlock Dracula' }))
    await user.click(screen.getByRole('button', { name: 'Reroll Dracula' }))
    expect(generated().players[0]).toEqual(firstHero)
    expect(getHeroById(generated().players[1].heroId)?.set).toBe(legends)
  })

  it.each([
    ['2v2 Competitive', 4],
    ['3 Player Free For All', 3],
    ['4 Player Free For All', 4],
  ])('preserves multiple slots and distinct heroes in %s', async (mode, count) => {
    const user = setup()
    await pick(user, 'Game Mode', mode)
    await pick(user, 'Player 1', 'Alice')
    await pick(user, `Player ${count}`, 'Dracula')
    await user.click(screen.getByRole('combobox', { name: 'Player 2' }))
    expect(screen.queryByRole('option', { name: 'Alice' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Dracula' })).not.toBeInTheDocument()
    await user.keyboard('{Escape}')
    for (let i = 0; i < 3; i++) {
      await user.click(generate())
      const match = generated()
      expect(match.players).toHaveLength(count)
      expect(match.players[0].heroId).toBe('alice')
      expect(match.players[count - 1].heroId).toBe('dracula')
      expect(new Set(match.players.map(p => p.heroId)).size).toBe(count)
      expect(match.players.map(p => p.turnOrder)).toEqual(Array.from({ length: count }, (_, n) => n + 1))
      expect(getMapById(match.mapId)!.maxPlayers).toBeGreaterThanOrEqual(count)
    }
    await pick(user, 'Game Mode', '1v1 Competitive')
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Player 1' })).toHaveTextContent('Random (unlocked)')
    expect(screen.getByRole('combobox', { name: 'Player 2' })).toHaveTextContent('Random (unlocked)')
  })

  it('reports an empty pool and lets the user recover without using excluded sets', async () => {
    const user = setup()
    await user.click(screen.getByRole('button', { name: 'Clear Sets' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Select at least one set')
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith('Select at least one set in the randomization pool')
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
    await user.click(screen.getByRole('checkbox', { name: fog }))
    await user.click(generate())
    expect(generated().players.every(p => getHeroById(p.heroId)?.set === fog)).toBe(true)
    expect(getMapById(generated().mapId)?.set).toBe(fog)
  })

  it('rejects insufficient distinct heroes, including aliases of the same character', async () => {
    const user = setup(['Bruce Lee', 'Muhammad Ali vs. Bruce Lee', legends])
    await pick(user, 'Game Mode', '3 Player Free For All')
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Not enough heroes'))
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
  })

  it('rejects a pool without a map for the player count rather than using an excluded map', async () => {
    const user = setup(['Robin Hood vs Bigfoot', legends])
    await pick(user, 'Game Mode', '3 Player Free For All')
    await pick(user, 'Player 1', 'Alice')
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith('No maps available for 3 players in the selected pool')
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
  })

  it('supports map-only accessories with locked heroes and reports unavailable hero rerolls', async () => {
    const user = setup([legends, accessory])
    await pick(user, 'Player 1', 'Alice')
    await pick(user, 'Player 2', 'Medusa')
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(generated().players.map(p => p.heroId)).toEqual(['alice', 'medusa'])
    expect(generated().mapId).toBe('yukon-1900')
    await user.click(screen.getByRole('button', { name: 'Unlock Medusa' }))
    await user.click(screen.getByRole('button', { name: 'Reroll Medusa' }))
    expect(toast.error).toHaveBeenCalledWith('No more heroes available')
    expect(generated().players.map(p => p.heroId)).toEqual(['alice', 'medusa'])
  })

  it.each([1, 2])('balances against a locked hero in slot %i using only the selected hero/map pool', async (slot) => {
    const history: Match = {
      id: 'm1', mode: '1v1', date: '2026-11-25', userId: 'user-1', isDraw: false,
      mapId: 'soho', winnerId: 'alice',
      players: [
        { heroId: 'alice', playerName: 'A', turnOrder: 1 },
        { heroId: 'dracula', playerName: 'B', turnOrder: 2 },
      ],
    }
    vi.mocked(getAllUserMatches).mockResolvedValue([history])
    const user = setup()
    await waitFor(() => expect(getAllUserMatches).toHaveBeenCalled())
    await user.click(screen.getByRole('radio', { name: /Balanced -/ }))
    await pick(user, `Player ${slot}`, 'Dracula')
    await user.click(screen.getByRole('checkbox', { name: fog }))
    await user.click(generate())
    expect(generated().players[slot - 1].heroId).toBe('dracula')
    expect(getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)?.set).toBe(legends)
    expect(getMapById(generated().mapId)?.set).toBe(legends)
    expect(screen.getByText(/confidence$/)).toBeInTheDocument()
    const opponentName = getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)!.name
    await user.click(screen.getByRole('button', { name: `Reroll ${opponentName}` }))
    expect(generated().players[slot - 1].heroId).toBe('dracula')
    expect(getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)?.set).toBe(legends)
  })
})
