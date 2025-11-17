import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerAssignment, Match } from "./types"
import { getHeroById } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PLAYER_NAME_MAP: Record<string, string> = {
  'mike': 'Mike',
  'sarah': 'Sarah',
  'alex': 'Alex',
  'chris': 'Chris',
  'jordan': 'Jordan',
}

const HERO_ID_MAP: Record<string, string> = {
  'bruce-lee-ali': 'bruce-lee',
}

export function normalizeHeroId(heroId: string): string {
  return HERO_ID_MAP[heroId] || heroId
}

export function getHeroDisplayName(player: PlayerAssignment): string {
  const hero = getHeroById(player.heroId)
  if (!hero) return 'Unknown Hero'
  
  if (hero.id === 'yennefer-triss' && player.heroVariant) {
    return `${hero.name} (${player.heroVariant === 'triss' ? 'Triss as Hero' : 'Yennefer as Hero'})`
  }
  
  return hero.name
}

export function normalizePlayerName(name: string): string {
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()
  
  return PLAYER_NAME_MAP[lower] || trimmed
}

export function normalizeMatchPlayerNames(match: Match): Match {
  return {
    ...match,
    players: match.players.map(player => ({
      ...player,
      playerName: normalizePlayerName(player.playerName),
      heroId: normalizeHeroId(player.heroId)
    })),
    winnerId: match.winnerId ? normalizeHeroId(match.winnerId) : match.winnerId
  }
}
