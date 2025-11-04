import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { UNMATCHED_SETS, getHeroesBySet, FRANCHISES, getSetsByFranchise } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Package, CheckSquare, Square, Funnel } from '@phosphor-icons/react'
import { useState } from 'react'

type CollectionTabProps = {
  ownedSets: string[]
  setOwnedSets: (updater: (sets: string[]) => string[]) => void
}

export function CollectionTab({ ownedSets, setOwnedSets }: CollectionTabProps) {
  const [selectedFranchise, setSelectedFranchise] = useState<string | null>(null)

  const toggleSet = (setName: string) => {
    setOwnedSets((current) => {
      if (current.includes(setName)) {
        return current.filter(s => s !== setName)
      } else {
        return [...current, setName]
      }
    })
  }

  const selectAll = () => {
    setOwnedSets(() => UNMATCHED_SETS.map(s => s.name))
  }

  const clearAll = () => {
    setOwnedSets(() => [])
  }

  const totalHeroes = ownedSets.reduce((acc, setName) => {
    return acc + getHeroesBySet(setName).length
  }, 0)

  const filteredSets = selectedFranchise 
    ? getSetsByFranchise(selectedFranchise)
    : UNMATCHED_SETS

  const allSelected = ownedSets.length === UNMATCHED_SETS.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-semibold">My Collection</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Select the sets you own to filter available heroes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={allSelected ? clearAll : selectAll}
          >
            {allSelected ? (
              <>
                <Square className="mr-2" />
                Clear All
              </>
            ) : (
              <>
                <CheckSquare className="mr-2" />
                Select All
              </>
            )}
          </Button>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Heroes Available</p>
              <p className="text-2xl font-bold text-primary">{totalHeroes}</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Funnel className="text-muted-foreground" />
        <span className="text-sm font-medium">Filter by Franchise:</span>
        <Button
          variant={selectedFranchise === null ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedFranchise(null)}
        >
          All Franchises
        </Button>
        {FRANCHISES.map((franchise) => (
          <Button
            key={franchise}
            variant={selectedFranchise === franchise ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFranchise(franchise)}
          >
            {franchise}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredSets.map((setInfo) => {
          const isOwned = ownedSets.includes(setInfo.name)
          const heroes = getHeroesBySet(setInfo.name)

          return (
            <Card 
              key={setInfo.name} 
              className={`p-6 cursor-pointer transition-all ${
                isOwned ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleSet(setInfo.name)}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  id={setInfo.name} 
                  checked={isOwned}
                  onCheckedChange={() => toggleSet(setInfo.name)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="cursor-pointer font-semibold text-base">
                      {setInfo.name}
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {setInfo.franchise}
                    </Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {heroes.map((hero) => (
                      <Badge key={hero.id} variant="secondary" className="text-xs">
                        {hero.name}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {heroes.length} {heroes.length === 1 ? 'hero' : 'heroes'}
                  </p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {ownedSets.length === 0 && (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-primary/10 p-6">
              <Package className="w-12 h-12 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No sets selected</h3>
              <p className="text-muted-foreground">
                Select the Unmatched sets you own to get started
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
