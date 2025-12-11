import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HEROES } from '@/lib/data'
import { HeroImage } from '@/components/heroes/HeroImage'
import { Heart, ArrowRight, Sword } from '@phosphor-icons/react'
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
import LeonardoImg from '@/assets/images/Leonardo.webp'

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
  'leonardo': LeonardoImg,
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
          <Input
            placeholder="Search heroes by name or set..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredHeroes.map((hero) => {
                const heroImage = localHeroImages[hero.id]
                const hasLocalImage = heroImage && heroImage !== ''
                const hasRemoteImage = hero.imageUrl && hero.imageUrl !== ''
                
                return (
                <button
                  key={hero.id}
                  onClick={() => setSelectedHeroId(hero.id)}
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

            <div className="lg:sticky lg:top-4 lg:self-start">
              {selectedHero ? (
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
                  </CardContent>
                </Card>
              ) : (
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
