import { useState } from 'react'
import type { Match } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Trophy } from '@phosphor-icons/react'
import { LogMatchDialog } from './LogMatchDialog'
import { MatchCard } from './MatchCard'
import { useKV } from '@github/spark/hooks'

type MatchesTabProps = {
  matches: Match[]
  setMatches: (updater: (matches: Match[]) => Match[]) => void
  onHeroClick: (heroId: string) => void
}

export function MatchesTab({ matches, setMatches, onHeroClick }: MatchesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentUserId] = useKV<string | null>('current-user-id', null)

  const sortedMatches = [...matches].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    
    if (isNaN(dateA) && isNaN(dateB)) return 0
    if (isNaN(dateA)) return 1
    if (isNaN(dateB)) return -1
    
    return dateB - dateA
  })

  if (!currentUserId) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Match History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length} {matches.length === 1 ? 'match' : 'matches'} logged
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2" />
          Log Match
        </Button>
      </div>

      {matches.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground mb-4">
                Start tracking your Unmatched games to see statistics and insights
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2" />
                Log Your First Match
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedMatches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              onDelete={(id) => setMatches(current => current.filter(m => m.id !== id))}
              onEdit={(updatedMatch) => setMatches(current => 
                current.map(m => m.id === updatedMatch.id ? updatedMatch : m)
              )}
              onHeroClick={onHeroClick}
            />
          ))}
        </div>
      )}

      <LogMatchDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSave={(match) => setMatches(current => [...current, match])}
      />
    </div>
  )
}
