import { useState, useMemo, useEffect } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { HEROES, getHeroById } from '@/lib/data'
import { calculateHeroStats } from '@/lib/stats'
import { Sword, Trophy, Target, CaretUpDown, Check, Globe, User } from '@phosphor-icons/react'
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
}

export function HeroesTab({ matches, currentUserId }: HeroesTabProps) {
  const [selectedHero, setSelectedHero] = useState('')
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [allMatches, setAllMatches] = useKV<Match[]>('community-all-matches', [])

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

  const filteredHeroes = useMemo(() => {
    const searchLower = search.toLowerCase()
    const filtered = search 
      ? HEROES.filter(
          hero =>
            hero.name.toLowerCase().includes(searchLower) ||
            hero.set.toLowerCase().includes(searchLower)
        )
      : HEROES
    
    return [...filtered].sort((a, b) => a.name.localeCompare(b.name))
  }, [search])

  if (matches.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Sword className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No hero data</h3>
            <p className="text-muted-foreground">
              Log some matches to see hero statistics
            </p>
          </div>
        </div>
      </Card>
    )
  }

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

  const userStats = calculateHeroStats(matches, selectedHero)
  const globalStats = calculateHeroStats(allMatches || [], selectedHero)
  const hero = getHeroById(selectedHero)

  const matchupEntries = Object.entries(userStats.vsMatchups)
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
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-xl font-semibold mb-2">{hero.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {hero.sidekick ? `Fighting alongside ${hero.sidekick}` : 'Fighting alone'}
              </p>
              <div className="space-y-1">
                <Badge variant="outline" className="mr-2">
                  {hero.set}
                </Badge>
              </div>
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
          <p className="text-3xl font-bold">{userStats.totalGames}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 p-2">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Wins</span>
          </div>
          <p className="text-3xl font-bold text-accent">{userStats.wins}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Target className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Losses</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{userStats.losses}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Your Win Rate</span>
          </div>
          <p className="text-3xl font-bold">{userStats.winRate.toFixed(1)}%</p>
          <Progress value={userStats.winRate} className="mt-2 h-2" />
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

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Matchup Statistics</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Performance against other heroes
        </p>
        
        {matchupEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No matchup data yet
          </p>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opponent</TableHead>
                  <TableHead className="text-center">Games</TableHead>
                  <TableHead className="text-center">Wins</TableHead>
                  <TableHead className="text-center">Losses</TableHead>
                  <TableHead>Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchupEntries.map((matchup) => (
                  <TableRow key={matchup.hero!.id}>
                    <TableCell className="font-medium">{matchup.hero!.name}</TableCell>
                    <TableCell className="text-center">{matchup.total}</TableCell>
                    <TableCell className="text-center text-accent">{matchup.wins}</TableCell>
                    <TableCell className="text-center text-destructive">
                      {matchup.total - matchup.wins}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Progress value={matchup.winRate} className="flex-1" />
                        <span className="text-sm font-medium min-w-[48px] text-right">
                          {matchup.winRate.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  )
}
