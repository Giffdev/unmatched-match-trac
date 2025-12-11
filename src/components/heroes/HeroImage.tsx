import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Hero } from '@/lib/types'
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
import LeonardoImg from '@/assets/images/Leonardo.webp'
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
  't-rex': TRexImg,
  'the-genie': TheGenieImg,
  'titania': TitaniaImg,
  'tomoe-gozen': TomoeGozenImg,
  'triss': TrissImg,
  'wayward-sisters': TheWaywardSistersImg,
  'willow': WillowImg,
  'william-shakespeare': ShakespeareImg,
  'winter-soldier': WinterSoldierImg,
  'yennefer': YenneferImg,
  'yennefer-triss': YenneferImg,
  'yennenga': YennengaImg,
}

export function HeroImage({ hero, className }: HeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const localImage = localHeroImages[hero.id]
  const hasLocalImage = localImage && localImage !== ''
  const hasRemoteImage = hero.imageUrl && hero.imageUrl !== ''
  const imageUrl = hasLocalImage ? localImage : (hasRemoteImage ? hero.imageUrl : '')

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
