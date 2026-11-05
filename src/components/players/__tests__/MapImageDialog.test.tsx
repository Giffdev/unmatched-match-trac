import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { getMapById } from '@/lib/data'
import Yukon from '@/assets/images/Yukon.webp'
import Yukon1900 from '@/assets/images/Yukon_1900.webp'
import BPRDHQ from '@/assets/images/BPRD_HQ.webp'
import Pandemonium from '@/assets/images/Pandemonium.webp'
import { MapImageDialog } from '../MapImageDialog'

describe('Yukon map image dialog', () => {
  it('displays the bundled Yukon 1900 variant rather than an empty image state', () => {
    render(<MapImageDialog map={getMapById('yukon-1900')!} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Yukon 1900')
    expect(screen.getByRole('img', { name: 'Yukon 1900' })).toHaveAttribute('src', Yukon1900)
    expect(screen.queryByText('No image available')).not.toBeInTheDocument()
  })

  it('still displays the original image for historical Yukon matches', () => {
    render(<MapImageDialog map={getMapById('yukon')!} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole('img', { name: 'Yukon' })).toHaveAttribute('src', Yukon)
  })
})

describe('Hellboy map image dialog', () => {
  it.each([
    ['bprd-hq', 'B.P.R.D. HQ', BPRDHQ],
    ['pandemonium', 'Pandemonium', Pandemonium],
  ])('displays the complete bundled %s board without a fixed-height crop', (id, name, imageUrl) => {
    render(<MapImageDialog map={getMapById(id)!} open onOpenChange={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveAccessibleName(name)
    const image = screen.getByRole('img', { name })
    expect(image).toHaveAttribute('src', imageUrl)
    expect(image).toHaveClass('w-full', 'h-auto')
    expect(screen.queryByText('No image available')).not.toBeInTheDocument()
  })
})
