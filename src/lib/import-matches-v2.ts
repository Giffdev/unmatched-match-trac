import type { Match } from './types'

// Full replacement match data — 76 matches
// Player mappings: DEVIN = Devin Sinha, SARAH = Sarah Anderson, STEPHEN = Stephen Kidson
// Hero IDs mapped from data.ts

let counter = 0
function nextId(): string {
  counter++
  return `import-v2-${counter}`
}

function m(
  date: string,
  p1: string,
  p1Hero: string,
  p2: string,
  p2Hero: string,
  mapId: string,
  victorName: string,
  victorHero: string,
  heroVariants?: { p1?: string; p2?: string; victor?: string }
): Match {
  const winnerId = victorName === p1 ? p1Hero : p2Hero
  return {
    id: nextId(),
    date,
    mode: '1v1',
    mapId,
    players: [
      { playerName: p1, heroId: p1Hero, turnOrder: 1, ...(heroVariants?.p1 ? { heroVariant: heroVariants.p1 } : {}) },
      { playerName: p2, heroId: p2Hero, turnOrder: 2, ...(heroVariants?.p2 ? { heroVariant: heroVariants.p2 } : {}) },
    ],
    winnerId,
    isDraw: false,
    userId: '',
  }
}

const D = 'Devin Sinha'
const S = 'Sarah Anderson'
const ST = 'Stephen Kidson'

export function getImportMatchesV2(): Match[] {
  counter = 0
  return [
    m('2023-05-24', S, 'squirrel-girl', D, 'ms-marvel', 'navy-pier', S, 'squirrel-girl'),
    m('2023-05-24', D, 'winter-soldier', S, 'cloak-dagger', 'navy-pier', S, 'cloak-dagger'),
    m('2023-05-26', S, 'black-panther', D, 'black-widow', 'helicarrier', D, 'black-widow'),
    m('2023-05-31', S, 'raptors', D, 'little-red', 'heorot', D, 'little-red'),
    m('2023-05-31', D, 'ingen', S, 'yennenga', 'raptor-paddock', D, 'ingen'),
    m('2023-05-31', D, 'sun-wukong', S, 'bloody-mary', 'hanging-gardens', D, 'sun-wukong'),
    m('2023-06-12', D, 'squirrel-girl', S, 'ms-marvel', 'navy-pier', D, 'squirrel-girl'),
    m('2023-06-15', D, 'daredevil', S, 'elektra', 'hells-kitchen', S, 'elektra'),
    m('2023-06-17', D, 'bruce-lee', S, 'medusa', 'sarpedon', D, 'bruce-lee'),
    m('2023-07-15', S, 'bruce-lee', D, 'houdini', 'king-solomons-mine', S, 'bruce-lee'),
    m('2023-07-15', D, 'the-genie', S, 'bruce-lee', 'king-solomons-mine', S, 'bruce-lee'),
    m('2023-07-17', S, 'doctor-strange', D, 'spider-man', 'sanctum-sanctorum', S, 'doctor-strange'),
    m('2023-07-17', D, 'she-hulk', S, 'spider-man', 'sanctum-sanctorum', S, 'spider-man'),
    m('2023-10-01', D, 'alice', ST, 'sinbad', 'sarpedon', D, 'alice'),
    m('2023-10-01', D, 'jekyll-hyde', ST, 'king-arthur', 'baskerville-manor', ST, 'king-arthur'),
    m('2023-10-01', ST, 'medusa', D, 'bigfoot', 'sarpedon', ST, 'medusa'),
    m('2023-10-03', D, 'king-arthur', ST, 'beowulf', 'sherwood-forest', D, 'king-arthur'),
    m('2023-10-03', D, 'beowulf', ST, 'king-arthur', 'sherwood-forest', D, 'beowulf'),
    m('2023-10-04', D, 'beowulf', ST, 'dracula', 'yukon', ST, 'dracula'),
    m('2023-10-06', ST, 'bigfoot', D, 'invisible-man', 'soho', ST, 'bigfoot'),
    m('2023-10-06', D, 'invisible-man', ST, 'robin-hood', 'baskerville-manor', ST, 'robin-hood'),
    m('2024-03-07', D, 'tomoe-gozen', S, 'oda-nobunaga', 'azuchi-castle', S, 'oda-nobunaga'),
    m('2024-03-07', D, 'tomoe-gozen', S, 'oda-nobunaga', 'azuchi-castle', S, 'oda-nobunaga'),
    m('2024-03-07', S, 'oda-nobunaga', D, 'tomoe-gozen', 'azuchi-castle', S, 'oda-nobunaga'),
    m('2024-03-07', S, 'tomoe-gozen', D, 'oda-nobunaga', 'azuchi-castle', S, 'tomoe-gozen'),
    m('2024-07-13', D, 'titania', S, 'wayward-sisters', 'globe-theatre', D, 'titania'),
    m('2024-07-13', ST, 'wayward-sisters', D, 'hamlet', 'globe-theatre', D, 'hamlet'),
    m('2024-07-13', D, 'william-shakespeare', ST, 'titania', 'globe-theatre', ST, 'titania'),
    m('2024-07-14', S, 'titania', D, 'hamlet', 'globe-theatre', S, 'titania'),
    m('2024-09-27', D, 'oda-nobunaga', S, 'houdini', 'globe-theatre', S, 'houdini'),
    m('2024-09-28', S, 'tomoe-gozen', D, 'the-genie', 'globe-theatre', S, 'tomoe-gozen'),
    m('2024-10-16', D, 't-rex', S, 'black-widow', 'raptor-paddock', D, 't-rex'),
    m('2024-10-20', D, 'winter-soldier', S, 'ms-marvel', 'heorot', S, 'ms-marvel'),
    // Witcher matches - Yennefer/Triss use heroVariant
    m('2025-01-04', D, 'ciri', S, 'ancient-leshen', 'fayrlund-forest', D, 'ciri'),
    m('2025-01-04', D, 'geralt', S, 'ciri', 'kaer-morhen', S, 'ciri'),
    m('2025-01-04', S, 'philippa', D, 'yennefer-triss', 'naglfar', S, 'philippa',
      { p2: 'triss' }),
    m('2025-01-04', D, 'yennefer-triss', S, 'philippa', 'streets-of-novigrad', D, 'yennefer-triss',
      { p1: 'yennefer' }),
    m('2025-01-10', S, 'yennefer-triss', D, 'ancient-leshen', 'kaer-morhen', D, 'ancient-leshen',
      { p1: 'yennefer' }),
    m('2025-01-11', D, 'dr-jill-trent', S, 'dracula', 'soho', D, 'dr-jill-trent'),
    m('2025-01-11', D, 'nikola-tesla', S, 'sherlock-holmes', 'baskerville-manor', S, 'sherlock-holmes'),
    m('2025-06-02', S, 'moon-knight', D, 'doctor-strange', 'the-raft', S, 'moon-knight'),
    m('2025-06-25', D, 'blackbeard', S, 'chupacabra', 'venice', S, 'chupacabra'),
    // New matches from here
    m('2025-10-05', D, 'pandora', S, 'loki', 'venice', D, 'pandora'),
    m('2025-10-05', S, 'bigfoot', D, 'chupacabra', 'santas-workshop', D, 'chupacabra'),
    m('2025-10-12', D, 'loki', S, 'dr-ellie-sattler', 't-rex-paddock', D, 'loki'),
    m('2025-10-12', D, 'eredin', S, 'achilles', 'streets-of-novigrad', D, 'eredin'),
    m('2025-10-13', S, 'bullseye', D, 'ghost-rider', 'hells-kitchen', S, 'bullseye'),
    m('2025-10-13', S, 'annie-christmas', D, 'golden-bat', 'the-raft', S, 'annie-christmas'),
    m('2025-10-13', D, 'golden-bat', S, 'annie-christmas', 'the-raft', D, 'golden-bat'),
    m('2025-10-13', D, 'luke-cage', S, 't-rex', 't-rex-paddock', D, 'luke-cage'),
    m('2025-10-15', D, 'the-genie', S, 'daredevil', 'king-solomons-mine', D, 'the-genie'),
    m('2025-10-16', D, 'black-panther', S, 'alice', 'marmoreal', D, 'black-panther'),
    m('2025-10-17', S, 'robin-hood', D, 'cloak-dagger', 'sherwood-forest', S, 'robin-hood'),
    m('2025-10-17', S, 'robin-hood', D, 'cloak-dagger', 'navy-pier', S, 'robin-hood'),
    m('2025-10-17', S, 'jekyll-hyde', D, 'bloody-mary', 'hanging-gardens', S, 'jekyll-hyde'),
    m('2025-10-18', D, 'wayward-sisters', S, 'invisible-man', 'soho', D, 'wayward-sisters'),
    m('2025-10-18', D, 'dracula', S, 'hamlet', 'globe-theatre', D, 'dracula'),
    m('2025-10-19', D, 'yennefer-triss', S, 'eredin', 'streets-of-novigrad', D, 'yennefer-triss',
      { p1: 'yennefer' }),
    m('2025-10-19', S, 'geralt', D, 'philippa', 'naglfar', S, 'geralt'),
    m('2025-10-19', S, 'geralt', D, 'philippa', 'naglfar', S, 'geralt'),
    m('2025-10-19', D, 'raptors', S, 'ingen', 'raptor-paddock', S, 'ingen'),
    m('2025-10-20', D, 'sinbad', S, 'blackbeard', 'sarpedon', D, 'sinbad'),
    m('2025-10-20', S, 'golden-bat', D, 'bullseye', 'hells-kitchen', D, 'bullseye'),
    m('2025-10-21', D, 'annie-christmas', S, 'dr-jill-trent', 'mcminnville', D, 'annie-christmas'),
    m('2025-10-22', D, 'moon-knight', S, 'ghost-rider', 'the-raft', D, 'moon-knight'),
    m('2025-10-23', S, 'king-arthur', D, 'medusa', 'marmoreal', D, 'medusa'),
    m('2025-11-02', D, 'elektra', S, 'sun-wukong', 'hells-kitchen', D, 'elektra'),
    m('2025-11-02', S, 'yennefer-triss', D, 'yennenga', 'streets-of-novigrad', D, 'yennenga',
      { p1: 'triss' }),
    m('2025-11-16', D, 'achilles', S, 'she-hulk', 'sanctum-sanctorum', S, 'she-hulk'),
    m('2025-11-16', S, 'sinbad', D, 'sherlock-holmes', 'baskerville-manor', S, 'sinbad'),
    m('2025-11-16', S, 'william-shakespeare', D, 'dr-ellie-sattler', 't-rex-paddock', S, 'william-shakespeare'),
    m('2025-11-16', S, 'nikola-tesla', D, 'robin-hood', 'point-pleasant', S, 'nikola-tesla'),
    m('2025-11-29', D, 'bruce-lee', S, 'muhammad-ali', 'tsing-shan-monastery', S, 'muhammad-ali'),
    m('2025-11-29', D, 'muhammad-ali', S, 'bruce-lee', 'thrilla-in-manila', S, 'bruce-lee'),
    m('2025-11-29', S, 'bruce-lee', D, 'muhammad-ali', 'tsing-shan-monastery', S, 'bruce-lee'),
    m('2025-11-29', S, 'muhammad-ali', D, 'bruce-lee', 'thrilla-in-manila', S, 'muhammad-ali'),
    m('2026-01-17', S, 'shredder', D, 'krang', 'thrilla-in-manila', S, 'shredder'),
    m('2026-01-17', D, 'shredder', S, 'michelangelo', 'thrilla-in-manila', S, 'michelangelo'),
  ]
}
