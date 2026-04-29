import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Match, GameMode, PlayerAssignment } from '@/lib/types'
import { getMapsByPlayerCount, getCooperativeMaps } from '@/lib/data'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Plus, CalendarBlank } from '@phosphor-icons/react'
import { cn, normalizePlayerName } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { MapSelector, PlayerCard, MatchResultSection } from './shared'

type EditMatchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (match: Match) => void
  match: Match
  existingMatches?: Match[]
}

export function EditMatchDialog({ open, onOpenChange, onSave, match, existingMatches = [] }: EditMatchDialogProps) {
  const [mode, setMode] = useState<GameMode>(match.mode)
  const [mapId, setMapId] = useState(match.mapId)
  const [players, setPlayers] = useState<PlayerAssignment[]>(match.players)
  const [winnerId, setWinnerId] = useState<string | undefined>(match.winnerId)
  const [isDraw, setIsDraw] = useState(match.isDraw)
  const [cooperativeResult, setCooperativeResult] = useState<'win' | 'loss' | undefined>(match.cooperativeResult)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    try {
      const [year, month, day] = match.date.split('-').map(Number)
      const parsedDate = new Date(year, month - 1, day)
      return !isNaN(parsedDate.getTime()) ? parsedDate : new Date()
    } catch {
      return new Date()
    }
  })

  useEffect(() => {
    if (open) {
      setMode(match.mode)
      setMapId(match.mapId)
      setPlayers(match.players)
      setWinnerId(match.winnerId)
      setIsDraw(match.isDraw)
      setCooperativeResult(match.cooperativeResult)
      try {
        const [year, month, day] = match.date.split('-').map(Number)
        const parsedDate = new Date(year, month - 1, day)
        setSelectedDate(!isNaN(parsedDate.getTime()) ? parsedDate : new Date())
      } catch {
        setSelectedDate(new Date())
      }
    }
  }, [open, match])

  const isCooperative = mode === 'cooperative'
  const playerCount = isCooperative 
    ? players.length 
    : mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : mode === 'ffa4' ? 4 : 2
  
  const availableMaps = isCooperative ? getCooperativeMaps() : getMapsByPlayerCount(playerCount)

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode)
    setMapId('')
    
    if (newMode === 'cooperative') {
      setPlayers([{ playerName: '', heroId: '', turnOrder: 1 }])
    } else {
      const count = newMode === '1v1' ? 2 : newMode === '2v2' ? 4 : newMode === 'ffa3' ? 3 : newMode === 'ffa4' ? 4 : 2
      const newPlayers: PlayerAssignment[] = []
      for (let i = 0; i < count; i++) {
        newPlayers.push(players[i] || { playerName: '', heroId: '', turnOrder: i + 1 })
      }
      setPlayers(newPlayers)
    }
  }

  const handleAddPlayer = () => {
    if (isCooperative && players.length < 4) {
      setPlayers([...players, { playerName: '', heroId: '', turnOrder: players.length + 1 }])
    }
  }

  const handleRemovePlayer = (index: number) => {
    if (isCooperative && players.length > 1) {
      const newPlayers = players.filter((_, i) => i !== index)
      newPlayers.forEach((p, i) => p.turnOrder = i + 1)
      setPlayers(newPlayers)
    }
  }

  const handleSubmit = () => {
    if (!mapId) {
      toast.error('Please select a map')
      return
    }

    for (const player of players) {
      if (!player.playerName.trim()) {
        toast.error('Please enter all player names')
        return
      }
      if (!player.heroId) {
        toast.error('Please select heroes for all players')
        return
      }
    }

    if (!isCooperative && !isDraw && !winnerId) {
      toast.error('Please select a winner or mark as draw')
      return
    }

    if (isCooperative && !cooperativeResult) {
      toast.error('Please select win or loss')
      return
    }

    if (!selectedDate) {
      toast.error('Please select a date')
      return
    }

    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const normalizedPlayers = players.map(player => ({
      ...player,
      playerName: normalizePlayerName(player.playerName)
    }))

    const updatedMatch: Match = {
      ...match,
      date: dateString,
      mode,
      mapId,
      players: normalizedPlayers,
      winnerId: isCooperative || isDraw ? undefined : winnerId,
      isDraw: isCooperative ? false : isDraw,
      cooperativeResult: isCooperative ? cooperativeResult : undefined,
    }

    onSave(updatedMatch)
    toast.success('Match updated successfully!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
          <DialogTitle>Edit Match</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4 px-6 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarBlank className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Game Mode</Label>
            <Select value={mode} onValueChange={(v) => handleModeChange(v as GameMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1v1">1v1 Competitive</SelectItem>
                <SelectItem value="2v2">2v2 Competitive</SelectItem>
                <SelectItem value="ffa3">3 Player Free For All</SelectItem>
                <SelectItem value="ffa4">4 Player Free For All</SelectItem>
                <SelectItem value="cooperative">Cooperative</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Map</Label>
            <MapSelector 
              value={mapId} 
              onChange={setMapId}
              availableMaps={availableMaps}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Players & Heroes</Label>
              {isCooperative && players.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddPlayer}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Player
                </Button>
              )}
            </div>
            {players.map((player, index) => (
              <PlayerCard
                key={`player-${player.heroId || index}-${player.turnOrder}`}
                player={player}
                index={index}
                isCooperative={isCooperative}
                canRemove={players.length > 1}
                existingMatches={existingMatches}
                onPlayerNameChange={(value) => {
                  const newPlayers = [...players]
                  newPlayers[index].playerName = value
                  setPlayers(newPlayers)
                }}
                onHeroChange={(heroId) => {
                  const newPlayers = [...players]
                  newPlayers[index].heroId = heroId
                  if (heroId === 'yennefer-triss' && !newPlayers[index].heroVariant) {
                    newPlayers[index].heroVariant = 'yennefer'
                  } else if (heroId !== 'yennefer-triss') {
                    delete newPlayers[index].heroVariant
                  }
                  setPlayers(newPlayers)
                }}
                onVariantChange={(variant) => {
                  const newPlayers = [...players]
                  newPlayers[index].heroVariant = variant
                  setPlayers(newPlayers)
                }}
                onRemove={() => handleRemovePlayer(index)}
              />
            ))}
          </div>

          <MatchResultSection
            isCooperative={isCooperative}
            players={players}
            winnerId={winnerId}
            setWinnerId={setWinnerId}
            isDraw={isDraw}
            setIsDraw={setIsDraw}
            cooperativeResult={cooperativeResult}
            setCooperativeResult={setCooperativeResult}
          />
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 shrink-0 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
