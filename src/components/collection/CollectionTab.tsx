import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { UNMATCHED_SETS, getHeroesBySet } from '@/lib/data'
import { Badge } from '@/components/ui/badge'
import { Package, CheckSquare, Square } from '@phosphor-icons/react'

type CollectionTabProps = {
  ownedSets: string[]
  setOwnedSets: (updater: (sets: string[]) => string[]) => void
}

export function CollectionTab({ ownedSets, setOwnedSets }: CollectionTabProps) {
  const toggleSet = (set: string) => {
    setOwnedSets((current) => {
      if (current.includes(set)) {
        return current.filter(s => s !== set)
      } else {
        return [...current, set]
      }
    })
  }

  const selectAll = () => {
    setOwnedSets(() => [...UNMATCHED_SETS])
  }

  const clearAll = () => {
    setOwnedSets(() => [])
  }

  const totalHeroes = ownedSets.reduce((acc, set) => {
    return acc + getHeroesBySet(set).length
  }, 0)

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {UNMATCHED_SETS.map((set) => {
          const isOwned = ownedSets.includes(set)
          const heroes = getHeroesBySet(set)

          return (
            <Card 
              key={set} 
              className={`p-6 cursor-pointer transition-all ${
                isOwned ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
              }`}
              onClick={() => toggleSet(set)}
            >
              <div className="flex items-start gap-3">
                <Checkbox 
                  id={set} 
                  checked={isOwned}
                  onCheckedChange={() => toggleSet(set)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1">
                  <Label htmlFor={set} className="cursor-pointer font-semibold text-base">
                    {set}
                  </Label>
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
