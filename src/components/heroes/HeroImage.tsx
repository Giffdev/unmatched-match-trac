import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Hero } from '@/lib/types'

type HeroImageProps = {
  hero: Hero
  className?: string
}

export function HeroImage({ hero, className }: HeroImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageUrl = `https://unmatched.cards/images/heroes/${hero.id}.jpg`

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border bg-card", className)}>
      {!imageError ? (
        <img
          src={imageUrl}
          alt={hero.name}
          className={cn(
            "w-full h-full object-cover rounded-lg transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageLoaded(false)
            setImageError(true)
          }}
        />
      ) : (
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex flex-col items-center justify-center p-4 text-center"
          )}
        >
          <Sword className="w-16 h-16 text-primary mb-4" />
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-foreground">{hero.name}</h3>
            {hero.sidekicks && hero.sidekicks.length > 0 && (
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">Sidekick:</p>
                <p>{hero.sidekicks.map(sk => `${sk.name}${sk.count > 1 ? ` x${sk.count}` : ''}`).join(', ')}</p>
              </div>
            )}
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">{hero.set}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
