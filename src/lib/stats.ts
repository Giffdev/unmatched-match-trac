import type { Match, PlayerStats, HeroStats, CommunityData } from './types'
import { normalizeHeroId } from './utils'

export function calculatePlayerStats(matches: Match[], playerName: string): PlayerStats {
  const playerMatches = matches.filter(m => 
    m.players.some(p => p.playerName.toLowerCase() === playerName.toLowerCase())
  )

  let wins = 0
  let losses = 0
  let draws = 0
  const heroesPlayed: Record<string, number> = {}
  const heroWinRates: Record<string, { wins: number; total: number }> = {}
  const mapsPlayed: Record<string, number> = {}
  const mapWinRates: Record<string, { wins: number; total: number }> = {}
  const vsPlayers: Record<string, { wins: number; losses: number; draws: number; total: number }> = {}

  for (const match of playerMatches) {
    const player = match.players.find(p => p.playerName.toLowerCase() === playerName.toLowerCase())
    if (!player) continue

    const opponents = match.players.filter(p => p.playerName.toLowerCase() !== playerName.toLowerCase())
    
    for (const opponent of opponents) {
      if (!vsPlayers[opponent.playerName]) {
        vsPlayers[opponent.playerName] = { wins: 0, losses: 0, draws: 0, total: 0 }
      }
      vsPlayers[opponent.playerName].total++
    }

    const heroId = normalizeHeroId(player.heroId)
    heroesPlayed[heroId] = (heroesPlayed[heroId] || 0) + 1

    if (!heroWinRates[heroId]) {
      heroWinRates[heroId] = { wins: 0, total: 0 }
    }
    heroWinRates[heroId].total++

    const mapId = match.mapId
    mapsPlayed[mapId] = (mapsPlayed[mapId] || 0) + 1

    if (!mapWinRates[mapId]) {
      mapWinRates[mapId] = { wins: 0, total: 0 }
    }
    mapWinRates[mapId].total++

    if (match.isDraw) {
      draws++
      for (const opponent of opponents) {
        vsPlayers[opponent.playerName].draws++
      }
    } else {
      const winner = match.players.find(p => p.heroId === match.winnerId)
      if (winner?.playerName.toLowerCase() === playerName.toLowerCase()) {
        wins++
        heroWinRates[heroId].wins++
        mapWinRates[mapId].wins++
        for (const opponent of opponents) {
          vsPlayers[opponent.playerName].wins++
        }
      } else {
        losses++
        for (const opponent of opponents) {
          vsPlayers[opponent.playerName].losses++
        }
      }
    }
  }

  return {
    playerName,
    totalGames: playerMatches.length,
    wins,
    losses,
    draws,
    winRate: playerMatches.length > 0 ? (wins / playerMatches.length) * 100 : 0,
    heroesPlayed,
    heroWinRates,
    mapsPlayed,
    mapWinRates,
    vsPlayers,
  }
}

export function calculateHeroStats(matches: Match[], heroId: string, filterByHeroId?: string): HeroStats {
  const normalizedHeroId = normalizeHeroId(heroId)
  const normalizedFilterHeroId = filterByHeroId ? normalizeHeroId(filterByHeroId) : undefined
  
  let relevantMatches = matches.filter(m => m.players.some(p => normalizeHeroId(p.heroId) === normalizedHeroId))
  
  if (normalizedFilterHeroId) {
    relevantMatches = relevantMatches.filter(m => 
      m.players.some(p => normalizeHeroId(p.heroId) === normalizedFilterHeroId)
    )
  }

  let wins = 0
  let losses = 0
  let draws = 0
  const vsMatchups: Record<string, { wins: number; total: number }> = {}

  for (const match of relevantMatches) {
    const opponents = match.players.filter(p => normalizeHeroId(p.heroId) !== normalizedHeroId)
    
    for (const opponent of opponents) {
      const normalizedOpponentId = normalizeHeroId(opponent.heroId)
      if (!vsMatchups[normalizedOpponentId]) {
        vsMatchups[normalizedOpponentId] = { wins: 0, total: 0 }
      }
      vsMatchups[normalizedOpponentId].total++
    }

    if (match.isDraw) {
      draws++
    } else if (match.winnerId && normalizeHeroId(match.winnerId) === normalizedHeroId) {
      wins++
      for (const opponent of opponents) {
        const normalizedOpponentId = normalizeHeroId(opponent.heroId)
        vsMatchups[normalizedOpponentId].wins++
      }
    } else {
      losses++
    }
  }

  return {
    heroId: normalizedHeroId,
    totalGames: relevantMatches.length,
    wins,
    losses,
    draws,
    winRate: relevantMatches.length > 0 ? (wins / relevantMatches.length) * 100 : 0,
    vsMatchups,
  }
}

export function calculateUserHeroStats(userMatches: Match[], heroId: string, playerName?: string): HeroStats {
  const normalizedHeroId = normalizeHeroId(heroId)
  let relevantMatches: Match[]
  
  if (playerName) {
    relevantMatches = userMatches.filter(m => 
      m.players.some(p => normalizeHeroId(p.heroId) === normalizedHeroId && p.playerName.toLowerCase() === playerName.toLowerCase())
    )
  } else {
    relevantMatches = userMatches.filter(m => 
      m.players.some(p => normalizeHeroId(p.heroId) === normalizedHeroId)
    )
  }

  let wins = 0
  let losses = 0
  let draws = 0
  const vsMatchups: Record<string, { wins: number; total: number }> = {}

  for (const match of relevantMatches) {
    let heroPlayer: typeof match.players[0] | undefined
    
    if (playerName) {
      heroPlayer = match.players.find(p => normalizeHeroId(p.heroId) === normalizedHeroId && p.playerName.toLowerCase() === playerName.toLowerCase())
    } else {
      heroPlayer = match.players.find(p => normalizeHeroId(p.heroId) === normalizedHeroId)
    }
    
    if (!heroPlayer) continue

    const opponents = match.players.filter(p => 
      playerName 
        ? p.playerName.toLowerCase() !== playerName.toLowerCase()
        : normalizeHeroId(p.heroId) !== normalizedHeroId
    )
    
    for (const opponent of opponents) {
      const normalizedOpponentId = normalizeHeroId(opponent.heroId)
      if (!vsMatchups[normalizedOpponentId]) {
        vsMatchups[normalizedOpponentId] = { wins: 0, total: 0 }
      }
      vsMatchups[normalizedOpponentId].total++
    }

    if (match.isDraw) {
      draws++
    } else if (match.winnerId) {
      const normalizedWinnerId = normalizeHeroId(match.winnerId)
      const winningPlayer = match.players.find(p => normalizeHeroId(p.heroId) === normalizedWinnerId)
      if (winningPlayer) {
        if (playerName) {
          if (winningPlayer.playerName.toLowerCase() === playerName.toLowerCase()) {
            wins++
            for (const opponent of opponents) {
              const normalizedOpponentId = normalizeHeroId(opponent.heroId)
              vsMatchups[normalizedOpponentId].wins++
            }
          } else {
            losses++
          }
        } else {
          if (normalizeHeroId(winningPlayer.heroId) === normalizedHeroId) {
            wins++
            for (const opponent of opponents) {
              const normalizedOpponentId = normalizeHeroId(opponent.heroId)
              vsMatchups[normalizedOpponentId].wins++
            }
          } else {
            losses++
          }
        }
      }
    }
  }

  return {
    heroId: normalizedHeroId,
    totalGames: relevantMatches.length,
    wins,
    losses,
    draws,
    winRate: relevantMatches.length > 0 ? (wins / relevantMatches.length) * 100 : 0,
    vsMatchups,
  }
}

export function getAllPlayerNames(matches: Match[]): string[] {
  const names = new Set<string>()
  for (const match of matches) {
    for (const player of match.players) {
      names.add(player.playerName)
    }
  }
  return Array.from(names).sort()
}

export function aggregateCommunityData(allMatches: Match[]): CommunityData {
  const heroStats: Record<string, HeroStats> = {}
  const heroIds = new Set<string>()

  for (const match of allMatches) {
    for (const player of match.players) {
      heroIds.add(normalizeHeroId(player.heroId))
    }
  }

  for (const heroId of heroIds) {
    heroStats[heroId] = calculateHeroStats(allMatches, heroId)
  }

  return {
    heroStats,
    lastUpdated: new Date().toISOString(),
    totalMatches: allMatches.length,
  }
}

export function getBalancedRandomHero(
  availableHeroes: string[],
  targetWinRate: number,
  communityData: CommunityData,
  tolerance: number = 10
): string {
  const candidates = availableHeroes.filter(heroId => {
    const stats = communityData.heroStats[heroId]
    if (!stats || stats.totalGames < 3) return true
    return Math.abs(stats.winRate - targetWinRate) <= tolerance
  })

  if (candidates.length === 0) return availableHeroes[Math.floor(Math.random() * availableHeroes.length)]
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export function getBalancedMatchupHero(
  availableHeroes: string[],
  opponentHeroId: string,
  communityData: CommunityData,
  minGamesThreshold: number = 2
): string {
  const opponentStats = communityData.heroStats[opponentHeroId]
  
  if (!opponentStats) {
    return availableHeroes[Math.floor(Math.random() * availableHeroes.length)]
  }

  const candidates = availableHeroes.filter(heroId => {
    const heroStats = communityData.heroStats[heroId]
    if (!heroStats) return false
    
    const heroVsOpponentData = heroStats.vsMatchups[opponentHeroId]
    
    if (!heroVsOpponentData || heroVsOpponentData.total < minGamesThreshold) {
      return false
    }
    
    const heroWinRate = (heroVsOpponentData.wins / heroVsOpponentData.total) * 100
    
    return heroWinRate >= 40 && heroWinRate <= 60
  })

  if (candidates.length === 0) {
    return availableHeroes[Math.floor(Math.random() * availableHeroes.length)]
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)]
}
