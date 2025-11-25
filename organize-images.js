const fs = require('fs');
const path = require('path');

const heroImages = [
  'Achilles.gif', 'Alice.png', 'Ancient_Leshen.webp', 'Angel.webp', 'Annie_Christmas.webp',
  'Beowulf.webp', 'Bigfoot.jpg', 'Black_Panther.webp', 'Black_Widow.webp', 'Blackbeard.webp',
  'Bloody_Mary.gif', 'Bruce_Lee.jpg', 'Buffy.webp', 'Bullseye.webp', 'Chupacabra.webp',
  'Ciri.webp', 'Cloak_Dagger.webp', 'Daredevil.webp', 'Deadpool.webp', 'Doctor_Strange.webp',
  'Donatello.webp', 'Dr._Sattler.webp', 'Dr_Jeykll.png', 'Dr_Jill_Trent.webp', 'Dracula.png',
  'Elektra.webp', 'Eredin.webp', 'Geralt.webp', 'Ghost_Rider.webp', 'Golden_Bat.webp',
  'Hamlet.webp', 'Houdini.webp', 'Invisible_Man.png', 'King_Arthur.png', 'Leonardo.webp',
  'Loki.webp', 'Luke_Cage.webp', 'Medusa.png', 'Michaelangelo.webp', 'Moon_Knight.webp',
  'Ms_Marvel.webp', 'Nikola_Tesla.webp', 'Oda_Nobunaga.webp', 'Pandora.webp', 'Philippa.webp',
  'Raphael.webp', 'Raptors.webp', 'Red_Riding_Hood.webp', 'Robert_Muldoon.webp', 'Robin_Hood.jpg',
  'Shakespeare.webp', 'She-Hulk.webp', 'Sherlock_Holmes.png', 'Sinbad.png', 'Spider-Man.webp',
  'Spike.webp', 'Squirrel_Girl.webp', 'Sun_Wukong.jpg', 'T_Rex.webp', 'The_Genie.webp',
  'The_Wayward_Sisters.webp', 'Titania.webp', 'Tomoe_Gozen.webp', 'Triss.webp', 'Willow.webp',
  'Winter_Soldier.webp', 'Yennefer.webp', 'Yennenga.jpg'
];

const mapImages = [
  'Azuchi_Castle.webp', 'Baskerville_Manor.webp', 'Fayrlund_Forest.webp', 'Globe_Theater.webp',
  'Hanging_Gardens.webp', 'Helicarrier.webp', "Hell's_Kitchen.webp", 'Heorot.webp',
  'Kaer_Morhen.webp', "King_Solomon's_Mine.webp", 'Marmoreal.webp', 'McMinnville_OR.webp',
  'Naglfar.webp', 'Navy_Pier.webp', 'Point_Pleasant.webp', 'Raptor_Paddock.webp',
  'Sanctum_Santorum.webp', 'Sarpedon.webp', 'Sherwood_Forest.webp', 'Soho.webp',
  'Streets_of_Novigrad.webp', 'Sunnydale_High.webp', 'The_Bronze.webp', 'The_Raft.webp',
  'T_Rex_Paddock.webp', 'Yukon.webp'
];

const baseDir = path.join(__dirname, 'src', 'assets', 'images');
const heroesDir = path.join(baseDir, 'heroes');
const mapsDir = path.join(baseDir, 'maps');

console.log('Starting image organization...\n');

let movedCount = 0;
let skippedCount = 0;
let errorCount = 0;

heroImages.forEach(filename => {
  const sourcePath = path.join(baseDir, filename);
  const destPath = path.join(heroesDir, filename);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, destPath);
      console.log(`✅ Moved hero: ${filename}`);
      movedCount++;
    } else {
      console.log(`⚠️  Hero file not found: ${filename}`);
      skippedCount++;
    }
  } catch (err) {
    console.error(`❌ Error moving ${filename}:`, err.message);
    errorCount++;
  }
});

mapImages.forEach(filename => {
  const sourcePath = path.join(baseDir, filename);
  const destPath = path.join(mapsDir, filename);
  
  try {
    if (fs.existsSync(sourcePath)) {
      fs.renameSync(sourcePath, destPath);
      console.log(`✅ Moved map: ${filename}`);
      movedCount++;
    } else {
      console.log(`⚠️  Map file not found: ${filename}`);
      skippedCount++;
    }
  } catch (err) {
    console.error(`❌ Error moving ${filename}:`, err.message);
    errorCount++;
  }
});

console.log('\n=== Summary ===');
console.log(`✅ Files moved: ${movedCount}`);
console.log(`⚠️  Files skipped: ${skippedCount}`);
console.log(`❌ Errors: ${errorCount}`);
console.log('\nImage organization complete!');
