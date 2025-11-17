import { useState } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash, Trophy, MapPin, Pencil } from '@phosphor-icons/react'
import { getHeroById, getMapById } from '@/lib/data'
import { getHeroDisplayName } from '@/lib/utils'
import { format } from 'date-fns'
import { EditMatchDialog } from './EditMatchDialog'

type MatchCardProps = {
  match: Match
  onDelete: (id: string) => void
  onEdit: (match: Match) => void
  onHeroClick: (heroId: string) => void
  existingMatches?: Match[]
}

const MODE_LABELS: Record<string, string> = {
  'cooperative': 'Co-op',
  '1v1': '1v1',
  '2v2': '2v2',
  'ffa3': '3P FFA',
  'ffa4': '4P FFA',
}

export function MatchCard({ match, onDelete, onEdit, onHeroClick, existingMatches = [] }: MatchCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const map = getMapById(match.mapId)
  const winner = match.players.find(p => p.heroId === match.winnerId)
  const winnerHero = winner ? getHeroById(winner.heroId) : null

  const formatMatchDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      if (isNaN(date.getTime())) {
        return dateString
      }
      return format(date, 'MMM d, yyyy')
    } catch {
      return dateString
    }
  }

  return (
    <>
      <Card className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <Badge variant="secondary" className="font-medium">
              {MODE_LABELS[match.mode]}
            </Badge>
            <div className="flex-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin size={16} />
                <span>{map?.name || 'Unknown Map'}</span>
              </div>
              {map && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {map.minPlayers === map.maxPlayers 
                    ? `${map.minPlayers}p` 
                    : `${map.minPlayers}-${map.maxPlayers}p`}
                  {' • '}
                  {map.zones} zones, {map.spaces} spaces
                </div>
              )}
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formatMatchDate(match.date)}
            </span>
          </div>

          <div className="space-y-2">
            {match.players
              .sort((a, b) => a.turnOrder - b.turnOrder)
              .map((player) => {
                const hero = getHeroById(player.heroId)
                const isWinner = player.heroId === match.winnerId
                
                return (
                  <div 
                    key={`${player.heroId}-${player.turnOrder}`}
                    className={`flex items-center gap-3 ${isWinner ? 'font-medium' : ''}`}
                  >
                    <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                      {player.turnOrder}
                    </Badge>
                    <span className="text-sm min-w-[120px]">{player.playerName}</span>
                    <span className="text-sm text-muted-foreground">•</span>
                    <button
                      onClick={() => onHeroClick(player.heroId)}
                      className="text-sm text-primary hover:underline cursor-pointer transition-colors"
                    >
                      {getHeroDisplayName(player)}
                    </button>
                    {isWinner && (
                      <Trophy className="text-accent ml-2" size={16} weight="fill" />
                    )}
                    {match.isDraw && (
                      <span className="text-xs text-muted-foreground ml-2">(Draw)</span>
                    )}
                  </div>
                )
              })}
          </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(match.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash />
            </Button>
          </div>
        </div>
      </Card>

      <EditMatchDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={onEdit}
        match={match}
        existingMatches={existingMatches}
      />
    </>
  )
}
