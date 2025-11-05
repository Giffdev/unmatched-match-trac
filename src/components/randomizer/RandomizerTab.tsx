import { useState } from 'react'
import type { Match, GameMode, PlayerAssignment, HeroStats } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Shuffle, DiceSix, Sparkle, ArrowsClockwise } from '@phosphor-icons/react'
import { getHeroById, getMapById, getHeroesBySet, getMapsByPlayerCount } from '@/lib/data'
import { aggregateCommunityData, getBalancedRandomHero, getBalancedMatchupHero } from '@/lib/stats'
import { LogMatchDialog } from '@/components/matches/LogMatchDialog'
import { toast } from 'sonner'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type RandomizerTabProps = {
  ownedSets: string[]
  matches: Match[]
  setMatches: (updater: (matches: Match[]) => Match[]) => void
}

type RandomizerResult = {
  mapId: string
  players: PlayerAssignment[]
  heroStats?: Record<string, HeroStats>
}

export function RandomizerTab({ ownedSets, matches, setMatches }: RandomizerTabProps) {
  const [mode, setMode] = useState<GameMode>('1v1')
  const [randomizationType, setRandomizationType] = useState<'true' | 'balanced'>('true')
  const [result, setResult] = useState<RandomizerResult | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const availableHeroes = ownedSets.flatMap(set => getHeroesBySet(set))

  const handleRandomize = () => {
    if (availableHeroes.length === 0) {
      toast.error('Please select some sets in your collection first')
      return
    }

    const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : mode === 'ffa4' ? 4 : 2

    if (availableHeroes.length < playerCount) {
      toast.error(`You need at least ${playerCount} heroes for this mode`)
      return
    }

    const suitableMaps = getMapsByPlayerCount(playerCount)
    if (suitableMaps.length === 0) {
      toast.error(`No maps available for ${playerCount} players`)
      return
    }

    const randomMap = suitableMaps[Math.floor(Math.random() * suitableMaps.length)]
    const selectedHeroes: string[] = []
    const players: PlayerAssignment[] = []
    let communityData
    let heroStats: Record<string, HeroStats> | undefined

    if (randomizationType === 'balanced') {
      communityData = aggregateCommunityData(matches)
      heroStats = {}

      if (mode === '1v1') {
        const available = availableHeroes.map(h => h.id)
        const firstHeroId = available[Math.floor(Math.random() * available.length)]
        selectedHeroes.push(firstHeroId)
        
        const firstStats = communityData.heroStats[firstHeroId]
        if (firstStats) {
          heroStats[firstHeroId] = firstStats
        }

        players.push({
          playerName: '',
          heroId: firstHeroId,
          turnOrder: 1,
        })

        const remainingAvailable = available.filter(h => h !== firstHeroId)
        const secondHeroId = getBalancedMatchupHero(remainingAvailable, firstHeroId, communityData)
        selectedHeroes.push(secondHeroId)
        
        const secondStats = communityData.heroStats[secondHeroId]
        if (secondStats) {
          heroStats[secondHeroId] = secondStats
        }

        players.push({
          playerName: '',
          heroId: secondHeroId,
          turnOrder: 2,
        })
      } else {
        let targetWinRate = 50

        for (let i = 0; i < playerCount; i++) {
          const available = availableHeroes
            .filter(h => !selectedHeroes.includes(h.id))
            .map(h => h.id)
          
          const heroId = getBalancedRandomHero(available, targetWinRate, communityData)
          selectedHeroes.push(heroId)
          
          const stats = communityData.heroStats[heroId]
          if (stats) {
            heroStats[heroId] = stats
            if (stats.totalGames >= 3) {
              targetWinRate = stats.winRate
            }
          }

          players.push({
            playerName: '',
            heroId,
            turnOrder: i + 1,
          })
        }
      }
    } else {
      for (let i = 0; i < playerCount; i++) {
        const available = availableHeroes.filter(h => !selectedHeroes.includes(h.id))
        const randomHero = available[Math.floor(Math.random() * available.length)]
        selectedHeroes.push(randomHero.id)
        players.push({
          playerName: '',
          heroId: randomHero.id,
          turnOrder: i + 1,
        })
      }
    }

    setResult({
      mapId: randomMap.id,
      players,
      heroStats,
    })

    toast.success('Random matchup generated!')
  }

  const rerollHero = (index: number) => {
    if (!result) return

    const usedHeroIds = result.players.map(p => p.heroId)
    const available = availableHeroes.filter(h => !usedHeroIds.includes(h.id))

    if (available.length === 0) {
      toast.error('No more heroes available')
      return
    }

    let newHeroId: string
    let updatedHeroStats = result.heroStats ? { ...result.heroStats } : undefined

    if (randomizationType === 'balanced' && matches.length > 0) {
      const communityData = aggregateCommunityData(matches)
      const availableIds = available.map(h => h.id)
      
      if (mode === '1v1') {
        const otherPlayerIndex = index === 0 ? 1 : 0
        const opponentHeroId = result.players[otherPlayerIndex].heroId
        newHeroId = getBalancedMatchupHero(availableIds, opponentHeroId, communityData)
      } else {
        const targetWinRate = index > 0 && result.players[index - 1] 
          ? communityData.heroStats[result.players[index - 1].heroId]?.winRate ?? 50
          : 50
        
        newHeroId = getBalancedRandomHero(availableIds, targetWinRate, communityData)
      }
      
      const stats = communityData.heroStats[newHeroId]
      if (stats && updatedHeroStats) {
        updatedHeroStats[newHeroId] = stats
      }
    } else {
      const randomHero = available[Math.floor(Math.random() * available.length)]
      newHeroId = randomHero.id
    }

    const newPlayers = [...result.players]
    newPlayers[index].heroId = newHeroId

    setResult({
      ...result,
      players: newPlayers,
      heroStats: updatedHeroStats,
    })
  }

  const rerollMap = () => {
    if (!result) return
    const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : mode === 'ffa4' ? 4 : 2
    const suitableMaps = getMapsByPlayerCount(playerCount)
    const randomMap = suitableMaps[Math.floor(Math.random() * suitableMaps.length)]
    setResult({
      ...result,
      mapId: randomMap.id,
    })
  }

  const handleLogMatch = () => {
    setDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Match Randomizer</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate random matchups from your collection. You can manage your collection from your profile menu.
        </p>
      </div>

      {availableHeroes.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Shuffle className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No heroes available</h3>
              <p className="text-muted-foreground">
                Add some sets to your collection from your profile menu to use the randomizer
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card className="p-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Game Mode</Label>
                <Select value={mode} onValueChange={(v) => setMode(v as GameMode)}>
                  <SelectTrigger>
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
                <RadioGroup value={randomizationType} onValueChange={(v) => setRandomizationType(v as 'true' | 'balanced')}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="true" id="true-random" />
                    <Label htmlFor="true-random" className="cursor-pointer font-normal flex items-center gap-2">
                      <DiceSix className="text-primary" />
                      True Random - Any heroes from collection
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced" className="cursor-pointer font-normal flex items-center gap-2">
                      <Sparkle className="text-accent" />
                      Balanced - Similar win rates for close matches
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <Button onClick={handleRandomize} size="lg" className="w-full">
                <Shuffle className="mr-2" />
                Generate Random Matchup
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
                    <p className="font-semibold">{getMapById(result.mapId)?.name}</p>
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
                      <div key={index} className="flex items-center justify-between p-4 bg-card rounded-lg border">
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
                        <Button variant="outline" size="sm" onClick={() => rerollHero(index)}>
                          <ArrowsClockwise className="mr-1" size={16} />
                          Reroll
                        </Button>
                      </div>
                    )
                  })}
                </div>

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
        </>
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
    </div>
  )
}
