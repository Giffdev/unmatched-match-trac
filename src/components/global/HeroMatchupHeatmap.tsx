import { useMemo } from 'react'
import type { Match } from '@/lib/types'
import { getSelectableHeroes, getHeroById } from '@/lib/data'
import { cn } from '@/lib/utils'

type HeroMatchupHeatmapProps = {
  matches: Match[]
  onHeroClick: (heroId: string) => void
  isLoading: boolean
}

type MatchupData = {
  wins: number
  total: number
  winRate: number
}

export function HeroMatchupHeatmap({ matches, onHeroClick, isLoading }: HeroMatchupHeatmapProps) {
  const selectableHeroes = getSelectableHeroes()
  
  const matchupMatrix = useMemo(() => {
    const matrix: Record<string, Record<string, MatchupData>> = {}
    
    selectableHeroes.forEach(hero => {
      matrix[hero.id] = {}
      selectableHeroes.forEach(opponent => {
        if (hero.id !== opponent.id) {
          matrix[hero.id][opponent.id] = { wins: 0, total: 0, winRate: 0 }
        }
      })
    })

    const onlyOneVOneMatches = matches.filter(match => match.mode === '1v1' && match.players.length === 2)

    onlyOneVOneMatches.forEach(match => {
      if (match.players.length !== 2) return
      
      const [player1, player2] = match.players
      const hero1Id = player1.heroId
      const hero2Id = player2.heroId
      
      if (!matrix[hero1Id] || !matrix[hero2Id]) return
      
      matrix[hero1Id][hero2Id].total++
      matrix[hero2Id][hero1Id].total++
      
      if (!match.isDraw && match.winnerId) {
        const winnerPlayer = match.players.find(p => 
          p.heroId === match.winnerId || p.heroId === match.winnerId
        )
        
        if (winnerPlayer) {
          const winnerHeroId = winnerPlayer.heroId
          const loserHeroId = winnerHeroId === hero1Id ? hero2Id : hero1Id
          
          if (matrix[winnerHeroId] && matrix[winnerHeroId][loserHeroId]) {
            matrix[winnerHeroId][loserHeroId].wins++
          }
        }
      }
    })

    Object.keys(matrix).forEach(heroId => {
      Object.keys(matrix[heroId]).forEach(opponentId => {
        const data = matrix[heroId][opponentId]
        if (data.total > 0) {
          data.winRate = (data.wins / data.total) * 100
        }
      })
    })

    return matrix
  }, [matches])

  const heroesWithData = useMemo(() => {
    return selectableHeroes.filter(hero => {
      const hasData = Object.values(matchupMatrix[hero.id] || {}).some(m => m.total > 0)
      return hasData
    }).sort((a, b) => a.name.localeCompare(b.name))
  }, [matchupMatrix, selectableHeroes])

  const getWinRateColor = (winRate: number, total: number) => {
    if (total === 0) {
      return 'oklch(0.20 0.005 270)'
    }
    
    const minAlpha = 0.3
    const alpha = Math.min(1, minAlpha + (total / 20) * (1 - minAlpha))
    
    if (winRate < 25) {
      const lightness = 0.35 + (winRate / 25) * 0.10
      return `oklch(${lightness} 0.1 20 / ${alpha})`
    } else if (winRate < 50) {
      const lightness = 0.45 + ((winRate - 25) / 25) * 0.15
      return `oklch(${lightness} 0.08 50 / ${alpha})`
    } else if (winRate < 75) {
      const lightness = 0.60 + ((winRate - 50) / 25) * 0.15
      return `oklch(${lightness} 0.05 120 / ${alpha})`
    } else {
      const lightness = 0.45 + ((winRate - 75) / 25) * 0.10
      return `oklch(${lightness} 0.15 195 / ${alpha})`
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading matchup data...
      </div>
    )
  }

  if (heroesWithData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No 1v1 matchup data available yet
      </div>
    )
  }

  return (
    <div className="overflow-auto -mx-3 md:mx-0">
      <div className="inline-block min-w-full px-3 md:px-0">
        <table className="border-collapse text-[10px] md:text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 z-20 bg-background border border-border p-1 md:p-2 min-w-[100px] md:min-w-[140px] text-left font-semibold text-[10px] md:text-xs">
                Winner
              </th>
              {heroesWithData.map(hero => (
                <th
                  key={hero.id}
                  className="border border-border p-0.5 md:p-1 min-w-[40px] md:min-w-[60px] bg-muted/50"
                >
                  <div className="writing-mode-vertical transform -rotate-180 whitespace-nowrap py-1 md:py-2 text-[9px] md:text-xs font-medium">
                    {hero.name}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heroesWithData.map(rowHero => (
              <tr key={rowHero.id}>
                <td 
                  className="sticky left-0 z-10 bg-background border border-border p-1 md:p-2 font-medium text-left cursor-pointer hover:bg-accent/10 transition-colors text-[10px] md:text-xs"
                  onClick={() => onHeroClick(rowHero.id)}
                >
                  <span className="text-primary hover:underline">
                    {rowHero.name}
                  </span>
                </td>
                {heroesWithData.map(colHero => {
                  if (rowHero.id === colHero.id) {
                    return (
                      <td
                        key={colHero.id}
                        className="border border-border p-1 md:p-2 text-center bg-muted/30"
                      >
                        <span className="text-muted-foreground text-[10px] md:text-xs">-</span>
                      </td>
                    )
                  }
                  
                  const data = matchupMatrix[rowHero.id]?.[colHero.id] || { wins: 0, total: 0, winRate: 0 }
                  const bgColor = getWinRateColor(data.winRate, data.total)
                  
                  return (
                    <td
                      key={colHero.id}
                      className="border border-border p-1 md:p-2 text-center transition-all hover:scale-105"
                      style={{ backgroundColor: bgColor }}
                      title={`${rowHero.name} vs ${colHero.name}: ${data.wins}/${data.total} (${data.winRate.toFixed(0)}%)`}
                    >
                      {data.total > 0 ? (
                        <span 
                          className={cn(
                            "font-semibold text-[10px] md:text-xs",
                            data.winRate < 40 ? "text-foreground" : "text-foreground"
                          )}
                        >
                          {data.winRate.toFixed(0)}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground/50 text-[10px] md:text-xs">-</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
