import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HEROES } from '@/lib/data'
import { Heart, User as UserIcon, ArrowRight,
import { HEROES } from '@/lib/data'
import { HeroImage } from '@/components/heroes/HeroImage'
import { Heart, User as UserIcon, ArrowRight, Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

            hero.name.toLowerCase().i
        )
    

  const selectedHero = selectedHeroId ? 
  return (
      <CardHeader>
        <CardDescripti
        </CardDes
      <CardContent>
          <Input
         
            cl

            <div className="space-y-2 max-h-[600px] overflow-y-auto p
              

                    "w-full text-left p-3 rounded-lg border transition-colors",

          
                  <div className="flex i
                  
                          src={hero.imageUrl
                         
                      )}
                    <div c
                   
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
                      </d
              ))}
              {filteredHeroes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                          {selectedHero.attack}
                </div>

            </div>

            <div className="lg:sticky lg:top-4 lg:self-start">
                          <div 
                <Card className="border-accent/20">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-48 h-48 rounded-lg overflow-hidden bg-muted">
                        <HeroImage heroId={selectedHero.id} />
                            
                      <div className="text-center">
                        <h3 className="text-2xl font-bold text-foreground">{selectedHero.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{selectedHero.set}</p>
                          </
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                        <Heart className="text-destructive" size={20} />
                            {
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
  )
                          {selectedHero.attack}

                      </div>

                      {selectedHero.sidekicks && selectedHero.sidekicks.length > 0 && (
                        <div className="pt-2">
                          <div className="text-sm font-semibold text-muted-foreground mb-2">

                          </div>
                          <div className="space-y-1">
                            {selectedHero.sidekicks.map((sidekick, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-sm">
                                <UserIcon size={16} className="text-muted-foreground" />
                                <span>
                                  {sidekick.count > 1 ? `${sidekick.count}× ` : ''}
                                  {sidekick.name}
                                </span>
                                {sidekick.hp && (
                                  <span className="text-muted-foreground">
                                    ({sidekick.hp} HP, {sidekick.attack})
                                  </span>

                              </div>

                          </div>
                        </div>
                      )}


                    {selectedHero.abilityDescription && (
                      <div className="pt-4 border-t border-border">
                        {selectedHero.abilityTitle && (
                          <div className="font-semibold text-primary mb-2 text-sm">
                            {selectedHero.abilityTitle}
                          </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">

                        </p>

                    )}

                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-12 text-center">
                    <div className="text-muted-foreground">
                      Select a hero to view details
                    </div>
                  </CardContent>
                </Card>

            </div>

        </div>

    </Card>

}
