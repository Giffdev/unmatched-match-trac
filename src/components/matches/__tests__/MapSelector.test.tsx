import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { getMapsByPlayerCount } from '@/lib/data'
import { MapSelector } from '../shared/MapSelector'

describe('Yukon variants in match selection', () => {
  it('resolves an existing saved Yukon ID without changing the displayed name', () => {
    render(<MapSelector value="yukon" onChange={vi.fn()} availableMaps={getMapsByPlayerCount(2)} />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Yukon')
    expect(screen.getByRole('combobox')).not.toHaveTextContent('1900')
  })

  it('lets the user select the new variant with its own stable ID', async () => {
    const onChange = vi.fn()
    render(<MapSelector value="yukon" onChange={onChange} availableMaps={getMapsByPlayerCount(2)} />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByPlaceholderText('Search maps...'), 'Yukon')
    expect(screen.getAllByRole('option')).toHaveLength(2)
    await userEvent.click(screen.getByRole('option', { name: /Yukon 1900/ }))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('yukon-1900')
  })
})
