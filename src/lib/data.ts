import type { Hero, Map } from './types'

export const UNMATCHED_SETS = [
  'Battle of Legends Volume 1',
  'Battle of Legends Volume 2',
  'Cobble & Fog',
  'Robin Hood vs Bigfoot',
  'Bruce Lee',
  'Little Red Riding Hood vs Beowulf',
  'Jurassic Park - Dr. Sattler vs T. Rex',
  'Jurassic Park - InGen vs Raptors',
  'Buffy the Vampire Slayer',
  'Deadpool',
  'Teen Spirit',
  'Houdini vs The Genie',
  'For King and Country',
  'Steel and Silver',
  'Sun Wukong',
  'Redemption Row',
  'Brains and Brawn',
  'Hell\'s Kitchen',
  'Slings & Arrows',
  'Bloody Mary vs The Headless Horseman',
]

export const HEROES: Hero[] = [
  { id: 'alice', name: 'Alice', set: 'Battle of Legends Volume 1' },
  { id: 'medusa', name: 'Medusa', set: 'Battle of Legends Volume 1' },
  { id: 'king-arthur', name: 'King Arthur', set: 'Battle of Legends Volume 1' },
  { id: 'sinbad', name: 'Sinbad', set: 'Battle of Legends Volume 1' },
  
  { id: 'achilles', name: 'Achilles', set: 'Battle of Legends Volume 2' },
  { id: 'sun-wukong-vol2', name: 'Sun Wukong', set: 'Battle of Legends Volume 2' },
  { id: 'bloody-mary-vol2', name: 'Bloody Mary', set: 'Battle of Legends Volume 2' },
  { id: 'yennenga', name: 'Yennenga', set: 'Battle of Legends Volume 2' },
  
  { id: 'invisible-man', name: 'Invisible Man', set: 'Cobble & Fog' },
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', set: 'Cobble & Fog' },
  { id: 'dracula', name: 'Dracula', set: 'Cobble & Fog' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', set: 'Cobble & Fog' },
  
  { id: 'robin-hood', name: 'Robin Hood', set: 'Robin Hood vs Bigfoot' },
  { id: 'bigfoot', name: 'Bigfoot', set: 'Robin Hood vs Bigfoot' },
  
  { id: 'bruce-lee', name: 'Bruce Lee', set: 'Bruce Lee' },
  
  { id: 'little-red', name: 'Little Red Riding Hood', set: 'Little Red Riding Hood vs Beowulf' },
  { id: 'beowulf', name: 'Beowulf', set: 'Little Red Riding Hood vs Beowulf' },
  
  { id: 't-rex', name: 'T. Rex', set: 'Jurassic Park - Dr. Sattler vs T. Rex' },
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', set: 'Jurassic Park - Dr. Sattler vs T. Rex' },
  
  { id: 'robert-muldoon', name: 'Robert Muldoon', set: 'Jurassic Park - InGen vs Raptors' },
  { id: 'raptors', name: 'Raptors', set: 'Jurassic Park - InGen vs Raptors' },
  
  { id: 'buffy', name: 'Buffy', set: 'Buffy the Vampire Slayer' },
  { id: 'angel', name: 'Angel', set: 'Buffy the Vampire Slayer' },
  { id: 'spike', name: 'Spike', set: 'Buffy the Vampire Slayer' },
  { id: 'willow', name: 'Willow', set: 'Buffy the Vampire Slayer' },
  
  { id: 'deadpool', name: 'Deadpool', set: 'Deadpool' },
  
  { id: 'buffy-teen', name: 'Buffy', set: 'Teen Spirit' },
  { id: 'angel-teen', name: 'Angel', set: 'Teen Spirit' },
  { id: 'spike-teen', name: 'Spike', set: 'Teen Spirit' },
  { id: 'willow-teen', name: 'Willow', set: 'Teen Spirit' },
  { id: 'oz', name: 'Oz', set: 'Teen Spirit' },
  { id: 'faith', name: 'Faith', set: 'Teen Spirit' },
  
  { id: 'houdini', name: 'Houdini', set: 'Houdini vs The Genie' },
  { id: 'the-genie', name: 'The Genie', set: 'Houdini vs The Genie' },
  
  { id: 'robin-hood-fkac', name: 'Robin Hood', set: 'For King and Country' },
  { id: 'richard-lionheart', name: 'Richard the Lionheart', set: 'For King and Country' },
  { id: 'king-arthur-fkac', name: 'King Arthur', set: 'For King and Country' },
  
  { id: 'geralt', name: 'Geralt of Rivia', set: 'Steel and Silver' },
  { id: 'ciri', name: 'Ciri', set: 'Steel and Silver' },
  { id: 'yennefer', name: 'Yennefer', set: 'Steel and Silver' },
  
  { id: 'sun-wukong', name: 'Sun Wukong', set: 'Sun Wukong' },
  
  { id: 'moon-knight', name: 'Moon Knight', set: 'Redemption Row' },
  { id: 'luke-cage', name: 'Luke Cage', set: 'Redemption Row' },
  { id: 'ghost-rider', name: 'Ghost Rider', set: 'Redemption Row' },
  
  { id: 'black-panther', name: 'Black Panther', set: 'Brains and Brawn' },
  { id: 'shuri', name: 'Shuri', set: 'Brains and Brawn' },
  { id: 'she-hulk', name: 'She-Hulk', set: 'Brains and Brawn' },
  
  { id: 'daredevil', name: 'Daredevil', set: 'Hell\'s Kitchen' },
  { id: 'elektra', name: 'Elektra', set: 'Hell\'s Kitchen' },
  { id: 'bullseye', name: 'Bullseye', set: 'Hell\'s Kitchen' },
  
  { id: 'bloody-mary', name: 'Bloody Mary', set: 'Bloody Mary vs The Headless Horseman' },
  { id: 'headless-horseman', name: 'The Headless Horseman', set: 'Bloody Mary vs The Headless Horseman' },
  
  { id: 'clint-barton', name: 'Clint Barton', set: 'Slings & Arrows' },
  { id: 'kate-bishop', name: 'Kate Bishop', set: 'Slings & Arrows' },
]

export const MAPS: Map[] = [
  { id: 'sarpedon', name: 'Sarpedon', set: 'Battle of Legends Volume 1' },
  { id: 'mariner-bay', name: 'Mariner Bay', set: 'Battle of Legends Volume 1' },
  
  { id: 'heorot', name: 'Heorot', set: 'Battle of Legends Volume 2' },
  { id: 'hanging-gardens', name: 'Hanging Gardens', set: 'Battle of Legends Volume 2' },
  
  { id: 'baskerville-manor', name: 'Baskerville Manor', set: 'Cobble & Fog' },
  { id: 'soho', name: 'SOHO', set: 'Cobble & Fog' },
  
  { id: 'sherwood-forest', name: 'Sherwood Forest', set: 'Robin Hood vs Bigfoot' },
  { id: 'yukon', name: 'Yukon', set: 'Robin Hood vs Bigfoot' },
  
  { id: 'insula-dulcamara', name: 'Insula Dulcamara', set: 'Bruce Lee' },
  
  { id: 'heorot-lrrh', name: 'Heorot', set: 'Little Red Riding Hood vs Beowulf' },
  
  { id: 'jurassic-park', name: 'Jurassic Park', set: 'Jurassic Park - Dr. Sattler vs T. Rex' },
  
  { id: 'raptor-paddock', name: 'Raptor Paddock', set: 'Jurassic Park - InGen vs Raptors' },
  
  { id: 'sunnydale-high', name: 'Sunnydale High', set: 'Buffy the Vampire Slayer' },
  
  { id: 'ny-1901', name: 'New York 1901', set: 'Deadpool' },
  
  { id: 'library', name: 'The Library', set: 'Teen Spirit' },
  { id: 'the-bronze', name: 'The Bronze', set: 'Teen Spirit' },
  
  { id: 'king-solomons-mine', name: 'King Solomon\'s Mine', set: 'Houdini vs The Genie' },
  
  { id: 'sherwood-forest-fkac', name: 'Sherwood Forest', set: 'For King and Country' },
  
  { id: 'kaer-morhen', name: 'Kaer Morhen', set: 'Steel and Silver' },
  
  { id: 'great-wall', name: 'The Great Wall', set: 'Sun Wukong' },
  
  { id: 'hells-kitchen', name: 'Hell\'s Kitchen', set: 'Hell\'s Kitchen' },
  
  { id: 'navy-pier', name: 'Navy Pier', set: 'Bloody Mary vs The Headless Horseman' },
  
  { id: 'sanctum-sanctorum', name: 'Sanctum Sanctorum', set: 'Redemption Row' },
  
  { id: 'wakanda', name: 'Wakanda', set: 'Brains and Brawn' },
  
  { id: 'helicarrier', name: 'The Helicarrier', set: 'Slings & Arrows' },
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
