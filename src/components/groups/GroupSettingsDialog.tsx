import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { deleteGroup, updateGroupInfo } from '@/lib/groups'
import { toast } from 'sonner'
import type { GroupSettings } from '@/lib/group-types'

type GroupSettingsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  groupDescription?: string
  settings: GroupSettings
  onDeleted: () => void
  onUpdated?: () => void
}

export function GroupSettingsDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  groupDescription,
  settings,
  onDeleted,
  onUpdated,
}: GroupSettingsDialogProps) {
  const [name, setName] = useState(groupName)
  const [description, setDescription] = useState(groupDescription || '')
  const [allowMemberInvites, setAllowMemberInvites] = useState(settings.allowMemberInvites)
  const [autoAddToPersonal, setAutoAddToPersonal] = useState(settings.autoAddToPersonal)
  const [saving, setSaving] = useState(false)
  const [confirmName, setConfirmName] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Sync form state when props change (e.g. dialog re-opened after update)
  useEffect(() => {
    setName(groupName)
    setDescription(groupDescription || '')
    setAllowMemberInvites(settings.allowMemberInvites)
    setAutoAddToPersonal(settings.autoAddToPersonal)
  }, [groupName, groupDescription, settings])

  const hasChanges =
    name !== groupName ||
    description !== (groupDescription || '') ||
    allowMemberInvites !== settings.allowMemberInvites ||
    autoAddToPersonal !== settings.autoAddToPersonal

  const canSave = hasChanges && name.trim().length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    try {
      await updateGroupInfo(groupId, {
        name: name.trim(),
        description: description.trim() || undefined,
        settings: { allowMemberInvites, autoAddToPersonal },
      })
      toast.success('Group settings saved')
      onUpdated?.()
    } catch (err) {
      console.error('Failed to save group settings:', err)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

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
          {/* Editable fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="group-description">Description</Label>
              <Input
                id="group-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="allow-member-invites" className="text-sm">
                Allow members to invite others
              </Label>
              <Switch
                id="allow-member-invites"
                checked={allowMemberInvites}
                onCheckedChange={setAllowMemberInvites}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-add-personal" className="text-sm">
                Auto-add group matches to personal log
              </Label>
              <Switch
                id="auto-add-personal"
                checked={autoAddToPersonal}
                onCheckedChange={setAutoAddToPersonal}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
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
