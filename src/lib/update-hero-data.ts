export async function updateAllHeroData() {
  console.warn('updateAllHeroData: LLM-based hero data fetch is no longer available after migration from Spark.')
  console.warn('Hero data should be maintained manually in src/lib/data.ts.')
  return { heroes: [] }
}
