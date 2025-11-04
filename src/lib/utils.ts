import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PlayerAssignment } from "./types"
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
