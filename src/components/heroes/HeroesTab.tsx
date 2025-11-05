import { useState, useMemo } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { HEROES, getHeroById } from '@/lib/data'
import { calculateHeroStats } from '@/lib/stats'
import { Sword, Trophy, Target, CaretUpDown, Check } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type HeroesTabProps = {
  matches: Match[]
}

export function HeroesTab({ matches }: HeroesTabProps) {
  const [selectedHero, setSelectedHero] = useState(HEROES[0]?.id || '')
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

  const stats = calculateHeroStats(matches, selectedHero)
  const hero = getHeroById(selectedHero)

  const matchupEntries = Object.entries(stats.vsMatchups)
    .map(([opponentId, data]) => ({
      hero: getHeroById(opponentId),
      ...data,
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
            <div className="flex-shrink-0">
              {hero.imageUrl ? (
                <img 
                  src={hero.imageUrl} 
                  alt={hero.name}
                  className="w-48 h-72 object-cover rounded-lg border-2 border-border shadow-lg"
                />
              ) : (
                <div className="w-48 h-72 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-lg border-2 border-border flex flex-col items-center justify-center p-4 text-center">
                  <Sword className="w-16 h-16 text-primary mb-4 opacity-40" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground">{hero.name}</h3>
                    {hero.sidekick && (
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">Sidekick:</p>
                        <p>{hero.sidekick}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">{hero.set}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Sword className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Total Games</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalGames}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-accent/10 p-2">
              <Trophy className="w-5 h-5 text-accent" />
            </div>
            <span className="text-sm text-muted-foreground">Wins</span>
          </div>
          <p className="text-3xl font-bold text-accent">{stats.wins}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <Target className="w-5 h-5 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Losses</span>
          </div>
          <p className="text-3xl font-bold text-destructive">{stats.losses}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
          <Progress value={stats.winRate} className="mt-2" />
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
