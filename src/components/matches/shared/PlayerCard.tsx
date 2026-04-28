import { Button } from '@/components/ui/button'
import { Trash } from '@phosphor-icons/react'
import { PlayerNameInput } from '../PlayerNameInput'
import { HeroSelector } from './HeroSelector'
import type { PlayerAssignment, Match } from '@/lib/types'

export type PlayerCardProps = {
  player: PlayerAssignment
  index: number
  isCooperative: boolean
  canRemove: boolean
  existingMatches: Match[]
  onPlayerNameChange: (value: string) => void
  onHeroChange: (heroId: string) => void
  onVariantChange: (variant: string) => void
  onRemove: () => void
}

export function PlayerCard({
  player,
  index,
  isCooperative,
  canRemove,
  existingMatches,
  onPlayerNameChange,
  onHeroChange,
  onVariantChange,
  onRemove,
}: PlayerCardProps) {
  return (
    <div className="flex gap-3 items-start p-4 rounded-lg border bg-card min-w-0">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
        {index + 1}
      </div>
      <div className="flex-1 space-y-3 min-w-0">
        <PlayerNameInput
          value={player.playerName}
          onChange={onPlayerNameChange}
          matches={existingMatches}
        />
        <HeroSelector
          value={player.heroId}
          onChange={onHeroChange}
          variant={player.heroVariant}
          onVariantChange={onVariantChange}
        />
      </div>
      {isCooperative && canRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="mt-1 shrink-0"
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
