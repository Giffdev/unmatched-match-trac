import { HEROES } from './data'

export async function updateAllHeroData() {
  console.log('Fetching accurate hero data from Unmatched game sources...')
  
  const heroList = HEROES.map(h => h.name).join('\n- ')
  
  const basePrompt = `You are an expert on the Unmatched board game by Restoration Games. I need ACCURATE game data for all of the following heroes.

For EACH of these heroes, provide:
1. Hero movement value (the number printed on their character card)
2. Sidekick name (exact name, or null if they have no sidekick)
3. Sidekick movement value (if applicable)
4. Hero attack type: "melee" (only melee attacks), "ranged" (only ranged attacks), or "both" (has both types)
5. Sidekick attack type (if applicable)
6. Core ability: A concise 1-2 sentence description of their main special ability

Heroes to process:
- ${heroList}

IMPORTANT GUIDELINES:
- Use ONLY official Unmatched game data
- Movement values are specific integers from character cards (typically 1-3)
- Attack types are based on the hero's deck composition
- Core abilities should be factual descriptions of the hero's main special rule
- For heroes with variants (like Jekyll & Hyde, Yennefer & Triss), describe how they work
- Be precise - this is for a statistics tracking app

Return a JSON object with a "heroes" property containing an array of objects in this format:
{
  "heroes": [
    {
      "name": "Alice",
      "movement": 2,
      "sidekick": "The Jabberwock",
      "sidekickMovement": 3,
      "attackType": "melee",
      "sidekickAttackType": "melee",
      "coreAbility": "Alice can move the Jabberwock like a hero after it attacks."
    }
  ]
}

Process ALL heroes listed above.`

  const result = await window.spark.llm(basePrompt, "gpt-4o", true)
  const data = JSON.parse(result)
  
  console.log('Hero data received:', data)
  return data
}
