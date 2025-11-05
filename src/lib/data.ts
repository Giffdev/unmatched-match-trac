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
  { id: 'achilles', name: 'Achilles', hp: 18, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Patroclus', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/9lCDpWINK-hNBFjVYHtWPQ__imagepage/img/o9mApjJmLmVT0Kw5fwBPZBmxcS0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257613.png' },
  { id: 'alice', name: 'Alice', hp: 13, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'The Jabberwock', count: 1, hp: 8, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/A_FZwxPy_JcKa1ZjEtlmqQ__imagepage/img/l-WrDtPbLIOxqOHv-VX6u5OgKVU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609969.png' },
  { id: 'ancient-leshen', name: 'Ancient Leshen', hp: 13, move: 1, attack: 'RANGED', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Wolves', count: 2, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/VFbI8rCPBG-qp39Px8QhGQ__imagepage/img/8oI5VuFdqj0i4rI_olB_QJ18mL4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775202.png' },
  { id: 'angel', name: 'Angel', hp: 16, move: 2, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Faith', count: 1, hp: 9, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/TRbkJxvY2nPHHKF77n9lFw__imagepage/img/jkLG7RQOoTmb4S7w0fRlwV9c_a8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093881.png' },
  { id: 'annie-christmas', name: 'Annie Christmas', hp: 14, move: 2, attack: 'MELEE', set: 'Adventures: Tales to Amaze', sidekicks: [{ name: 'Charlie', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/VfE1UIPxxgvnTwz7wHM7pA__imagepage/img/EWp-DqLb7wP6MfDjX-wX90BmZ_w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257631.png' },
  { id: 'beowulf', name: 'Beowulf', hp: 17, move: 2, attack: 'MELEE', set: 'Little Red Riding Hood vs. Beowulf', sidekicks: [{ name: 'Wiglaf', count: 1, hp: 9, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/tQDdF0rQ1q_LTfhqrxS8hg__imagepage/img/bN-NFXR4gB5qakWp1X_4_hD5OQM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182948.png' },
  { id: 'bigfoot', name: 'Bigfoot', hp: 16, move: 3, attack: 'MELEE', set: 'Robin Hood vs Bigfoot', sidekicks: [{ name: 'The Jackalope', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/RJ_Kfkql9XWw6y3uxlOSpw__imagepage/img/dUZYt8uy8SJHg6d1xDwJDdHQaYc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4830607.png' },
  { id: 'black-panther', name: 'Black Panther', hp: 14, move: 2, attack: 'MELEE', set: 'For King and Country', sidekicks: [{ name: 'Shuri', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/e5_zzmNTdJgj79m9vM65bw__imagepage/img/zz6z_1PMl-3vMSPj7V3jGPCEF5c=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093923.png' },
  { id: 'black-widow', name: 'Black Widow', hp: 13, move: 2, attack: 'RANGED', set: 'For King and Country', sidekicks: [{ name: 'Maria Hill', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/yqwfk1-Uz3_NZ1L_kwDVSg__imagepage/img/s4oQMVpBR5Z02xjAxCvB4vukrzM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093929.png' },
  { id: 'bloody-mary', name: 'Bloody Mary', hp: 16, move: 3, attack: 'MELEE', set: 'Battle of Legends, Volume Two', imageUrl: 'https://cf.geekdo-images.com/a4QqpTTDZvvfyaQmYMdVPg__imagepage/img/sppaxf0Lh1oqvK73_xgNiU_0Gzg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257617.png' },
  { id: 'bruce-lee', name: 'Bruce Lee', hp: 14, move: 3, attack: 'MELEE', set: 'Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/VDiIXjVILnXMQNDO8IVlNg__imagepage/img/Sb8H3_lZhE98-i7yStUTWvZLhWk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182990.png' },
  { id: 'buffy', name: 'Buffy', hp: 14, move: 3, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Giles or Xander', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/OKLFzqoWIc0eU-lMb7nkFA__imagepage/img/L-iLYj6r54FQpkEKKNq8Xvuii04=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093883.png' },
  { id: 'bullseye', name: 'Bullseye', hp: 14, move: 2, attack: 'RANGED', set: 'Hell\'s Kitchen', imageUrl: 'https://cf.geekdo-images.com/l-0GBzfSJdLRvCq-s3ZyLw__imagepage/img/6lrQ1iXzCuXsFZxJ14EGQ5nH1cI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093939.png' },
  { id: 'ciri', name: 'Ciri', hp: 15, move: 2, attack: 'MELEE', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Ihuarraquax', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/Nw7IM6HrJJCjjJLXdsgL2g__imagepage/img/Ql1-j0DJqJWAyQDH9HEXlUdVVoM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775204.png' },
  { id: 'cloak-dagger', name: 'Cloak', hp: 8, move: 2, attack: 'MELEE', set: 'Teen Spirit', imageUrl: 'https://cf.geekdo-images.com/U8BJ0y6Y5YYY2djFNW9YsA__imagepage/img/dMgkuZBmkfWawFyqJG_GKWS0RDs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093933.png' },
  { id: 'daredevil', name: 'Daredevil', hp: 17, move: 3, attack: 'MELEE', set: 'Hell\'s Kitchen', imageUrl: 'https://cf.geekdo-images.com/8SDHh8UW-hXDNyAdRfxq3g__imagepage/img/Q03PvKt4NL7o20FYLlUZxbXlWkc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093943.png' },
  { id: 'deadpool', name: 'Deadpool', hp: 10, move: 2, attack: 'MELEE', set: 'Deadpool', imageUrl: 'https://cf.geekdo-images.com/vRz80UWDlhb8QaGzQgmqeA__imagepage/img/hgXSt45_XQDpmtJiJ1u25EZj-Ag=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093937.png' },
  { id: 'doctor-strange', name: 'Doctor Strange', hp: 14, move: 2, attack: 'RANGED', set: 'Brains and Brawn', sidekicks: [{ name: 'Wong', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/fKC-e_cZ1q5VG_X2qP0f1g__imagepage/img/RgEXKdO1uBJ4ygXQQ4eMSU7k0w8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093945.png' },
  { id: 'dr-ellie-sattler', name: 'Dr. Sattler', hp: 13, move: 2, attack: 'MELEE', set: 'Jurassic Park – Sattler vs. T‑Rex', sidekicks: [{ name: 'Dr. Malcolm', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/EX2lnBZajdWaYW_NR7GsWQ__imagepage/img/rGfE7rJbR8wlkxzKaJbLsO8UBkc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652029.png' },
  { id: 'dr-jill-trent', name: 'Dr. Jill Trent', hp: 13, move: 2, attack: 'MELEE', set: 'Adventures: Tales to Amaze', sidekicks: [{ name: 'Daisy', count: 1, hp: 8, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/Ppa3hELSoxjUNpwQrTIUTQ__imagepage/img/a59fvIf3l_YhZ5kZgFzYz9GqDMg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257636.png' },
  
  { id: 'medusa', name: 'Medusa', hp: 16, move: 3, attack: 'RANGED', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'Harpies', count: 3, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/T-A4wGqLFywPYo2WgIj6Tg__imagepage/img/N_D8_OFSbT6BNbXuFnuxu_2AiE4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609982.png' },
  { id: 'king-arthur', name: 'King Arthur', hp: 18, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'Merlin', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/6VoqcPdHxKNu2wQEbIr3GA__imagepage/img/X-YQJieCsE7Jn-RGIEELyRTzEag=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609977.png' },
  { id: 'sinbad', name: 'Sinbad', hp: 15, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume One', sidekicks: [{ name: 'The Porter', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/7hKRE5V_3gVRtcbcWB3Ucw__imagepage/img/v68q5IZCGtYVZk6A9BmP1bN4lj4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609986.png' },
  { id: 'robin-hood', name: 'Robin Hood', hp: 13, move: 2, attack: 'RANGED', set: 'Robin Hood vs Bigfoot', sidekicks: [{ name: 'Outlaws', count: 4, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/Y3lCu-ZE4VZ6sBZw_W4-Gw__imagepage/img/rvXYSvM2cqCWzGxBnYJ0n7kvjvI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4830611.png' },
  { id: 'ingen', name: 'Robert Muldoon', hp: 14, move: 3, attack: 'RANGED', set: 'Jurassic Park – InGen vs. Raptors', sidekicks: [{ name: 'Ingen Workers', count: 3, hp: 7, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/8zf7IKj82FQB1t-nnGOV4A__imagepage/img/lzYNLMVVrW4UtzCz1QWbYUGpRoo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652033.png' },
  { id: 'raptors', name: 'Raptors', hp: 7, move: 3, attack: 'MELEE', set: 'Jurassic Park – InGen vs. Raptors', imageUrl: 'https://cf.geekdo-images.com/O_lwZmJN-3sWx-oyhDw0rA__imagepage/img/fgINTPPc-u7kGFjXvKnTpK5c22o=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652035.png' },
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', hp: 16, move: 2, attack: 'MELEE', set: 'Cobble & Fog', sidekicks: [{ name: 'Dr. Watson', count: 1, hp: 8, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/IqIEU9H73W8p5Pzbe1vprA__imagepage/img/q4bBVeVlC-YVhaNGf0J2RO0XbXo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182960.png' },
  { id: 'dracula', name: 'Dracula', hp: 13, move: 2, attack: 'MELEE', set: 'Cobble & Fog', sidekicks: [{ name: 'The Sisters', count: 3, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/uj-PHVY0R0SL6SbJzm8t6Q__imagepage/img/HI2LYtzjkIkCy2TGx1HjRfxRvsc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182952.png' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', hp: 16, move: 2, attack: 'MELEE', set: 'Cobble & Fog', imageUrl: 'https://cf.geekdo-images.com/uu3Dsp-ztHNJbhajKxPovA__imagepage/img/BAdkTbhqCwmHcxHPdBY1iVGVjT4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182956.png' },
  { id: 'invisible-man', name: 'Invisible Man', hp: 15, move: 2, attack: 'MELEE', set: 'Cobble & Fog', imageUrl: 'https://cf.geekdo-images.com/j_FqTXrqnJqfBHlqjhN9Ug__imagepage/img/jKCy66D5h4G5mLXl-oCfVDo0SQE=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182954.png' },
  { id: 'spike', name: 'Spike', hp: 15, move: 2, attack: 'MELEE', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Drusilla', count: 1, hp: 7, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/VxQo_ZywuMJ4EWBAtc6zQA__imagepage/img/7F-9c7fKIUF1vKo-YrQ5LOxBvtg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093889.png' },
  { id: 'willow', name: 'Willow', hp: 14, move: 2, attack: 'RANGED', set: 'Buffy the Vampire Slayer', sidekicks: [{ name: 'Tara', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/5yfLH_gg7fXj32xKr9_yIQ__imagepage/img/a7mjF-7fCLRAqKRADHVNDYJV0ng=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093893.png' },
  { id: 'little-red', name: 'Little Red Riding Hood', hp: 14, move: 2, attack: 'MELEE', set: 'Little Red Riding Hood vs. Beowulf', sidekicks: [{ name: 'Huntsman', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/RrFKdcJ9fPcF0u5e4KNB8A__imagepage/img/03iTVLt7mDYVUYIhfZ49x51F0Fo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182974.png' },
  { id: 'sun-wukong', name: 'Sun Wukong', hp: 17, move: 2, attack: 'MELEE', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Clones', count: 3, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/OkGx7fXRrF_-l7BPZ6_e_A__imagepage/img/KH2ixWxYaV-5TLfJ_CBQGDVL7jw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257625.png' },
  { id: 'yennenga', name: 'Yennenga', hp: 15, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Two', sidekicks: [{ name: 'Archers', count: 2, hp: 7, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/NqnlJR48tDFVqcUAe5wKWw__imagepage/img/S9p-9fqbFbbApF0v0lK-uNvP-rU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257627.png' },
  { id: 'blackbeard', name: 'Blackbeard', hp: 16, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', imageUrl: 'https://cf.geekdo-images.com/JC3qcyUIBEq8XKuN6bx1zw__imagepage/img/iQEuJ3JWMzikYyq2bFXQvCpYqnU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759172.png' },
  { id: 'chupacabra', name: 'Chupacabra', hp: 13, move: 3, attack: 'MELEE', set: 'Battle of Legends, Volume Three', imageUrl: 'https://cf.geekdo-images.com/lhPVSDWyEvZQhFFjuTDxmQ__imagepage/img/PjRJjQvI7_zPQA1noBHk4hDIv1Q=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759175.png' },
  { id: 'loki', name: 'Loki', hp: 14, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', imageUrl: 'https://cf.geekdo-images.com/LDOIVNy5dHmxL96Bvq4Hag__imagepage/img/nEPuhXCWE8xHiBNRJ4zJXg5aI4w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759181.png' },
  { id: 'pandora', name: 'Pandora', hp: 13, move: 2, attack: 'RANGED', set: 'Battle of Legends, Volume Three', imageUrl: 'https://cf.geekdo-images.com/p_ynSGJhOg6y6Qjv6LqJtQ__imagepage/img/cY5hYoKSfOgYIEuqCUG_HdqU2ig=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759183.png' },
  { id: 'luke-cage', name: 'Luke Cage', hp: 13, move: 2, attack: 'MELEE', set: 'Redemption Row', sidekicks: [{ name: 'Misty Knight', count: 1, hp: 6, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/vPtSEYtO2mjsjFCNsHRbtw__imagepage/img/90Q4pSz3Hxa0JPB48A_eNpfF6V4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093967.png' },
  { id: 'moon-knight', name: 'Moon Knight', hp: 16, move: 3, attack: 'MELEE', set: 'Redemption Row', imageUrl: 'https://cf.geekdo-images.com/Lp_RLz1S6GbgBm5_NrZiKw__imagepage/img/tXb3zOF88cP7HDBQNY6hEgxYh3U=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093971.png' },
  { id: 'ghost-rider', name: 'Ghost Rider', hp: 17, move: 2, attack: 'MELEE', set: 'Redemption Row', imageUrl: 'https://cf.geekdo-images.com/6cPOXsAjQO5lNH7KvzN_WA__imagepage/img/xwGaFqjZsxGC0VB3S3X8EWH4B2A=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093951.png' },
  { id: 'elektra', name: 'Elektra', hp: 7, move: 2, attack: 'MELEE', set: 'Hell\'s Kitchen', sidekicks: [{ name: 'The Hand', count: 4, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/uGqLsF_EtTUdEEyDo4x60A__imagepage/img/lS6Ud6r9cqpNlnQFrU4dHgGUOmY=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093947.png' },
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', hp: 13, move: 2, attack: 'RANGED', set: 'Jurassic Park – Sattler vs. T‑Rex', imageUrl: 'https://cf.geekdo-images.com/EX2lnBZajdWaYW_NR7GsWQ__imagepage/img/rGfE7rJbR8wlkxzKaJbLsO8UBkc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652029.png' },
  { id: 't-rex', name: 'T. Rex', hp: 27, move: 1, attack: 'MELEE', set: 'Jurassic Park – Sattler vs. T‑Rex', imageUrl: 'https://cf.geekdo-images.com/HUXE5AUDlVd0lVz_YMW5gA__imagepage/img/sL1VBVd_1AH0y6bW2LKh56QZaxg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652032.png' },
  { id: 'houdini', name: 'Harry Houdini', hp: 14, move: 2, attack: 'MELEE', set: 'Houdini vs. The Genie', sidekicks: [{ name: 'Bess', count: 1, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/M6CpbIThDSa5nqCUxOp9yQ__imagepage/img/pRNMiLTJD_aFhWcbLJwKEjHAGGw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257642.png' },
  { id: 'the-genie', name: 'The Genie', hp: 16, move: 3, attack: 'RANGED', set: 'Houdini vs. The Genie', imageUrl: 'https://cf.geekdo-images.com/B7pSMbIz2fVjO85FvkCLKw__imagepage/img/dC4fWYnc5cj4tXKNGdrhWajoCYc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257644.png' },
  { id: 'ms-marvel', name: 'Ms. Marvel', hp: 14, move: 2, attack: 'MELEE', set: 'Teen Spirit', imageUrl: 'https://cf.geekdo-images.com/FxSZOk3c7tXHdIhzzkp-9Q__imagepage/img/CyJR_MbXcqkATyREBFRXKrXARoQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093979.png' },
  { id: 'squirrel-girl', name: 'Squirrel Girl', hp: 13, move: 2, attack: 'MELEE', set: 'Teen Spirit', imageUrl: 'https://cf.geekdo-images.com/hXPj-jYDZKxWqvjIW-GhGQ__imagepage/img/z_YiJ3tqMgZ7wE0q7pj46dNBNuI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093987.png' },
  { id: 'winter-soldier', name: 'Winter Soldier', hp: 15, move: 2, attack: 'RANGED', set: 'For King and Country', imageUrl: 'https://cf.geekdo-images.com/nF_zLfAL0tDzwLN78IlDgA__imagepage/img/JnZBONLbZF6iEWI8nW3OFn5kdoE=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093991.png' },
  { id: 'spider-man', name: 'Spider‑Man', hp: 15, move: 3, attack: 'MELEE', set: 'Brains and Brawn', imageUrl: 'https://cf.geekdo-images.com/HqSJ6zFyEi4ifnqQHpgOaw__imagepage/img/H7zMM_o3Ee8OJbVD9qNg1Hg1BYk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093983.png' },
  { id: 'she-hulk', name: 'She‑Hulk', hp: 20, move: 2, attack: 'MELEE', set: 'Brains and Brawn', imageUrl: 'https://cf.geekdo-images.com/I9QHsRbN8cRkz-cSjKOkYA__imagepage/img/gXSXVq8jq3sxJlHcHEG6-_5KhqM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093977.png' },
  { id: 'nikola-tesla', name: 'Nikola Tesla', hp: 14, move: 2, attack: 'RANGED', set: 'Adventures: Tales to Amaze', imageUrl: 'https://cf.geekdo-images.com/v8j8U3bvKOuNj72UajZBag__imagepage/img/NujPG15-JCQxRXqHsqb0VljsSO0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257652.png' },
  { id: 'golden-bat', name: 'Golden Bat', hp: 18, move: 3, attack: 'MELEE', set: 'Adventures: Tales to Amaze', imageUrl: 'https://cf.geekdo-images.com/E4iMhN1Lp3gUz_X46_Mkmw__imagepage/img/d6JTIpM0WiQyqLiDivCIqj1qgNo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257638.png' },
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', hp: 14, move: 2, attack: 'RANGED', set: 'Sun\'s Origin', imageUrl: 'https://cf.geekdo-images.com/eHGrh8aQdtKNJjg7eYYs8g__imagepage/img/x6cBNs2h2CzLvUxkTW9Oq-8n48M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257659.png' },
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', hp: 13, move: 2, attack: 'MELEE', set: 'Sun\'s Origin', sidekicks: [{ name: 'Honor Guard', count: 2, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/EabM2FdC2WiQKQKECe-5xw__imagepage/img/Dy75XCazBF0vIaU2FHubZJOh6Uw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257654.png' },
  { id: 'hamlet', name: 'Hamlet', hp: 15, move: 2, attack: 'MELEE', set: 'Slings & Arrows', sidekicks: [{ name: 'Rosencrantz & Guildenstern', count: 2, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/N5WU_kJZpx6cJjlNj7P2iw__imagepage/img/PzXbJDXpALZxsE5gDdGIHiYEAa0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257640.png' },
  { id: 'titania', name: 'Titania', hp: 12, move: 2, attack: 'RANGED', set: 'Slings & Arrows', sidekicks: [{ name: 'Oberon', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/BoevOvNBOw2eZFj0u-tJrg__imagepage/img/00eHQOOSNaGWvhNpkr1gmlKmr-4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257661.png' },
  { id: 'wayward-sisters', name: 'The Wayward Sisters', hp: 6, move: 2, attack: 'MELEE', set: 'Slings & Arrows', imageUrl: 'https://cf.geekdo-images.com/aR1XGWcE_2J4nAvXhD0tig__imagepage/img/Rk9QMk8JxXL20n0MXOUIWIuJh6Q=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257665.png' },
  { id: 'william-shakespeare', name: 'William Shakespeare', hp: 13, move: 2, attack: 'MELEE', set: 'Slings & Arrows', sidekicks: [{ name: 'Actors', count: 3, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/eSsb82XCOEu2gIjSKE-Xxw__imagepage/img/7fgJVkJ4Qh3r5cWH4d9z1V2bJC0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257668.png' },
  { id: 'eredin', name: 'Eredin', hp: 14, move: 2, attack: 'MELEE', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Red Riders', count: 4, hp: 5, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/Tn8ZukZMb9ZOYPjB-Cm4iQ__imagepage/img/TLtTLKLGW_2CpT-ySt7z8L76aZs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775193.png' },
  { id: 'philippa', name: 'Philippa', hp: 12, move: 2, attack: 'RANGED', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Dijkstra', count: 1, hp: 6, attack: 'MELEE' }], imageUrl: 'https://cf.geekdo-images.com/y-5o6E3bT9Oaa8j8BnQj6Q__imagepage/img/l2ER3BEshxUc7pOe-mTa75xYfdo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775196.png' },
  { id: 'yennefer-triss', name: 'Yennefer & Triss', hp: 14, move: 2, attack: 'RANGED', set: 'The Witcher – Realms Fall', sidekicks: [{ name: 'Triss', count: 1, hp: 9, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/hLHEdyiO7kVqP2R8BnJBZA__imagepage/img/f9kbmXAI9MG7xhtZnCdUFxeZOVM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775200.png' },
  { id: 'geralt', name: 'Geralt of Rivia', hp: 16, move: 2, attack: 'MELEE', set: 'The Witcher – Steel & Silver', sidekicks: [{ name: 'Dandelion', count: 1, hp: 8, attack: 'RANGED' }], imageUrl: 'https://cf.geekdo-images.com/s9GF0fXi-P4xjKKQd7YpXw__imagepage/img/7NVe-H0Jz55tcrnREK6h_QJdvvM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775208.png' },
  { id: 'muhammad-ali', name: 'Muhammad Ali', hp: 16, move: 3, attack: 'MELEE', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/4YH7gOTh5Fl4uQD4Fvs4hg__imagepage/img/-hCqy8Iow40l5MPZlMAf1kUJCmg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7899527.png' },
  { id: 'bruce-lee-ali', name: 'Bruce Lee', hp: 14, move: 3, attack: 'MELEE', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/a5Q-X5RMH1gIZGR8aWLBwQ__imagepage/img/LwDJnPvJpVY8xAL2wHb8aY7CxpQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7899525.png' },
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
