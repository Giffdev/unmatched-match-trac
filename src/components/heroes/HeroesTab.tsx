import { useState, useMemo, useEffect } from 'react'
import type { Match, User } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { getSelectableHeroes, getHeroById } from '@/lib/data'
import { calculateHeroStats, calculateUserHeroStats } from '@/lib/stats'
import { Sword, Trophy, Target, CaretUpDown, Check, Globe, User as UserIcon } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useKV } from '@github/spark/hooks'
import { HeroImage } from './HeroImage'

type HeroesTabProps = {
  matches: Match[]
  currentUserId: string | null
  initialSelectedHero?: string | null
  onHeroChange?: () => void
}

export function HeroesTab({ matches, currentUserId, initialSelectedHero, onHeroChange }: HeroesTabProps) {
  const [selectedHero, setSelectedHero] = useState(initialSelectedHero || '')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [allMatches, setAllMatches] = useKV<Match[]>('community-all-matches', [])
  const [users] = useKV<User[]>('users', [])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (currentUserId && users) {
      const user = users.find(u => u.id === currentUserId)
      setCurrentUser(user || null)
    } else {
      setCurrentUser(null)
    }
  }, [currentUserId, users])

  useEffect(() => {
    if (initialSelectedHero) {
      setSelectedHero(initialSelectedHero)
      onHeroChange?.()
    }
  }, [initialSelectedHero, onHeroChange])

  useEffect(() => {
    const updateCommunityMatches = async () => {
      if (!currentUserId) return
      
      const keys = await window.spark.kv.keys()
      const matchKeys = keys.filter(k => k.startsWith('matches-'))
      
      const allMatchesData: Match[] = []
      for (const key of matchKeys) {
        const userMatches = await window.spark.kv.get<Match[]>(key)
        if (userMatches) {
          allMatchesData.push(...userMatches)
        }
      }
      
      setAllMatches(allMatchesData)
    }
    
    updateCommunityMatches()
  }, [matches.length, currentUserId])

  const selectableHeroes = getSelectableHeroes()

  const filteredHeroes = useMemo(() => {
    const searchLower = search.toLowerCase()
    const filtered = search 
      ? selectableHeroes.filter(
          hero =>
            hero.name.toLowerCase().includes(searchLower) ||
            hero.set.toLowerCase().includes(searchLower)
        )
      : selectableHeroes
    
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }, [search, selectableHeroes])

  if (!selectedHero) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Hero Statistics</h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="max-w-md w-full justify-between"
              >
                Select hero...
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
                    {filteredHeroes.map((h) => (
                      <CommandItem
                        key={h.id}
                        value={h.id}
                        onSelect={() => {
                          setSelectedHero(h.id)
                          setOpen(false)
                          setSearch('')
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedHero === h.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex-1">
                          <div>{h.name}</div>
                          <div className="text-xs text-muted-foreground">{h.set}</div>
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
              <Sword className="w-12 h-12 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Select a hero</h3>
              <p className="text-muted-foreground">
                Choose a hero from the list above to view their statistics
              </p>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const userStats = calculateUserHeroStats(matches, selectedHero, currentUser?.playerName)
  const userAllHeroStats = calculateUserHeroStats(matches, selectedHero)
  const globalStats = calculateHeroStats(allMatches || [], selectedHero)
  const hero = getHeroById(selectedHero)

  const matchupEntries = Object.entries(userAllHeroStats.vsMatchups)
    .map(([opponentId, data]) => ({
      hero: getHeroById(opponentId),
      wins: data.wins,
      total: data.total,
      winRate: data.total > 0 ? (data.wins / data.total) * 100 : 0,
    }))
    .filter(m => m.hero)
    .sort((a, b) => b.total - a.total)

  const selectedHeroData = getHeroById(selectedHero)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Hero Statistics</h2>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="max-w-md w-full justify-between"
            >
              {selectedHeroData ? (
                <span className="truncate">
                  {selectedHeroData.name}
                  <span className="text-xs text-muted-foreground ml-2">({selectedHeroData.set})</span>
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
                  {filteredHeroes.map((h) => (
                    <CommandItem
                      key={h.id}
                      value={h.id}
                      onSelect={() => {
                        setSelectedHero(h.id)
                        setOpen(false)
                        setSearch('')
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedHero === h.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div>{h.name}</div>
                        <div className="text-xs text-muted-foreground">{h.set}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {hero && (
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <HeroImage hero={hero} className="w-48 h-72 flex-shrink-0" />
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{hero.name}</h3>
                <Badge variant="outline" className="mr-2">
                  {hero.set}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Health</p>
                  <p className="text-2xl font-bold text-accent">{hero.hp}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Movement</p>
                  <p className="text-2xl font-bold text-primary">{hero.move}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Attack Type</p>
                  <p className="text-2xl font-bold">{hero.attack}</p>
                </div>
              </div>

              {(hero.abilityTitle || hero.abilityDescription) && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-semibold text-muted-foreground">Special Ability</p>
                  {hero.abilityTitle && (
                    <p className="text-base font-bold text-primary">{hero.abilityTitle}</p>
                  )}
                  {hero.abilityDescription && (
                    <p className="text-sm text-foreground leading-relaxed">{hero.abilityDescription}</p>
                  )}
                </div>
              )}

              {hero.sidekicks && hero.sidekicks.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-sm font-semibold text-muted-foreground">Sidekicks</p>
                  <div className="space-y-2">
                    {hero.sidekicks.map((sidekick, idx) => (
                      <div key={idx} className="flex items-center gap-4 text-sm">
                        <span className="font-medium">{sidekick.name}</span>
                        <span className="text-muted-foreground">×{sidekick.count}</span>
                        {sidekick.hp && (
                          <span className="text-accent">HP: {sidekick.hp}</span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {sidekick.attack}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Sword className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Games</span>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="flex items-center gap-1">
              <UserIcon className="w-4 h-4 text-primary" />
              <p className="text-3xl font-bold">{userAllHeroStats.totalGames}</p>
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-accent" />
              <p className="text-3xl font-bold text-accent">{globalStats.totalGames}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 p-2">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Wins</span>
          </div>
          <p className="text-3xl font-bold text-accent">{userAllHeroStats.wins}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Target className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Losses</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{userAllHeroStats.losses}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Your Win Rate</span>
          </div>
          <p className="text-3xl font-bold">{userAllHeroStats.winRate.toFixed(1)}%</p>
          <Progress value={userAllHeroStats.winRate} className="mt-2 h-2" />
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 p-2">
              <Globe className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Global Win Rate</span>
          </div>
          {globalStats.totalGames > 0 ? (
            <>
              <p className="text-3xl font-bold text-accent">{globalStats.winRate.toFixed(1)}%</p>
              <Progress value={globalStats.winRate} className="mt-2 h-2" />
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">No global data yet</p>
          )}
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Matchup Statistics</h3>
        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4">
          Performance against other heroes
        </p>
        
        {matchupEntries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              {matches.length === 0 
                ? "Log matches with this hero to see matchup statistics"
                : "No matchup data yet for this hero"}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden -mx-4 md:mx-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm">Opponent</TableHead>
                    <TableHead className="text-center text-xs md:text-sm">Games</TableHead>
                    <TableHead className="text-center text-xs md:text-sm">W</TableHead>
                    <TableHead className="text-center text-xs md:text-sm">L</TableHead>
                    <TableHead className="text-xs md:text-sm hidden sm:table-cell">Win Rate</TableHead>
                    <TableHead className="sm:hidden text-xs">WR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matchupEntries.map((matchup) => (
                    <TableRow key={matchup.hero!.id}>
                      <TableCell className="font-medium text-xs md:text-sm">{matchup.hero!.name}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm">{matchup.total}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm text-accent">{matchup.wins}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm text-destructive">
                        {matchup.total - matchup.wins}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-3">
                          <Progress value={matchup.winRate} className="flex-1" />
                          <span className="text-sm font-medium min-w-[48px] text-right">
                            {matchup.winRate.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="sm:hidden text-center text-xs font-medium">
                        {matchup.winRate.toFixed(0)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
