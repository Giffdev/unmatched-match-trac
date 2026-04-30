import { useState, useMemo, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { HEROES, MAPS, getHeroById } from '@/lib/data'
import { getAllUserMatches } from '@/lib/firestore'
import type { Match } from '@/lib/types'
import { HeroImage } from '@/components/heroes/HeroImage'
import { Heart, ArrowRight, ArrowLeft, Sword, Trophy, Target, MapPin, Users, ChartBar } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import AchillesImg from '@/assets/images/Achilles.gif'
import AliceImg from '@/assets/images/Alice.png'
import AncientLeshenImg from '@/assets/images/Ancient_Leshen.webp'
import AngelImg from '@/assets/images/Angel.webp'
import AnnieChristmasImg from '@/assets/images/Annie_Christmas.webp'
import BeowulfImg from '@/assets/images/Beowulf.webp'
import BigfootImg from '@/assets/images/Bigfoot.jpg'
import BlackPantherImg from '@/assets/images/Black_Panther.webp'
import BlackWidowImg from '@/assets/images/Black_Widow.webp'
import BlackbeardImg from '@/assets/images/Blackbeard.webp'
import BloodyMaryImg from '@/assets/images/Bloody_Mary.gif'
import BruceLeeImg from '@/assets/images/Bruce_Lee.jpg'
import BuffyImg from '@/assets/images/Buffy.webp'
import BullseyeImg from '@/assets/images/Bullseye.webp'
import ChupacabraImg from '@/assets/images/Chupacabra.webp'
import CiriImg from '@/assets/images/Ciri.webp'
import CloakDaggerImg from '@/assets/images/Cloak_Dagger.webp'
import DaredevilImg from '@/assets/images/Daredevil.webp'
import DeadpoolImg from '@/assets/images/Deadpool.webp'
import DoctorStrangeImg from '@/assets/images/Doctor_Strange.webp'
import DonatelloImg from '@/assets/images/Donatello.webp'
import DrSattlerImg from '@/assets/images/Dr._Sattler.webp'
import DrJekyllImg from '@/assets/images/Dr_Jeykll.png'
import DrJillTrentImg from '@/assets/images/Dr_Jill_Trent.webp'
import DraculaImg from '@/assets/images/Dracula.png'
import ElektraImg from '@/assets/images/Elektra.webp'
import EredinImg from '@/assets/images/Eredin.webp'
import GeraltImg from '@/assets/images/Geralt.webp'
import GhostRiderImg from '@/assets/images/Ghost_Rider.webp'
import GoldenBatImg from '@/assets/images/Golden_Bat.webp'
import HamletImg from '@/assets/images/Hamlet.webp'
import HoudiniImg from '@/assets/images/Houdini.webp'
import InvisibleManImg from '@/assets/images/Invisible_Man.png'
import KingArthurImg from '@/assets/images/King_Arthur.png'
import LokiImg from '@/assets/images/Loki.webp'
import LukeCageImg from '@/assets/images/Luke_Cage.webp'
import MedusaImg from '@/assets/images/Medusa.png'
import MichaelangeloImg from '@/assets/images/Michaelangelo.webp'
import MoonKnightImg from '@/assets/images/Moon_Knight.webp'
import MsMarvelImg from '@/assets/images/Ms_Marvel.webp'
import NikolaTeslaImg from '@/assets/images/Nikola_Tesla.webp'
import OdaNobunagaImg from '@/assets/images/Oda_Nobunaga.webp'
import PandoraImg from '@/assets/images/Pandora.webp'
import PhilippaImg from '@/assets/images/Philippa.webp'
import RaphaelImg from '@/assets/images/Raphael.webp'
import RaptorsImg from '@/assets/images/Raptors.webp'
import RedRidingHoodImg from '@/assets/images/Red_Riding_Hood.webp'
import RobertMuldoonImg from '@/assets/images/Robert_Muldoon.webp'
import RobinHoodImg from '@/assets/images/Robin_Hood.jpg'
import ShakespeareImg from '@/assets/images/Shakespeare.webp'
import SheHulkImg from '@/assets/images/She-Hulk.webp'
import SherlockHolmesImg from '@/assets/images/Sherlock_Holmes.png'
import SinbadImg from '@/assets/images/Sinbad.png'
import SpiderManImg from '@/assets/images/Spider-Man.webp'
import SpikeImg from '@/assets/images/Spike.webp'
import SquirrelGirlImg from '@/assets/images/Squirrel_Girl.webp'
import SunWukongImg from '@/assets/images/Sun_Wukong.jpg'
import TRexImg from '@/assets/images/T_Rex.webp'
import TheGenieImg from '@/assets/images/The_Genie.webp'
import TheWaywardSistersImg from '@/assets/images/The_Wayward_Sisters.webp'
import TitaniaImg from '@/assets/images/Titania.webp'
import TomoeGozenImg from '@/assets/images/Tomoe_Gozen.webp'
import TrissImg from '@/assets/images/Triss.webp'
import WillowImg from '@/assets/images/Willow.webp'
import WinterSoldierImg from '@/assets/images/Winter_Soldier.webp'
import YenneferImg from '@/assets/images/Yennefer.webp'
import YennengaImg from '@/assets/images/Yennenga.jpg'


const localHeroImages: Record<string, string> = {
  'achilles': AchillesImg,
  'alice': AliceImg,
  'ancient-leshen': AncientLeshenImg,
  'angel': AngelImg,
  'annie-christmas': AnnieChristmasImg,
  'beowulf': BeowulfImg,
  'bigfoot': BigfootImg,
  'black-panther': BlackPantherImg,
  'black-widow': BlackWidowImg,
  'blackbeard': BlackbeardImg,
  'bloody-mary': BloodyMaryImg,
  'bruce-lee': BruceLeeImg,
  'bruce-lee-ali': BruceLeeImg,
  'buffy': BuffyImg,
  'bullseye': BullseyeImg,
  'chupacabra': ChupacabraImg,
  'ciri': CiriImg,
  'cloak-dagger': CloakDaggerImg,
  'daredevil': DaredevilImg,
  'deadpool': DeadpoolImg,
  'doctor-strange': DoctorStrangeImg,
  'donatello': DonatelloImg,
  'dr-ellie-sattler': DrSattlerImg,
  'dr-jill-trent': DrJillTrentImg,
  'dracula': DraculaImg,
  'elektra': ElektraImg,
  'eredin': EredinImg,
  'geralt': GeraltImg,
  'ghost-rider': GhostRiderImg,
  'golden-bat': GoldenBatImg,
  'hamlet': HamletImg,
  'houdini': HoudiniImg,
  'invisible-man': InvisibleManImg,
  'jekyll-hyde': DrJekyllImg,
  'king-arthur': KingArthurImg,

  'little-red': RedRidingHoodImg,
  'loki': LokiImg,
  'luke-cage': LukeCageImg,
  'medusa': MedusaImg,
  'michaelangelo': MichaelangeloImg,
  'michelangelo': MichaelangeloImg,
  'moon-knight': MoonKnightImg,
  'ms-marvel': MsMarvelImg,
  'muhammad-ali': BruceLeeImg,
  'nikola-tesla': NikolaTeslaImg,
  'oda-nobunaga': OdaNobunagaImg,
  'pandora': PandoraImg,
  'philippa': PhilippaImg,
  'raphael': RaphaelImg,
  'raptors': RaptorsImg,
  'red-riding-hood': RedRidingHoodImg,
  'robin-hood': RobinHoodImg,
  'ingen': RobertMuldoonImg,
  'shakespeare': ShakespeareImg,
  'sherlock-holmes': SherlockHolmesImg,
  'sinbad': SinbadImg,
  'spike': SpikeImg,
  'spider-man': SpiderManImg,
  'she-hulk': SheHulkImg,
  'squirrel-girl': SquirrelGirlImg,
  'sun-wukong': SunWukongImg,
  'triss': TrissImg,
  't-rex': TRexImg,
  'the-genie': TheGenieImg,
  'titania': TitaniaImg,
  'tomoe-gozen': TomoeGozenImg,
  'wayward-sisters': TheWaywardSistersImg,
  'willow': WillowImg,
  'william-shakespeare': ShakespeareImg,
  'winter-soldier': WinterSoldierImg,
  'yennefer': YenneferImg,
  'yennefer-triss': YenneferImg,
  'yennenga': YennengaImg,
}

type PublicHeroBrowserProps = {
  selectedHeroId?: string | null
}

export function PublicHeroBrowser({ selectedHeroId: initialSelectedHeroId }: PublicHeroBrowserProps) {
  const [search, setSearch] = useState('')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(initialSelectedHeroId || null)
  const detailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialSelectedHeroId) {
      setSelectedHeroId(initialSelectedHeroId)
    }
  }, [initialSelectedHeroId])

  const filteredHeroes = useMemo(() => {
    const searchLower = search.toLowerCase()
    return search
      ? HEROES.filter(
          hero =>
            hero.name.toLowerCase().includes(searchLower) ||
            hero.set.toLowerCase().includes(searchLower)
        )
      : HEROES
  }, [search])

  const selectedHero = selectedHeroId ? HEROES.find(h => h.id === selectedHeroId) : null

  // Fetch global matches once
  const [allMatches, setAllMatches] = useState<Match[]>([])
  const [loadingMatches, setLoadingMatches] = useState(true)
  useEffect(() => {
    getAllUserMatches().then(m => { setAllMatches(m); setLoadingMatches(false) }).catch(() => setLoadingMatches(false))
  }, [])

  // Compute community stats for selected hero
  const heroStats = useMemo(() => {
    if (!selectedHeroId || allMatches.length === 0) return null

    const heroMatches = allMatches.filter(m =>
      m.mode === '1v1' && m.players.some(p => p.heroId === selectedHeroId)
    )
    if (heroMatches.length === 0) return null

    const wins = heroMatches.filter(m => m.winnerId === selectedHeroId).length
    const winRate = Math.round((wins / heroMatches.length) * 100)

    // Opponent stats
    const opponentMap: Record<string, { wins: number; losses: number }> = {}
    const mapMap: Record<string, { wins: number; losses: number }> = {}

    for (const m of heroMatches) {
      const opponent = m.players.find(p => p.heroId !== selectedHeroId)
      if (opponent) {
        if (!opponentMap[opponent.heroId]) opponentMap[opponent.heroId] = { wins: 0, losses: 0 }
        if (m.winnerId === selectedHeroId) opponentMap[opponent.heroId].wins++
        else opponentMap[opponent.heroId].losses++
      }
      if (!mapMap[m.mapId]) mapMap[m.mapId] = { wins: 0, losses: 0 }
      if (m.winnerId === selectedHeroId) mapMap[m.mapId].wins++
      else mapMap[m.mapId].losses++
    }

    // Most faced opponent
    const opponents = Object.entries(opponentMap).sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
    const mostFaced = opponents[0] ? { hero: getHeroById(opponents[0][0]), ...opponents[0][1], total: opponents[0][1].wins + opponents[0][1].losses } : null

    // Best matchup (min 2 games, highest win rate)
    const qualifiedOpponents = opponents.filter(([, s]) => (s.wins + s.losses) >= 2)
    const bestMatchup = qualifiedOpponents.sort((a, b) => (b[1].wins / (b[1].wins + b[1].losses)) - (a[1].wins / (a[1].wins + a[1].losses)))[0]
    const best = bestMatchup ? { hero: getHeroById(bestMatchup[0]), wins: bestMatchup[1].wins, total: bestMatchup[1].wins + bestMatchup[1].losses } : null

    // Worst matchup (min 2 games, lowest win rate)
    const worstMatchup = qualifiedOpponents.sort((a, b) => (a[1].wins / (a[1].wins + a[1].losses)) - (b[1].wins / (b[1].wins + b[1].losses)))[0]
    const worst = worstMatchup ? { hero: getHeroById(worstMatchup[0]), wins: worstMatchup[1].wins, total: worstMatchup[1].wins + worstMatchup[1].losses } : null

    // Most played map
    const maps = Object.entries(mapMap).sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
    const topMap = maps[0] ? { map: MAPS.find(m => m.id === maps[0][0]), wins: maps[0][1].wins, total: maps[0][1].wins + maps[0][1].losses } : null

    // Unique players who used this hero
    const uniqueUsers = new Set(heroMatches.map(m => m.userId)).size

    return { total: heroMatches.length, wins, winRate, mostFaced, best, worst, topMap, uniqueUsers }
  }, [selectedHeroId, allMatches])

  const handleSelectHero = (heroId: string) => {
    setSelectedHeroId(heroId)
    // On mobile (single column), scroll to the detail panel
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  // Hero detail card content (shared between mobile and desktop)
  const heroDetailContent = selectedHero ? (
    <Card className="border-accent/20">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <HeroImage hero={selectedHero} className="w-48 h-48" />
          <div className="text-center">
            <h3 className="text-2xl font-bold text-foreground">{selectedHero.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{selectedHero.set}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Heart className="text-destructive" size={20} />
            <div>
              <div className="text-xs text-muted-foreground">Health</div>
              <div className="font-semibold">{selectedHero.hp}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Sword className="text-primary" size={20} />
            <div>
              <div className="text-xs text-muted-foreground">Movement</div>
              <div className="font-semibold">{selectedHero.move}</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Attack Type:</span>
            <span className="font-semibold">{selectedHero.attack}</span>
          </div>

          {selectedHero.sidekicks && selectedHero.sidekicks.length > 0 && (
            <div className="pt-2">
              <div className="text-sm font-semibold text-muted-foreground mb-2">
                Sidekicks
              </div>
              <div className="space-y-1">
                {selectedHero.sidekicks.map((sidekick, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span>
                      {sidekick.count > 1 ? `${sidekick.count}× ` : ''}
                      {sidekick.name}
                    </span>
                    {sidekick.hp && (
                      <span className="text-muted-foreground">
                        ({sidekick.hp} HP, {sidekick.attack})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedHero.abilityDescription && (
          <div className="pt-4 border-t border-border">
            {selectedHero.abilityTitle && (
              <div className="font-semibold text-primary mb-2 text-sm">
                {selectedHero.abilityTitle}
              </div>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {selectedHero.abilityDescription}
            </p>
          </div>
        )}

        {/* Community Stats */}
        {heroStats && (
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <ChartBar className="text-primary" size={18} />
              <span className="font-semibold text-sm">Community Stats</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{heroStats.total}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">Matches</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-bold">{heroStats.wins}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">Wins</div>
              </div>
              <div className="text-center p-2 bg-muted/50 rounded-lg">
                <div className={cn("text-lg font-bold", heroStats.winRate >= 50 ? "text-green-500" : "text-red-400")}>
                  {heroStats.winRate}%
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">Win Rate</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {heroStats.mostFaced && (
                <div className="flex items-center gap-2">
                  <Users className="text-muted-foreground shrink-0" size={14} />
                  <span className="text-muted-foreground">Most faced:</span>
                  <span className="font-medium">{heroStats.mostFaced.hero?.name ?? '?'}</span>
                  <span className="text-xs text-muted-foreground">({heroStats.mostFaced.wins}W-{heroStats.mostFaced.total - heroStats.mostFaced.wins}L)</span>
                </div>
              )}
              {heroStats.best && heroStats.best.hero && (
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-500 shrink-0" size={14} />
                  <span className="text-muted-foreground">Best vs:</span>
                  <span className="font-medium">{heroStats.best.hero.name}</span>
                  <span className="text-xs text-muted-foreground">({Math.round((heroStats.best.wins / heroStats.best.total) * 100)}% in {heroStats.best.total}g)</span>
                </div>
              )}
              {heroStats.worst && heroStats.worst.hero && (
                <div className="flex items-center gap-2">
                  <Target className="text-red-400 shrink-0" size={14} />
                  <span className="text-muted-foreground">Worst vs:</span>
                  <span className="font-medium">{heroStats.worst.hero.name}</span>
                  <span className="text-xs text-muted-foreground">({Math.round((heroStats.worst.wins / heroStats.worst.total) * 100)}% in {heroStats.worst.total}g)</span>
                </div>
              )}
              {heroStats.topMap && heroStats.topMap.map && (
                <div className="flex items-center gap-2">
                  <MapPin className="text-blue-400 shrink-0" size={14} />
                  <span className="text-muted-foreground">Top map:</span>
                  <span className="font-medium">{heroStats.topMap.map.name}</span>
                  <span className="text-xs text-muted-foreground">({heroStats.topMap.wins}W-{heroStats.topMap.total - heroStats.topMap.wins}L)</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground text-center pt-1">
              Based on {allMatches.length} community matches from {heroStats.uniqueUsers} player{heroStats.uniqueUsers !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {loadingMatches && selectedHero && (
          <div className="text-xs text-muted-foreground text-center">Loading community stats...</div>
        )}

        {!loadingMatches && !heroStats && selectedHero && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
            No community matches logged with this hero yet
          </div>
        )}

        {/* Back to list button for mobile */}
        <div className="lg:hidden pt-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setSelectedHeroId(null)}
          >
            <ArrowLeft className="mr-2" size={16} />
            Back to hero list
          </Button>
        </div>
      </CardContent>
    </Card>
  ) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Database</CardTitle>
        <CardDescription>
          Browse all heroes and view their stats, abilities, and sidekicks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* On mobile: show detail OR list, not both */}
          {/* On desktop: show side by side */}

          {/* Mobile: selected hero detail (shown instead of list) */}
          {selectedHero && (
            <div ref={detailRef} className="lg:hidden">
              {heroDetailContent}
            </div>
          )}

          {/* Mobile: hero list (hidden when hero selected) */}
          {/* Desktop: always show both columns */}
          <div className={cn(
            selectedHero ? "hidden" : "block lg:hidden"
          )}>
            <Input
              placeholder="Search heroes by name or set..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md mb-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cn(
              "space-y-2 max-h-[600px] overflow-y-auto pr-2",
              selectedHero ? "hidden lg:block" : "block"
            )}>
              {/* Search for desktop (always visible in grid) */}
              <div className="hidden lg:block sticky top-0 bg-card z-10 pb-2">
                <Input
                  placeholder="Search heroes by name or set..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {filteredHeroes.map((hero) => {
                const heroImage = localHeroImages[hero.id]
                const hasLocalImage = heroImage && heroImage !== ''
                const hasRemoteImage = hero.imageUrl && hero.imageUrl !== ''
                
                return (
                <button
                  key={hero.id}
                  onClick={() => handleSelectHero(hero.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedHeroId === hero.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-accent hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                      {hasLocalImage ? (
                        <img 
                          src={heroImage} 
                          alt={hero.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : hasRemoteImage ? (
                        <img 
                          src={hero.imageUrl} 
                          alt={hero.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground text-center px-1">No img</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{hero.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{hero.set}</div>
                    </div>
                    <ArrowRight className="text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              )})}
              {filteredHeroes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No heroes found
                </div>
              )}
            </div>

            {/* Desktop: detail panel (always in grid) */}
            <div className="hidden lg:block lg:sticky lg:top-4 lg:self-start" ref={detailRef}>
              {heroDetailContent || (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground">
                      Select a hero to view details
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
