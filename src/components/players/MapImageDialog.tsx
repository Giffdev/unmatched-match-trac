import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Map } from '@/lib/types'

type MapImageDialogProps = {
  map: Map | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MapImageDialog({ map, open, onOpenChange }: MapImageDialogProps) {
  if (!map) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{map.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {map.imageUrl ? (
            <img 
              src={map.imageUrl} 
              alt={map.name}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg">
              <p className="text-muted-foreground">No image available for this map</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <span className="text-muted-foreground">Set:</span>
              <p className="font-medium">{map.set}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Players:</span>
              <p className="font-medium">{map.minPlayers === map.maxPlayers ? map.minPlayers : `${map.minPlayers}-${map.maxPlayers}`}</p>
            </div>
            {map.zones && (
              <div>
                <span className="text-muted-foreground">Zones:</span>
                <p className="font-medium">{map.zones}</p>
              </div>
            )}
            {map.spaces && (
              <div>
                <span className="text-muted-foreground">Spaces:</span>
                <p className="font-medium">{map.spaces}</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
