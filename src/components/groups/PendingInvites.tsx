import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { acceptInvite, declineInvite } from '@/lib/group-invites'
import { toast } from 'sonner'
import type { GroupInvite } from '@/lib/group-types'

type PendingInvitesProps = {
  invites: GroupInvite[]
  onRespond: () => void
}

export function PendingInvites({ invites, onRespond }: PendingInvitesProps) {
  const [respondingId, setRespondingId] = useState<string | null>(null)

  const handleAccept = async (invite: GroupInvite) => {
    setRespondingId(invite.id)
    try {
      await acceptInvite(invite.id, invite.groupId, invite.invitedUid)
      toast.success(`Joined "${invite.groupName}"!`)
      onRespond()
    } catch (err) {
      toast.error('Failed to accept invite')
      console.error(err)
    } finally {
      setRespondingId(null)
    }
  }

  const handleDecline = async (invite: GroupInvite) => {
    setRespondingId(invite.id)
    try {
      await declineInvite(invite.id, invite.groupId)
      toast.success('Invite declined')
      onRespond()
    } catch (err) {
      toast.error('Failed to decline invite')
      console.error(err)
    } finally {
      setRespondingId(null)
    }
  }

  if (invites.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Pending Invites ({invites.length})
      </h3>
      {invites.map((invite) => (
        <Card key={invite.id} className="p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{invite.groupName}</p>
              <p className="text-xs text-muted-foreground truncate">
                Invited by {invite.invitedByName}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(invite)}
                disabled={respondingId === invite.id}
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invite)}
                disabled={respondingId === invite.id}
              >
                Accept
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
