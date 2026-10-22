import { describe, expect, it } from 'vitest'
import {
  HEROES, MAPS, UNMATCHED_SETS, getCooperativeMaps, getHeroById,
  getHeroesBySet, getMapById, getMapsByPlayerCount, getMapsBySet,
  getSetsByFranchise,
} from '../data'
import { calculateMapPopularity } from '../stats'
import type { Match } from '../types'

const accessory = 'Neoprene Battlefields: Sherwood Forest / Yukon 1900'

describe('Yukon 1900 catalog addition', () => {
  it('keeps the original Yukon ID, name, set, stats, and image', () => {
    expect(getMapById('yukon')).toEqual({
      id: 'yukon', name: 'Yukon', set: 'Robin Hood vs Bigfoot',
      minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31,
      imageUrl: expect.any(String),
    })
    expect(getMapsBySet('Robin Hood vs Bigfoot').map(map => map.id))
      .toEqual(['sherwood-forest', 'yukon'])
  })

  it('adds only the evidenced variant fields without borrowing artwork', () => {
    expect(getMapById('yukon-1900')).toEqual({
      id: 'yukon-1900', name: 'Yukon 1900', set: accessory,
      minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31,
    })
    expect(getMapById('yukon-1910')).toBeUndefined()
  })

  it('registers the map-only accessory once and keeps it in the Unmatched franchise', () => {
    expect(UNMATCHED_SETS.filter(set => set.name === accessory))
      .toEqual([{ name: accessory, franchise: 'Unmatched' }])
    expect(getSetsByFranchise('Unmatched').map(set => set.name)).toContain(accessory)
    expect(getMapsBySet(accessory).map(map => map.id)).toEqual(['yukon-1900'])
    expect(getHeroesBySet(accessory)).toEqual([])
  })

  it('keeps both variants eligible for two-player selection but not larger or cooperative games', () => {
    expect(getMapsByPlayerCount(2).map(map => map.id))
      .toEqual(expect.arrayContaining(['yukon', 'yukon-1900']))
    for (const count of [1, 3, 4]) {
      expect(getMapsByPlayerCount(count).map(map => map.id)).not.toContain('yukon-1900')
    }
    expect(getCooperativeMaps().map(map => map.id)).not.toContain('yukon-1900')
  })

  it('uses independent ownership links in the randomizer map pool', () => {
    const ownedSets = ['Robin Hood vs Bigfoot']
    const pool = () => getMapsByPlayerCount(2).filter(map => ownedSets.includes(map.set))
    expect(pool().map(map => map.id)).toEqual(['sherwood-forest', 'yukon'])
    ownedSets.push(accessory)
    expect(pool().map(map => map.id)).toContain('yukon-1900')
    expect(getMapsByPlayerCount(2).filter(map => map.set === accessory).map(map => map.id))
      .toEqual(['yukon-1900'])
  })

  it('keeps historical matches and popularity totals separate by stable map ID', () => {
    const original: Match = {
      id: 'old-match', date: '2026-01-01', mode: '1v1', mapId: 'yukon',
      players: [], isDraw: false, userId: 'player',
    }
    const matches = [original, { ...original, id: 'new-match', mapId: 'yukon-1900' }]
    expect(calculateMapPopularity(matches)).toEqual([
      { mapId: 'yukon', count: 1 }, { mapId: 'yukon-1900', count: 1 },
    ])
    expect(original.mapId).toBe('yukon')
    expect(getMapById(original.mapId)?.name).toBe('Yukon')
  })

  it('keeps catalog IDs and set names unique', () => {
    expect(new Set(MAPS.map(map => map.id)).size).toBe(MAPS.length)
    expect(new Set(HEROES.map(hero => hero.id)).size).toBe(HEROES.length)
    expect(new Set(UNMATCHED_SETS.map(set => set.name)).size).toBe(UNMATCHED_SETS.length)
  })
})

describe('Hellboy evidence gate', () => {
  it('does not expose unverified heroes or an empty owned set', () => {
    for (const id of ['hellboy', 'abe-sapien', 'liz-sherman', 'baba-yaga']) {
      expect(getHeroById(id)).toBeUndefined()
    }
    expect(UNMATCHED_SETS.some(set => /hellboy/i.test(set.name))).toBe(false)
  })
})
