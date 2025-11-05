import { useState } from 'react'
import { Sword } from '@phosphor-icons/react'
import type { Hero } from '@/lib/types'
import { cn } from '@/lib/utils'

type HeroImageProps = {
  hero: Hero
  className?: string
  showDetails?: boolean
}

export function HeroImage({ hero, className, showDetails = true }: HeroImageProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const shouldShowFallback = !hero.imageUrl || imageError

  return (
    <div className={cn("relative", className)}>
      {hero.imageUrl && !imageError && (
        <img 
          src={hero.imageUrl} 
          alt={hero.name}
          className={cn(
            "w-full h-full object-cover rounded-lg border-2 border-border shadow-lg transition-opacity duration-300",
            imageLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true)
            setImageLoaded(false)
          }}
          loading="lazy"
        />
      )}
      
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 rounded-lg border-2 border-border flex flex-col items-center justify-center p-4 text-center transition-opacity duration-300",
          shouldShowFallback ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <Sword className="w-16 h-16 text-primary mb-4 opacity-40" />
        {showDetails && (
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
