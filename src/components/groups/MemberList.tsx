import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useGroupMembers } from '@/hooks/use-group-members'
import { removeMemberFromGroup, leaveGroup } from '@/lib/groups'
import { toast } from 'sonner'
import type { GroupMember } from '@/lib/group-types'

type MemberListProps = {
  groupId: string
  currentUserId: string | null
  isOwner: boolean
  onMemberRemoved: () => void
}

export function MemberList({ groupId, currentUserId, isOwner, onMemberRemoved }: MemberListProps) {
  const { members, loading, refetch } = useGroupMembers(groupId)
  const [removingUid, setRemovingUid] = useState<string | null>(null)

  const handleRemove = async (member: GroupMember) => {
    if (!confirm(`Remove ${member.displayName || member.uid} from this group?`)) return

    setRemovingUid(member.uid)
    try {
      await removeMemberFromGroup(groupId, member.uid)
      toast.success('Member removed')
      refetch()
      onMemberRemoved()
    } catch (err) {
      toast.error('Failed to remove member')
      console.error(err)
    } finally {
      setRemovingUid(null)
    }
  }

  const handleLeave = async () => {
    if (!currentUserId) return
    if (!confirm('Are you sure you want to leave this group?')) return

    try {
      await leaveGroup(groupId, currentUserId)
      toast.success('Left group')
      onMemberRemoved()
    } catch (err) {
      toast.error('Failed to leave group')
      console.error(err)
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-4">Loading members...</p>
  }

  const roleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'default' as const
      case 'admin': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.uid}
            className="flex items-center justify-between p-3 rounded-md border border-border"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.displayName || member.playerName || 'Unknown'}
                </p>
                {member.playerName && member.displayName && (
                  <p className="text-xs text-muted-foreground">@{member.playerName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant={roleBadgeVariant(member.role)} className="capitalize">
                {member.role}
              </Badge>
              {isOwner && member.uid !== currentUserId && member.role !== 'owner' && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive h-7 px-2"
                  onClick={() => handleRemove(member)}
                  disabled={removingUid === member.uid}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isOwner && currentUserId && (
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={handleLeave}
        >
          Leave Group
        </Button>
      )}
    </div>
  )
}
