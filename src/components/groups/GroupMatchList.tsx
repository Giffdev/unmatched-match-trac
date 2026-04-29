import { Button } from '@/components/ui/button'
import { WarningCircle } from '@phosphor-icons/react'
import { useGroupMatches } from '@/hooks/use-group-matches'
import { MatchCard } from '@/components/matches/MatchCard'

type GroupMatchListProps = {
  groupId: string
}

export function GroupMatchList({ groupId }: GroupMatchListProps) {
  const { matches, loading, error, loadMore, hasMore, refetch } = useGroupMatches(groupId)

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading matches...</p>
  }

  if (error) {
    return (
      <div className="text-center py-8 space-y-3">
        <WarningCircle size={36} className="mx-auto text-destructive" />
        <p className="text-sm text-destructive font-medium">Failed to load matches</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
        <Button variant="outline" size="sm" onClick={refetch}>
          Try Again
        </Button>
      </div>
    )
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
        <MatchCard
          key={match.id}
          match={match}
          onHeroClick={() => {}}
          subtitle={`Logged by ${match.loggedByName}`}
        />
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

