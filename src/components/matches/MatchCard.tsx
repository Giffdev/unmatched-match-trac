import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trash, Trophy, MapPin, Users } from '@phosphor-icons/react'
import { getHeroById, getMapById } from '@/lib/data'
import { format } from 'date-fns'

type MatchCardProps = {
  match: Match
  onDelete: (id: string) => void
}

const MODE_LABELS: Record<string, string> = {
  'cooperative': 'Co-op',
  '1v1': '1v1',
  '2v2': '2v2',
  'ffa3': '3P FFA',
  'ffa4': '4P FFA',
}

export function MatchCard({ match, onDelete }: MatchCardProps) {
  const map = getMapById(match.mapId)
  const winner = match.players.find(p => p.heroId === match.winnerId)
  const winnerHero = winner ? getHeroById(winner.heroId) : null

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="font-medium">
              {MODE_LABELS[match.mode]}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin size={16} />
              {map?.name || 'Unknown Map'}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(new Date(match.date), 'MMM d, yyyy')}
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
                    <span className="text-sm">{hero?.name || 'Unknown Hero'}</span>
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

        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => onDelete(match.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash />
        </Button>
      </div>
    </Card>
  )
}
