import { useState } from 'react'
import type { Match } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HEROES, getHeroById } from '@/lib/data'
import { calculateHeroStats } from '@/lib/stats'
import { Sword, Trophy, Target } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type HeroesTabProps = {
  matches: Match[]
}

export function HeroesTab({ matches }: HeroesTabProps) {
  const [selectedHero, setSelectedHero] = useState(HEROES[0]?.id || '')

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Hero Statistics</h2>
        <Select value={selectedHero} onValueChange={setSelectedHero}>
          <SelectTrigger className="max-w-md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {HEROES.map((h) => (
              <SelectItem key={h.id} value={h.id}>
                {h.name} <span className="text-xs text-muted-foreground">({h.set})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
