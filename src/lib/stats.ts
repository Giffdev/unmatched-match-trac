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

// Bayesian smoothing: shrink small-sample win rates toward 50%
function smoothedWinRate(wins: number, total: number, priorGames: number = 4): number {
  return ((wins + priorGames * 0.5) / (total + priorGames)) * 100
}

// Confidence weight: how much to trust a sample of N games (0-1 scale)
function sampleConfidence(games: number, fullConfidenceAt: number = 20): number {
  return Math.min(games / fullConfidenceAt, 1)
}

// Calculate total "power" of a hero including sidekicks
function heroPowerProxy(hero: { hp: number; move: number; sidekicks?: { count: number; hp?: number }[] }): number {
  let totalHp = hero.hp
  if (hero.sidekicks) {
    for (const sk of hero.sidekicks) {
      totalHp += (sk.hp ?? 1) * sk.count
    }
  }
  return totalHp + hero.move * 2 // weight movement as proxy for mobility advantage
}

export function getBalancedMatchupScored(
  availableHeroes: string[],
  opponentHeroId: string,
  communityData: CommunityData,
  heroDataLookup: (id: string) => { hp: number; move: number; sidekicks?: { count: number; hp?: number }[] } | undefined
): import('./types').BalancedResult {
  const opponentStats = communityData.heroStats[opponentHeroId]
  const opponentHeroData = heroDataLookup(opponentHeroId)
  const opponentPower = opponentHeroData ? heroPowerProxy(opponentHeroData) : null
  const opponentWinRate = opponentStats && opponentStats.totalGames >= 2
    ? smoothedWinRate(opponentStats.wins, opponentStats.totalGames)
    : 50

  type ScoredCandidate = {
    heroId: string
    score: number
    confidence: 'high' | 'medium' | 'low'
    reason: 'direct-matchup' | 'win-rate-similarity' | 'stat-proxy'
    matchupGames?: number
    heroAGames?: number
    heroBGames?: number
  }

  const scored: ScoredCandidate[] = []

  for (const heroId of availableHeroes) {
    if (heroId === opponentHeroId) continue

    const stats = communityData.heroStats[heroId]
    const heroData = heroDataLookup(heroId)

    let directScore = 0
    let directWeight = 0
    let matchupGames = 0

    // Tier 1: Direct head-to-head data
    if (stats && opponentStats) {
      const vsData = stats.vsMatchups[opponentHeroId]
      if (vsData && vsData.total >= 1) {
        matchupGames = vsData.total
        const h2hWinRate = smoothedWinRate(vsData.wins, vsData.total)
        // Score: how close to 50%. Max score = 100 at exactly 50%
        directScore = 100 - Math.abs(h2hWinRate - 50) * 2
        directWeight = sampleConfidence(vsData.total, 10) // full confidence at 10 H2H games
      }
    }

    // Tier 2: Overall win rate similarity
    let winRateScore = 0
    let winRateWeight = 0
    if (stats && stats.totalGames >= 2) {
      const heroWinRate = smoothedWinRate(stats.wins, stats.totalGames)
      // Score: how close the two overall win rates are. Max = 100 if identical
      winRateScore = 100 - Math.abs(heroWinRate - opponentWinRate) * 3
      winRateScore = Math.max(winRateScore, 0)
      const minGames = Math.min(stats.totalGames, opponentStats?.totalGames ?? 0)
      winRateWeight = sampleConfidence(minGames, 10) * (1 - directWeight) // fills gap left by direct data
    }

    // Tier 3: Stat-based proxy
    let statScore = 50 // neutral default
    if (heroData && opponentPower !== null) {
      const heroPower = heroPowerProxy(heroData)
      const powerDiff = Math.abs(heroPower - opponentPower)
      // Score: closer power levels = higher score
      statScore = Math.max(100 - powerDiff * 5, 0)
    }
    const statWeight = Math.max(1 - directWeight - winRateWeight, 0.05) // always at least 5%

    // Blended score
    const totalWeight = directWeight + winRateWeight + statWeight
    const compositeScore = (
      directScore * directWeight +
      winRateScore * winRateWeight +
      statScore * statWeight
    ) / totalWeight

    // Determine confidence level and primary reason
    let confidence: 'high' | 'medium' | 'low'
    let reason: 'direct-matchup' | 'win-rate-similarity' | 'stat-proxy'
    if (directWeight >= 0.3) {
      confidence = matchupGames >= 5 ? 'high' : 'medium'
      reason = 'direct-matchup'
    } else if (winRateWeight >= 0.3) {
      confidence = 'medium'
      reason = 'win-rate-similarity'
    } else {
      confidence = 'low'
      reason = 'stat-proxy'
    }

    scored.push({
      heroId,
      score: compositeScore,
      confidence,
      reason,
      matchupGames: matchupGames > 0 ? matchupGames : undefined,
      heroAGames: stats?.totalGames,
      heroBGames: opponentStats?.totalGames,
    })
  }

  if (scored.length === 0) {
    const fallback = availableHeroes.filter(h => h !== opponentHeroId)
    const pick = fallback[Math.floor(Math.random() * fallback.length)] ?? availableHeroes[0]
    return { heroId: pick, confidence: 'low', reason: 'stat-proxy', score: 50 }
  }

  // Softmax-style weighted random selection from all candidates
  // Temperature controls diversity: lower = more deterministic, higher = more random
  const temperature = 0.15
  const maxScore = Math.max(...scored.map(s => s.score))
  const weights = scored.map(s => Math.exp((s.score - maxScore) / (temperature * 100)))
  const totalWeightSum = weights.reduce((a, b) => a + b, 0)

  let roll = Math.random() * totalWeightSum
  for (let i = 0; i < scored.length; i++) {
    roll -= weights[i]
    if (roll <= 0) {
      return {
        heroId: scored[i].heroId,
        confidence: scored[i].confidence,
        reason: scored[i].reason,
        matchupGames: scored[i].matchupGames,
        heroAGames: scored[i].heroAGames,
        heroBGames: scored[i].heroBGames,
        score: scored[i].score,
      }
    }
  }

  // Fallback to highest scored
  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]
  return {
    heroId: best.heroId,
    confidence: best.confidence,
    reason: best.reason,
    matchupGames: best.matchupGames,
    heroAGames: best.heroAGames,
    heroBGames: best.heroBGames,
    score: best.score,
  }
}

// Keep old functions for backward compat but they're no longer used by randomizer
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
