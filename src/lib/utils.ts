import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerAssignment, Match } from "./types"
import { getHeroById } from "./data"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHeroDisplayName(player: PlayerAssignment): string {
  const hero = getHeroById(player.heroId)
  if (!hero) return 'Unknown Hero'
  
  if (hero.id === 'yennefer-triss' && player.heroVariant) {
    return `${hero.name} (${player.heroVariant === 'triss' ? 'Triss as Hero' : 'Yennefer as Hero'})`
  }
  
  return hero.name
}

const PLAYER_NAME_MAP: Record<string, string> = {
  'sarah': 'Sarah Anderson',
  'sarah anderson': 'Sarah Anderson',
  'devin': 'Devin Sinha',
  'devin sinha': 'Devin Sinha',
  'stephen': 'Stephen Kidson',
  'stephen kidson': 'Stephen Kidson',
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
      playerName: normalizePlayerName(player.playerName)
    }))
  }
}
