import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Hero } from '@/lib/types'
import AchillesImg from '@/assets/images/heroes/Achilles.gif'
import AliceImg from '@/assets/images/heroes/Alice.png'
import AncientLeshenImg from '@/assets/images/heroes/Ancient_Leshen.webp'
import AngelImg from '@/assets/images/heroes/Angel.webp'
import AnnieChristmasImg from '@/assets/images/heroes/Annie_Christmas.webp'
import BeowulfImg from '@/assets/images/heroes/Beowulf.webp'
import BigfootImg from '@/assets/images/heroes/Bigfoot.jpg'
import BlackPantherImg from '@/assets/images/heroes/Black_Panther.webp'
import BlackWidowImg from '@/assets/images/heroes/Black_Widow.webp'
import BlackbeardImg from '@/assets/images/heroes/Blackbeard.webp'
import BloodyMaryImg from '@/assets/images/heroes/Bloody_Mary.gif'
import BruceLeeImg from '@/assets/images/heroes/Bruce_Lee.jpg'
import BuffyImg from '@/assets/images/heroes/Buffy.webp'
import BullseyeImg from '@/assets/images/heroes/Bullseye.webp'
import ChupacabraImg from '@/assets/images/heroes/Chupacabra.webp'
import CiriImg from '@/assets/images/heroes/Ciri.webp'
import CloakDaggerImg from '@/assets/images/heroes/Cloak_Dagger.webp'
import DaredevilImg from '@/assets/images/heroes/Daredevil.webp'
import DeadpoolImg from '@/assets/images/heroes/Deadpool.webp'
import DoctorStrangeImg from '@/assets/images/heroes/Doctor_Strange.webp'
import DonatelloImg from '@/assets/images/heroes/Donatello.webp'
import DrSattlerImg from '@/assets/images/heroes/Dr._Sattler.webp'
import DrJekyllImg from '@/assets/images/heroes/Dr_Jeykll.png'
import DrJillTrentImg from '@/assets/images/heroes/Dr_Jill_Trent.webp'
import DraculaImg from '@/assets/images/heroes/Dracula.png'
import ElektraImg from '@/assets/images/heroes/Elektra.webp'
import LeonardoImg from '@/assets/images/heroes/Leonardo.webp'
import EredinImg from '@/assets/images/heroes/Eredin.webp'
import GeraltImg from '@/assets/images/heroes/Geralt.webp'
import GhostRiderImg from '@/assets/images/heroes/Ghost_Rider.webp'
import GoldenBatImg from '@/assets/images/heroes/Golden_Bat.webp'
import HamletImg from '@/assets/images/heroes/Hamlet.webp'
import HoudiniImg from '@/assets/images/heroes/Houdini.webp'
import InvisibleManImg from '@/assets/images/heroes/Invisible_Man.png'
import KingArthurImg from '@/assets/images/heroes/King_Arthur.png'
import LokiImg from '@/assets/images/heroes/Loki.webp'
import LukeCageImg from '@/assets/images/heroes/Luke_Cage.webp'
import MedusaImg from '@/assets/images/heroes/Medusa.png'
import MichaelangeloImg from '@/assets/images/heroes/Michaelangelo.webp'
import MoonKnightImg from '@/assets/images/heroes/Moon_Knight.webp'
import MsMarvelImg from '@/assets/images/heroes/Ms_Marvel.webp'
import NikolaTeslaImg from '@/assets/images/heroes/Nikola_Tesla.webp'
import OdaNobunagaImg from '@/assets/images/heroes/Oda_Nobunaga.webp'
import PandoraImg from '@/assets/images/heroes/Pandora.webp'
import PhilippaImg from '@/assets/images/heroes/Philippa.webp'
import RaphaelImg from '@/assets/images/heroes/Raphael.webp'
import RaptorsImg from '@/assets/images/heroes/Raptors.webp'
import RedRidingHoodImg from '@/assets/images/heroes/Red_Riding_Hood.webp'
import RobertMuldoonImg from '@/assets/images/heroes/Robert_Muldoon.webp'
import RobinHoodImg from '@/assets/images/heroes/Robin_Hood.jpg'
import ShakespeareImg from '@/assets/images/heroes/Shakespeare.webp'
import SheHulkImg from '@/assets/images/heroes/She-Hulk.webp'
import SherlockHolmesImg from '@/assets/images/heroes/Sherlock_Holmes.png'
import SinbadImg from '@/assets/images/heroes/Sinbad.png'
import SpiderManImg from '@/assets/images/heroes/Spider-Man.webp'
import SpikeImg from '@/assets/images/heroes/Spike.webp'
import SquirrelGirlImg from '@/assets/images/heroes/Squirrel_Girl.webp'
import SunWukongImg from '@/assets/images/heroes/Sun_Wukong.jpg'
import TRexImg from '@/assets/images/heroes/T_Rex.webp'
import TheGenieImg from '@/assets/images/heroes/The_Genie.webp'
import TheWaywardSistersImg from '@/assets/images/heroes/The_Wayward_Sisters.webp'
import TitaniaImg from '@/assets/images/heroes/Titania.webp'
import TomoeGozenImg from '@/assets/images/heroes/Tomoe_Gozen.webp'
import TrissImg from '@/assets/images/heroes/Triss.webp'
import WillowImg from '@/assets/images/heroes/Willow.webp'
import WinterSoldierImg from '@/assets/images/heroes/Winter_Soldier.webp'
import YenneferImg from '@/assets/images/heroes/Yennefer.webp'
import YennengaImg from '@/assets/images/heroes/Yennenga.jpg'

type HeroImageProps = {
  hero: Hero
  className?: string
}

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
  'moon-knight': MoonKnightImg,
  'ms-marvel': MsMarvelImg,
  'nikola-tesla': NikolaTeslaImg,
  'oda-nobunaga': OdaNobunagaImg,
  'pandora': PandoraImg,
  'philippa': PhilippaImg,
  'raphael': RaphaelImg,
  'raptors': RaptorsImg,
  'robin-hood': RobinHoodImg,
  'ingen': RobertMuldoonImg,
  'sherlock-holmes': SherlockHolmesImg,
  'sinbad': SinbadImg,
  'spike': SpikeImg,
  'willow': WillowImg,
  'sun-wukong': SunWukongImg,
  'yennenga': YennengaImg,
  'spider-man': SpiderManImg,
  'she-hulk': SheHulkImg,
  'squirrel-girl': SquirrelGirlImg,
  't-rex': TRexImg,
  'the-genie': TheGenieImg,
  'titania': TitaniaImg,
  'tomoe-gozen': TomoeGozenImg,
  'wayward-sisters': TheWaywardSistersImg,
  'william-shakespeare': ShakespeareImg,
  'winter-soldier': WinterSoldierImg,
  'yennefer-triss': YenneferImg,
}

export function HeroImage({ hero, className }: HeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const localImage = localHeroImages[hero.id]
  const imageUrl = (localImage && localImage !== '') ? localImage : (hero.imageUrl || `https://unmatched.cards/images/heroes/${hero.id}.jpg`)

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border bg-card", className)}>
      {!imageError && imageUrl && imageUrl !== '' ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className={cn(
            "w-full h-full object-cover rounded-lg transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(false)
            setImageError(true)
          }}
        />
      ) : (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center p-4 text-center"
          )}
        >
          <Sword className="w-16 h-16 text-primary mb-4" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">{hero.name}</h3>
            {hero.sidekicks && hero.sidekicks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Sidekick:</p>
                <p>{hero.sidekicks.map(sk => `${sk.name}${sk.count > 1 ? ` x${sk.count}` : ''}`).join(', ')}</p>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{hero.set}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
