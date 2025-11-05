import type { Match, PlayerStats, HeroStats, CommunityData } from './types'

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

    const heroId = player.heroId
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
  let relevantMatches = matches.filter(m => m.players.some(p => p.heroId === heroId))
  
  if (filterByHeroId) {
    relevantMatches = relevantMatches.filter(m => 
      m.players.some(p => p.heroId === filterByHeroId)
    )
  }

  let wins = 0
  let losses = 0
  let draws = 0
  const vsMatchups: Record<string, { wins: number; total: number }> = {}

  for (const match of relevantMatches) {
    const opponents = match.players.filter(p => p.heroId !== heroId)
    
    for (const opponent of opponents) {
      if (!vsMatchups[opponent.heroId]) {
        vsMatchups[opponent.heroId] = { wins: 0, total: 0 }
      }
      vsMatchups[opponent.heroId].total++
    }

    if (match.isDraw) {
      draws++
    } else if (match.winnerId === heroId) {
      wins++
      for (const opponent of opponents) {
        vsMatchups[opponent.heroId].wins++
      }
    } else {
      losses++
    }
  }

  return {
    heroId,
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
      heroIds.add(player.heroId)
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
    const matchupData = opponentStats.vsMatchups[heroId]
    
    if (!matchupData || matchupData.total < minGamesThreshold) {
      return true
    }
    
    const opponentWinRate = (matchupData.wins / matchupData.total) * 100
    
    return opponentWinRate >= 40 && opponentWinRate <= 60
  })

  if (candidates.length === 0) {
    return availableHeroes[Math.floor(Math.random() * availableHeroes.length)]
  }
  
  return candidates[Math.floor(Math.random() * candidates.length)]
}
