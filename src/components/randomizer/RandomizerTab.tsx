import { useState, useEffect, useMemo, useId } from 'react'
import type { Match, GameMode, PlayerAssignment, HeroStats, Map, BalancedResult, CommunityData } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shuffle, DiceSix, Sparkle, ArrowsClockwise, Info, LockSimple, LockSimpleOpen } from '@phosphor-icons/react'
import { getHeroById, getMapById, getHeroesBySet, getMapsByPlayerCount, getSelectableHeroes } from '@/lib/data'
import { aggregateCommunityData, getBalancedMatchupScored } from '@/lib/stats'
import { getAllUserMatches } from '@/lib/firestore'
import { LogMatchDialog } from '@/components/matches/LogMatchDialog'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { MapImageDialog } from '@/components/players/MapImageDialog'
import { normalizeHeroId } from '@/lib/utils'

type RandomizerTabProps = {
  ownedSets: string[]
  setMatches: (updater: (matches: Match[]) => Match[]) => void
}

type RandomizerResult = {
  mapId: string
  players: PlayerAssignment[]
  heroStats?: Record<string, HeroStats>
  balancedResults?: BalancedResult[]
}

export function RandomizerTab({ ownedSets, setMatches }: RandomizerTabProps) {
  const radioId = useId()
  const [mode, setMode] = useState<GameMode>('1v1')
  const [randomizationType, setRandomizationType] = useState<'true' | 'balanced'>('true')
  const [result, setResult] = useState<RandomizerResult | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [useCollectionOnly, setUseCollectionOnly] = useState(true)
  const [selectedMap, setSelectedMap] = useState<Map | null>(null)
  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false)
  const [globalMatches, setGlobalMatches] = useState<Match[]>([])
  const [loadingGlobal, setLoadingGlobal] = useState(false)
  const [excludedSets, setExcludedSets] = useState<string[]>([])
  const [lockedHeroes, setLockedHeroes] = useState<(string | null)[]>([null, null, null, null])
  const playerCount = mode === '1v1' ? 2 : mode === 'ffa3' ? 3 : 4

  // Fetch global matches on mount for balanced mode
  useEffect(() => {
    setLoadingGlobal(true)
    getAllUserMatches()
      .then(m => setGlobalMatches(m))
      .catch(() => {})
      .finally(() => setLoadingGlobal(false))
  }, [])

  // Memoize community data from global 1v1 matches only
  const globalCommunityData = useMemo<CommunityData | null>(() => {
    const matches1v1 = globalMatches.filter(m => m.mode === '1v1')
    if (matches1v1.length === 0) return null
    return aggregateCommunityData(matches1v1)
  }, [globalMatches])

  // Hero data lookup for stat proxy
  const heroDataLookup = (id: string) => {
    const hero = getHeroById(id)
    if (!hero) return undefined
    return { hp: hero.hp, move: hero.move, sidekicks: hero.sidekicks }
  }

  const handleMapClick = (mapId: string) => {
    const map = getMapById(mapId)
    if (map) {
      setSelectedMap(map)
      setIsMapDialogOpen(true)
    }
  }

  const poolSets = ownedSets.filter(set => !excludedSets.includes(set))
  const availableHeroes = (useCollectionOnly
    ? poolSets.flatMap(set => getHeroesBySet(set))
    : getSelectableHeroes())
    .map(hero => ({ ...hero, id: normalizeHeroId(hero.id) }))
    .filter((hero, index, heroes) => heroes.findIndex(h => h.id === hero.id) === index)

  const updatePool = (excluded: string[]) => {
    setExcludedSets(excluded)
  }

  const pickRandomMap = (count: number) => {
    const suitableMaps = getMapsByPlayerCount(count).filter(map =>
      !useCollectionOnly || poolSets.includes(map.set)
    )
    if (suitableMaps.length === 0) {
      toast.error(`No maps available for ${count} players in the selected pool`)
      return null
    }
    return suitableMaps[Math.floor(Math.random() * suitableMaps.length)]
  }

  const handleRandomize = () => {
    if (useCollectionOnly && poolSets.length === 0) {
      toast.error('Select at least one set in the randomization pool')
      return
    }

    const selectedHeroes = lockedHeroes.slice(0, playerCount)
    const lockedIds = selectedHeroes.filter((id): id is string => id !== null)
    const candidates = availableHeroes.filter(hero => !lockedIds.includes(hero.id))
    if (candidates.length < playerCount - lockedIds.length) {
      toast.error(`Not enough heroes in the selected pool for ${playerCount} players. Add sets or unlock a hero.`)
      return
    }

    const randomMap = pickRandomMap(playerCount)
    if (!randomMap) return
    const balancedData = randomizationType === 'balanced' && mode === '1v1' ? globalCommunityData : null
    const balancedResults: BalancedResult[] = []
    if (balancedData && !selectedHeroes.some(Boolean)) {
      selectedHeroes[0] = candidates[Math.floor(Math.random() * candidates.length)].id
    }

    const players: PlayerAssignment[] = []
    const heroStats: Record<string, HeroStats> = {}
    for (let i = 0; i < playerCount; i++) {
      let heroId = selectedHeroes[i]
      if (!heroId) {
        const available = availableHeroes.filter(h => !selectedHeroes.includes(h.id))
        const opponentId = selectedHeroes[i === 0 ? 1 : 0]
        if (balancedData && opponentId) {
          const balancedResult = getBalancedMatchupScored(available.map(h => h.id), opponentId, balancedData, heroDataLookup)
          heroId = balancedResult.heroId
          balancedResults.push(balancedResult)
        } else {
          heroId = available[Math.floor(Math.random() * available.length)].id
        }
        selectedHeroes[i] = heroId
      }
      players.push({ playerName: '', heroId, turnOrder: i + 1 })
      const stats = balancedData?.heroStats[heroId]
      if (stats) heroStats[heroId] = stats
    }

    setResult({ mapId: randomMap.id, players, heroStats: balancedData ? heroStats : undefined, balancedResults })
    toast.success(balancedData ? 'Balanced matchup generated!' : 'Random matchup generated!')
  }

  const rerollHero = (index: number) => {
    if (!result || lockedHeroes[index]) return

    const usedHeroIds = result.players.map(p => p.heroId)
    const available = availableHeroes.filter(h => !usedHeroIds.includes(h.id))

    if (available.length === 0) {
      toast.error('No more heroes available')
      return
    }

    let newHeroId: string
    const updatedHeroStats = result.heroStats ? { ...result.heroStats } : undefined
    let updatedBalancedResults = result.balancedResults ? [...result.balancedResults] : undefined

    if (randomizationType === 'balanced' && mode === '1v1' && globalCommunityData) {
      const availableIds = available.map(h => h.id)
      const otherPlayerIndex = index === 0 ? 1 : 0
      const opponentHeroId = result.players[otherPlayerIndex].heroId
      const balancedResult = getBalancedMatchupScored(availableIds, opponentHeroId, globalCommunityData, heroDataLookup)
      newHeroId = balancedResult.heroId
      
      if (updatedBalancedResults) {
        updatedBalancedResults = [balancedResult]
      } else {
        updatedBalancedResults = [balancedResult]
      }
      
      const stats = globalCommunityData.heroStats[newHeroId]
      if (stats && updatedHeroStats) {
        updatedHeroStats[newHeroId] = stats
      }
    } else {
      const randomHero = available[Math.floor(Math.random() * available.length)]
      newHeroId = randomHero.id
    }

    const newPlayers = [...result.players]
    newPlayers[index] = { ...newPlayers[index], heroId: newHeroId }

    setResult({
      ...result,
      players: newPlayers,
      heroStats: updatedHeroStats,
      balancedResults: updatedBalancedResults,
    })
  }

  const rerollMap = () => {
    if (!result) return
    const randomMap = pickRandomMap(playerCount)
    if (!randomMap) return
    setResult({ ...result, mapId: randomMap.id })
  }

  const handleLogMatch = () => {
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Match Randomizer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate random matchups {useCollectionOnly ? 'from your collection' : 'from all available heroes and maps'}. You can manage your collection from your profile menu.
        </p>
      </div>

      {useCollectionOnly && ownedSets.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Shuffle className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No heroes available</h3>
              <p className="text-muted-foreground">
                {useCollectionOnly 
                  ? 'Add some sets to your collection from your profile menu to use the randomizer'
                  : 'No heroes available in the database'}
              </p>
            </div>
          </div>
        </Card>
      )}
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={`${radioId}-mode`}>Game Mode</Label>
                <Select value={mode} onValueChange={(v) => {
                  setMode(v as GameMode)
                  setResult(null)
                  setLockedHeroes([null, null, null, null])
                }}>
                  <SelectTrigger id={`${radioId}-mode`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1v1">1v1 Competitive</SelectItem>
                    <SelectItem value="2v2">2v2 Competitive</SelectItem>
                    <SelectItem value="ffa3">3 Player Free For All</SelectItem>
                    <SelectItem value="ffa4">4 Player Free For All</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Randomization Type</Label>
                <RadioGroup value={randomizationType} onValueChange={(v) => {
                  setRandomizationType(v as 'true' | 'balanced')
                  setResult(null)
                }}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id={`${radioId}-true-random`} />
                    <Label htmlFor={`${radioId}-true-random`} className="cursor-pointer font-normal flex items-center gap-2">
                      <DiceSix className="text-primary" />
                      True Random - Any heroes from the selected pool
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="balanced" id={`${radioId}-balanced`} />
                    <Label htmlFor={`${radioId}-balanced`} className="cursor-pointer font-normal flex items-center gap-2">
                      <Sparkle className="text-accent" />
                      Balanced - Pick opponents with close matchup data (1v1 only)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="collection-only" className="cursor-pointer font-normal">
                    Use only heroes and maps from my collection
                  </Label>
                  <Switch 
                    id="collection-only" 
                    checked={useCollectionOnly}
                    onCheckedChange={(checked) => {
                      setUseCollectionOnly(checked)
                      setResult(null)
                    }}
                  />
                </div>
                {useCollectionOnly && ownedSets.length > 0 && (
                  <div className="space-y-3">
                    <details className="space-y-3">
                      <summary className="cursor-pointer text-sm font-medium">
                        Randomization pool ({poolSets.length} of {ownedSets.length} sets selected)
                      </summary>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => updatePool([])}>Select All Sets</Button>
                        <Button variant="outline" size="sm" onClick={() => updatePool([...ownedSets])}>Clear Sets</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Selected sets apply to future random heroes and maps. Locked heroes stay fixed, even outside this pool.
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {ownedSets.map((set, index) => (
                          <div key={set} className="flex items-center gap-2">
                            <Checkbox
                              id={`${radioId}-pool-${index}`}
                              checked={poolSets.includes(set)}
                              onCheckedChange={(checked) => updatePool(checked
                                ? excludedSets.filter(s => s !== set)
                                : [...excludedSets, set])}
                            />
                            <Label htmlFor={`${radioId}-pool-${index}`} className="font-normal cursor-pointer">{set}</Label>
                          </div>
                        ))}
                      </div>
                    </details>
                    {poolSets.length === 0 && <p role="alert" className="text-sm text-destructive">Select at least one set in the randomization pool.</p>}
                  </div>
                )}
              </div>

              {randomizationType === 'balanced' && loadingGlobal && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info size={12} /> Loading community data for balanced matching...
                </p>
              )}

              <Button onClick={handleRandomize} size="lg" className="w-full" disabled={randomizationType === 'balanced' && loadingGlobal}>
                <Shuffle className="mr-2" />
                {randomizationType === 'balanced' && loadingGlobal ? 'Loading Community Data...' : 'Generate Random Matchup'}
              </Button>
            </div>
          </Card>

          {result && (
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Your Random Matchup</h3>
                <Badge variant="secondary" className="text-xs">
                  {randomizationType === 'balanced' ? 'Balanced' : 'True Random'}
                </Badge>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Map</p>
                    <p 
                      className="font-semibold cursor-pointer hover:text-primary transition-colors"
                      onClick={() => handleMapClick(result.mapId)}
                    >
                      {getMapById(result.mapId)?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      From: {getMapById(result.mapId)?.set}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {getMapById(result.mapId)?.minPlayers === getMapById(result.mapId)?.maxPlayers 
                        ? `${getMapById(result.mapId)?.minPlayers} players` 
                        : `${getMapById(result.mapId)?.minPlayers}-${getMapById(result.mapId)?.maxPlayers} players`}
                      {' • '}
                      {getMapById(result.mapId)?.zones} zones, {getMapById(result.mapId)?.spaces} spaces
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={rerollMap}>
                    <ArrowsClockwise className="mr-1" size={16} />
                    Reroll
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Heroes</p>
                  {result.players.map((player, index) => {
                    const hero = getHeroById(player.heroId)
                    const stats = result.heroStats?.[player.heroId]
                    
                    let matchupStats: { wins: number; losses: number; total: number; winRate: number } | undefined
                    if (mode === '1v1' && randomizationType === 'balanced' && stats) {
                      const otherPlayerIndex = index === 0 ? 1 : 0
                      const opponentHeroId = result.players[otherPlayerIndex].heroId
                      const vsData = stats.vsMatchups[opponentHeroId]
                      if (vsData && vsData.total > 0) {
                        matchupStats = {
                          wins: vsData.wins,
                          losses: vsData.total - vsData.wins,
                          total: vsData.total,
                          winRate: (vsData.wins / vsData.total) * 100
                        }
                      }
                    }
                    
                    return (
                      <div key={index} className="flex flex-wrap gap-3 items-center justify-between p-4 bg-card rounded-lg border">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center p-0">
                            {player.turnOrder}
                          </Badge>
                          <div className="flex-1">
                            <p className="font-semibold">{hero?.name}</p>
                            <p className="text-xs text-muted-foreground">{hero?.set}</p>
                            {randomizationType === 'balanced' && stats && stats.totalGames > 0 && (
                              <>
                                {matchupStats ? (
                                  <p className="text-xs text-accent mt-1">
                                    vs {getHeroById(result.players[index === 0 ? 1 : 0].heroId)?.name}: {matchupStats.wins}W - {matchupStats.losses}L ({matchupStats.winRate.toFixed(1)}%)
                                  </p>
                                ) : (
                                  <p className="text-xs text-accent mt-1">
                                    Overall: {stats.wins}W - {stats.losses}L ({stats.winRate.toFixed(1)}% win rate)
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative group shrink-0">
                          <Button
                            variant={lockedHeroes[index] ? 'secondary' : 'outline'}
                            size="icon"
                            className="h-11 w-11"
                            aria-pressed={!!lockedHeroes[index]}
                            aria-label={`${lockedHeroes[index] ? 'Unlock' : 'Lock'} ${hero?.name}`}
                            aria-describedby={`${radioId}-lock-help-${index}`}
                            onClick={(event) => {
                              event.currentTarget.focus()
                              setLockedHeroes(current => current.map((id, slot) => slot === index ? (id ? null : player.heroId) : id))
                            }}
                          >
                            {lockedHeroes[index] ? <LockSimple size={20} aria-hidden="true" /> : <LockSimpleOpen size={20} aria-hidden="true" />}
                          </Button>
                          <span
                            id={`${radioId}-lock-help-${index}`}
                            role="tooltip"
                            className="absolute bottom-full right-0 z-50 hidden w-56 rounded-md border bg-popover p-2 text-xs text-popover-foreground shadow-md group-hover:block group-focus-within:block"
                          >
                            {lockedHeroes[index]
                              ? 'Locked: this hero stays when generating a new matchup. Tap to unlock.'
                              : 'Unlocked: this hero can be randomized. Tap to lock it for new matchups.'}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" aria-label={`Reroll ${hero?.name}`} disabled={!!lockedHeroes[index]} onClick={() => rerollHero(index)}>
                          <ArrowsClockwise className="mr-1" size={16} />
                          Reroll
                        </Button>
                      </div>
                    )
                  })}
                </div>

                {/* Balanced confidence indicator */}
                {randomizationType === 'balanced' && result.balancedResults && result.balancedResults.length > 0 && (
                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-xs">
                    <Info size={14} className="text-muted-foreground mt-0.5 shrink-0" />
                    <div className="text-muted-foreground">
                      {(() => {
                        const br = result.balancedResults![0]
                        const confidenceColors = { high: 'text-green-500', medium: 'text-yellow-500', low: 'text-muted-foreground' }
                        const confidenceLabel = { high: 'High', medium: 'Medium', low: 'Low' }
                        return (
                          <>
                            <span className={`font-medium ${confidenceColors[br.confidence]}`}>
                              {confidenceLabel[br.confidence]} confidence
                            </span>
                            {' — '}
                            {br.reason === 'direct-matchup' && br.matchupGames
                              ? `Based on ${br.matchupGames} community head-to-head game${br.matchupGames > 1 ? 's' : ''}`
                              : br.reason === 'win-rate-similarity'
                              ? `Matched by similar community win rates (${br.heroAGames ?? 0} & ${br.heroBGames ?? 0} games)`
                              : 'Estimated from hero stats (limited community data)'}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={handleRandomize} variant="outline" className="flex-1">
                    <Shuffle className="mr-2" />
                    Generate New
                  </Button>
                  <Button onClick={handleLogMatch} className="flex-1">
                    Log This Match
                  </Button>
                </div>
              </div>
            </Card>
          )}
      {result && (
        <LogMatchDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSave={(match) => setMatches(current => [...current, match])}
          prefilled={{
            mode,
            mapId: result.mapId,
            players: result.players,
          }}
        />
      )}

      <MapImageDialog 
        map={selectedMap}
        open={isMapDialogOpen}
        onOpenChange={setIsMapDialogOpen}
      />
    </div>
  )
}
