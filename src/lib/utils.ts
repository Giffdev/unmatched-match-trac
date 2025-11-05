import { clsx, type ClassValue } from "clsx"
import type { PlayerAssignment, Match } 
import type { PlayerAssignment } from "./types"
import { getHeroById } from "./data"

  const hero = getHeroById(player.heroId)
  
 

}
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
      playerName: normalizePlayerName(player.playerName)
    }))
  }
}
