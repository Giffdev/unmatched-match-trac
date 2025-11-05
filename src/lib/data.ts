import type { Hero, Map, SetInfo } from './types'

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
]

export const FRANCHISES = Array.from(new Set(UNMATCHED_SETS.map(s => s.franchise))).sort()

export function getSetsByFranchise(franchise: string): SetInfo[] {
  return UNMATCHED_SETS.filter(s => s.franchise === franchise)
}

export const HEROES: Hero[] = [
  { id: 'alice', name: 'Alice', set: 'Battle of Legends, Volume One', sidekick: 'The Jabberwock' },
  { id: 'medusa', name: 'Medusa', set: 'Battle of Legends, Volume One', sidekick: 'Harpies' },
  { id: 'king-arthur', name: 'King Arthur', set: 'Battle of Legends, Volume One', sidekick: 'Merlin' },
  { id: 'sinbad', name: 'Sinbad', set: 'Battle of Legends, Volume One', sidekick: 'Porter' },
  
  { id: 'bruce-lee', name: 'Bruce Lee', set: 'Bruce Lee' },
  
  { id: 'robin-hood', name: 'Robin Hood', set: 'Robin Hood vs Bigfoot', sidekick: 'Outlaws' },
  { id: 'bigfoot', name: 'Bigfoot', set: 'Robin Hood vs Bigfoot' },
  
  { id: 'ingen', name: 'Robert Muldoon', set: 'Jurassic Park – InGen vs. Raptors', sidekick: 'InGen Workers' },
  { id: 'raptors', name: 'Raptors', set: 'Jurassic Park – InGen vs. Raptors' },
  
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', set: 'Cobble & Fog', sidekick: 'Dr. Watson' },
  { id: 'dracula', name: 'Dracula', set: 'Cobble & Fog', sidekick: 'Sisters' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', set: 'Cobble & Fog' },
  { id: 'invisible-man', name: 'Invisible Man', set: 'Cobble & Fog' },
  
  { id: 'buffy', name: 'Buffy', set: 'Buffy the Vampire Slayer', sidekick: 'Giles' },
  { id: 'angel', name: 'Angel', set: 'Buffy the Vampire Slayer', sidekick: 'Faith' },
  { id: 'spike', name: 'Spike', set: 'Buffy the Vampire Slayer', sidekick: 'Drusilla' },
  { id: 'willow', name: 'Willow', set: 'Buffy the Vampire Slayer', sidekick: 'Tara' },
  
  { id: 'little-red', name: 'Little Red Riding Hood', set: 'Little Red Riding Hood vs. Beowulf', sidekick: 'The Huntsman' },
  { id: 'beowulf', name: 'Beowulf', set: 'Little Red Riding Hood vs. Beowulf', sidekick: 'Wiglaf' },
  
  { id: 'deadpool', name: 'Deadpool', set: 'Deadpool' },
  
  { id: 'achilles', name: 'Achilles', set: 'Battle of Legends, Volume Two', sidekick: 'Patroclus' },
  { id: 'bloody-mary', name: 'Bloody Mary', set: 'Battle of Legends, Volume Two', sidekick: 'Spirits' },
  { id: 'sun-wukong', name: 'Sun Wukong', set: 'Battle of Legends, Volume Two', sidekick: 'Clones' },
  { id: 'yennenga', name: 'Yennenga', set: 'Battle of Legends, Volume Two', sidekick: 'Stallions' },
  
  { id: 'blackbeard', name: 'Blackbeard', set: 'Battle of Legends, Volume Three', sidekick: 'Crew' },
  { id: 'chupacabra', name: 'Chupacabra', set: 'Battle of Legends, Volume Three', sidekick: 'Goats' },
  { id: 'loki', name: 'Loki', set: 'Battle of Legends, Volume Three', sidekick: 'Hel' },
  { id: 'pandora', name: 'Pandora', set: 'Battle of Legends, Volume Three', sidekick: 'Hope' },
  
  { id: 'luke-cage', name: 'Luke Cage', set: 'Redemption Row', sidekick: 'Misty Knight' },
  { id: 'moon-knight', name: 'Moon Knight', set: 'Redemption Row', sidekick: 'Khonshu' },
  { id: 'ghost-rider', name: 'Ghost Rider', set: 'Redemption Row', sidekick: 'Cerberus' },
  
  { id: 'daredevil', name: 'Daredevil', set: 'Hell\'s Kitchen', sidekick: 'Foggy Nelson' },
  { id: 'bullseye', name: 'Bullseye', set: 'Hell\'s Kitchen', sidekick: 'Hostages' },
  { id: 'elektra', name: 'Elektra', set: 'Hell\'s Kitchen', sidekick: 'The Hand' },
  
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', set: 'Jurassic Park – Sattler vs. T‑Rex', sidekick: 'Dr. Ian Malcolm' },
  { id: 't-rex', name: 'T‑Rex', set: 'Jurassic Park – Sattler vs. T‑Rex' },
  
  { id: 'houdini', name: 'Harry Houdini', set: 'Houdini vs. The Genie', sidekick: 'The Heir' },
  { id: 'the-genie', name: 'The Genie', set: 'Houdini vs. The Genie', sidekick: 'Jafar' },
  
  { id: 'ms-marvel', name: 'Ms. Marvel', set: 'Teen Spirit', sidekick: 'Bruno Carrelli' },
  { id: 'squirrel-girl', name: 'Squirrel Girl', set: 'Teen Spirit', sidekick: 'Squirrels' },
  { id: 'cloak-dagger', name: 'Cloak & Dagger', set: 'Teen Spirit' },
  
  { id: 'black-widow', name: 'Black Widow', set: 'For King and Country', sidekick: 'Nick Fury' },
  { id: 'black-panther', name: 'Black Panther', set: 'For King and Country', sidekick: 'Okoye' },
  { id: 'winter-soldier', name: 'Winter Soldier', set: 'For King and Country', sidekick: 'White Wolf' },
  
  { id: 'spider-man', name: 'Spider‑Man', set: 'Brains and Brawn', sidekick: 'Black Cat' },
  { id: 'she-hulk', name: 'She‑Hulk', set: 'Brains and Brawn', sidekick: 'Titania' },
  { id: 'doctor-strange', name: 'Doctor Strange', set: 'Brains and Brawn', sidekick: 'Wong' },
  
  { id: 'nikola-tesla', name: 'Nikola Tesla', set: 'Adventures: Tales to Amaze', sidekick: 'Robots' },
  { id: 'dr-jill-trent', name: 'Dr. Jill Trent', set: 'Adventures: Tales to Amaze', sidekick: 'Daisy Tremaine' },
  { id: 'golden-bat', name: 'Golden Bat', set: 'Adventures: Tales to Amaze', sidekick: 'Bats' },
  { id: 'annie-christmas', name: 'Annie Christmas', set: 'Adventures: Tales to Amaze', sidekick: 'Daughters' },
  
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', set: 'Sun\'s Origin', sidekick: 'Archers' },
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', set: 'Sun\'s Origin', sidekick: 'Tanegashima' },
  
  { id: 'hamlet', name: 'Hamlet', set: 'Slings & Arrows', sidekick: 'Horatio' },
  { id: 'titania', name: 'Titania', set: 'Slings & Arrows', sidekick: 'Bottom' },
  { id: 'wayward-sisters', name: 'The Wayward Sisters', set: 'Slings & Arrows' },
  { id: 'william-shakespeare', name: 'William Shakespeare', set: 'Slings & Arrows', sidekick: 'Yorick' },
  
  { id: 'eredin', name: 'Eredin', set: 'The Witcher – Realms Fall', sidekick: 'Wild Hunt Riders' },
  { id: 'philippa', name: 'Philippa', set: 'The Witcher – Realms Fall', sidekick: 'Lackeys' },
  { id: 'yennefer-triss', name: 'Yennefer & Triss', set: 'The Witcher – Realms Fall', sidekick: 'Sorceresses' },
  
  { id: 'geralt', name: 'Geralt of Rivia', set: 'The Witcher – Steel & Silver', sidekick: 'Roach' },
  { id: 'ciri', name: 'Ciri', set: 'The Witcher – Steel & Silver', sidekick: 'Zireael' },
  { id: 'ancient-leshen', name: 'Ancient Leshen', set: 'The Witcher – Steel & Silver', sidekick: 'Wolves' },
  
  { id: 'muhammad-ali', name: 'Muhammad Ali', set: 'Muhammad Ali vs. Bruce Lee' },
  { id: 'bruce-lee-ali', name: 'Bruce Lee', set: 'Muhammad Ali vs. Bruce Lee' },
]

export const MAPS: Map[] = [
  { id: 'mcminnville', name: 'McMinnville OR', set: 'Adventures: Tales to Amaze', minPlayers: 2, maxPlayers: 4, zones: 10, spaces: 42 },
  { id: 'point-pleasant', name: 'Point Pleasant', set: 'Adventures: Tales to Amaze', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 42 },
  { id: 'marmoreal', name: 'Marmoreal', set: 'Battle of Legends, Volume One', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 31 },
  { id: 'sarpedon', name: 'Sarpedon', set: 'Battle of Legends, Volume One', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 38 },
  { id: 'santas-workshop', name: 'Santa\'s Workshop', set: 'Battle of Legends, Volume Three', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 34 },
  { id: 'venice', name: 'Venice', set: 'Battle of Legends, Volume Three', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 33 },
  { id: 'hanging-gardens', name: 'Hanging Gardens', set: 'Battle of Legends, Volume Two', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 33 },
  { id: 'sanctum-sanctorum', name: 'Sanctum Sanctorum', set: 'Brains and Brawn', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29 },
  { id: 'sunnydale-high', name: 'Sunnydale High', set: 'Buffy the Vampire Slayer', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 31 },
  { id: 'the-bronze', name: 'The Bronze', set: 'Buffy the Vampire Slayer', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 35 },
  { id: 'baskerville-manor', name: 'Baskerville Manor', set: 'Cobble & Fog', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 32 },
  { id: 'soho', name: 'Soho', set: 'Cobble & Fog', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29 },
  { id: 'helicarrier', name: 'Helicarrier', set: 'For King and Country', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 29 },
  { id: 'hells-kitchen', name: 'Hell\'s Kitchen', set: 'Hell\'s Kitchen', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 30 },
  { id: 'king-solomons-mine', name: 'King Solomon\'s Mine', set: 'Houdini vs. The Genie', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 29 },
  { id: 'raptor-paddock', name: 'Raptor Paddock', set: 'Jurassic Park – InGen vs. Raptors', minPlayers: 2, maxPlayers: 2, zones: 6, spaces: 28 },
  { id: 't-rex-paddock', name: 'T. Rex Paddock', set: 'Jurassic Park – Sattler vs. T-Rex', minPlayers: 2, maxPlayers: 2, zones: 6, spaces: 26 },
  { id: 'heorot', name: 'Heorot', set: 'Little Red Riding Hood vs. Beowulf', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30 },
  { id: 'the-raft', name: 'The Raft', set: 'Redemption Row', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 31 },
  { id: 'sherwood-forest', name: 'Sherwood Forest', set: 'Robin Hood vs Bigfoot', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 30 },
  { id: 'yukon', name: 'Yukon', set: 'Robin Hood vs Bigfoot', minPlayers: 2, maxPlayers: 2, zones: 7, spaces: 31 },
  { id: 'globe-theatre', name: 'Globe Theatre', set: 'Slings & Arrows', minPlayers: 2, maxPlayers: 4, zones: 10, spaces: 32 },
  { id: 'azuchi-castle', name: 'Azuchi Castle', set: 'Sun\'s Origin', minPlayers: 2, maxPlayers: 2, zones: 8, spaces: 31 },
  { id: 'navy-pier', name: 'Navy Pier', set: 'Teen Spirit', minPlayers: 2, maxPlayers: 4, zones: 6, spaces: 30 },
  { id: 'naglfar', name: 'Naglfar', set: 'The Witcher – Realms Fall', minPlayers: 2, maxPlayers: 4, zones: 7, spaces: 28 },
  { id: 'streets-of-novigrad', name: 'Streets of Novigrad', set: 'The Witcher – Realms Fall', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 34 },
  { id: 'fayrlund-forest', name: 'Fayrlund Forest', set: 'The Witcher – Steel & Silver', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 30 },
  { id: 'kaer-morhen', name: 'Kaer Morhen', set: 'The Witcher – Steel & Silver', minPlayers: 2, maxPlayers: 4, zones: 8, spaces: 32 },
]

export function getHeroById(id: string): Hero | undefined {
  return HEROES.find(h => h.id === id)
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

export const ADVENTURE_SETS = ['Adventures: Tales to Amaze']

export function getCooperativeMaps(): Map[] {
  return MAPS.filter(m => ADVENTURE_SETS.includes(m.set))
}
