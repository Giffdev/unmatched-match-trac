import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'
import { HeroMatchupHeatmap } from '@/components/global/HeroMatchupHeatmap'

type PublicHeatmapProps = {
  onHeroClick: (heroId: string) => void
}

export function PublicHeatmap({ onHeroClick }: PublicHeatmapProps) {
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCommunityMatches = async () => {
      setIsLoading(true)
      try {
        const keys = await window.spark.kv.keys()
        const matchKeys = keys.filter(k => k.startsWith('matches-'))
        
        const allMatchesData: Match[] = []
        for (const key of matchKeys) {
          const userMatches = await window.spark.kv.get<Match[]>(key)
          if (userMatches) {
            allMatchesData.push(...userMatches)
          }
        }
        
        setAllMatches(allMatchesData)
      } catch (error) {
        console.error('Failed to load community matches:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadCommunityMatches()
  }, [])

  if (isLoading) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Globe className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Loading global data...</h3>
            <p className="text-muted-foreground">
              Fetching matchup statistics from all users
            </p>
          </div>
        </div>
      </Card>
    )
  }

  if (allMatches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-6">
            <Globe className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No global data yet</h3>
            <p className="text-muted-foreground">
              Sign in and log some matches to contribute to global statistics
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global Matchup Heatmap</CardTitle>
              <CardDescription>
                Win rates across all logged matches
              </CardDescription>
            </div>
            <div className="px-4 py-2 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Total Matches</div>
              <div className="text-2xl font-bold text-primary">{allMatches.length}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <HeroMatchupHeatmap matches={allMatches} onHeroClick={onHeroClick} isLoading={isLoading} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Read the Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Understanding the Data</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Each cell shows the win rate of the row hero vs the column hero</li>
                <li>• Percentages are calculated from all logged matches</li>
                <li>• Sign in to access detailed hero statistics and analytics</li>
                <li>• Darker cells indicate fewer games played</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Color Scale</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: 'oklch(0.35 0.1 20)' }}></div>
                  <span className="text-sm text-muted-foreground">0-25% (Poor matchup)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: 'oklch(0.60 0.08 50)' }}></div>
                  <span className="text-sm text-muted-foreground">25-50% (Unfavorable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: 'oklch(0.75 0.05 120)' }}></div>
                  <span className="text-sm text-muted-foreground">50-75% (Favorable)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: 'oklch(0.55 0.15 195)' }}></div>
                  <span className="text-sm text-muted-foreground">75-100% (Strong matchup)</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
