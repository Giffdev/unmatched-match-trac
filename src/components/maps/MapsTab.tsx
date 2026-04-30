import { useState, useMemo, useEffect } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { MAPS, getHeroById, getMapById } from '@/lib/data'
import { MapTrifold, UsersThree, SquaresFour, Trophy, Sword, Globe, User as UserIcon } from '@phosphor-icons/react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { CaretUpDown, Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { normalizeHeroId } from '@/lib/utils'
import { getAllUserMatches } from '@/lib/firestore'
import { useAuth } from '@/hooks/use-auth'

type MapsTabProps = {
  matches: Match[]
}

type HeroMapPerformance = {
  heroId: string
  heroName: string
  userWins: number
  userLosses: number
  userTotal: number
  userWinRate: number
  globalWins: number
  globalLosses: number
  globalTotal: number
  globalWinRate: number
}

type MapStats = {
  userTotalMatches: number
  globalTotalMatches: number
  heroPerformance: HeroMapPerformance[]
  recentMatches: Match[]
}

function calculateHeroPerformanceOnMap(
  matches: Match[],
): Record<string, { wins: number; losses: number; total: number }> {
  const heroRecord: Record<string, { wins: number; losses: number; total: number }> = {}
  for (const match of matches) {
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
  return heroRecord
}

function calculateMapStats(userMatches: Match[], globalMatches: Match[], mapId: string): MapStats {
  const userMapMatches = userMatches.filter(m => m.mapId === mapId)
  const globalMapMatches = globalMatches.filter(m => m.mapId === mapId)

  const userHeroRecord = calculateHeroPerformanceOnMap(userMapMatches)
  const globalHeroRecord = calculateHeroPerformanceOnMap(globalMapMatches)

  // Merge all hero IDs from both sources
  const allHeroIds = new Set([...Object.keys(userHeroRecord), ...Object.keys(globalHeroRecord)])

  const heroPerformance: HeroMapPerformance[] = Array.from(allHeroIds)
    .map(heroId => {
      const hero = getHeroById(heroId)
      const u = userHeroRecord[heroId] || { wins: 0, losses: 0, total: 0 }
      const g = globalHeroRecord[heroId] || { wins: 0, losses: 0, total: 0 }
      return {
        heroId,
        heroName: hero?.name || heroId,
        userWins: u.wins,
        userLosses: u.losses,
        userTotal: u.total,
        userWinRate: u.total > 0 ? (u.wins / u.total) * 100 : 0,
        globalWins: g.wins,
        globalLosses: g.losses,
        globalTotal: g.total,
        globalWinRate: g.total > 0 ? (g.wins / g.total) * 100 : 0,
      }
    })
    .sort((a, b) => b.globalTotal - a.globalTotal || b.userTotal - a.userTotal)

  const recentMatches = [...userMapMatches].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10)

  return {
    userTotalMatches: userMapMatches.length,
    globalTotalMatches: globalMapMatches.length,
    heroPerformance,
    recentMatches,
  }
}

export function MapsTab({ matches }: MapsTabProps) {
  const [selectedMap, setSelectedMap] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [isLoadingGlobal, setIsLoadingGlobal] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const loadGlobalMatches = async () => {
      setIsLoadingGlobal(true)
      try {
        const data = await getAllUserMatches()
        setAllMatches(data)
      } catch (error) {
        console.error('Error loading global matches:', error)
      } finally {
        setIsLoadingGlobal(false)
      }
    }
    loadGlobalMatches()
  }, [matches])

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
    () => (selectedMap ? calculateMapStats(matches, allMatches, selectedMap) : null),
    [matches, allMatches, selectedMap]
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

                <div className="pt-2 border-t space-y-1.5">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4 text-primary" weight="fill" />
                    <span className="text-sm font-medium">
                      {stats.userTotalMatches} {stats.userTotalMatches === 1 ? 'match' : 'matches'} (yours)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent" />
                    <span className="text-sm font-medium">
                      {stats.globalTotalMatches} {stats.globalTotalMatches === 1 ? 'match' : 'matches'} (all users)
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
              <div className="space-y-4">
                {stats.heroPerformance.map(hero => (
                  <div key={hero.heroId} className="space-y-2 pb-3 border-b border-border/50 last:border-0 last:pb-0">
                    <div className="font-medium text-sm">{hero.heroName}</div>

                    {/* User's stats */}
                    {hero.userTotal > 0 ? (
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" weight="fill" />
                        <div className="flex-1 min-w-0">
                          <Progress value={hero.userWinRate} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap w-28 text-right">
                          {hero.userWins}W–{hero.userLosses}L ({hero.userTotal}) {hero.userWinRate.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 italic">No matches in your logs</span>
                      </div>
                    )}

                    {/* Global stats */}
                    {hero.globalTotal > 0 ? (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <Progress value={hero.globalWinRate} className="h-1.5" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap w-28 text-right">
                          {hero.globalWins}W–{hero.globalLosses}L ({hero.globalTotal}) {hero.globalWinRate.toFixed(0)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground/40 flex-shrink-0" />
                        <span className="text-xs text-muted-foreground/60 italic">No global data</span>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><UserIcon className="w-3 h-3 text-primary" weight="fill" /> Your matches</span>
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-accent" /> All users</span>
                </div>
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
