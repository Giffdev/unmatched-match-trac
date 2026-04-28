import { useState, useMemo } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MAPS, getHeroById, getMapById } from '@/lib/data'
import { MapTrifold, UsersThree, SquaresFour, Trophy, Sword } from '@phosphor-icons/react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CaretUpDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { normalizeHeroId } from '@/lib/utils'

type MapsTabProps = {
  matches: Match[]
}

type MapStats = {
  totalMatches: number
  heroPerformance: {
    heroId: string
    heroName: string
    wins: number
    losses: number
    total: number
    winRate: number
  }[]
  recentMatches: Match[]
}

function calculateMapStats(matches: Match[], mapId: string): MapStats {
  const mapMatches = matches.filter(m => m.mapId === mapId)

  const heroRecord: Record<string, { wins: number; losses: number; total: number }> = {}

  for (const match of mapMatches) {
    for (const player of match.players) {
      const heroId = normalizeHeroId(player.heroId)
      if (!heroRecord[heroId]) {
        heroRecord[heroId] = { wins: 0, losses: 0, total: 0 }
      }
      heroRecord[heroId].total++

      if (!match.isDraw) {
        const winnerHeroId = match.winnerId ? normalizeHeroId(match.winnerId) : null
        if (winnerHeroId === heroId) {
          heroRecord[heroId].wins++
        } else {
          heroRecord[heroId].losses++
        }
      }
    }
  }

  const heroPerformance = Object.entries(heroRecord)
    .map(([heroId, data]) => {
      const hero = getHeroById(heroId)
      return {
        heroId,
        heroName: hero?.name || heroId,
        wins: data.wins,
        losses: data.losses,
        total: data.total,
        winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
      }
    })
    .sort((a, b) => b.total - a.total || b.winRate - a.winRate)

  const recentMatches = [...mapMatches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return { totalMatches: mapMatches.length, heroPerformance, recentMatches }
}

export function MapsTab({ matches }: MapsTabProps) {
  const [selectedMap, setSelectedMap] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const sortedMaps = useMemo(() => {
    return [...MAPS].sort((a, b) => a.name.localeCompare(b.name))
  }, [])

  const filteredMaps = useMemo(() => {
    const searchLower = search.toLowerCase()
    return search
      ? sortedMaps.filter(
          m =>
            m.name.toLowerCase().includes(searchLower) ||
            m.set.toLowerCase().includes(searchLower)
        )
      : sortedMaps
  }, [search, sortedMaps])

  // Precompute match counts per map for badges
  const matchCountByMap = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const match of matches) {
      counts[match.mapId] = (counts[match.mapId] || 0) + 1
    }
    return counts
  }, [matches])

  const mapData = selectedMap ? getMapById(selectedMap) : null
  const stats = useMemo(
    () => (selectedMap ? calculateMapStats(matches, selectedMap) : null),
    [matches, selectedMap]
  )

  const selectedMapData = getMapById(selectedMap)

  if (!selectedMap) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Map Explorer</h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="max-w-md w-full justify-between"
              >
                Select map...
                <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search maps..."
                  value={search}
                  onValueChange={setSearch}
                />
                <CommandList>
                  <CommandEmpty>No map found.</CommandEmpty>
                  <CommandGroup>
                    {filteredMaps.map(m => (
                      <CommandItem
                        key={m.id}
                        value={m.id}
                        onSelect={() => {
                          setSelectedMap(m.id)
                          setOpen(false)
                          setSearch('')
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedMap === m.id ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <div>
                            <div>{m.name}</div>
                            <div className="text-xs text-muted-foreground">{m.set}</div>
                          </div>
                          {matchCountByMap[m.id] && (
                            <Badge variant="secondary" className="text-xs ml-2">
                              {matchCountByMap[m.id]} {matchCountByMap[m.id] === 1 ? 'match' : 'matches'}
                            </Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-6">
              <MapTrifold className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Select a map</h3>
              <p className="text-muted-foreground">
                Choose a map from the list above to view details and match statistics
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Map Explorer</h2>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="max-w-md w-full justify-between"
            >
              {selectedMapData ? (
                <span className="truncate">
                  {selectedMapData.name}
                  <span className="text-xs text-muted-foreground ml-2">({selectedMapData.set})</span>
                </span>
              ) : (
                'Select map...'
              )}
              <CaretUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="Search maps..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                <CommandEmpty>No map found.</CommandEmpty>
                <CommandGroup>
                  {filteredMaps.map(m => (
                    <CommandItem
                      key={m.id}
                      value={m.id}
                      onSelect={() => {
                        setSelectedMap(m.id)
                        setOpen(false)
                        setSearch('')
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedMap === m.id ? 'opacity-100' : 'opacity-0'
                        )}
                      />
                      <div className="flex-1 flex items-center justify-between">
                        <div>
                          <div>{m.name}</div>
                          <div className="text-xs text-muted-foreground">{m.set}</div>
                        </div>
                        {matchCountByMap[m.id] && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            {matchCountByMap[m.id]} {matchCountByMap[m.id] === 1 ? 'match' : 'matches'}
                          </Badge>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {mapData && stats && (
        <>
          {/* Map Info Card */}
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Map summary info first */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{mapData.name}</h3>
                  <Badge variant="outline">{mapData.set}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Players</p>
                    <div className="flex items-center gap-1.5">
                      <UsersThree className="w-5 h-5 text-primary" />
                      <p className="text-2xl font-bold text-primary">
                        {mapData.minPlayers === mapData.maxPlayers
                          ? mapData.minPlayers
                          : `${mapData.minPlayers}–${mapData.maxPlayers}`}
                      </p>
                    </div>
                  </div>
                  {mapData.zones != null && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Zones</p>
                      <div className="flex items-center gap-1.5">
                        <SquaresFour className="w-5 h-5 text-accent" />
                        <p className="text-2xl font-bold text-accent">{mapData.zones}</p>
                      </div>
                    </div>
                  )}
                  {mapData.spaces != null && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Spaces</p>
                      <p className="text-2xl font-bold">{mapData.spaces}</p>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {stats.totalMatches} {stats.totalMatches === 1 ? 'match' : 'matches'} played
                    </span>
                  </div>
                </div>
              </div>

              {/* Map image */}
              {mapData.imageUrl ? (
                <div className="w-full md:w-80 flex-shrink-0">
                  <img
                    src={mapData.imageUrl}
                    alt={mapData.name}
                    className="w-full rounded-lg border border-border object-cover"
                  />
                </div>
              ) : (
                <div className="w-full md:w-80 flex-shrink-0 h-48 md:h-auto rounded-lg border border-dashed border-border bg-muted/30 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapTrifold className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Hero Performance on this Map */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sword className="w-5 h-5 text-primary" weight="fill" />
              <h3 className="text-lg font-semibold">Hero Performance on This Map</h3>
            </div>

            {stats.heroPerformance.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No matches recorded on this map yet
              </p>
            ) : (
              <div className="space-y-3">
                {stats.heroPerformance.map(hero => (
                  <div key={hero.heroId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium truncate mr-2">{hero.heroName}</span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        {hero.wins}W – {hero.losses}L
                        <span className="ml-1.5 text-xs">
                          ({hero.total} {hero.total === 1 ? 'match' : 'matches'})
                        </span>
                      </span>
                    </div>
                    <Progress value={hero.winRate} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Matches on this Map */}
          {stats.recentMatches.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Matches</h3>
              <div className="space-y-2">
                {stats.recentMatches.map(match => {
                  const winner = match.isDraw
                    ? null
                    : match.players.find(p => normalizeHeroId(p.heroId) === normalizeHeroId(match.winnerId || ''))
                  const winnerHero = match.winnerId ? getHeroById(normalizeHeroId(match.winnerId)) : null

                  return (
                    <div
                      key={match.id}
                      className="flex items-center gap-2 text-sm py-2 border-b border-border/50 last:border-0"
                    >
                      <span className="text-muted-foreground text-xs w-20 flex-shrink-0">
                        {new Date(match.date + 'T00:00:00').toLocaleDateString()}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-1">
                          {match.players.map((p, i) => {
                            const hero = getHeroById(normalizeHeroId(p.heroId))
                            const isWinner = winner && p.playerName === winner.playerName
                            return (
                              <span key={i} className="inline-flex items-center gap-1">
                                {i > 0 && <span className="text-muted-foreground mx-1">vs</span>}
                                <span className={isWinner ? 'font-semibold text-yellow-600 dark:text-yellow-400' : ''}>
                                  {p.playerName}
                                </span>
                                <span className="text-muted-foreground">
                                  ({hero?.name || p.heroId})
                                </span>
                                {isWinner && <Trophy className="w-3.5 h-3.5 text-yellow-500 inline" weight="fill" />}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
