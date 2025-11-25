import { useState } from 'react'
import type { Match, Map } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { getAllPlayerNames, calculatePlayerStats } from '@/lib/stats'
import { getHeroById, getMapById, getSelectableHeroes, MAPS } from '@/lib/data'
import { Trophy, Target, Sword, MapPin, Users } from '@phosphor-icons/react'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useKV } from '@github/spark/hooks'
import { MapImageDialog } from './MapImageDialog'

type PlayersTabProps = {
  matches: Match[]
  ownedSets?: string[]
  onHeroClick?: (heroId: string) => void
}

export function PlayersTab({ matches, ownedSets = [], onHeroClick }: PlayersTabProps) {
  const playerNames = getAllPlayerNames(matches)
  const [selectedPlayer, setSelectedPlayer] = useState(playerNames[0] || '')
  const [showOnlyOwnedHeroes, setShowOnlyOwnedHeroes] = useKV<boolean>('player-filter-collection-heroes', false)
  const [showOnlyOwnedMaps, setShowOnlyOwnedMaps] = useKV<boolean>('player-filter-collection-maps', false)
  const [selectedMap, setSelectedMap] = useState<Map | null>(null)
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)

  const handleMapClick = (mapId: string) => {
    const map = getMapById(mapId)
    if (map) {
      setSelectedMap(map)
      setIsMapDialogOpen(true)
    }
  }

  if (playerNames.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-primary/10 p-6">
            <Target className="w-12 h-12 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">No player data</h3>
            <p className="text-muted-foreground">
              Log some matches to see player statistics
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const stats = calculatePlayerStats(matches, selectedPlayer)
  const heroesPlayedEntries = Object.entries(stats.heroesPlayed).sort((a, b) => b[1] - a[1])
  
  const selectableHeroes = getSelectableHeroes()
  let neverPlayedHeroes = selectableHeroes.filter(h => !stats.heroesPlayed[h.id])
  if ((showOnlyOwnedHeroes ?? false) && ownedSets.length > 0) {
    neverPlayedHeroes = neverPlayedHeroes.filter(h => ownedSets.includes(h.set))
  }
  neverPlayedHeroes = neverPlayedHeroes.sort((a, b) => a.name.localeCompare(b.name))
  
  const mapsPlayedEntries = Object.entries(stats.mapsPlayed).sort((a, b) => b[1] - a[1])
  let neverPlayedMaps = MAPS.filter(m => !stats.mapsPlayed[m.id])
  if ((showOnlyOwnedMaps ?? false) && ownedSets.length > 0) {
    neverPlayedMaps = neverPlayedMaps.filter(m => ownedSets.includes(m.set))
  }
  const vsPlayersEntries = Object.entries(stats.vsPlayers).sort((a, b) => b[1].total - a[1].total)

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Player Statistics</h2>
        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger className="w-full md:max-w-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {playerNames.map((name) => (
              <SelectItem key={name} value={name}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4 md:gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-2">
            <div className="rounded-full bg-primary/10 p-1.5 md:p-2 w-fit">
              <Sword className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <span className="text-xs md:text-sm text-muted-foreground">Total Games</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats.totalGames}</p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-2">
            <div className="rounded-full bg-accent/10 p-1.5 md:p-2 w-fit">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-accent" />
            </div>
            <span className="text-xs md:text-sm text-muted-foreground">Wins</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-accent">{stats.wins}</p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-2">
            <div className="rounded-full bg-destructive/10 p-1.5 md:p-2 w-fit">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-destructive" />
            </div>
            <span className="text-xs md:text-sm text-muted-foreground">Losses</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-destructive">{stats.losses}</p>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col gap-2 mb-2">
            <span className="text-xs md:text-sm text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-2xl md:text-3xl font-bold">{stats.winRate.toFixed(1)}%</p>
          <Progress value={stats.winRate} className="mt-2" />
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <Card className="p-4 md:p-6 overflow-hidden">
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Most Played Heroes</h3>
          <div className="space-y-3">
            {heroesPlayedEntries.slice(0, 10).map(([heroId, count]) => {
              const hero = getHeroById(heroId)
              const winRate = stats.heroWinRates[heroId]
              const winPercentage = winRate ? (winRate.wins / winRate.total) * 100 : 0

              return (
                <div key={heroId} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col min-w-0 flex-1">
                      <span 
                        className={`text-sm font-medium truncate ${onHeroClick ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                        onClick={() => onHeroClick?.(heroId)}
                      >
                        {hero?.name}
                      </span>
                      {hero?.sidekicks && hero.sidekicks.length > 0 && (
                        <span className="text-xs text-muted-foreground truncate">{hero.sidekicks.map(sk => sk.name).join(', ')}</span>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {count} {count === 1 ? 'game' : 'games'}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        {winPercentage.toFixed(0)}% WR
                      </span>
                    </div>
                  </div>
                  <Progress value={winPercentage} className="h-2" />
                </div>
              )
            })}
            {heroesPlayedEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No heroes played yet
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-3 mb-3 md:mb-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-base md:text-lg font-semibold">Never Played Heroes</h3>
            <div className="flex items-center gap-2">
              <Switch 
                id="owned-only" 
                checked={showOnlyOwnedHeroes ?? false}
                onCheckedChange={setShowOnlyOwnedHeroes}
              />
              <Label htmlFor="owned-only" className="text-xs md:text-sm cursor-pointer whitespace-nowrap">
                Collection only
              </Label>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {neverPlayedHeroes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {(showOnlyOwnedHeroes ?? false) && ownedSets.length > 0 
                  ? "You've played all heroes in your collection! 🎉"
                  : "You've played all heroes! 🎉"}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full px-4 md:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs md:text-sm">Hero</TableHead>
                        <TableHead className="text-xs md:text-sm hidden sm:table-cell">Sidekick</TableHead>
                        <TableHead className="text-xs md:text-sm">Set</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {neverPlayedHeroes.map((hero) => (
                        <TableRow 
                          key={hero.id}
                          className={onHeroClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}
                          onClick={() => onHeroClick?.(hero.id)}
                        >
                          <TableCell className="font-medium text-xs md:text-sm">{hero.name}</TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground hidden sm:table-cell">
                            {hero.sidekicks && hero.sidekicks.length > 0 ? hero.sidekicks.map(sk => sk.name).join(', ') : '—'}
                          </TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">{hero.set}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6 overflow-hidden">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold">Most Played Maps</h3>
          </div>
          <div className="space-y-3">
            {mapsPlayedEntries.slice(0, 10).map(([mapId, count]) => {
              const map = getMapById(mapId)
              const winRate = stats.mapWinRates[mapId]
              const winPercentage = winRate ? (winRate.wins / winRate.total) * 100 : 0

              return (
                <div key={mapId} className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span 
                      className="text-sm font-medium truncate flex-1 min-w-0 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleMapClick(mapId)}
                    >
                      {map?.name}
                    </span>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <Badge variant="secondary" className="text-xs whitespace-nowrap">
                        {count} {count === 1 ? 'game' : 'games'}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                        {winPercentage.toFixed(0)}% WR
                      </span>
                    </div>
                  </div>
                  <Progress value={winPercentage} className="h-2" />
                </div>
              )
            })}
            {mapsPlayedEntries.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No maps played yet
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4 md:p-6 overflow-hidden">
          <div className="flex flex-col gap-3 mb-3 md:mb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <h3 className="text-base md:text-lg font-semibold">Never Played Maps</h3>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="maps-owned-only" 
                checked={showOnlyOwnedMaps ?? false}
                onCheckedChange={setShowOnlyOwnedMaps}
              />
              <Label htmlFor="maps-owned-only" className="text-xs md:text-sm cursor-pointer whitespace-nowrap">
                Collection only
              </Label>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {neverPlayedMaps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {(showOnlyOwnedMaps ?? false) && ownedSets.length > 0
                  ? "You've played all maps in your collection! 🎉"
                  : "You've played all maps! 🎉"}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full px-4 md:px-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs md:text-sm">Map</TableHead>
                        <TableHead className="text-xs md:text-sm">Set</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {neverPlayedMaps.map((map) => (
                        <TableRow 
                          key={map.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleMapClick(map.id)}
                        >
                          <TableCell className="font-medium text-xs md:text-sm">{map.name}</TableCell>
                          <TableCell className="text-xs md:text-sm text-muted-foreground">{map.set}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {vsPlayersEntries.length > 0 && (
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-2 mb-3 md:mb-4">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            <h3 className="text-base md:text-lg font-semibold">Head-to-Head Records</h3>
          </div>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs md:text-sm">Opponent</TableHead>
                  <TableHead className="text-center text-xs md:text-sm">Games</TableHead>
                  <TableHead className="text-center text-xs md:text-sm">W</TableHead>
                  <TableHead className="text-center text-xs md:text-sm">L</TableHead>
                  <TableHead className="text-center text-xs md:text-sm hidden sm:table-cell">Draws</TableHead>
                  <TableHead className="text-center text-xs md:text-sm hidden md:table-cell">Win Rate</TableHead>
                  <TableHead className="hidden lg:table-cell">Record</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vsPlayersEntries.map(([opponentName, record]) => {
                  const winRate = record.total > 0 ? (record.wins / record.total) * 100 : 0
                  return (
                    <TableRow key={opponentName}>
                      <TableCell className="font-medium text-xs md:text-sm">{opponentName}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm">{record.total}</TableCell>
                      <TableCell className="text-center text-xs md:text-sm">
                        <span className="text-accent font-medium">{record.wins}</span>
                      </TableCell>
                      <TableCell className="text-center text-xs md:text-sm">
                        <span className="text-destructive font-medium">{record.losses}</span>
                      </TableCell>
                      <TableCell className="text-center text-xs md:text-sm hidden sm:table-cell">
                        <span className="text-muted-foreground">{record.draws}</span>
                      </TableCell>
                      <TableCell className="text-center text-xs md:text-sm hidden md:table-cell">
                        <span className="font-medium">{winRate.toFixed(1)}%</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Progress value={winRate} className="h-2 w-24" />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <MapImageDialog 
        map={selectedMap}
        open={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
      />
    </div>
  )
}
