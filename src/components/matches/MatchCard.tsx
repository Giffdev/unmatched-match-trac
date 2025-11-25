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
  onMapClick?: (mapId: string) => void
  existingMatches?: Match[]
}

const MODE_LABELS: Record<string, string> = {
  'cooperative': 'Co-op',
  '1v1': '1v1',
  '2v2': '2v2',
  'ffa3': '3P FFA',
  'ffa4': '4P FFA',
}

export function MatchCard({ match, onDelete, onEdit, onHeroClick, onMapClick, existingMatches = [] }: MatchCardProps) {
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
      <Card className="p-3 md:p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2 md:gap-4">
          <div className="flex-1 space-y-3 min-w-0">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 md:gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="font-medium text-xs md:text-sm">
                {MODE_LABELS[match.mode]}
              </Badge>
              <div className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                <MapPin size={14} className="md:hidden" />
                <MapPin size={16} className="hidden md:block" />
                <span 
                  className={`truncate ${onMapClick ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                  onClick={() => onMapClick?.(match.mapId)}
                >
                  {map?.name || 'Unknown Map'}
                </span>
              </div>
            </div>
            {map && (
              <div className="text-[10px] md:text-xs text-muted-foreground">
                {map.minPlayers === map.maxPlayers 
                  ? `${map.minPlayers}p` 
                  : `${map.minPlayers}-${map.maxPlayers}p`}
                {' • '}
                {map.zones} zones, {map.spaces} spaces
              </div>
            )}
            <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
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
                    className={`flex items-center gap-2 md:gap-3 ${isWinner ? 'font-medium' : ''}`}
                  >
                    <Badge variant="outline" className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center p-0 text-xs">
                      {player.turnOrder}
                    </Badge>
                    <span className="text-xs md:text-sm min-w-[80px] md:min-w-[120px] truncate">{player.playerName}</span>
                    <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">•</span>
                    <button
                      onClick={() => onHeroClick(player.heroId)}
                      className="text-xs md:text-sm text-primary hover:underline cursor-pointer transition-colors truncate flex-1"
                    >
                      {getHeroDisplayName(player)}
                    </button>
                    {isWinner && (
                      <Trophy className="text-accent ml-1 md:ml-2 flex-shrink-0" size={14} weight="fill" />
                    )}
                    {match.isDraw && (
                      <span className="text-[10px] md:text-xs text-muted-foreground ml-1 md:ml-2 flex-shrink-0">(Draw)</span>
                    )}
                  </div>
                )
              })}
            {match.mode === 'cooperative' && match.cooperativeResult && (
              <div className="mt-3 pt-3 border-t border-border">
                <Badge 
                  variant={match.cooperativeResult === 'win' ? 'default' : 'destructive'}
                  className="font-medium text-xs md:text-sm"
                >
                  {match.cooperativeResult === 'win' ? 'Victory' : 'Defeat'}
                </Badge>
              </div>
            )}
          </div>
          </div>

          <div className="flex flex-col md:flex-row gap-1 md:gap-2 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setEditDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground h-8 w-8 md:h-10 md:w-10"
            >
              <Pencil size={16} className="md:hidden" />
              <Pencil className="hidden md:block" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => onDelete(match.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 md:h-10 md:w-10"
            >
              <Trash size={16} className="md:hidden" />
              <Trash className="hidden md:block" />
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
