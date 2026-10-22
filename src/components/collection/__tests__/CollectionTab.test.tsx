import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CollectionTab } from '../CollectionTab'

const accessory = 'Neoprene Battlefields: Sherwood Forest / Yukon 1900'

describe('map-only collection accessories', () => {
  it('shows the map instead of an empty hero list', () => {
    render(<CollectionTab ownedSets={[]} setOwnedSets={vi.fn()} />)
    const card = screen.getByText(accessory).closest('[data-slot="card"]')!
    expect(within(card as HTMLElement).getByText('Yukon 1900')).toBeInTheDocument()
    expect(within(card as HTMLElement).getByText('1 map · No heroes')).toBeInTheDocument()
  })

  it('adds and removes accessory ownership without changing existing set selections', async () => {
    const setOwnedSets = vi.fn()
    const owned = ['Robin Hood vs Bigfoot', 'Cobble & Fog']
    render(<CollectionTab ownedSets={owned} setOwnedSets={setOwnedSets} />)
    await userEvent.click(screen.getByText(accessory))
    const updated = setOwnedSets.mock.calls[0][0](owned)
    expect(updated).toEqual([...owned, accessory])
    expect(owned).toEqual(['Robin Hood vs Bigfoot', 'Cobble & Fog'])

    await userEvent.click(screen.getByText(accessory))
    expect(setOwnedSets.mock.calls[1][0](updated)).toEqual(owned)
  })
})
