import { beforeAll, beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
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

async function expandPool(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByText(/^Randomization pool \(/))
}

async function lockSlot(user: ReturnType<typeof userEvent.setup>, slot: number) {
  const player = generated().players[slot - 1]
  await user.click(screen.getByRole('button', { name: `Lock ${getHeroById(player.heroId)!.name}` }))
  return player
}

describe('Randomizer locks and set pool', () => {
  it('uses accessible icon-only lock buttons with focus/tap explanations and toggle state', async () => {
    const user = setup()
    await user.click(generate())
    const name = getHeroById(generated().players[0].heroId)!.name
    const lock = screen.getByRole('button', { name: `Lock ${name}` })
    expect(lock).toHaveTextContent('')
    expect(lock.querySelector('svg')).toBeInTheDocument()
    expect(lock).toHaveAttribute('aria-pressed', 'false')
    expect(lock).toHaveAccessibleDescription('Unlocked: this hero can be randomized. Tap to lock it for new matchups.')
    await user.click(lock)
    expect(lock).toHaveFocus()
    expect(lock).toHaveAccessibleName(`Unlock ${name}`)
    expect(lock).toHaveAttribute('aria-pressed', 'true')
    expect(lock).toHaveAccessibleDescription('Locked: this hero stays when generating a new matchup. Tap to unlock.')
    expect(screen.getByRole('button', { name: `Reroll ${name}` })).toBeDisabled()
    await user.keyboard(' ')
    expect(lock).toHaveAccessibleName(`Lock ${name}`)
    expect(lock).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: `Reroll ${name}` })).toBeEnabled()
  })

  it('collapses the pool by default, retains selections when collapsed, and only shows locks on results', async () => {
    const user = setup()
    const summary = screen.getByText(/^Randomization pool \(/)
    const details = summary.closest('details')!
    expect(details).not.toHaveAttribute('open')
    expect(screen.queryByText('Lock characters')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Player 1' })).not.toBeInTheDocument()
    fireEvent.click(summary)
    expect(details).toHaveAttribute('open')
    await user.click(screen.getByRole('checkbox', { name: fog }))
    fireEvent.click(summary)
    expect(details).not.toHaveAttribute('open')
    expect(summary).toHaveTextContent('1 of 2 sets selected')
    await user.click(generate())
    expect(generated().players.every(p => getHeroById(p.heroId)?.set === legends)).toBe(true)
    expect(screen.getAllByRole('button', { name: /^Lock / })).toHaveLength(3)
  })

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

  it('locks the generated map across new matchups and pool changes, then unlocks for rerolls', async () => {
    const user = setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    await user.click(generate())
    const original = generated()
    const mapName = getMapById(original.mapId)!.name
    const lock = screen.getByRole('button', { name: `Lock ${mapName}` })
    expect(lock).toHaveAccessibleDescription('Unlocked: this map can be randomized. Tap to lock it for new matchups.')
    await user.click(lock)
    expect(lock).toHaveAccessibleName(`Unlock ${mapName}`)
    expect(screen.getByRole('button', { name: 'Reroll' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Generate New' }))
    expect(generated().mapId).toBe(original.mapId)
    await expandPool(user)
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(generated().mapId).toBe(original.mapId)
    expect(generated().players.every(p => getHeroById(p.heroId)?.set === fog)).toBe(true)
    await user.click(screen.getByRole('button', { name: `Unlock ${mapName}` }))
    const players = generated().players
    await user.click(screen.getByRole('button', { name: 'Reroll' }))
    expect(getMapById(generated().mapId)?.set).toBe(fog)
    expect(generated().players).toEqual(players)
  })

  it('clears the map lock on mode changes and generates a suitable map for the new player count', async () => {
    const user = setup(['Robin Hood vs Bigfoot', legends])
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    await user.click(generate())
    const name = getMapById(generated().mapId)!.name
    await user.click(screen.getByRole('button', { name: `Lock ${name}` }))
    await pick(user, 'Game Mode', '4 Player Free For All')
    await user.click(generate())
    expect(getMapById(generated().mapId)!.maxPlayers).toBeGreaterThanOrEqual(4)
    expect(screen.queryByRole('button', { name: /^Unlock / })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reroll' })).toBeEnabled()
  })

  it('defaults all owned sets to selected and applies a narrower pool to generation and rerolls', async () => {
    const user = setup()
    await expandPool(user)
    expect(screen.getByRole('checkbox', { name: legends })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: fog })).toBeChecked()
    await user.click(screen.getByRole('checkbox', { name: fog }))
    for (let i = 0; i < 3; i++) {
      await user.click(generate())
      expect(generated().players.every(p => getHeroById(p.heroId)?.set === legends)).toBe(true)
      expect(getMapById(generated().mapId)?.set).toBe(legends)
    }
    await user.click(screen.getByRole('button', { name: 'Generate New' }))
    expect(toast.success).not.toHaveBeenCalled()
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

  it('preserves generated locked heroes outside the pool and permits unlocking and rerolling', async () => {
    const user = setup()
    vi.spyOn(Math, 'random').mockReturnValue(0)
    await user.click(generate())
    const secondHero = await lockSlot(user, 2)
    const secondName = getHeroById(secondHero.heroId)!.name
    expect(screen.getByRole('button', { name: `Reroll ${secondName}` })).toBeDisabled()
    const firstHero = generated().players[0]
    await lockSlot(user, 1)
    await expandPool(user)
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(generated().players[0]).toEqual(firstHero)
    expect(generated().players[1]).toEqual(secondHero)
    expect(getMapById(generated().mapId)?.set).toBe(fog)
    await user.click(screen.getByRole('button', { name: `Unlock ${secondName}` }))
    await user.click(screen.getByRole('button', { name: `Reroll ${secondName}` }))
    expect(generated().players[0]).toEqual(firstHero)
    expect(getHeroById(generated().players[1].heroId)?.set).toBe(fog)
  })

  it.each([
    ['2v2 Competitive', 4],
    ['3 Player Free For All', 3],
    ['4 Player Free For All', 4],
  ])('preserves multiple slots and distinct heroes in %s', async (mode, count) => {
    const user = setup()
    await pick(user, 'Game Mode', mode)
    await user.click(generate())
    const first = await lockSlot(user, 1)
    const last = await lockSlot(user, count)
    for (let i = 0; i < 3; i++) {
      await user.click(generate())
      const match = generated()
      expect(match.players).toHaveLength(count)
      expect(match.players[0]).toEqual(first)
      expect(match.players[count - 1]).toEqual(last)
      expect(new Set(match.players.map(p => p.heroId)).size).toBe(count)
      expect(match.players.map(p => p.turnOrder)).toEqual(Array.from({ length: count }, (_, n) => n + 1))
      expect(getMapById(match.mapId)!.maxPlayers).toBeGreaterThanOrEqual(count)
    }
    await pick(user, 'Game Mode', '1v1 Competitive')
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
    await user.click(generate())
    expect(screen.queryByRole('button', { name: /^Unlock / })).not.toBeInTheDocument()
  })

  it('reports an empty pool and lets the user recover without using excluded sets', async () => {
    const user = setup()
    await expandPool(user)
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

  it('keeps generated locks accessible when a pool edit prevents regeneration', async () => {
    const user = setup()
    await user.click(generate())
    const locked = await lockSlot(user, 1)
    const name = getHeroById(locked.heroId)!.name
    await expandPool(user)
    await user.click(screen.getByRole('button', { name: 'Clear Sets' }))
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith('Select at least one set in the randomization pool')
    expect(screen.getByRole('button', { name: `Unlock ${name}` })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: `Unlock ${name}` }))
    expect(screen.getByRole('button', { name: `Lock ${name}` })).toHaveAttribute('aria-pressed', 'false')
  })

  it('rejects insufficient distinct heroes, including aliases of the same character', async () => {
    const user = setup(['Bruce Lee', 'Muhammad Ali vs. Bruce Lee', legends])
    await expandPool(user)
    await pick(user, 'Game Mode', '3 Player Free For All')
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Not enough heroes'))
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
  })

  it('rejects a pool without a map for the player count rather than using an excluded map', async () => {
    const user = setup(["Houdini vs. The Genie", 'Robin Hood vs Bigfoot', legends])
    await pick(user, 'Game Mode', '3 Player Free For All')
    await expandPool(user)
    await user.click(screen.getByRole('checkbox', { name: legends }))
    await user.click(generate())
    expect(toast.error).toHaveBeenCalledWith('No maps available for 3 players in the selected pool')
    expect(screen.queryByTestId('match')).not.toBeInTheDocument()
  })

  it('supports map-only accessories with locked heroes and reports unavailable hero rerolls', async () => {
    const user = setup([legends, accessory])
    vi.spyOn(Math, 'random').mockReturnValue(0)
    await user.click(generate())
    await lockSlot(user, 1)
    await lockSlot(user, 2)
    await expandPool(user)
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
    await user.click(generate())
    const locked = await lockSlot(user, slot)
    await expandPool(user)
    const excluded = getHeroById(locked.heroId)!.set
    const remaining = excluded === legends ? fog : legends
    await user.click(screen.getByRole('checkbox', { name: excluded }))
    await user.click(generate())
    expect(generated().players[slot - 1]).toEqual(locked)
    expect(getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)?.set).toBe(remaining)
    expect(getMapById(generated().mapId)?.set).toBe(remaining)
    expect(screen.getByText(/confidence$/)).toBeInTheDocument()
    expect(toast.success).not.toHaveBeenCalled()
    const opponentName = getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)!.name
    await user.click(screen.getByRole('button', { name: `Reroll ${opponentName}` }))
    expect(generated().players[slot - 1]).toEqual(locked)
    expect(getHeroById(generated().players[slot === 1 ? 1 : 0].heroId)?.set).toBe(remaining)
  })
})
