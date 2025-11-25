import { useMemo, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Globe } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'
import { getSelectableHeroes } from '@/lib/data'
import { HeroMatchupHeatmap } from './HeroMatchupHeatmap'

type GlobalResultsTabProps = {
  matches: Match[]
  currentUserId: string | null
  onHeroClick: (heroId: string) => void
}

export function GlobalResultsTab({ matches, currentUserId, onHeroClick }: GlobalResultsTabProps) {
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const updateCommunityMatches = async () => {
      if (!currentUserId) {
        setIsLoading(false)
        return
      }
      
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
        console.error('Error loading global matches:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    updateCommunityMatches()
  }, [matches.length, currentUserId])

  const totalMatches = useMemo(() => {
    return allMatches.length || 0
  }, [allMatches])

  if (!currentUserId) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Globe className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sign in required</h3>
            <p className="text-muted-foreground">
              Sign in to view global matchup statistics
            </p>
          </div>
        </div>
      </Card>
    )
  }

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

  if (totalMatches === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-muted p-6">
            <Globe className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No global data yet</h3>
            <p className="text-muted-foreground">
              Log some matches to contribute to global statistics
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold mb-1 md:mb-2">Global Matchup Results</h2>
          <p className="text-xs md:text-sm text-muted-foreground">
            Win rates across all logged matches
          </p>
        </div>
        <Card className="px-3 py-2 md:px-4 w-fit">
          <div className="text-xs md:text-sm text-muted-foreground">Total Matches</div>
          <div className="text-xl md:text-2xl font-bold text-primary">{totalMatches}</div>
        </Card>
      </div>

      <HeroMatchupHeatmap matches={allMatches} onHeroClick={onHeroClick} isLoading={isLoading} />

      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">How to Read the Heatmap</h3>
        <div className="grid gap-3 md:gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-medium mb-2 text-sm md:text-base">Understanding the Data</h4>
            <ul className="text-xs md:text-sm text-muted-foreground space-y-1">
              <li>• Each cell shows the win rate of the row hero vs the column hero</li>
              <li>• Percentages are calculated from all logged matches</li>
              <li>• Click on any hero name to view detailed statistics</li>
              <li>• Darker cells indicate fewer games played</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm md:text-base">Color Scale</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0" style={{ backgroundColor: 'oklch(0.35 0.1 20)' }}></div>
                <span className="text-xs md:text-sm text-muted-foreground">0-25% (Poor matchup)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0" style={{ backgroundColor: 'oklch(0.60 0.08 50)' }}></div>
                <span className="text-xs md:text-sm text-muted-foreground">25-50% (Unfavorable)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0" style={{ backgroundColor: 'oklch(0.75 0.05 120)' }}></div>
                <span className="text-xs md:text-sm text-muted-foreground">50-75% (Favorable)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded flex-shrink-0" style={{ backgroundColor: 'oklch(0.55 0.15 195)' }}></div>
                <span className="text-xs md:text-sm text-muted-foreground">75-100% (Strong matchup)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
