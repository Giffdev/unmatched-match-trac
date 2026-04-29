import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGroupMatches } from '@/hooks/use-group-matches'
import { getHeroById } from '@/lib/data'
import { getHeroDisplayName } from '@/lib/utils'
import { format } from 'date-fns'
import type { GroupMatch } from '@/lib/group-types'

type GroupMatchListProps = {
  groupId: string
}

export function GroupMatchList({ groupId }: GroupMatchListProps) {
  const { matches, loading, loadMore, hasMore } = useGroupMatches(groupId)

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading matches...</p>
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No matches logged yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <GroupMatchCard key={match.id} match={match} />
      ))}

      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={loadMore}
        >
          Load More
        </Button>
      )}
    </div>
  )
}

function GroupMatchCard({ match }: { match: GroupMatch }) {
  const formatMatchDate = (dateString: string): string => {
    try {
      const [year, month, day] = dateString.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      if (isNaN(date.getTime())) return dateString
      return format(date, 'MMM d, yyyy')
    } catch {
      return dateString
    }
  }

  const winnerPlayer = match.players.find(p => p.heroId === match.winnerId)
  const winnerHero = winnerPlayer ? getHeroById(winnerPlayer.heroId) : null

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground">{formatMatchDate(match.date)}</span>
        <Badge variant="outline" className="text-xs">
          Logged by {match.loggedByName}
        </Badge>
      </div>

      <div className="space-y-1">
        {match.players.map((player, idx) => {
          const hero = getHeroById(player.heroId)
          const isWinner = player.heroId === match.winnerId
          return (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="font-medium min-w-0 truncate">
                {player.playerName}
              </span>
              <span className="text-muted-foreground">as</span>
              <span className="text-muted-foreground truncate">
                {hero ? getHeroDisplayName(hero) : player.heroId}
              </span>
              {isWinner && <span className="flex-shrink-0">🏆</span>}
            </div>
          )
        })}
      </div>

      {match.isDraw && (
        <Badge variant="secondary" className="mt-2">Draw</Badge>
      )}
      {match.cooperativeResult && (
        <Badge
          variant={match.cooperativeResult === 'win' ? 'default' : 'secondary'}
          className="mt-2"
        >
          Co-op {match.cooperativeResult === 'win' ? 'Win' : 'Loss'}
        </Badge>
      )}
    </Card>
  )
}
