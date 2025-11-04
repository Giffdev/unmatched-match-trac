import type { Hero, Map } from './types'

export const UNMATCHED_SETS = [
  'Battle of Legends, Volume One',
  'Bruce Lee',
  'Robin Hood vs. Bigfoot',
  'Jurassic Park – InGen vs. Raptors',
  'Cobble & Fog',
  'Buffy the Vampire Slayer',
  'Little Red Riding Hood vs. Beowulf',
  'Deadpool',
  'Battle of Legends, Volume Two',
  'Redemption Row',
  'Hell\'s Kitchen',
  'Jurassic Park – Sattler vs. T‑Rex',
  'Houdini vs. The Genie',
  'Teen Spirit',
  'For King and Country',
  'Brains & Brawn',
  'Unmatched Adventures – Tales to Amaze',
  'Sun\'s Origin',
  'Slings & Arrows',
  'Realm\'s Fall',
  'Steel & Silver',
  'Muhammad Ali vs. Bruce Lee',
]

export const HEROES: Hero[] = [
  { id: 'alice', name: 'Alice', set: 'Battle of Legends, Volume One' },
  { id: 'medusa', name: 'Medusa', set: 'Battle of Legends, Volume One' },
  { id: 'king-arthur', name: 'King Arthur', set: 'Battle of Legends, Volume One' },
  { id: 'sinbad', name: 'Sinbad', set: 'Battle of Legends, Volume One' },
  
  { id: 'bruce-lee', name: 'Bruce Lee', set: 'Bruce Lee' },
  
  { id: 'robin-hood', name: 'Robin Hood', set: 'Robin Hood vs. Bigfoot' },
  { id: 'bigfoot', name: 'Bigfoot', set: 'Robin Hood vs. Bigfoot' },
  
  { id: 'ingen', name: 'InGen', set: 'Jurassic Park – InGen vs. Raptors' },
  { id: 'raptors', name: 'Raptors', set: 'Jurassic Park – InGen vs. Raptors' },
  
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', set: 'Cobble & Fog' },
  { id: 'dracula', name: 'Dracula', set: 'Cobble & Fog' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', set: 'Cobble & Fog' },
  { id: 'invisible-man', name: 'Invisible Man', set: 'Cobble & Fog' },
  
  { id: 'buffy', name: 'Buffy', set: 'Buffy the Vampire Slayer' },
  { id: 'angel', name: 'Angel', set: 'Buffy the Vampire Slayer' },
  { id: 'spike', name: 'Spike', set: 'Buffy the Vampire Slayer' },
  { id: 'willow', name: 'Willow', set: 'Buffy the Vampire Slayer' },
  
  { id: 'little-red', name: 'Little Red Riding Hood', set: 'Little Red Riding Hood vs. Beowulf' },
  { id: 'beowulf', name: 'Beowulf', set: 'Little Red Riding Hood vs. Beowulf' },
  
  { id: 'deadpool', name: 'Deadpool', set: 'Deadpool' },
  
  { id: 'achilles', name: 'Achilles', set: 'Battle of Legends, Volume Two' },
  { id: 'bloody-mary', name: 'Bloody Mary', set: 'Battle of Legends, Volume Two' },
  { id: 'sun-wukong', name: 'Sun Wukong', set: 'Battle of Legends, Volume Two' },
  { id: 'yennenga', name: 'Yennenga', set: 'Battle of Legends, Volume Two' },
  
  { id: 'luke-cage', name: 'Luke Cage', set: 'Redemption Row' },
  { id: 'moon-knight', name: 'Moon Knight', set: 'Redemption Row' },
  { id: 'ghost-rider', name: 'Ghost Rider', set: 'Redemption Row' },
  
  { id: 'daredevil', name: 'Daredevil', set: 'Hell\'s Kitchen' },
  { id: 'bullseye', name: 'Bullseye', set: 'Hell\'s Kitchen' },
  { id: 'elektra', name: 'Elektra', set: 'Hell\'s Kitchen' },
  
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', set: 'Jurassic Park – Sattler vs. T‑Rex' },
  { id: 't-rex', name: 'T‑Rex', set: 'Jurassic Park – Sattler vs. T‑Rex' },
  
  { id: 'houdini', name: 'Harry Houdini', set: 'Houdini vs. The Genie' },
  { id: 'the-genie', name: 'The Genie', set: 'Houdini vs. The Genie' },
  
  { id: 'ms-marvel', name: 'Ms. Marvel', set: 'Teen Spirit' },
  { id: 'squirrel-girl', name: 'Squirrel Girl', set: 'Teen Spirit' },
  { id: 'cloak-dagger', name: 'Cloak & Dagger', set: 'Teen Spirit' },
  
  { id: 'black-widow', name: 'Black Widow', set: 'For King and Country' },
  { id: 'black-panther', name: 'Black Panther', set: 'For King and Country' },
  { id: 'winter-soldier', name: 'Winter Soldier', set: 'For King and Country' },
  
  { id: 'spider-man', name: 'Spider‑Man', set: 'Brains & Brawn' },
  { id: 'she-hulk', name: 'She‑Hulk', set: 'Brains & Brawn' },
  { id: 'doctor-strange', name: 'Doctor Strange', set: 'Brains & Brawn' },
  
  { id: 'nikola-tesla', name: 'Nikola Tesla', set: 'Unmatched Adventures – Tales to Amaze' },
  { id: 'dr-jill-trent', name: 'Dr. Jill Trent', set: 'Unmatched Adventures – Tales to Amaze' },
  { id: 'golden-bat', name: 'Golden Bat', set: 'Unmatched Adventures – Tales to Amaze' },
  { id: 'annie-christmas', name: 'Annie Christmas', set: 'Unmatched Adventures – Tales to Amaze' },
  
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', set: 'Sun\'s Origin' },
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', set: 'Sun\'s Origin' },
  
  { id: 'hamlet', name: 'Hamlet', set: 'Slings & Arrows' },
  { id: 'titania', name: 'Titania', set: 'Slings & Arrows' },
  { id: 'wayward-sisters', name: 'The Wayward Sisters', set: 'Slings & Arrows' },
  { id: 'william-shakespeare', name: 'William Shakespeare', set: 'Slings & Arrows' },
  
  { id: 'eredin', name: 'Eredin', set: 'Realm\'s Fall' },
  { id: 'philippa', name: 'Philippa', set: 'Realm\'s Fall' },
  { id: 'yennefer-triss', name: 'Yennefer & Triss', set: 'Realm\'s Fall' },
  
  { id: 'geralt', name: 'Geralt of Rivia', set: 'Steel & Silver' },
  { id: 'ciri', name: 'Ciri', set: 'Steel & Silver' },
  { id: 'ancient-leshen', name: 'Ancient Leshen', set: 'Steel & Silver' },
  
  { id: 'muhammad-ali', name: 'Muhammad Ali', set: 'Muhammad Ali vs. Bruce Lee' },
  { id: 'bruce-lee-ali', name: 'Bruce Lee', set: 'Muhammad Ali vs. Bruce Lee' },
]

export const MAPS: Map[] = [
  { id: 'sarpedon', name: 'Sarpedon', set: 'Battle of Legends, Volume One' },
  { id: 'mariner-bay', name: 'Mariner Bay', set: 'Battle of Legends, Volume One' },
  
  { id: 'insula-dulcamara', name: 'Insula Dulcamara', set: 'Bruce Lee' },
  
  { id: 'sherwood-forest', name: 'Sherwood Forest', set: 'Robin Hood vs. Bigfoot' },
  { id: 'yukon', name: 'Yukon', set: 'Robin Hood vs. Bigfoot' },
  
  { id: 'raptor-paddock', name: 'Raptor Paddock', set: 'Jurassic Park – InGen vs. Raptors' },
  
  { id: 'baskerville-manor', name: 'Baskerville Manor', set: 'Cobble & Fog' },
  { id: 'soho', name: 'SOHO', set: 'Cobble & Fog' },
  
  { id: 'sunnydale-high', name: 'Sunnydale High', set: 'Buffy the Vampire Slayer' },
  
  { id: 'heorot', name: 'Heorot', set: 'Little Red Riding Hood vs. Beowulf' },
  
  { id: 'ny-1901', name: 'New York 1901', set: 'Deadpool' },
  
  { id: 'hanging-gardens', name: 'Hanging Gardens', set: 'Battle of Legends, Volume Two' },
  
  { id: 'hells-kitchen', name: 'Hell\'s Kitchen', set: 'Hell\'s Kitchen' },
  
  { id: 'sanctum-sanctorum', name: 'Sanctum Sanctorum', set: 'Redemption Row' },
  
  { id: 'jurassic-park', name: 'Jurassic Park', set: 'Jurassic Park – Sattler vs. T‑Rex' },
  
  { id: 'king-solomons-mine', name: 'King Solomon\'s Mine', set: 'Houdini vs. The Genie' },
  
  { id: 'library', name: 'The Library', set: 'Teen Spirit' },
  { id: 'the-bronze', name: 'The Bronze', set: 'Teen Spirit' },
  
  { id: 'helicarrier', name: 'The Helicarrier', set: 'For King and Country' },
  
  { id: 'wakanda', name: 'Wakanda', set: 'Brains & Brawn' },
  
  { id: 'kaer-morhen', name: 'Kaer Morhen', set: 'Steel & Silver' },
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
