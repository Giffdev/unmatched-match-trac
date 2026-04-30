/**
 * HeroImage component tests
 *
 * Catches bugs like:
 * - Image import deleted but still referenced (renders fallback gracefully)
 * - Component crashes when hero data is incomplete
 */
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HeroImage } from '../HeroImage'
import type { Hero } from '@/lib/types'

function createHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: 'sinbad',
    name: 'Sinbad',
    set: 'Battle of Legends Vol. 1',
    hp: 15,
    move: 3,
    attack: 'MELEE',
    imageUrl: 'https://example.com/sinbad.png',
    ...overrides,
  }
}

describe('HeroImage', () => {
  it('renders without crashing with valid hero data', () => {
    const hero = createHero()
    const { container } = render(<HeroImage hero={hero} />)
    expect(container.querySelector('img')).toBeTruthy()
  })

  it('shows fallback placeholder when imageUrl is empty', () => {
    const hero = createHero({ imageUrl: '' })
    render(<HeroImage hero={hero} />)
    // Should show hero name in fallback
    expect(screen.getByText('Sinbad')).toBeTruthy()
  })

  it('shows fallback placeholder when imageUrl is undefined', () => {
    const hero = createHero({ imageUrl: undefined })
    render(<HeroImage hero={hero} />)
    expect(screen.getByText('Sinbad')).toBeTruthy()
  })

  it('shows fallback when image fails to load (broken import)', () => {
    const hero = createHero({ imageUrl: 'https://example.com/deleted.png' })
    const { container } = render(<HeroImage hero={hero} />)

    const img = container.querySelector('img')!
    fireEvent.error(img)

    // After error, should show fallback with hero name
    expect(screen.getByText('Sinbad')).toBeTruthy()
  })

  it('displays sidekick info in fallback', () => {
    const hero = createHero({
      imageUrl: '',
      sidekicks: [{ name: 'The Porter', count: 1, attack: 'MELEE' }],
    })
    render(<HeroImage hero={hero} />)
    expect(screen.getByText('The Porter')).toBeTruthy()
  })

  it('displays set name in fallback', () => {
    const hero = createHero({ imageUrl: '' })
    render(<HeroImage hero={hero} />)
    expect(screen.getByText('Battle of Legends Vol. 1')).toBeTruthy()
  })

  it('handles hero with no sidekicks gracefully', () => {
    const hero = createHero({ imageUrl: '', sidekicks: undefined })
    const { container } = render(<HeroImage hero={hero} />)
    // Should not crash
    expect(container).toBeTruthy()
  })

  it('applies custom className', () => {
    const hero = createHero()
    const { container } = render(<HeroImage hero={hero} className="w-48 h-48" />)
    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.className).toContain('w-48')
    expect(wrapper.className).toContain('h-48')
  })
})
