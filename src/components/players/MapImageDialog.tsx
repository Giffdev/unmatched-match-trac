import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Map } from '@/lib/types'

  onOpenChange: (open: boole

  if (!map) ret
  onOpenChange: (open: boolean) => void
}

export function MapImageDialog({ map, open, onOpenChange }: MapImageDialogProps) {
  if (!map) return null

        <d
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{map.name}</DialogTitle>
        </DialogHeader>
              <p className="text-mu
          {map.imageUrl ? (
          <div cl
              src={map.imageUrl} 
              alt={map.name}
              className="w-full h-auto rounded-lg"
              
            )}
        </div>
    </Dialog>
}




























