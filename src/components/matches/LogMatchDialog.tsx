import { useState, useEffect, useMemo } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { Match, GameMode, PlayerAssignment } from '@/lib/types'
import { HEROES, getMapsByPlayerCount } from '@/lib/data'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Check, CaretUpDown } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type LogMatchDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (match: Match) => void
  prefilled?: Partial<Match>
}

type HeroSelectorProps = {
  value: string
  onChange: (heroId: string) => void
  variant?: string
  onVariantChange?: (variant: string) => void
}

function HeroSelector({ value, onChange, variant, onVariantChange }: HeroSelectorProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredHeroes = useMemo(() => {
    if (!search) return HEROES
    const searchLower = search.toLowerCase()
    return HEROES.filter(
      hero =>
        hero.name.toLowerCase().includes(searchLower) ||
        hero.set.toLowerCase().includes(searchLower)
    )
  }, [search])

  const selectedHero = HEROES.find(h => h.id === value)
  const isYenneferTriss = value === 'yennefer-triss'

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedHero ? (
              <span className="truncate">
                {selectedHero.name}
                <span className="text-xs text-muted-foreground ml-2">({selectedHero.set})</span>
              </span>
            ) : (
              "Select hero..."
            )}
            <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput 
              placeholder="Search heroes..." 
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>No hero found.</CommandEmpty>
              <CommandGroup>
                {filteredHeroes.map((hero) => (
                  <CommandItem
                    key={hero.id}
                    value={hero.id}
                    onSelect={() => {
                      onChange(hero.id)
                      setOpen(false)
                      setSearch('')
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === hero.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div>{hero.name}</div>
                      <div className="text-xs text-muted-foreground">{hero.set}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {isYenneferTriss && onVariantChange && (
        <RadioGroup value={variant || 'yennefer'} onValueChange={onVariantChange}>
          <div className="flex gap-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="yennefer" id={`yennefer-${value}`} />
              <Label htmlFor={`yennefer-${value}`} className="cursor-pointer font-normal">
                Yennefer (Hero)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="triss" id={`triss-${value}`} />
              <Label htmlFor={`triss-${value}`} className="cursor-pointer font-normal">
                Triss (Hero)
              </Label>
            </div>
          </div>
        </RadioGroup>
      )}
    </div>
  )
}

export function LogMatchDialog({ open, onOpenChange, onSave, prefilled }: LogMatchDialogProps) {
  const [mode, setMode] = useState<GameMode>(prefilled?.mode || '1v1')
  const [mapId, setMapId] = useState(prefilled?.mapId || '')
  const [players, setPlayers] = useState<PlayerAssignment[]>(
    prefilled?.players || [
      { playerName: '', heroId: '', turnOrder: 1 },
      { playerName: '', heroId: '', turnOrder: 2 },
    ]
  )
  const [winnerId, setWinnerId] = useState<string | undefined>(prefilled?.winnerId)
  const [isDraw, setIsDraw] = useState(prefilled?.isDraw || false)
  const [currentUserId] = useKV<string | null>('current-user-id', null)

  const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : mode === 'ffa4' ? 4 : 2
  const availableMaps = getMapsByPlayerCount(playerCount)

  const handleModeChange = (newMode: GameMode) => {
    setMode(newMode)
    const count = newMode === '1v1' ? 2 : newMode === '2v2' ? 4 : newMode === 'ffa3' ? 3 : newMode === 'ffa4' ? 4 : 2
    
    const newPlayers: PlayerAssignment[] = []
    for (let i = 0; i < count; i++) {
      newPlayers.push(players[i] || { playerName: '', heroId: '', turnOrder: i + 1 })
    }
    setPlayers(newPlayers)
  }

  const handleSubmit = () => {
    if (!currentUserId) {
      toast.error('Please sign in to log matches')
      return
    }

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

    if (!isDraw && !winnerId) {
      toast.error('Please select a winner or mark as draw')
      return
    }

    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const match: Match = {
      id: crypto.randomUUID(),
      date: dateString,
      mode,
      mapId,
      players,
      winnerId: isDraw ? undefined : winnerId,
      isDraw,
      userId: currentUserId,
    }

    onSave(match)
    toast.success('Match logged successfully!')
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setMode('1v1')
    setMapId('')
    setPlayers([
      { playerName: '', heroId: '', turnOrder: 1 },
      { playerName: '', heroId: '', turnOrder: 2 },
    ])
    setWinnerId(undefined)
    setIsDraw(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log Match</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
            <Select value={mapId} onValueChange={setMapId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a map" />
              </SelectTrigger>
              <SelectContent>
                {availableMaps.map((map) => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name} <span className="text-xs text-muted-foreground">({map.minPlayers === map.maxPlayers ? `${map.minPlayers}p` : `${map.minPlayers}-${map.maxPlayers}p`})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Players & Heroes</Label>
            {players.map((player, index) => (
              <div key={index} className="flex gap-3 items-start p-4 rounded-lg border bg-card">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 space-y-3">
                  <Input
                    placeholder="Player name"
                    value={player.playerName}
                    onChange={(e) => {
                      const newPlayers = [...players]
                      newPlayers[index].playerName = e.target.value
                      setPlayers(newPlayers)
                    }}
                  />
                  <HeroSelector
                    value={player.heroId}
                    onChange={(heroId) => {
                      const newPlayers = [...players]
                      newPlayers[index].heroId = heroId
                      if (heroId === 'yennefer-triss' && !newPlayers[index].heroVariant) {
                        newPlayers[index].heroVariant = 'yennefer'
                      } else if (heroId !== 'yennefer-triss') {
                        delete newPlayers[index].heroVariant
                      }
                      setPlayers(newPlayers)
                    }}
                    variant={player.heroVariant}
                    onVariantChange={(variant) => {
                      const newPlayers = [...players]
                      newPlayers[index].heroVariant = variant
                      setPlayers(newPlayers)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <Label>Result</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="draw-checkbox"
                  checked={isDraw}
                  onChange={(e) => {
                    setIsDraw(e.target.checked)
                    if (e.target.checked) setWinnerId(undefined)
                  }}
                  className="w-4 h-4 rounded border-input"
                />
                <Label htmlFor="draw-checkbox" className="cursor-pointer font-normal">
                  Draw
                </Label>
              </div>
            </div>
            
            {!isDraw && (
              <RadioGroup value={winnerId} onValueChange={setWinnerId}>
                <div className="space-y-2">
                  {players.map((player, index) => {
                    const hero = HEROES.find(h => h.id === player.heroId)
                    const displayName = hero?.id === 'yennefer-triss' 
                      ? `${hero.name} (${player.heroVariant === 'triss' ? 'Triss as Hero' : 'Yennefer as Hero'})`
                      : hero?.name || 'No hero selected'
                    
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <RadioGroupItem value={player.heroId} id={`winner-${index}`} />
                        <Label htmlFor={`winner-${index}`} className="cursor-pointer font-normal">
                          {player.playerName || `Player ${index + 1}`} - {displayName}
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Save Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
