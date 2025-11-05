import { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { HEROES } from '@/lib/data'
import { HeroImage } from '@/components/heroes/HeroImage'
import { Heart, ArrowRight, Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type PublicHeroBrowserProps = {
  selectedHeroId?: string | null
}

export function PublicHeroBrowser({ selectedHeroId: initialSelectedHeroId }: PublicHeroBrowserProps) {
  const [search, setSearch] = useState('')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(initialSelectedHeroId || null)

  useEffect(() => {
    if (initialSelectedHeroId) {
      setSelectedHeroId(initialSelectedHeroId)
    }
  }, [initialSelectedHeroId])

  const filteredHeroes = useMemo(() => {
    const searchLower = search.toLowerCase()
    return search
      ? HEROES.filter(
          hero =>
            hero.name.toLowerCase().includes(searchLower) ||
            hero.set.toLowerCase().includes(searchLower)
        )
      : HEROES
  }, [search])

  const selectedHero = selectedHeroId ? HEROES.find(h => h.id === selectedHeroId) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Database</CardTitle>
        <CardDescription>
          Browse all heroes and view their stats, abilities, and sidekicks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Input
            placeholder="Search heroes by name or set..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {filteredHeroes.map((hero) => (
                <button
                  key={hero.id}
                  onClick={() => setSelectedHeroId(hero.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedHeroId === hero.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-accent hover:bg-accent/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                      {hero.imageUrl && (
                        <img 
                          src={hero.imageUrl} 
                          alt={hero.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground">{hero.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{hero.set}</div>
                    </div>
                    <ArrowRight className="text-muted-foreground flex-shrink-0" />
                  </div>
                </button>
              ))}
              {filteredHeroes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No heroes found
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
              {selectedHero ? (
                <Card className="border-accent/20">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <HeroImage hero={selectedHero} className="w-48 h-48" />
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-foreground">{selectedHero.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{selectedHero.set}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Heart className="text-destructive" size={20} />
                        <div>
                          <div className="text-xs text-muted-foreground">Health</div>
                          <div className="font-semibold">{selectedHero.hp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Sword className="text-primary" size={20} />
                        <div>
                          <div className="text-xs text-muted-foreground">Movement</div>
                          <div className="font-semibold">{selectedHero.move}</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Attack Type:</span>
                        <span className="font-semibold">{selectedHero.attack}</span>
                      </div>

                      {selectedHero.sidekicks && selectedHero.sidekicks.length > 0 && (
                        <div className="pt-2">
                          <div className="text-sm font-semibold text-muted-foreground mb-2">
                            Sidekicks
                          </div>
                          <div className="space-y-1">
                            {selectedHero.sidekicks.map((sidekick, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <span>
                                  {sidekick.count > 1 ? `${sidekick.count}× ` : ''}
                                  {sidekick.name}
                                </span>
                                {sidekick.hp && (
                                  <span className="text-muted-foreground">
                                    ({sidekick.hp} HP, {sidekick.attack})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedHero.abilityDescription && (
                      <div className="pt-4 border-t border-border">
                        {selectedHero.abilityTitle && (
                          <div className="font-semibold text-primary mb-2 text-sm">
                            {selectedHero.abilityTitle}
                          </div>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {selectedHero.abilityDescription}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground">
                      Select a hero to view details
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
