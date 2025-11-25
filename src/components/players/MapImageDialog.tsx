import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Map } from '@/lib/types'

interface MapImageDialogProps {
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
        <div className="mt-4">
          {map.imageUrl ? (
            <img 
              src={map.imageUrl} 
              alt={map.name}
              className="w-full h-auto rounded-lg"
            />
          ) : (
            <p className="text-muted-foreground text-center py-8">No image available</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}




























