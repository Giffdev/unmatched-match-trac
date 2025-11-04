import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Target, MapPin, TrendUp } from '@phosphor-icons/react'
import { getHeroById, getMapById } from '@/lib/data'
import type { Match } from '@/lib/types'

type HeroStat = {
  heroId: string
  name: string
  games: number
  wins: number
  winRate: number
}

type MapStat = {
  mapId: string
  name: string
  games: number
}

export function GlobalStats() {
  const [totalMatches, setTotalMatches] = useState(0)
  const [topHeroes, setTopHeroes] = useState<HeroStat[]>([])
  const [topWinRates, setTopWinRates] = useState<HeroStat[]>([])
  const [topMaps, setTopMaps] = useState<MapStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const allKeys = await window.spark.kv.keys()
        const matchKeys = allKeys.filter(key => key.startsWith('matches-'))
        
        const allMatches: Match[] = []
        for (const key of matchKeys) {
          const userMatches = await window.spark.kv.get<Match[]>(key)
          if (userMatches) {
            allMatches.push(...userMatches)
          }
        }

        setTotalMatches(allMatches.length)

        const heroStats = new Map<string, { games: number; wins: number }>()
        const mapStats = new Map<string, number>()

        for (const match of allMatches) {
          for (const player of match.players) {
            const existing = heroStats.get(player.heroId) || { games: 0, wins: 0 }
            existing.games++
            if (!match.isDraw && match.winnerId === player.heroId) {
              existing.wins++
            }
            heroStats.set(player.heroId, existing)
          }

          const mapCount = mapStats.get(match.mapId) || 0
          mapStats.set(match.mapId, mapCount + 1)
        }

        const heroStatsList: HeroStat[] = Array.from(heroStats.entries())
          .map(([heroId, stats]) => {
            const hero = getHeroById(heroId)
            return {
              heroId,
              name: hero?.name || heroId,
              games: stats.games,
              wins: stats.wins,
              winRate: stats.games > 0 ? (stats.wins / stats.games) * 100 : 0
            }
          })
          .filter(stat => stat.games >= 3)

        const sortedByGames = [...heroStatsList].sort((a, b) => b.games - a.games).slice(0, 5)
        const sortedByWinRate = [...heroStatsList].sort((a, b) => b.winRate - a.winRate).slice(0, 5)

        setTopHeroes(sortedByGames)
        setTopWinRates(sortedByWinRate)

        const mapStatsList: MapStat[] = Array.from(mapStats.entries())
          .map(([mapId, games]) => {
            const map = getMapById(mapId)
            return {
              mapId,
              name: map?.name || mapId,
              games
            }
          })
          .sort((a, b) => b.games - a.games)
          .slice(0, 5)

        setTopMaps(mapStatsList)
      } catch (error) {
        console.error('Failed to load global stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGlobalStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-12 bg-muted rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (totalMatches === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">No Community Data Yet</CardTitle>
          <CardDescription className="text-center">
            Be the first to log matches and contribute to the global statistics!
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Community Statistics
        </h2>
        <p className="text-muted-foreground">
          Insights from <span className="font-semibold text-accent">{totalMatches.toLocaleString()}</span> matches played by the community
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="text-primary" size={24} />
              <CardTitle>Most Played Heroes</CardTitle>
            </div>
            <CardDescription>Heroes that see the most action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topHeroes.map((hero, index) => (
                <div key={hero.heroId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{hero.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {hero.games} {hero.games === 1 ? 'game' : 'games'}
                    </span>
                  </div>
                  <Progress value={(hero.games / topHeroes[0].games) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="text-accent" size={24} />
              <CardTitle>Highest Win Rates</CardTitle>
            </div>
            <CardDescription>Heroes dominating the meta (3+ games)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topWinRates.map((hero, index) => (
                <div key={hero.heroId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{hero.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-accent">
                        {hero.winRate.toFixed(0)}%
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({hero.wins}/{hero.games})
                      </span>
                    </div>
                  </div>
                  <Progress value={hero.winRate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="text-secondary" size={24} />
              <CardTitle>Popular Maps</CardTitle>
            </div>
            <CardDescription>Most frequently played battlefields</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topMaps.map((map, index) => (
                <div key={map.mapId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                        {index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{map.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {map.games} {map.games === 1 ? 'game' : 'games'}
                    </span>
                  </div>
                  <Progress value={(map.games / topMaps[0].games) * 100} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-accent/20 bg-accent/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendUp className="text-accent mt-1" size={24} />
            <div className="space-y-1">
              <h3 className="font-semibold text-foreground">Join the Community</h3>
              <p className="text-sm text-muted-foreground">
                Create an account to track your own matches, analyze your playstyle, and contribute to these global statistics.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
