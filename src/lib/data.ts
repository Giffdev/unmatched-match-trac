import type { Hero, Map } from './types'

export const UNMATCHED_SETS = [
  'Battle of Legends Vol. 1',
  'Battle of Legends Vol. 2',
  'Cobble & Fog',
  'Buffy the Vampire Slayer',
  'Jurassic Park',
  'InGen vs Raptors',
  'Robin Hood vs Bigfoot',
  'Bruce Lee',
  'Little Red Riding Hood vs Beowulf',
  'Deadpool',
  'Teen Spirit',
  'Houdini vs The Genie',
  'Sun Wukong',
  'For King and Country',
  'Steel and Silver',
  'Marvel',
  'Redemption Row',
  'Brains and Brawn',
  'Hell\'s Kitchen',
]

export const HEROES: Hero[] = [
  { id: 'alice', name: 'Alice', set: 'Battle of Legends Vol. 1' },
  { id: 'medusa', name: 'Medusa', set: 'Battle of Legends Vol. 1' },
  { id: 'king-arthur', name: 'King Arthur', set: 'Battle of Legends Vol. 1' },
  { id: 'sinbad', name: 'Sinbad', set: 'Battle of Legends Vol. 1' },
  
  { id: 'achilles', name: 'Achilles', set: 'Battle of Legends Vol. 2' },
  { id: 'sun-wukong-vol2', name: 'Sun Wukong', set: 'Battle of Legends Vol. 2' },
  { id: 'bloody-mary', name: 'Bloody Mary', set: 'Battle of Legends Vol. 2' },
  { id: 'yennenga', name: 'Yennenga', set: 'Battle of Legends Vol. 2' },
  
  { id: 'invisible-man', name: 'Invisible Man', set: 'Cobble & Fog' },
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', set: 'Cobble & Fog' },
  { id: 'dracula', name: 'Dracula', set: 'Cobble & Fog' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', set: 'Cobble & Fog' },
  
  { id: 'buffy', name: 'Buffy', set: 'Buffy the Vampire Slayer' },
  { id: 'angel', name: 'Angel', set: 'Buffy the Vampire Slayer' },
  { id: 'spike', name: 'Spike', set: 'Buffy the Vampire Slayer' },
  { id: 'willow', name: 'Willow', set: 'Buffy the Vampire Slayer' },
  
  { id: 't-rex', name: 'T-Rex', set: 'Jurassic Park' },
  { id: 'velociraptors', name: 'Velociraptors', set: 'Jurassic Park' },
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', set: 'Jurassic Park' },
  { id: 'ian-malcolm', name: 'Dr. Ian Malcolm', set: 'Jurassic Park' },
  
  { id: 'robert-muldoon', name: 'Robert Muldoon', set: 'InGen vs Raptors' },
  { id: 'raptors', name: 'Raptors', set: 'InGen vs Raptors' },
  
  { id: 'robin-hood', name: 'Robin Hood', set: 'Robin Hood vs Bigfoot' },
  { id: 'bigfoot', name: 'Bigfoot', set: 'Robin Hood vs Bigfoot' },
  
  { id: 'bruce-lee', name: 'Bruce Lee', set: 'Bruce Lee' },
  
  { id: 'little-red', name: 'Little Red Riding Hood', set: 'Little Red Riding Hood vs Beowulf' },
  { id: 'beowulf', name: 'Beowulf', set: 'Little Red Riding Hood vs Beowulf' },
  
  { id: 'deadpool', name: 'Deadpool', set: 'Deadpool' },
  
  { id: 'buffy-angel-spike', name: 'Buffy, Angel, & Spike', set: 'Teen Spirit' },
  
  { id: 'houdini', name: 'Houdini', set: 'Houdini vs The Genie' },
  { id: 'the-genie', name: 'The Genie', set: 'Houdini vs The Genie' },
  
  { id: 'sun-wukong', name: 'Sun Wukong', set: 'Sun Wukong' },
  
  { id: 'robin-hood-fkac', name: 'Robin Hood', set: 'For King and Country' },
  { id: 'richard-lionheart', name: 'Richard the Lionheart', set: 'For King and Country' },
  
  { id: 'geralt', name: 'Geralt of Rivia', set: 'Steel and Silver' },
  { id: 'ciri', name: 'Ciri', set: 'Steel and Silver' },
  
  { id: 'black-widow', name: 'Black Widow', set: 'Marvel' },
  { id: 'spider-man', name: 'Spider-Man', set: 'Marvel' },
  { id: 'dr-strange', name: 'Doctor Strange', set: 'Marvel' },
  
  { id: 'moon-knight', name: 'Moon Knight', set: 'Redemption Row' },
  { id: 'luke-cage', name: 'Luke Cage', set: 'Redemption Row' },
  { id: 'ghost-rider', name: 'Ghost Rider', set: 'Redemption Row' },
  
  { id: 'black-panther', name: 'Black Panther', set: 'Brains and Brawn' },
  { id: 'shuri', name: 'Shuri', set: 'Brains and Brawn' },
  
  { id: 'daredevil', name: 'Daredevil', set: 'Hell\'s Kitchen' },
  { id: 'elektra', name: 'Elektra', set: 'Hell\'s Kitchen' },
  { id: 'bullseye', name: 'Bullseye', set: 'Hell\'s Kitchen' },
  
  { id: 'squirrel-girl', name: 'Squirrel Girl', set: 'Battle of Legends Vol. 1' },
  { id: 'ms-marvel', name: 'Ms. Marvel', set: 'Battle of Legends Vol. 1' },
  
  { id: 'cloak-dagger', name: 'Cloak & Dagger', set: 'Battle of Legends Vol. 2' },
  
  { id: 'she-hulk', name: 'She-Hulk', set: 'Brains and Brawn' },
  
  { id: 'winter-soldier', name: 'Winter Soldier', set: 'For King and Country' },
  
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', set: 'Steel and Silver' },
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', set: 'Steel and Silver' },
]

export const MAPS: Map[] = [
  { id: 'sarpedon', name: 'Sarpedon' },
  { id: 'heorot', name: 'Heorot' },
  { id: 'mariner-bay', name: 'Mariner Bay' },
  { id: 'baskerville-manor', name: 'Baskerville Manor' },
  { id: 'yukon', name: 'Yukon' },
  { id: 'sherwood-forest', name: 'Sherwood Forest' },
  { id: 'soho', name: 'SOHO' },
  { id: 'insula-dulcamara', name: 'Insula Dulcamara' },
  { id: 'sunnydale-high', name: 'Sunnydale High' },
  { id: 'jurassic-park', name: 'Jurassic Park' },
  { id: 'raptor-paddock', name: 'Raptor Paddock' },
  { id: 'hanging-gardens', name: 'Hanging Gardens' },
  { id: 'sanctum-sanctorum', name: 'Sanctum Sanctorum' },
  { id: 'hells-kitchen', name: 'Hell\'s Kitchen' },
  { id: 'king-solomons-mine', name: 'King Solomon\'s Mine' },
  { id: 'navy-pier', name: 'Navy Pier' },
  { id: 'azuchi-castle', name: 'Azuchi Castle' },
  { id: 'helicarrier', name: 'Helicarrier' },
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
