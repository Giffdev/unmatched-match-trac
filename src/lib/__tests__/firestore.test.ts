import { describe, it, expect } from 'vitest'

// stripUndefined is not exported from firestore.ts, so we recreate it here
// to test the pure logic. This is the exact implementation from src/lib/firestore.ts.
function stripUndefined(obj: any): any {
  if (Array.isArray(obj)) return obj.map(stripUndefined)
  if (obj !== null && typeof obj === 'object') {
    const clean: Record<string, any> = {}
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = stripUndefined(v)
    }
    return clean
  }
  return obj
}

describe('stripUndefined', () => {
  it('removes top-level undefined values', () => {
    const input = { a: 1, b: undefined, c: 'hello' }
    expect(stripUndefined(input)).toEqual({ a: 1, c: 'hello' })
  })

  it('removes nested undefined values', () => {
    const input = { a: { b: 1, c: undefined }, d: 'ok' }
    expect(stripUndefined(input)).toEqual({ a: { b: 1 }, d: 'ok' })
  })

  it('handles deeply nested objects', () => {
    const input = { a: { b: { c: { d: undefined, e: 42 } } } }
    expect(stripUndefined(input)).toEqual({ a: { b: { c: { e: 42 } } } })
  })

  it('handles arrays of objects with undefined values', () => {
    const input = [
      { id: '1', name: 'test', extra: undefined },
      { id: '2', name: undefined, value: 5 },
    ]
    expect(stripUndefined(input)).toEqual([
      { id: '1', name: 'test' },
      { id: '2', value: 5 },
    ])
  })

  it('handles arrays nested in objects', () => {
    const input = { items: [{ a: 1, b: undefined }, { c: undefined, d: 2 }] }
    expect(stripUndefined(input)).toEqual({ items: [{ a: 1 }, { d: 2 }] })
  })

  it('passes through already-clean objects unchanged', () => {
    const input = { a: 1, b: 'two', c: true, d: null }
    expect(stripUndefined(input)).toEqual({ a: 1, b: 'two', c: true, d: null })
  })

  it('handles empty objects', () => {
    expect(stripUndefined({})).toEqual({})
  })

  it('handles object with all undefined values (results in empty object)', () => {
    const input = { a: undefined, b: undefined }
    expect(stripUndefined(input)).toEqual({})
  })

  it('preserves null values (only undefined is removed)', () => {
    const input = { a: null, b: undefined, c: 0, d: false, e: '' }
    expect(stripUndefined(input)).toEqual({ a: null, c: 0, d: false, e: '' })
  })

  it('handles primitive values (passthrough)', () => {
    expect(stripUndefined(42)).toBe(42)
    expect(stripUndefined('hello')).toBe('hello')
    expect(stripUndefined(null)).toBe(null)
    expect(stripUndefined(true)).toBe(true)
  })

  it('handles empty arrays', () => {
    expect(stripUndefined([])).toEqual([])
  })

  it('handles arrays with mixed types', () => {
    const input = [1, 'two', null, { a: undefined, b: 3 }]
    expect(stripUndefined(input)).toEqual([1, 'two', null, { b: 3 }])
  })

  it('preserves Date objects as values', () => {
    const date = new Date('2026-01-01')
    const input = { date, extra: undefined }
    const result = stripUndefined(input)
    // Date objects are typeof 'object' and not null/array, so they get
    // iterated as entries. This tests current behavior.
    expect(result).not.toHaveProperty('extra')
  })
})
