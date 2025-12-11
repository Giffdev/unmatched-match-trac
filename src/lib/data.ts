import type { Hero, Map, SetInfo } from './types'

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
import LeonardoImg from '@/assets/images/Leonardo.webp'
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

import AzuchiCastle from '@/assets/images/Azuchi_Castle.webp'
import BaskervilleManor from '@/assets/images/Baskerville_Manor.webp'
import FayrlundForest from '@/assets/images/Fayrlund_Forest.webp'
import GlobeTheater from '@/assets/images/Globe_Theater.webp'
import HangingGardens from '@/assets/images/Hanging_Gardens.webp'
import Helicarrier from '@/assets/images/Helicarrier.webp'
import HellsKitchenMap from "@/assets/images/Hell's_Kitchen.webp"
import Heorot from '@/assets/images/Heorot.webp'
import KaerMorhen from '@/assets/images/Kaer_Morhen.webp'
import KingSolomonsMine from "@/assets/images/King_Solomon's_Mine.webp"
import Marmoreal from '@/assets/images/Marmoreal.webp'
import McMinnvilleOR from '@/assets/images/McMinnville_OR.webp'
import Naglfar from '@/assets/images/Naglfar.webp'
import NavyPier from '@/assets/images/Navy_Pier.webp'
import PointPleasant from '@/assets/images/Point_Pleasant.webp'
import RaptorPaddock from '@/assets/images/Raptor_Paddock.webp'
import SanctumSantorum from '@/assets/images/Sanctum_Santorum.webp'
import Sarpedon from '@/assets/images/Sarpedon.webp'
import SherwoodForest from '@/assets/images/Sherwood_Forest.webp'
import Soho from '@/assets/images/Soho.webp'
import StreetsOfNovigrad from '@/assets/images/Streets_of_Novigrad.webp'
import SunnydaleHigh from '@/assets/images/Sunnydale_High.webp'
import TheBronze from '@/assets/images/The_Bronze.webp'
import TheRaft from '@/assets/images/The_Raft.webp'
import TRexPaddock from '@/assets/images/T_Rex_Paddock.webp'
import Yukon from '@/assets/images/Yukon.webp'

export const UNMATCHED_SETS: SetInfo[] = [
  { name: 'Battle of Legends, Volume One', franchise: 'Unmatched' },
  { name: 'Battle of Legends, Volume Two', franchise: 'Unmatched' },
  { name: 'Battle of Legends, Volume Three', franchise: 'Unmatched' },
  { name: 'Bruce Lee', franchise: 'Unmatched' },
  { name: 'Robin Hood vs Bigfoot', franchise: 'Unmatched' },
  { name: 'Cobble & Fog', franchise: 'Unmatched' },
  { name: 'Little Red Riding Hood vs. Beowulf', franchise: 'Unmatched' },
  { name: 'Houdini vs. The Genie', franchise: 'Unmatched' },
  { name: 'Adventures: Tales to Amaze', franchise: 'Unmatched' },
  { name: 'Sun\'s Origin', franchise: 'Unmatched' },
  { name: 'Slings & Arrows', franchise: 'Unmatched' },
  { name: 'Muhammad Ali vs. Bruce Lee', franchise: 'Unmatched' },
  { name: 'Jurassic Park – InGen vs. Raptors', franchise: 'Jurassic Park' },
  { name: 'Jurassic Park – Sattler vs. T‑Rex', franchise: 'Jurassic Park' },
  { name: 'Buffy the Vampire Slayer', franchise: 'Buffy' },
  { name: 'Deadpool', franchise: 'Marvel' },
  { name: 'Redemption Row', franchise: 'Marvel' },
  { name: 'Hell\'s Kitchen', franchise: 'Marvel' },
  { name: 'Teen Spirit', franchise: 'Marvel' },
  { name: 'For King and Country', franchise: 'Marvel' },
  { name: 'Brains and Brawn', franchise: 'Marvel' },
  { name: 'The Witcher – Realms Fall', franchise: 'The Witcher' },
  { name: 'The Witcher – Steel & Silver', franchise: 'The Witcher' },
  { name: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', franchise: 'TMNT' },
  { name: 'TMNT: Shredder and Krang', franchise: 'TMNT' },
]

export const FRANCHISES = Array.from(new Set(UNMATCHED_SETS.map(s => s.franchise))).sort()

export function getSetsByFranchise(franchise: string): SetInfo[] {
  return UNMATCHED_SETS.filter(s => s.franchise === franchise)
}

export const HEROES: Hero[] = [
  { id: 'achilles', name: 'Achilles', hp: 18, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Patroclus', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: AchillesImg, abilityDescription: "When Patroclus is defeated, discard 2 random cards. While Patroclus is defeated: (1) Add +2 to the value of all Achilles' attacks. (2) If Achilles wins combat, draw 1 card." },
  { id: 'alice', name: 'Alice', hp: 13, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'The Jabberwock', count: 1, hp: 8, attack: 'MELEE' }], imageUrl: AliceImg, abilityDescription: "When you place Alice, choose whether she starts the game BIG or SMALL. When Alice is BIG, add 2 to the value of her attack cards. When Alice is SMALL, add 1 to the value of her defense cards." },
  { id: 'ancient-leshen', name: 'Ancient Leshen', hp: 13, move: 1, attack: 'RANGED', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Wolves', count: 2, hp: 1, attack: 'MELEE' }], imageUrl: AncientLeshenImg, abilityTitle: "HEART OF THE FOREST", abilityDescription: "Add +3 to the value of the Leshen's attacks if it already attacked this turn. Your Wolves have a move value of 3." },
  { id: 'angel', name: 'Angel', hp: 16, move: 2, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Faith', count: 1, hp: 9, attack: 'MELEE' }], imageUrl: AngelImg, abilityDescription: "After Angel or Faith attacks, if you lost the combat, draw 1 card." },
  { id: 'annie-christmas', name: 'Annie Christmas', hp: 14, move: 2, attack: 'MELEE', set: 'Adventures: Tales to Amaze', sidekicks: [{ name: 'Charlie', count: 1, hp: 8, attack: 'RANGED' }], imageUrl: AnnieChristmasImg, abilityTitle: "NECKLACE OF PEARLS", abilityDescription: "Add +2 to the value of Annie's attacks if she has less health than the defender." },
  { id: 'beowulf', name: 'Beowulf', hp: 17, move: 2, attack: 'MELEE', set: 'Little Red Riding Hood vs. Beowulf', sidekicks: [{ name: 'Wiglaf', count: 1, hp: 9, attack: 'MELEE' }], imageUrl: BeowulfImg, abilityDescription: "Beowulf starts with 1 Rage. When Beowulf is dealt damage, he gains 1 Rage. Beowulf has a maximum of 3 rage." },
  { id: 'bigfoot', name: 'Bigfoot', hp: 16, move: 3, attack: 'MELEE', set: 'Robin Hood vs Bigfoot', sidekicks: [{ name: 'The Jackalope', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: BigfootImg, abilityDescription: "At the end of your turn, if there are no opposing fighters in Bigfoot's zone, you may draw 1 card." },
  { id: 'black-panther', name: 'Black Panther', hp: 14, move: 2, attack: 'MELEE', set: 'For King and Country', sidekicks: [{ name: 'Shuri', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: BlackPantherImg, abilityTitle: "VIBRANIUM SUIT", abilityDescription: "Whenever you BOOST, draw 1 card. Cards stored in your VIBRANIUM SUIT can only be used to BOOST." },
  { id: 'black-widow', name: 'Black Widow', hp: 13, move: 2, attack: 'RANGED', set: 'For King and Country', sidekicks: [{ name: 'Maria Hill', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: BlackWidowImg, abilityTitle: "MISSION READY", abilityDescription: 'Before drawing your starting hand, add "The Moscow Protocol" card to your hand. Then shuffle your deck and draw 5 cards. (Your starting hand is 6 cards instead of 5.)' },
  { id: 'bloody-mary', name: 'Bloody Mary', hp: 16, move: 3, attack: 'MELEE', set: 'Battle of Legends, Volume Two', imageUrl: BloodyMaryImg, abilityDescription: "At the start of your turn, if you have exactly 3 cards in hand, gain 1 action." },
  { id: 'bruce-lee', name: 'Bruce Lee', hp: 14, move: 3, attack: 'MELEE', set: 'Bruce Lee', imageUrl: BruceLeeImg, abilityTitle: "FLEET OF FOOT", abilityDescription: "At the end of your turn, you may move Bruce Lee 1 space." },
  { id: 'buffy', name: 'Buffy', hp: 14, move: 3, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Giles', count: 1, hp: 6, attack: 'MELEE' }, { name: 'Xander', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: BuffyImg, abilityDescription: "Buffy may move through spaces containing opposing fighters (including when she is moved by effects)." },
  { id: 'bullseye', name: 'Bullseye', hp: 14, move: 2, attack: 'RANGED', set: 'Hell\'s Kitchen', imageUrl: BullseyeImg, abilityDescription: "Bullseye can attack from up to 5 spaces away (ignoring zones)." },
  { id: 'ciri', name: 'Ciri', hp: 15, move: 2, attack: 'MELEE', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Ihuarraquax', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: CiriImg, abilityTitle: "UNCONTAINABLE POWER", abilityDescription: "If you have 7 or more Source cards in your discard pile, effects on Ciri's cards cannot be canceled." },
  { id: 'cloak-dagger', name: 'Cloak & Dagger', hp: 8, move: 2, attack: 'MELEE', set: 'Teen Spirit', sidekicks: [{ name: 'Dagger', count: 1, hp: 8, attack: 'RANGED' }], imageUrl: CloakDaggerImg, abilityTitle: "UMBRA / REFRACTION", abilityDescription: "UMBRA: After you attack, if Cloak dealt at least 2 combat damage, your opponent discards 1 card. REFRACTION: After you attack, if Dagger dealt at least 2 combat damage, gain 1 action." },
  { id: 'daredevil', name: 'Daredevil', hp: 17, move: 3, attack: 'MELEE', set: 'Hell\'s Kitchen', imageUrl: DaredevilImg, abilityDescription: "DURING COMBAT: If you have 2 or fewer cards in your hand, you may BLIND BOOST your attack or defense. (If you have other DURING COMBAT effects, choose the order.)" },
  { id: 'deadpool', name: 'Deadpool', hp: 10, move: 2, attack: 'MELEE', set: 'Deadpool', imageUrl: DeadpoolImg, abilityDescription: "After you attack, Deadpool recovers 1 health. Also, if your opponent's real name is Logan, all your attacks are +5." },
  { id: 'doctor-strange', name: 'Doctor Strange', hp: 14, move: 2, attack: 'RANGED', set: 'Brains and Brawn', sidekicks: [{ name: 'Wong', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: DoctorStrangeImg, abilityTitle: "DARK PACT", abilityDescription: "After each combat, if Doctor Strange played a card, you may deal 1 damage to him. If you do, put that card on the bottom of your deck and draw 1 card." },
  { id: 'dr-ellie-sattler', name: 'Dr. Sattler', hp: 13, move: 2, attack: 'MELEE', set: 'Jurassic Park – Sattler vs. T‑Rex', sidekicks: [{ name: 'Dr. Malcolm', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: DrSattlerImg, abilityDescription: "After Dr. Sattler or Dr. Malcolm move, place an insight token in their new space. You have 5 insight tokens." },
  { id: 'dr-jill-trent', name: 'Dr. Jill Trent', hp: 13, move: 2, attack: 'MELEE', set: 'Adventures: Tales to Amaze', sidekicks: [{ name: 'Daisy', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: DrJillTrentImg, abilityTitle: "GADGETOLOGY", abilityDescription: "At the start of your turn, activate one of your gadgets. Whenever Jill Trent attacks, resolve the active gadget's effect." },
  { id: 'medusa', name: 'Medusa', hp: 16, move: 3, attack: 'RANGED', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'Harpies', count: 3, hp: 2, attack: 'MELEE' }], imageUrl: MedusaImg, abilityDescription: "At the start of your turn, you may deal 1 damage to an opposing fighter in Medusa's zone." },
  { id: 'king-arthur', name: 'King Arthur', hp: 18, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'Merlin', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: KingArthurImg, abilityDescription: "When King Arthur attacks, you may BOOST that attack. Play the BOOST card, face down, along with your attack card. If your opponent cancels the effects on your attack card, the BOOST is discarded without effect." },
  { id: 'sinbad', name: 'Sinbad', hp: 15, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'The Porter', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: SinbadImg, abilityDescription: "When you maneuver, you may move your fighters +1 space for each Voyage card in your discard pile." },
  { id: 'robin-hood', name: 'Robin Hood', hp: 13, move: 2, attack: 'RANGED', set: 'Robin Hood vs Bigfoot', sidekicks: [{ name: 'Outlaws', count: 4, hp: 1, attack: 'MELEE' }], imageUrl: RobinHoodImg, abilityDescription: "After you attack, you may move your attacking fighter up to 2 spaces." },
  { id: 'ingen', name: 'Robert Muldoon', hp: 14, move: 3, attack: 'RANGED', set: 'Jurassic Park – InGen vs. Raptors', sidekicks: [{ name: 'Ingen Workers', count: 3, hp: 2, attack: 'RANGED' }], imageUrl: RobertMuldoonImg, abilityDescription: "At the start of your turn, you may place a trap. Whenever one of your traps is returned to the box, draw a card. Muldoon starts with 8 traps." },
  { id: 'raptors', name: 'Raptors', hp: 7, move: 3, attack: 'MELEE', set: 'Jurassic Park ��� InGen vs. Raptors', sidekicks: [{ name: 'Raptors', count: 2, hp: 7, attack: 'MELEE' }], imageUrl: RaptorsImg, abilityDescription: "Raptors add 1 to the value of their attack cards for each of your other Raptors adjacent to the defender." },
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', hp: 16, move: 2, attack: 'MELEE', set: 'Cobble & Fog', sidekicks: [{ name: 'Dr. Watson', count: 1, hp: 8, attack: 'RANGED' }], imageUrl: SherlockHolmesImg, abilityDescription: "Effects on HOLMES and DR. WATSON cards cannot be canceled by an opponent. (Effects on ANY cards can be canceled.)" },
  { id: 'dracula', name: 'Dracula', hp: 13, move: 2, attack: 'MELEE', set: 'Cobble & Fog', sidekicks: [{ name: 'The Sisters', count: 3, hp: 1, attack: 'MELEE' }], imageUrl: DraculaImg, abilityDescription: "At the start of your turn, you may deal 1 damage to a fighter adjacent to Dracula. If you do, draw a card." },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', hp: 16, move: 2, attack: 'MELEE', set: 'Cobble & Fog', imageUrl: DrJekyllImg, abilityDescription: "Start the game as Dr. Jekyll. At the start of your turn, you may transform into Dr. Jekyll or Mr. Hyde. Use the transformation token to indicate what he currently is. While Mr. Hyde: After you Maneuver, take 1 damage." },
  { id: 'invisible-man', name: 'Invisible Man', hp: 15, move: 2, attack: 'MELEE', set: 'Cobble & Fog', imageUrl: InvisibleManImg, abilityDescription: "At the start of the game, after you place Invisible Man, place 3 fog tokens in separate spaces in his zone. When Invisible Man is on a space with a fog token, add 1 to the value of his defense cards. Invisible Man may move between two spaces with fog tokens as if they were adjacent." },
  { id: 'spike', name: 'Spike', hp: 15, move: 2, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Drusilla', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: SpikeImg, abilityDescription: "At the start of your turn, you may place a Shadow token in any space adjacent to Spike or Drusilla." },
  { id: 'willow', name: 'Willow', hp: 14, move: 2, attack: 'RANGED', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Tara', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: WillowImg, abilityDescription: "When Willow or Tara is dealt damage, Willow becomes Dark Willow. At the end of your turn, if Dark Willow is adjacent to Tara, she becomes Willow." },
  { id: 'little-red', name: 'Little Red Riding Hood', hp: 14, move: 2, attack: 'MELEE', set: 'Little Red Riding Hood vs. Beowulf', sidekicks: [{ name: 'Huntsman', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: RedRidingHoodImg, abilityDescription: "Resolve an effect on a card you play if the symbol next to the effect matches the item in your basket. At the start of the game, place \"Little Red's Basket\" in your discard pile. Little Red's Basket: This starts in your discard pile. It does not count as a card." },
  { id: 'sun-wukong', name: 'Sun Wukong', hp: 17, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Clones', count: 3, hp: 2, attack: 'MELEE' }], imageUrl: SunWukongImg, abilityDescription: "At the start of your turn, you may take 1 damage to summon a Clone in an empty space adjacent to Sun Wukong. Do not start with any Clones on the board." },
  { id: 'yennenga', name: 'Yennenga', hp: 15, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Archers', count: 2, hp: 2, attack: 'RANGED' }], imageUrl: YennengaImg, abilityDescription: "If Yennenga would take damage, you may assign any amount of that damage to one or more Archers in her zone instead. (You may not assign more damage to an Archer than their remaining health.)" },
  { id: 'blackbeard', name: 'Blackbeard', hp: 16, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', imageUrl: BlackbeardImg, abilityTitle: "PRIVATEER TURNED PIRATE", abilityDescription: "Start the game with 1 doubloon in the treasury, you have the other 2. ● At the start of your turn, you may pay 1 doubloon to gain 1 action. ● When Blackbeard takes combat damage, pay 1 doubloon." },
  { id: 'chupacabra', name: 'Chupacabra', hp: 13, move: 3, attack: 'MELEE', set: 'Battle of Legends, Volume Three', imageUrl: ChupacabraImg, abilityTitle: "THE HUNGER", abilityDescription: "After you attack, you may draw a card." },
  { id: 'loki', name: 'Loki', hp: 14, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', imageUrl: LokiImg, abilityTitle: "MISCHIEF-MONGER", abilityDescription: "After you play a TRICK, put that card into your opponent's hand instead of your discard pile. If an opponent discards a TRICK from their hand, return that card to your hand or the top of your deck. Add +1 to your move value for each TRICK in your opponents' hands." },
  { id: 'pandora', name: 'Pandora', hp: 13, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', sidekicks: [{ name: 'Kakodæmons', count: 3, hp: 1, attack: 'MELEE' }], imageUrl: PandoraImg, abilityTitle: "PANDORA'S BOX", abilityDescription: "Do not start with any Kakodæmons on the board. At the start of your turn, open Pandora's Box. Pandora's Box is a deck of seven cards called MISERIES. When you open Pandora's Box, reveal the top card and resolve its effect (if any). You may keep revealing and resolving additional cards, one at a time, until you choose to stop. If there are three or more total feathers on revealed cards, you must stop revealing, then Pandora takes 1 damage for each revealed MISERY. At the end of your turn, shuffle all revealed MISERIES back into Pandora's Box." },
  { id: 'luke-cage', name: 'Luke Cage', hp: 13, move: 2, attack: 'MELEE', set: 'Redemption Row', sidekicks: [{ name: 'Misty Knight', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: LukeCageImg, abilityDescription: "Luke Cage takes 2 less combat damage from attacks. (When defending, Luke Cage wins combat if he takes no damage, even if he didn't play a card.)" },
  { id: 'moon-knight', name: 'Moon Knight', hp: 16, move: 3, attack: 'MELEE', set: 'Redemption Row', imageUrl: MoonKnightImg, abilityDescription: "Start the game as Moon Knight. At the end of your turn, change to your next identity (Moon Knight ➞ Khonshu ➞ Mr. Knight ➞ Moon Knight). ● Moon Knight: At the start of your turn, move up to 2 spaces. ● Khonshu: Khonshu adds +2 to the value of his attack cards. He does not take damage from effects other than combat damage. ● Mr. Knight: Mr. Knight adds +1 to all his defense values." },
  { id: 'ghost-rider', name: 'Ghost Rider', hp: 17, move: 2, attack: 'MELEE', set: 'Redemption Row', imageUrl: GhostRiderImg, abilityDescription: "Ghost Rider starts the game with 5 Hellfire. When you maneuver you may spend 1 Hellfire. If you do, increase Ghost Rider's move value to 4, and he may move through opposing fighters. Then deal 1 damage to each opposing fighter he moved through." },
  { id: 'elektra', name: 'Elektra', hp: 7, move: 2, attack: 'MELEE', set: 'Hell\'s Kitchen', sidekicks: [{ name: 'The Hand', count: 4, hp: 1, attack: 'MELEE' }], imageUrl: ElektraImg, abilityDescription: "The first time Elektra would be defeated, remove her and all Hand from the board. She is not defeated. At the start of your next turn, Resurrect her. (Ignore effects with the RESURRECTED symbol.) When Elektra Resurrects: Flip your health dial. Shuffle your discard pile into your deck. Place Elektra and all Hand back onto the board with each fighter in a different zone. (You must resolve effects with the RESURRECTED symbol.)" },
  { id: 't-rex', name: 'T. Rex', hp: 27, move: 1, attack: 'MELEE', set: 'Jurassic Park – Sattler vs. T‑Rex', imageUrl: TRexImg, abilityDescription: "T. Rex is a large fighter. (She can attack up to 2 spaces away.) At the end of your turn, draw a card." },
  { id: 'houdini', name: 'Harry Houdini', hp: 14, move: 2, attack: 'MELEE', set: 'Houdini vs. The Genie', sidekicks: [{ name: 'Bess', count: 1, hp: 5, attack: 'MELEE' }], imageUrl: HoudiniImg, abilityTitle: "ESCAPE ARTIST", abilityDescription: "When you take the maneuver action and BOOST, you may place Houdini in any space instead of moving. (Bess moves as normal.)" },
  { id: 'the-genie', name: 'The Genie', hp: 16, move: 3, attack: 'RANGED', set: 'Houdini vs. The Genie', imageUrl: TheGenieImg, abilityTitle: "INFINITE POWER", abilityDescription: "At the start of your turn, you may discard 1 card to gain 1 action." },
  { id: 'ms-marvel', name: 'Ms. Marvel', hp: 14, move: 2, attack: 'MELEE', set: 'Teen Spirit', imageUrl: MsMarvelImg, abilityTitle: "STRETCHY", abilityDescription: "At the start of your turn, you may move Ms. Marvel 1 space. Ms. Marvel can attack from up to 2 spaces away (ignoring zones)." },
  { id: 'squirrel-girl', name: 'Squirrel Girl', hp: 13, move: 2, attack: 'MELEE', set: 'Teen Spirit', sidekicks: [{ name: 'Squirrels', count: 4, hp: 1, attack: 'MELEE' }], imageUrl: SquirrelGirlImg, abilityTitle: "GO NUTS!", abilityDescription: "At the start of your turn, summon a squirrel in a space adjacent to Squirrel Girl. Squirrels are small fighters. Do not start with any squirrels on the board." },
  { id: 'winter-soldier', name: 'Winter Soldier', hp: 15, move: 2, attack: 'RANGED', set: 'For King and Country', imageUrl: WinterSoldierImg, abilityTitle: "BRAINWASHED", abilityDescription: "Effects on Winter Soldier's cards cannot be canceled." },
  { id: 'spider-man', name: 'Spider‑Man', hp: 15, move: 3, attack: 'MELEE', set: 'Brains and Brawn', sidekicks: [{ name: 'Aunt May', count: 1, hp: 5, attack: 'MELEE' }], imageUrl: SpiderManImg, abilityTitle: "SPIDEY‑SENSE", abilityDescription: "When an opponent attacks Spider‑Man, before you play a defense card, they must tell you the printed value of their card." },
  { id: 'she-hulk', name: 'She‑Hulk', hp: 20, move: 2, attack: 'MELEE', set: 'Brains and Brawn', sidekicks: [{ name: 'Pug', count: 1, hp: 5, attack: 'MELEE' }], imageUrl: SheHulkImg, abilityTitle: "JUST THROW SOMETHING", abilityDescription: "At the start of your turn, you may discard a card to deal damage equal to its BOOST value to a fighter in your zone." },
  { id: 'nikola-tesla', name: 'Nikola Tesla', hp: 14, move: 2, attack: 'RANGED', set: 'Adventures: Tales to Amaze', sidekicks: [{ name: 'Pigeons', count: 2, hp: 2, attack: 'MELEE' }], imageUrl: NikolaTeslaImg, abilityTitle: "ELECTRICAL OVERFLOW", abilityDescription: "Start the game with 1 coil charged. At the end of your turn, charge 1 coil. At the start of your turn, if both coils are charged, deal 1 damage to each opposing fighter adjacent to Tesla and move them up to 1 space." },
  { id: 'golden-bat', name: 'Golden Bat', hp: 18, move: 3, attack: 'MELEE', set: 'Adventures: Tales to Amaze', imageUrl: GoldenBatImg, abilityTitle: "THE FIRST SUPERHERO", abilityDescription: "If you haven't taken a Maneuver action this turn, add +2 to the value of Golden Bat's attacks." },
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', hp: 14, move: 2, attack: 'RANGED', set: 'Sun\'s Origin', imageUrl: TomoeGozenImg, abilityTitle: "ATTACK OF OPPORTUNITY", abilityDescription: "When an opposing hero leaves Tomoe Gozen's zone, deal 1 damage to that hero." },
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', hp: 13, move: 2, attack: 'MELEE', set: 'Sun\'s Origin', sidekicks: [{ name: 'Honor Guard', count: 2, hp: 2, attack: 'MELEE' }], imageUrl: OdaNobunagaImg, abilityTitle: "MASTER STRATEGIST", abilityDescription: "Other friendly fighters in Oda Nobunaga's zone add +1 to the value of their played combat cards. (Oda Nobunaga does not benefit from this ability.)" },
  { id: 'hamlet', name: 'Hamlet', hp: 15, move: 2, attack: 'MELEE', set: 'Slings & Arrows', sidekicks: [{ name: 'Rosencrantz', count: 1, hp: 2, attack: 'MELEE' }, { name: 'Guildenstern', count: 1, hp: 2, attack: 'MELEE' }], imageUrl: HamletImg, abilityTitle: "THE QUESTION", abilityDescription: "At the start of your turn, choose TO BE or NOT TO BE. If you choose NOT TO BE, deal 2 damage to one of your fighters. ● TO BE: When you maneuver, draw 1 additional card. ● NOT TO BE: Add +2 to the value of Hamlet's attacks." },
  { id: 'titania', name: 'Titania', hp: 12, move: 2, attack: 'RANGED', set: 'Slings & Arrows', sidekicks: [{ name: 'Oberon', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: TitaniaImg, abilityTitle: "FAIRY MAGIC", abilityDescription: "If you do not have a face‑up glamour at the start of your turn, flip the top card of your glamour deck face‑up. Its effect is ongoing while it remains face‑up." },
  { id: 'wayward-sisters', name: 'The Wayward Sisters', hp: 6, move: 2, attack: 'MELEE', set: 'Slings & Arrows', sidekicks: [{ name: 'The Sisters', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: TheWaywardSistersImg, abilityTitle: "BUBBLING BREW", abilityDescription: "Your cards go into your cauldron instead of your discard pile. After you attack, you may cast one spell that you have the ingredients for. If you do, discard all the cards in your cauldron." },
  { id: 'william-shakespeare', name: 'William Shakespeare', hp: 13, move: 2, attack: 'MELEE', set: 'Slings & Arrows', sidekicks: [{ name: 'Actors', count: 3, hp: 2, attack: 'MELEE' }], imageUrl: ShakespeareImg, abilityTitle: "IAMBIC PENTAMETER", abilityDescription: "After you attack or defend, add your card to your line. When your line has 10 or more syllables, discard your line. If there are exactly 10 syllables, resolve the completion effect on the last card." },
  { id: 'eredin', name: 'Eredin', hp: 14, move: 2, attack: 'MELEE', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Red Riders', count: 4, hp: 1, attack: 'MELEE' }], imageUrl: EredinImg, abilityTitle: "KING OF THE WILD HUNT", abilityDescription: "While all of your Red Riders are defeated, Eredin is ENRAGED. If Eredin is ENRAGED, add +1 to the value of your combat cards, and your move value is 3." },
  { id: 'philippa', name: 'Philippa', hp: 12, move: 2, attack: 'RANGED', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Dijkstra', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: PhilippaImg, abilityTitle: "TWO STEPS AHEAD", abilityDescription: "At the end of your turn, you may draw until you have a hand of 4 cards." },
  { id: 'yennefer-triss', name: 'Yennefer & Triss', hp: 14, move: 2, attack: 'RANGED', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Yennefer or Triss', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: YenneferImg, abilityTitle: "SORCERESS OF VENGERBERG / MERIGOLD THE FEARLESS", abilityDescription: "At the beginning of the game, choose Yennefer or Triss to be your hero. Yennefer: SORCERESS OF VENGERBERG: IMMEDIATELY: If Yennefer is attacking, you may BOOST her attack. (This effect cannot be canceled.) Triss: MERIGOLD THE FEARLESS: After Triss plays a scheme, deal 2 damage to a fighter adjacent to Triss." },
  { id: 'geralt', name: 'Geralt of Rivia', hp: 16, move: 2, attack: 'MELEE', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Dandelion', count: 1, hp: 5, attack: 'RANGED' }], imageUrl: GeraltImg, abilityTitle: "ALWAYS PREPARED", abilityDescription: "At the start of the game, choose your gear. Select a POTION, ARMOR, and SWORD, and shuffle 2 copies of each into your deck." },
  { id: 'muhammad-ali', name: 'Muhammad Ali', hp: 16, move: 3, attack: 'MELEE', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: BruceLeeImg, abilityTitle: "A BEAUTIFUL SWING", abilityDescription: "Begin the game with your stance on Float Like a Butterfly. After you attack, if you won the combat, change stances. Float Like a Butterfly: You can attack from 2 spaces away. Sting Like a Bee: Add +2 to your attacks." },
  { id: 'bruce-lee-ali', name: 'Bruce Lee', hp: 14, move: 3, attack: 'MELEE', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: BruceLeeImg, abilityTitle: "FLEET OF FOOT", abilityDescription: "At the end of your turn, you may move Bruce Lee 1 space." },
  { id: 'leonardo', name: 'Leonardo', hp: 14, move: 2, attack: 'MELEE', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', imageUrl: LeonardoImg, abilityTitle: "TEAM TACTICS", abilityDescription: "At the start of your turn, move any fighter up to 1 space." },
  { id: 'raphael', name: 'Raphael', hp: 16, move: 2, attack: 'MELEE', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', sidekicks: [{ name: 'Casey', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: RaphaelImg, abilityTitle: "ANGER ISSUES", abilityDescription: "On each of your turns, the first time you lose combat, gain 1 action." },
  { id: 'donatello', name: 'Donatello', hp: 12, move: 2, attack: 'RANGED', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', sidekicks: [{ name: 'Metalhead', count: 1, hp: 8, attack: 'MELEE' }], imageUrl: DonatelloImg, abilityTitle: "INVENTIVE", abilityDescription: "When you maneuver, you may draw 2 cards instead of 1. If you do, put a card in your hand on the bottom of your deck. After you play an invention, tuck it under this card." },
  { id: 'michelangelo', name: 'Michelangelo', hp: 13, move: 3, attack: 'MELEE', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', sidekicks: [{ name: 'April', count: 1, hp: 5, attack: 'MELEE' }], imageUrl: MichaelangeloImg, abilityTitle: "PIZZA PARTY", abilityDescription: "After you attack or scheme, draw 1 card. Your starting and maximum hand size is 3." },
  { id: 'krang', name: 'Krang', hp: 16, move: 1, attack: 'MELEE', set: 'TMNT: Shredder and Krang', imageUrl: '', abilityTitle: "DOOOOOM", abilityDescription: "Krang has 3 doomsday machines. Start with one machine active. After you roll the Die of Ultimate Destruction, you can deactivate an active machine to reroll the die. Add +1 to your move value for each active machine." },
  { id: 'shredder', name: 'Shredder', hp: 15, move: 3, attack: 'MELEE', set: 'TMNT: Shredder and Krang', sidekicks: [{ name: 'Bebop & Rocksteady', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: '', abilityTitle: "MASTER OF THE CLAN", abilityDescription: "At the start of your turn, deploy a Foot soldier to a path adjacent to a friendly fighter. You may attack opposing fighters adjacent to Foot soldiers. If an opponent boosts their maneuver, they may remove any Foot soldiers their hero moves through." },
]

export const MAPS: Map[] = [
  { id: 'mcminnville', name: 'McMinnville OR', set: 'Adventures: Tales to Amaze', minPlayers: 2, maxPlayers: 4, zones: 10, spaces: 42, imageUrl: McMinnvilleOR },
  { id: 'point-pleasant', name: 'Point Pleasant', set: 'Adventures: Tales to Amaze', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 42, imageUrl: PointPleasant },
  { id: 'marmoreal', name: 'Marmoreal', set: 'Battle of Legends, Volume One', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 31, imageUrl: Marmoreal },
  { id: 'sarpedon', name: 'Sarpedon', set: 'Battle of Legends, Volume One', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 38, imageUrl: Sarpedon },
  { id: 'santas-workshop', name: 'Santa\'s Workshop', set: 'Battle of Legends, Volume Three', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 34 },
  { id: 'venice', name: 'Venice', set: 'Battle of Legends, Volume Three', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 33 },
  { id: 'hanging-gardens', name: 'Hanging Gardens', set: 'Battle of Legends, Volume Two', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 33, imageUrl: HangingGardens },
  { id: 'sanctum-sanctorum', name: 'Sanctum Sanctorum', set: 'Brains and Brawn', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29, imageUrl: SanctumSantorum },
  { id: 'sunnydale-high', name: 'Sunnydale High', set: 'Buffy the Vampire Slayer', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 31, imageUrl: SunnydaleHigh },
  { id: 'the-bronze', name: 'The Bronze', set: 'Buffy the Vampire Slayer', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 35, imageUrl: TheBronze },
  { id: 'baskerville-manor', name: 'Baskerville Manor', set: 'Cobble & Fog', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 32, imageUrl: BaskervilleManor },
  { id: 'soho', name: 'Soho', set: 'Cobble & Fog', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29, imageUrl: Soho },
  { id: 'helicarrier', name: 'Helicarrier', set: 'For King and Country', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29, imageUrl: Helicarrier },
  { id: 'hells-kitchen', name: 'Hell\'s Kitchen', set: 'Hell\'s Kitchen', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 30, imageUrl: HellsKitchenMap },
  { id: 'king-solomons-mine', name: 'King Solomon\'s Mine', set: 'Houdini vs. The Genie', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 29, imageUrl: KingSolomonsMine },
  { id: 'raptor-paddock', name: 'Raptor Paddock', set: 'Jurassic Park – InGen vs. Raptors', minPlayers: 2, maxPlayers: 2, zones: 6, spaces: 28, imageUrl: RaptorPaddock },
  { id: 't-rex-paddock', name: 'T. Rex Paddock', set: 'Jurassic Park – Sattler vs. T-Rex', minPlayers: 2, maxPlayers: 2, zones: 6, spaces: 26, imageUrl: TRexPaddock },
  { id: 'heorot', name: 'Heorot', set: 'Little Red Riding Hood vs. Beowulf', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30, imageUrl: Heorot },
  { id: 'the-raft', name: 'The Raft', set: 'Redemption Row', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 31, imageUrl: TheRaft },
  { id: 'sherwood-forest', name: 'Sherwood Forest', set: 'Robin Hood vs Bigfoot', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30, imageUrl: SherwoodForest },
  { id: 'yukon', name: 'Yukon', set: 'Robin Hood vs Bigfoot', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31, imageUrl: Yukon },
  { id: 'globe-theatre', name: 'Globe Theatre', set: 'Slings & Arrows', minPlayers: 2, maxPlayers: 4, zones: 10, spaces: 32, imageUrl: GlobeTheater },
  { id: 'azuchi-castle', name: 'Azuchi Castle', set: 'Sun\'s Origin', minPlayers: 2, maxPlayers: 2, zones: 8, spaces: 31, imageUrl: AzuchiCastle },
  { id: 'navy-pier', name: 'Navy Pier', set: 'Teen Spirit', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 30, imageUrl: NavyPier },
  { id: 'naglfar', name: 'Naglfar', set: 'The Witcher – Realms Fall', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 28, imageUrl: Naglfar },
  { id: 'streets-of-novigrad', name: 'Streets of Novigrad', set: 'The Witcher – Realms Fall', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 34, imageUrl: StreetsOfNovigrad },
  { id: 'fayrlund-forest', name: 'Fayrlund Forest', set: 'The Witcher – Steel & Silver', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 30, imageUrl: FayrlundForest },
  { id: 'kaer-morhen', name: 'Kaer Morhen', set: 'The Witcher – Steel & Silver', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 32, imageUrl: KaerMorhen },
  { id: 'tsing-shan-monastery', name: 'Tsing Shan Monastery', set: 'Muhammad Ali vs. Bruce Lee', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30 },
  { id: 'thrilla-in-manila', name: 'Thrilla In Manila', set: 'Muhammad Ali vs. Bruce Lee', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30 },
  { id: 'technodrome', name: 'Technodrome', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', minPlayers: 2, maxPlayers: 4 },
  { id: 'new-york-city', name: 'New York City', set: 'Unmatched Adventures: Teenage Mutant Ninja Turtles', minPlayers: 2, maxPlayers: 4 },
]

export function getHeroById(id: string): Hero | undefined {
  const normalizedId = id === 'bruce-lee-ali' ? 'bruce-lee' : id
  return HEROES.find(h => h.id === normalizedId)
}

export function getMapById(id: string): Map | undefined {
  return MAPS.find(m => m.id === id)
}

export function getHeroesBySet(set: string): Hero[] {
  return HEROES.filter(h => h.set === set)
}

export function getMapsBySet(set: string): Map[] {
  return MAPS.filter(m => m.set === set)
}

export function getMapsByPlayerCount(playerCount: number): Map[] {
  return MAPS.filter(m => playerCount >= m.minPlayers && playerCount <= m.maxPlayers)
}

export const ADVENTURE_SETS = ['Adventures: Tales to Amaze', 'Unmatched Adventures: Teenage Mutant Ninja Turtles']

export function getCooperativeMaps(): Map[] {
  return MAPS.filter(m => ADVENTURE_SETS.includes(m.set))
}

export function getSelectableHeroes(): Hero[] {
  return HEROES.filter(h => h.id !== 'bruce-lee-ali')
}
