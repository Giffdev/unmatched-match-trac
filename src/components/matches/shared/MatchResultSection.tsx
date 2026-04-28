import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { HEROES } from '@/lib/data'
import type { PlayerAssignment } from '@/lib/types'

export type MatchResultSectionProps = {
  isCooperative: boolean
  players: PlayerAssignment[]
  winnerId: string | undefined
  setWinnerId: (id: string | undefined) => void
  isDraw: boolean
  setIsDraw: (draw: boolean) => void
  cooperativeResult: 'win' | 'loss' | undefined
  setCooperativeResult: (result: 'win' | 'loss') => void
}

export function MatchResultSection({
  isCooperative,
  players,
  winnerId,
  setWinnerId,
  isDraw,
  setIsDraw,
  cooperativeResult,
  setCooperativeResult,
}: MatchResultSectionProps) {
  if (isCooperative) {
    return (
      <div className="space-y-3">
        <Label>Result</Label>
        <RadioGroup value={cooperativeResult} onValueChange={(v) => setCooperativeResult(v as 'win' | 'loss')}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="win" id="coop-win" />
              <Label htmlFor="coop-win" className="cursor-pointer font-normal">
                Win
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="loss" id="coop-loss" />
              <Label htmlFor="coop-loss" className="cursor-pointer font-normal">
                Loss
              </Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label>Result</Label>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="draw-checkbox"
            checked={isDraw}
            onChange={(e) => {
              setIsDraw(e.target.checked)
              if (e.target.checked) setWinnerId(undefined)
            }}
            className="w-4 h-4 rounded border-input"
          />
          <Label htmlFor="draw-checkbox" className="cursor-pointer font-normal">
            Draw
          </Label>
        </div>
      </div>
      
      {!isDraw && (
        <RadioGroup value={winnerId} onValueChange={setWinnerId}>
          <div className="space-y-2">
            {players.map((player, index) => {
              const hero = HEROES.find(h => h.id === player.heroId)
              const displayName = hero?.id === 'yennefer-triss' 
                ? `${hero.name} (${player.heroVariant === 'triss' ? 'Triss as Hero' : 'Yennefer as Hero'})`
                : hero?.name || 'No hero selected'
              
              return (
                <div key={index} className="flex items-center gap-2">
                  <RadioGroupItem value={player.heroId} id={`winner-${index}`} />
                  <Label htmlFor={`winner-${index}`} className="cursor-pointer font-normal">
                    {player.playerName || `Player ${index + 1}`} - {displayName}
                  </Label>
                </div>
              )
            })}
          </div>
        </RadioGroup>
      )}
    </div>
  )
}
