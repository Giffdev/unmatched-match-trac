import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { getUserMatches } from '@/lib/firestore'
import { getGroupMatches } from '@/lib/group-matches'
import { importMatchesToGroup } from '@/lib/groups'
import { getHeroById, getMapById } from '@/lib/data'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { Match } from '@/lib/types'

type ImportMatchesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  onImportComplete?: () => void
}

export function ImportMatchesDialog({ open, onOpenChange, groupId, onImportComplete }: ImportMatchesDialogProps) {
  const { user } = useAuth()
  const [personalMatches, setPersonalMatches] = useState<Match[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)

  useEffect(() => {
    if (!open || !user?.uid) return
    setLoading(true)
    setSelectedIds(new Set())

    Promise.all([
      getUserMatches(user.uid),
      getGroupMatches(groupId).then(r => r.matches),
    ]).then(([personal, groupMatches]) => {
      // Build set of sourceMatchIds already in group for reliable deduplication
      const importedSourceIds = new Set(
        groupMatches
          .map(m => (m as any).sourceMatchId)
          .filter(Boolean)
      )

      // Filter out personal matches already imported (by sourceMatchId or groupRef)
      const filtered = personal.filter(m => {
        const hasGroupRef = (m as any).groupRef?.groupId === groupId
        const alreadyImported = importedSourceIds.has(m.id)
        return !hasGroupRef && !alreadyImported
      })
      setPersonalMatches(filtered)
      setLoading(false)
    }).catch(() => {
      toast.error('Failed to load matches')
      setLoading(false)
    })
  }, [open, user?.uid, groupId])

  const allSelected = personalMatches.length > 0 && selectedIds.size === personalMatches.length

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(personalMatches.map(m => m.id)))
    }
  }

  const toggleMatch = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = async () => {
    if (!user?.uid || selectedIds.size === 0) return
    setImporting(true)
    try {
      const matchesToImport = personalMatches.filter(m => selectedIds.has(m.id))
      const userName = user.displayName || user.email || 'Unknown'
      const result = await importMatchesToGroup(groupId, matchesToImport, user.uid, userName)
      toast.success(`Imported ${result.imported} match${result.imported !== 1 ? 'es' : ''} to group`)
      onImportComplete?.()
      onOpenChange(false)
    } catch (err) {
      toast.error('Failed to import matches')
    } finally {
      setImporting(false)
    }
  }

  const getMatchSummary = (match: Match) => {
    const heroes = match.players.map(p => {
      const hero = getHeroById(p.heroId)
      return hero?.name || p.heroId
    })
    const map = getMapById(match.mapId)
    const winner = match.isDraw
      ? 'Draw'
      : match.winnerId
        ? match.players.find(p => p.heroId === match.winnerId)?.playerName || 'Winner'
        : match.cooperativeResult === 'win' ? 'Win' : match.cooperativeResult === 'loss' ? 'Loss' : ''

    return { heroes, mapName: map?.name || match.mapId, winner, date: match.date }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Matches to Group</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">Loading your matches...</p>
        ) : personalMatches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No importable matches found. All your matches are already in this group.
          </p>
        ) : (
          <>
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Checkbox
                checked={allSelected}
                onCheckedChange={toggleAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Select All ({personalMatches.length} matches)
              </label>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 min-h-0 py-2">
              {personalMatches.map(match => {
                const { heroes, mapName, winner, date } = getMatchSummary(match)
                return (
                  <div
                    key={match.id}
                    className="flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleMatch(match.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(match.id)}
                      onCheckedChange={() => toggleMatch(match.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {heroes.map((h, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {h}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{mapName}</span>
                        <span>·</span>
                        <span>{winner}</span>
                        <span>·</span>
                        <span>{format(new Date(date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedIds.size === 0 || importing}
          >
            {importing ? 'Importing...' : `Import ${selectedIds.size} Match${selectedIds.size !== 1 ? 'es' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
