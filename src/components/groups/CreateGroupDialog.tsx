import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { createGroup } from '@/lib/groups'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

type CreateGroupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateGroupDialog({ open, onOpenChange, onCreated }: CreateGroupDialogProps) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [allowMemberInvites, setAllowMemberInvites] = useState(false)
  const [autoAddToPersonal, setAutoAddToPersonal] = useState(true)
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!user?.uid || !name.trim()) return

    setCreating(true)
    try {
      await createGroup(user.uid, name.trim(), description.trim() || undefined)
      toast.success(`Group "${name.trim()}" created!`)
      setName('')
      setDescription('')
      setAllowMemberInvites(false)
      setAutoAddToPersonal(true)
      onCreated()
    } catch (err) {
      toast.error('Failed to create group')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name *</Label>
            <Input
              id="group-name"
              placeholder="e.g. Friday Night Fights"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="group-desc">Description</Label>
            <Input
              id="group-desc"
              placeholder="What's this group for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="allow-invites" className="text-sm font-normal cursor-pointer">
                Allow members to invite others
              </Label>
              <Switch
                id="allow-invites"
                checked={allowMemberInvites}
                onCheckedChange={setAllowMemberInvites}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-personal" className="text-sm font-normal cursor-pointer">
                Auto-add matches to personal log
              </Label>
              <Switch
                id="auto-personal"
                checked={autoAddToPersonal}
                onCheckedChange={setAutoAddToPersonal}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || creating}>
            {creating ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
