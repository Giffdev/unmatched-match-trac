import { useState, useEffect } from 'react'
import type { Match, User } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Trophy, CalendarDots, Upload } from '@phosphor-icons/react'
import { LogMatchDialog } from './LogMatchDialog'
import { MatchCard } from './MatchCard'
import { CsvImportDialog } from './CsvImportDialog'
import { useKV } from '@github/spark/hooks'

type MatchesTabProps = {
  matches: Match[]
  setMatches: (updater: (matches: Match[]) => Match[]) => void
}

export function MatchesTab({ matches, setMatches }: MatchesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [currentUserId] = useKV<string | null>('current-user-id', null)
  const [users] = useKV<User[]>('users', [])

  useEffect(() => {
    if (currentUserId && users) {
      const user = users.find(u => u.id === currentUserId)
      if (user) {
        setUserEmail(user.email)
      }
    }
  }, [currentUserId, users])

  const sortedMatches = [...matches].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const showImportButton = userEmail === 'giffdev@gmail.com'

  const handleImport = (importedMatches: Match[]) => {
    setMatches(current => [...current, ...importedMatches])
  }

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
        <div className="flex gap-2">
          {showImportButton && (
            <Button onClick={() => setImportDialogOpen(true)} size="lg" variant="outline">
              <Upload className="mr-2" />
              Import CSV
            </Button>
          )}
          <Button onClick={() => setDialogOpen(true)} size="lg">
            <Plus className="mr-2" />
            Log Match
          </Button>
        </div>
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
            />
          ))}
        </div>
      )}

      <LogMatchDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        onSave={(match) => setMatches(current => [...current, match])}
      />

      <CsvImportDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        currentUserId={currentUserId || ''}
      />
    </div>
  )
}
