import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteGroup } from '@/lib/groups'
import { toast } from 'sonner'

type GroupSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  onDeleted: () => void
}

export function GroupSettingsDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  onDeleted,
}: GroupSettingsDialogProps) {
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const canDelete = confirmName === groupName

  const handleDelete = async () => {
    if (!canDelete) return
    setDeleting(true)
    try {
      await deleteGroup(groupId)
      toast.success('Group deleted')
      onOpenChange(false)
      onDeleted()
    } catch (err) {
      console.error('Failed to delete group:', err)
      toast.error('Failed to delete group')
    } finally {
      setDeleting(false)
    }
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setShowDeleteConfirm(false)
      setConfirmName('')
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Group Settings</DialogTitle>
          <DialogDescription>Manage settings for {groupName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Group Info */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Group Name</label>
            <p className="text-foreground mt-1">{groupName}</p>
          </div>

          {/* Danger Zone */}
          <div className="border border-destructive/30 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>

            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Group
              </Button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  This will delete the group and all its matches. <strong>Your personal matches will NOT be affected.</strong>
                </p>
                <p className="text-sm text-muted-foreground">
                  Type <strong>{groupName}</strong> to confirm:
                </p>
                <Input
                  value={confirmName}
                  onChange={(e) => setConfirmName(e.target.value)}
                  placeholder="Type group name to confirm"
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={!canDelete || deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setConfirmName('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
