import { useState } from 'react'
import type { Match, Map } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Trophy } from '@phosphor-icons/react'
import { LogMatchDialog } from './LogMatchDialog'
import { MatchCard } from './MatchCard'
import { useAuth } from '@/hooks/use-auth'
import { compareMatchesByRecency } from '@/lib/sort'
import { getMapById } from '@/lib/data'
import { MapImageDialog } from '@/components/players/MapImageDialog'
import { DataContextSelector } from '@/components/shared/DataContextSelector'

type MatchesTabProps = {
  matches: Match[]
  setMatches: (updater: (matches: Match[]) => Match[]) => void
  onHeroClick: (heroId: string) => void
  dataSource?: { label: string; matches: Match[] }
  groups?: { id: string; name: string }[]
  dataContext?: string
  onDataContextChange?: (value: string) => void
}

export function MatchesTab({ matches, setMatches, onHeroClick, dataSource, groups, dataContext, onDataContextChange }: MatchesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { user } = useAuth()
  const currentUserId = user?.uid ?? null
  const [selectedMap, setSelectedMap] = useState<Map | null>(null)
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)

  const isGroupContext = dataContext !== undefined && dataContext !== 'personal'
  const effectiveMatches = dataSource?.matches ?? matches

  const handleMapClick = (mapId: string) => {
    const map = getMapById(mapId)
    if (map) {
      setSelectedMap(map)
      setIsMapDialogOpen(true)
    }
  }

  const sortedMatches = [...effectiveMatches].sort(compareMatchesByRecency)

  if (!currentUserId) {
    return null
  }

  return (
    <div className="space-y-6">
      {groups && dataContext && onDataContextChange && (
        <DataContextSelector
          groups={groups}
          value={dataContext}
          onChange={onDataContextChange}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Match History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {effectiveMatches.length} {effectiveMatches.length === 1 ? 'match' : 'matches'} logged
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="lg">
          <Plus className="mr-2" />
          Log Match
        </Button>
      </div>

      {effectiveMatches.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Trophy className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No matches yet</h3>
              <p className="text-muted-foreground mb-4">
                {isGroupContext
                  ? 'No matches in this group yet. Log matches from the Groups tab.'
                  : 'Start tracking your Unmatched games to see statistics and insights'}
              </p>
              {!isGroupContext && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2" />
                  Log Your First Match
                </Button>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedMatches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              {...(!isGroupContext && {
                onDelete: (id: string) => setMatches(current => current.filter(m => m.id !== id)),
                onEdit: (updatedMatch: Match) => setMatches(current => 
                  current.map(m => m.id === updatedMatch.id ? updatedMatch : m)
                ),
              })}
              onHeroClick={onHeroClick}
              onMapClick={handleMapClick}
              existingMatches={matches}
              subtitle={isGroupContext ? `Logged by ${(match as any).loggedByName || 'Unknown'}` : undefined}
            />
          ))}
        </div>
      )}

      <LogMatchDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSave={(match) => setMatches(current => [...current, match])}
        existingMatches={matches}
      />

      <MapImageDialog 
        map={selectedMap}
        open={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
      />
    </div>
  )
}
