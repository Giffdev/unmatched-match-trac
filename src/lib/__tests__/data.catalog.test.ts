import { describe, expect, it } from 'vitest'
import {
  HEROES, MAPS, UNMATCHED_SETS, getCooperativeMaps, getHeroById,
  getHeroesBySet, getMapById, getMapsByPlayerCount, getMapsBySet,
  getSelectableHeroes, getSetsByFranchise,
} from '../data'
import { calculateMapPopularity } from '../stats'
import type { Match } from '../types'
import Yukon from '@/assets/images/Yukon.webp'
import Yukon1900 from '@/assets/images/Yukon_1900.webp'
import Hellboy from '@/assets/images/Hellboy.webp'
import AbeSapien from '@/assets/images/Abe_Sapien.webp'
import LizSherman from '@/assets/images/Liz_Sherman.webp'
import BabaYaga from '@/assets/images/Baba_Yaga.webp'
import BPRDHQ from '@/assets/images/BPRD_HQ.webp'
import Pandemonium from '@/assets/images/Pandemonium.webp'

const accessory = 'Neoprene Battlefields: Sherwood Forest / Yukon 1900'

describe('Yukon 1900 catalog addition', () => {
  it('keeps the original Yukon ID, name, set, stats, and image', () => {
    expect(getMapById('yukon')).toEqual({
      id: 'yukon', name: 'Yukon', set: 'Robin Hood vs Bigfoot',
      minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31,
      imageUrl: Yukon,
    })
    expect(getMapsBySet('Robin Hood vs Bigfoot').map(map => map.id))
      .toEqual(['sherwood-forest', 'yukon'])
  })

  it('uses the correct bundled variant artwork without changing the original Yukon image', () => {
    expect(getMapById('yukon-1900')).toEqual({
      id: 'yukon-1900', name: 'Yukon 1900', set: accessory,
      minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31,
      imageUrl: Yukon1900,
    })
    expect(Yukon1900).not.toBe(Yukon)
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

describe('Hellboy catalog addition', () => {
  const heroIds = ['hellboy', 'abe-sapien', 'liz-sherman', 'baba-yaga']
  const mapIds = ['bprd-hq', 'pandemonium']

  it.each([
    { id: 'hellboy', name: 'Hellboy', hp: 18, move: 2, attack: 'MELEE', sidekicks: [{ name: 'Lobster Johnson', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: Hellboy },
    { id: 'abe-sapien', name: 'Abe Sapien', hp: 13, move: 2, attack: 'RANGED', sidekicks: [{ name: 'B.P.R.D. Agents', count: 3, hp: 1, attack: 'RANGED' }], imageUrl: AbeSapien },
    { id: 'liz-sherman', name: 'Liz Sherman', hp: 16, move: 3, attack: 'RANGED', sidekicks: [], imageUrl: LizSherman },
    { id: 'baba-yaga', name: 'Baba Yaga', hp: 13, move: 2, attack: 'RANGED', sidekicks: [{ name: 'Koschei', count: 1, hp: 3, attack: 'MELEE' }], imageUrl: BabaYaga },
  ])('resolves verified metadata and the matching bundled artwork for $name', (hero) => {
    expect(getHeroById(hero.id)).toEqual({ ...hero, set: 'Hellboy' })
  })

  it('links the complete roster and maps to one discoverable franchise set', () => {
    expect(getSetsByFranchise('Hellboy')).toEqual([{ name: 'Hellboy', franchise: 'Hellboy' }])
    expect(getHeroesBySet('Hellboy').map(hero => hero.id)).toEqual(heroIds)
    expect(getMapsBySet('Hellboy').map(map => map.id)).toEqual(mapIds)
    expect(UNMATCHED_SETS.filter(set => set.name === 'Hellboy')).toHaveLength(1)
  })

  it('includes the fighters in unrestricted and owned-set pools without changing prior ownership', () => {
    expect(getSelectableHeroes().map(hero => hero.id)).toEqual(expect.arrayContaining(heroIds))
    const owned = ['Robin Hood vs Bigfoot']
    const heroPool = (sets: string[]) => sets.flatMap(getHeroesBySet).map(hero => hero.id)
    const mapPool = (sets: string[]) => getMapsByPlayerCount(2)
      .filter(map => sets.includes(map.set)).map(map => map.id)
    expect(heroPool(owned).filter(id => heroIds.includes(id))).toEqual([])
    expect(mapPool(owned)).toEqual(['sherwood-forest', 'yukon'])
    expect(heroPool([...owned, 'Hellboy'])).toEqual([...heroPool(owned), ...heroIds])
    expect(mapPool([...owned, 'Hellboy'])).toEqual([...mapPool(owned), ...mapIds])
    expect(owned).toEqual(['Robin Hood vs Bigfoot'])
  })

  it.each([
    { id: 'bprd-hq', name: 'B.P.R.D. HQ', zones: 9, imageUrl: BPRDHQ },
    { id: 'pandemonium', name: 'Pandemonium', zones: 8, imageUrl: Pandemonium },
  ])('makes $id eligible for 2–4 players with inspected board metadata and artwork', ({ id, name, zones, imageUrl }) => {
    expect(getMapById(id)).toEqual({ id, name, set: 'Hellboy', minPlayers: 2, maxPlayers: 4, zones, spaces: 32, imageUrl })
    for (const count of [2, 3, 4]) {
      expect(getMapsByPlayerCount(count).map(map => map.id)).toContain(id)
    }
    for (const count of [1, 5]) {
      expect(getMapsByPlayerCount(count).map(map => map.id)).not.toContain(id)
    }
    expect(getCooperativeMaps().map(map => map.id)).not.toContain(id)
  })
})
