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
  { id: 'alice', name: 'Alice', set: 'Battle of Legends, Volume One', sidekick: 'The Jabberwock', imageUrl: 'https://cf.geekdo-images.com/A_FZwxPy_JcKa1ZjEtlmqQ__imagepage/img/l-WrDtPbLIOxqOHv-VX6u5OgKVU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609969.png' },
  { id: 'medusa', name: 'Medusa', set: 'Battle of Legends, Volume One', sidekick: 'Harpies', imageUrl: 'https://cf.geekdo-images.com/T-A4wGqLFywPYo2WgIj6Tg__imagepage/img/N_D8_OFSbT6BNbXuFnuxu_2AiE4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609982.png' },
  { id: 'king-arthur', name: 'King Arthur', set: 'Battle of Legends, Volume One', sidekick: 'Merlin', imageUrl: 'https://cf.geekdo-images.com/6VoqcPdHxKNu2wQEbIr3GA__imagepage/img/X-YQJieCsE7Jn-RGIEELyRTzEag=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609977.png' },
  { id: 'sinbad', name: 'Sinbad', set: 'Battle of Legends, Volume One', sidekick: 'Porter', imageUrl: 'https://cf.geekdo-images.com/7hKRE5V_3gVRtcbcWB3Ucw__imagepage/img/v68q5IZCGtYVZk6A9BmP1bN4lj4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5609986.png' },
  
  { id: 'bruce-lee', name: 'Bruce Lee', set: 'Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/VDiIXjVILnXMQNDO8IVlNg__imagepage/img/Sb8H3_lZhE98-i7yStUTWvZLhWk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182990.png' },
  
  { id: 'robin-hood', name: 'Robin Hood', set: 'Robin Hood vs Bigfoot', sidekick: 'Outlaws', imageUrl: 'https://cf.geekdo-images.com/Y3lCu-ZE4VZ6sBZw_W4-Gw__imagepage/img/rvXYSvM2cqCWzGxBnYJ0n7kvjvI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4830611.png' },
  { id: 'bigfoot', name: 'Bigfoot', set: 'Robin Hood vs Bigfoot', imageUrl: 'https://cf.geekdo-images.com/RJ_Kfkql9XWw6y3uxlOSpw__imagepage/img/dUZYt8uy8SJHg6d1xDwJDdHQaYc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4830607.png' },
  
  { id: 'ingen', name: 'Robert Muldoon', set: 'Jurassic Park – InGen vs. Raptors', sidekick: 'InGen Workers', imageUrl: 'https://cf.geekdo-images.com/8zf7IKj82FQB1t-nnGOV4A__imagepage/img/lzYNLMVVrW4UtzCz1QWbYUGpRoo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652033.png' },
  { id: 'raptors', name: 'Raptors', set: 'Jurassic Park – InGen vs. Raptors', imageUrl: 'https://cf.geekdo-images.com/O_lwZmJN-3sWx-oyhDw0rA__imagepage/img/fgINTPPc-u7kGFjXvKnTpK5c22o=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652035.png' },
  
  { id: 'sherlock-holmes', name: 'Sherlock Holmes', set: 'Cobble & Fog', sidekick: 'Dr. Watson', imageUrl: 'https://cf.geekdo-images.com/IqIEU9H73W8p5Pzbe1vprA__imagepage/img/q4bBVeVlC-YVhaNGf0J2RO0XbXo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182960.png' },
  { id: 'dracula', name: 'Dracula', set: 'Cobble & Fog', sidekick: 'Sisters', imageUrl: 'https://cf.geekdo-images.com/uj-PHVY0R0SL6SbJzm8t6Q__imagepage/img/HI2LYtzjkIkCy2TGx1HjRfxRvsc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182952.png' },
  { id: 'jekyll-hyde', name: 'Jekyll & Hyde', set: 'Cobble & Fog', imageUrl: 'https://cf.geekdo-images.com/uu3Dsp-ztHNJbhajKxPovA__imagepage/img/BAdkTbhqCwmHcxHPdBY1iVGVjT4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182956.png' },
  { id: 'invisible-man', name: 'Invisible Man', set: 'Cobble & Fog', imageUrl: 'https://cf.geekdo-images.com/j_FqTXrqnJqfBHlqjhN9Ug__imagepage/img/jKCy66D5h4G5mLXl-oCfVDo0SQE=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182954.png' },
  
  { id: 'buffy', name: 'Buffy', set: 'Buffy the Vampire Slayer', sidekick: 'Giles', imageUrl: 'https://cf.geekdo-images.com/OKLFzqoWIc0eU-lMb7nkFA__imagepage/img/L-iLYj6r54FQpkEKKNq8Xvuii04=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093883.png' },
  { id: 'angel', name: 'Angel', set: 'Buffy the Vampire Slayer', sidekick: 'Faith', imageUrl: 'https://cf.geekdo-images.com/TRbkJxvY2nPHHKF77n9lFw__imagepage/img/jkLG7RQOoTmb4S7w0fRlwV9c_a8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093881.png' },
  { id: 'spike', name: 'Spike', set: 'Buffy the Vampire Slayer', sidekick: 'Drusilla', imageUrl: 'https://cf.geekdo-images.com/VxQo_ZywuMJ4EWBAtc6zQA__imagepage/img/7F-9c7fKIUF1vKo-YrQ5LOxBvtg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093889.png' },
  { id: 'willow', name: 'Willow', set: 'Buffy the Vampire Slayer', sidekick: 'Tara', imageUrl: 'https://cf.geekdo-images.com/5yfLH_gg7fXj32xKr9_yIQ__imagepage/img/a7mjF-7fCLRAqKRADHVNDYJV0ng=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093893.png' },
  
  { id: 'little-red', name: 'Little Red Riding Hood', set: 'Little Red Riding Hood vs. Beowulf', sidekick: 'The Huntsman', imageUrl: 'https://cf.geekdo-images.com/RrFKdcJ9fPcF0u5e4KNB8A__imagepage/img/03iTVLt7mDYVUYIhfZ49x51F0Fo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182974.png' },
  { id: 'beowulf', name: 'Beowulf', set: 'Little Red Riding Hood vs. Beowulf', sidekick: 'Wiglaf', imageUrl: 'https://cf.geekdo-images.com/tQDdF0rQ1q_LTfhqrxS8hg__imagepage/img/bN-NFXR4gB5qakWp1X_4_hD5OQM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5182948.png' },
  
  { id: 'deadpool', name: 'Deadpool', set: 'Deadpool', imageUrl: 'https://cf.geekdo-images.com/vRz80UWDlhb8QaGzQgmqeA__imagepage/img/hgXSt45_XQDpmtJiJ1u25EZj-Ag=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093937.png' },
  
  { id: 'achilles', name: 'Achilles', set: 'Battle of Legends, Volume Two', sidekick: 'Patroclus', imageUrl: 'https://cf.geekdo-images.com/9lCDpWINK-hNBFjVYHtWPQ__imagepage/img/o9mApjJmLmVT0Kw5fwBPZBmxcS0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257613.png' },
  { id: 'bloody-mary', name: 'Bloody Mary', set: 'Battle of Legends, Volume Two', sidekick: 'Spirits', imageUrl: 'https://cf.geekdo-images.com/a4QqpTTDZvvfyaQmYMdVPg__imagepage/img/sppaxf0Lh1oqvK73_xgNiU_0Gzg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257617.png' },
  { id: 'sun-wukong', name: 'Sun Wukong', set: 'Battle of Legends, Volume Two', sidekick: 'Clones', imageUrl: 'https://cf.geekdo-images.com/OkGx7fXRrF_-l7BPZ6_e_A__imagepage/img/KH2ixWxYaV-5TLfJ_CBQGDVL7jw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257625.png' },
  { id: 'yennenga', name: 'Yennenga', set: 'Battle of Legends, Volume Two', sidekick: 'Stallions', imageUrl: 'https://cf.geekdo-images.com/NqnlJR48tDFVqcUAe5wKWw__imagepage/img/S9p-9fqbFbbApF0v0lK-uNvP-rU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257627.png' },
  
  { id: 'blackbeard', name: 'Blackbeard', set: 'Battle of Legends, Volume Three', sidekick: 'Crew', imageUrl: 'https://cf.geekdo-images.com/JC3qcyUIBEq8XKuN6bx1zw__imagepage/img/iQEuJ3JWMzikYyq2bFXQvCpYqnU=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759172.png' },
  { id: 'chupacabra', name: 'Chupacabra', set: 'Battle of Legends, Volume Three', sidekick: 'Goats', imageUrl: 'https://cf.geekdo-images.com/lhPVSDWyEvZQhFFjuTDxmQ__imagepage/img/PjRJjQvI7_zPQA1noBHk4hDIv1Q=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759175.png' },
  { id: 'loki', name: 'Loki', set: 'Battle of Legends, Volume Three', sidekick: 'Hel', imageUrl: 'https://cf.geekdo-images.com/LDOIVNy5dHmxL96Bvq4Hag__imagepage/img/nEPuhXCWE8xHiBNRJ4zJXg5aI4w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759181.png' },
  { id: 'pandora', name: 'Pandora', set: 'Battle of Legends, Volume Three', sidekick: 'Hope', imageUrl: 'https://cf.geekdo-images.com/p_ynSGJhOg6y6Qjv6LqJtQ__imagepage/img/cY5hYoKSfOgYIEuqCUG_HdqU2ig=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7759183.png' },
  
  { id: 'luke-cage', name: 'Luke Cage', set: 'Redemption Row', sidekick: 'Misty Knight', imageUrl: 'https://cf.geekdo-images.com/vPtSEYtO2mjsjFCNsHRbtw__imagepage/img/90Q4pSz3Hxa0JPB48A_eNpfF6V4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093967.png' },
  { id: 'moon-knight', name: 'Moon Knight', set: 'Redemption Row', sidekick: 'Khonshu', imageUrl: 'https://cf.geekdo-images.com/Lp_RLz1S6GbgBm5_NrZiKw__imagepage/img/tXb3zOF88cP7HDBQNY6hEgxYh3U=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093971.png' },
  { id: 'ghost-rider', name: 'Ghost Rider', set: 'Redemption Row', sidekick: 'Cerberus', imageUrl: 'https://cf.geekdo-images.com/6cPOXsAjQO5lNH7KvzN_WA__imagepage/img/xwGaFqjZsxGC0VB3S3X8EWH4B2A=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093951.png' },
  
  { id: 'daredevil', name: 'Daredevil', set: 'Hell\'s Kitchen', sidekick: 'Foggy Nelson', imageUrl: 'https://cf.geekdo-images.com/8SDHh8UW-hXDNyAdRfxq3g__imagepage/img/Q03PvKt4NL7o20FYLlUZxbXlWkc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093943.png' },
  { id: 'bullseye', name: 'Bullseye', set: 'Hell\'s Kitchen', sidekick: 'Hostages', imageUrl: 'https://cf.geekdo-images.com/l-0GBzfSJdLRvCq-s3ZyLw__imagepage/img/6lrQ1iXzCuXsFZxJ14EGQ5nH1cI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093939.png' },
  { id: 'elektra', name: 'Elektra', set: 'Hell\'s Kitchen', sidekick: 'The Hand', imageUrl: 'https://cf.geekdo-images.com/uGqLsF_EtTUdEEyDo4x60A__imagepage/img/lS6Ud6r9cqpNlnQFrU4dHgGUOmY=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093947.png' },
  
  { id: 'ellie-sattler', name: 'Dr. Ellie Sattler', set: 'Jurassic Park – Sattler vs. T‑Rex', sidekick: 'Dr. Ian Malcolm', imageUrl: 'https://cf.geekdo-images.com/EX2lnBZajdWaYW_NR7GsWQ__imagepage/img/rGfE7rJbR8wlkxzKaJbLsO8UBkc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652029.png' },
  { id: 't-rex', name: 'T‑Rex', set: 'Jurassic Park – Sattler vs. T‑Rex', imageUrl: 'https://cf.geekdo-images.com/HUXE5AUDlVd0lVz_YMW5gA__imagepage/img/sL1VBVd_1AH0y6bW2LKh56QZaxg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic5652032.png' },
  
  { id: 'houdini', name: 'Harry Houdini', set: 'Houdini vs. The Genie', sidekick: 'The Heir', imageUrl: 'https://cf.geekdo-images.com/M6CpbIThDSa5nqCUxOp9yQ__imagepage/img/pRNMiLTJD_aFhWcbLJwKEjHAGGw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257642.png' },
  { id: 'the-genie', name: 'The Genie', set: 'Houdini vs. The Genie', sidekick: 'Jafar', imageUrl: 'https://cf.geekdo-images.com/B7pSMbIz2fVjO85FvkCLKw__imagepage/img/dC4fWYnc5cj4tXKNGdrhWajoCYc=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257644.png' },
  
  { id: 'ms-marvel', name: 'Ms. Marvel', set: 'Teen Spirit', sidekick: 'Bruno Carrelli', imageUrl: 'https://cf.geekdo-images.com/FxSZOk3c7tXHdIhzzkp-9Q__imagepage/img/CyJR_MbXcqkATyREBFRXKrXARoQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093979.png' },
  { id: 'squirrel-girl', name: 'Squirrel Girl', set: 'Teen Spirit', sidekick: 'Squirrels', imageUrl: 'https://cf.geekdo-images.com/hXPj-jYDZKxWqvjIW-GhGQ__imagepage/img/z_YiJ3tqMgZ7wE0q7pj46dNBNuI=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093987.png' },
  { id: 'cloak-dagger', name: 'Cloak & Dagger', set: 'Teen Spirit', imageUrl: 'https://cf.geekdo-images.com/U8BJ0y6Y5YYY2djFNW9YsA__imagepage/img/dMgkuZBmkfWawFyqJG_GKWS0RDs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093933.png' },
  
  { id: 'black-widow', name: 'Black Widow', set: 'For King and Country', sidekick: 'Nick Fury', imageUrl: 'https://cf.geekdo-images.com/yqwfk1-Uz3_NZ1L_kwDVSg__imagepage/img/s4oQMVpBR5Z02xjAxCvB4vukrzM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093929.png' },
  { id: 'black-panther', name: 'Black Panther', set: 'For King and Country', sidekick: 'Okoye', imageUrl: 'https://cf.geekdo-images.com/e5_zzmNTdJgj79m9vM65bw__imagepage/img/zz6z_1PMl-3vMSPj7V3jGPCEF5c=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093923.png' },
  { id: 'winter-soldier', name: 'Winter Soldier', set: 'For King and Country', sidekick: 'White Wolf', imageUrl: 'https://cf.geekdo-images.com/nF_zLfAL0tDzwLN78IlDgA__imagepage/img/JnZBONLbZF6iEWI8nW3OFn5kdoE=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093991.png' },
  
  { id: 'spider-man', name: 'Spider‑Man', set: 'Brains and Brawn', sidekick: 'Black Cat', imageUrl: 'https://cf.geekdo-images.com/HqSJ6zFyEi4ifnqQHpgOaw__imagepage/img/H7zMM_o3Ee8OJbVD9qNg1Hg1BYk=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093983.png' },
  { id: 'she-hulk', name: 'She‑Hulk', set: 'Brains and Brawn', sidekick: 'Titania', imageUrl: 'https://cf.geekdo-images.com/I9QHsRbN8cRkz-cSjKOkYA__imagepage/img/gXSXVq8jq3sxJlHcHEG6-_5KhqM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093977.png' },
  { id: 'doctor-strange', name: 'Doctor Strange', set: 'Brains and Brawn', sidekick: 'Wong', imageUrl: 'https://cf.geekdo-images.com/fKC-e_cZ1q5VG_X2qP0f1g__imagepage/img/RgEXKdO1uBJ4ygXQQ4eMSU7k0w8=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6093945.png' },
  
  { id: 'nikola-tesla', name: 'Nikola Tesla', set: 'Adventures: Tales to Amaze', sidekick: 'Robots', imageUrl: 'https://cf.geekdo-images.com/v8j8U3bvKOuNj72UajZBag__imagepage/img/NujPG15-JCQxRXqHsqb0VljsSO0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257652.png' },
  { id: 'dr-jill-trent', name: 'Dr. Jill Trent', set: 'Adventures: Tales to Amaze', sidekick: 'Daisy Tremaine', imageUrl: 'https://cf.geekdo-images.com/Ppa3hELSoxjUNpwQrTIUTQ__imagepage/img/a59fvIf3l_YhZ5kZgFzYz9GqDMg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257636.png' },
  { id: 'golden-bat', name: 'Golden Bat', set: 'Adventures: Tales to Amaze', sidekick: 'Bats', imageUrl: 'https://cf.geekdo-images.com/E4iMhN1Lp3gUz_X46_Mkmw__imagepage/img/d6JTIpM0WiQyqLiDivCIqj1qgNo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257638.png' },
  { id: 'annie-christmas', name: 'Annie Christmas', set: 'Adventures: Tales to Amaze', sidekick: 'Daughters', imageUrl: 'https://cf.geekdo-images.com/VfE1UIPxxgvnTwz7wHM7pA__imagepage/img/EWp-DqLb7wP6MfDjX-wX90BmZ_w=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257631.png' },
  
  { id: 'tomoe-gozen', name: 'Tomoe Gozen', set: 'Sun\'s Origin', sidekick: 'Archers', imageUrl: 'https://cf.geekdo-images.com/eHGrh8aQdtKNJjg7eYYs8g__imagepage/img/x6cBNs2h2CzLvUxkTW9Oq-8n48M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257659.png' },
  { id: 'oda-nobunaga', name: 'Oda Nobunaga', set: 'Sun\'s Origin', sidekick: 'Tanegashima', imageUrl: 'https://cf.geekdo-images.com/EabM2FdC2WiQKQKECe-5xw__imagepage/img/Dy75XCazBF0vIaU2FHubZJOh6Uw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257654.png' },
  
  { id: 'hamlet', name: 'Hamlet', set: 'Slings & Arrows', sidekick: 'Horatio', imageUrl: 'https://cf.geekdo-images.com/N5WU_kJZpx6cJjlNj7P2iw__imagepage/img/PzXbJDXpALZxsE5gDdGIHiYEAa0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257640.png' },
  { id: 'titania', name: 'Titania', set: 'Slings & Arrows', sidekick: 'Bottom', imageUrl: 'https://cf.geekdo-images.com/BoevOvNBOw2eZFj0u-tJrg__imagepage/img/00eHQOOSNaGWvhNpkr1gmlKmr-4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257661.png' },
  { id: 'wayward-sisters', name: 'The Wayward Sisters', set: 'Slings & Arrows', imageUrl: 'https://cf.geekdo-images.com/aR1XGWcE_2J4nAvXhD0tig__imagepage/img/Rk9QMk8JxXL20n0MXOUIWIuJh6Q=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257665.png' },
  { id: 'william-shakespeare', name: 'William Shakespeare', set: 'Slings & Arrows', sidekick: 'Yorick', imageUrl: 'https://cf.geekdo-images.com/eSsb82XCOEu2gIjSKE-Xxw__imagepage/img/7fgJVkJ4Qh3r5cWH4d9z1V2bJC0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic6257668.png' },
  
  { id: 'eredin', name: 'Eredin', set: 'The Witcher – Realms Fall', sidekick: 'Wild Hunt Riders', imageUrl: 'https://cf.geekdo-images.com/Tn8ZukZMb9ZOYPjB-Cm4iQ__imagepage/img/TLtTLKLGW_2CpT-ySt7z8L76aZs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775193.png' },
  { id: 'philippa', name: 'Philippa', set: 'The Witcher – Realms Fall', sidekick: 'Lackeys', imageUrl: 'https://cf.geekdo-images.com/y-5o6E3bT9Oaa8j8BnQj6Q__imagepage/img/l2ER3BEshxUc7pOe-mTa75xYfdo=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775196.png' },
  { id: 'yennefer-triss', name: 'Yennefer & Triss', set: 'The Witcher – Realms Fall', sidekick: 'Sorceresses', imageUrl: 'https://cf.geekdo-images.com/hLHEdyiO7kVqP2R8BnJBZA__imagepage/img/f9kbmXAI9MG7xhtZnCdUFxeZOVM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775200.png' },
  
  { id: 'geralt', name: 'Geralt of Rivia', set: 'The Witcher – Steel & Silver', sidekick: 'Roach', imageUrl: 'https://cf.geekdo-images.com/s9GF0fXi-P4xjKKQd7YpXw__imagepage/img/7NVe-H0Jz55tcrnREK6h_QJdvvM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775208.png' },
  { id: 'ciri', name: 'Ciri', set: 'The Witcher – Steel & Silver', sidekick: 'Zireael', imageUrl: 'https://cf.geekdo-images.com/Nw7IM6HrJJCjjJLXdsgL2g__imagepage/img/Ql1-j0DJqJWAyQDH9HEXlUdVVoM=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775204.png' },
  { id: 'ancient-leshen', name: 'Ancient Leshen', set: 'The Witcher – Steel & Silver', sidekick: 'Wolves', imageUrl: 'https://cf.geekdo-images.com/VFbI8rCPBG-qp39Px8QhGQ__imagepage/img/8oI5VuFdqj0i4rI_olB_QJ18mL4=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7775202.png' },
  
  { id: 'muhammad-ali', name: 'Muhammad Ali', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/4YH7gOTh5Fl4uQD4Fvs4hg__imagepage/img/-hCqy8Iow40l5MPZlMAf1kUJCmg=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7899527.png' },
  { id: 'bruce-lee-ali', name: 'Bruce Lee', set: 'Muhammad Ali vs. Bruce Lee', imageUrl: 'https://cf.geekdo-images.com/a5Q-X5RMH1gIZGR8aWLBwQ__imagepage/img/LwDJnPvJpVY8xAL2wHb8aY7CxpQ=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7899525.png' },
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
