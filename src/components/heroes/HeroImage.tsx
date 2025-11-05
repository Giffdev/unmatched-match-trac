import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { cn } from '@/lib/utils'


  const [ima


 

          alt={hero.name}
            "w-full h-full object-cover rounded-lg bo
          )}

            setImageLoaded(false)

      )}
      <div 
          "absolute inset-0 bg-gradient-
        )}
        <Sword className="w-16
          <div className=
            {hero.sideki
                <p className="font-medium">Sidekick:</p>
              </div>
            
            </div>
        )}
    </div>
}













          <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">{hero.name}</h3>
            {hero.sidekick && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Sidekick:</p>
                <p>{hero.sidekick}</p>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{hero.set}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
