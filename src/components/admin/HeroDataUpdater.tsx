import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { updateAllHeroData } from '@/lib/update-hero-data'
import { HEROES } from '@/lib/data'
import { Download } from '@phosphor-icons/react'

export function HeroDataUpdater() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpdate = async () => {
    setIsLoading(true)
    try {
      const data = await updateAllHeroData()
      setResult(data)
      
      const heroMap = new Map(HEROES.map(h => [h.name, h]))
      
      const updatedHeroes = data.heroes.map((heroData: any) => {
        const existingHero = heroMap.get(heroData.name)
        if (!existingHero) {
          console.warn(`Hero not found: ${heroData.name}`)
          return null
        }
        
        return {
          ...existingHero,
          movement: heroData.movement,
          sidekick: heroData.sidekick,
          sidekickMovement: heroData.sidekickMovement,
          attackType: heroData.attackType,
          sidekickAttackType: heroData.sidekickAttackType,
          coreAbility: heroData.coreAbility,
        }
      }).filter(Boolean)
      
      console.log('Updated heroes data:', updatedHeroes)
      
      const output = `export const HEROES: Hero[] = ${JSON.stringify(updatedHeroes, null, 2)}`
      
      const blob = new Blob([output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'updated-heroes.ts'
      a.click()
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Error updating hero data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 mb-6 bg-amber-50 border-amber-200">
      <h3 className="text-lg font-semibold mb-2 text-amber-900">Hero Data Updater (Admin)</h3>
      <p className="text-sm text-amber-800 mb-4">
        Click to fetch accurate hero data from Unmatched game sources and download updated data file.
      </p>
      <Button 
        onClick={handleUpdate} 
        disabled={isLoading}
        variant="outline"
        className="gap-2"
      >
        <Download />
        {isLoading ? 'Fetching data...' : 'Update Hero Data'}
      </Button>
      
      {result && (
        <div className="mt-4 p-4 bg-white rounded border border-amber-200">
          <p className="text-sm text-green-700 mb-2">
            ✓ Successfully fetched data for {result.heroes?.length || 0} heroes
          </p>
          <p className="text-xs text-amber-700">
            Check console for details and download the updated file
          </p>
        </div>
      )}
    </Card>
  )
}
