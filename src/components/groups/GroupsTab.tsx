import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Plus, WarningCircle } from '@phosphor-icons/react'
import { useGroups, usePendingInvites } from '@/hooks/use-groups'
import { useAuth } from '@/hooks/use-auth'
import { GroupView } from './GroupView'
import { CreateGroupDialog } from './CreateGroupDialog'
import { PendingInvites } from './PendingInvites'
import type { UserGroupMembership } from '@/lib/group-types'

export function GroupsTab() {
  const { user } = useAuth()
  const userId = user?.uid ?? null
  const { groups, loading, error, refetch } = useGroups(userId)
  const { invites, count: inviteCount, refetch: refetchInvites } = usePendingInvites(userId)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  if (selectedGroupId) {
    return (
      <GroupView
        groupId={selectedGroupId}
        onBack={() => {
          setSelectedGroupId(null)
          refetch()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Groups</h2>
        <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5">
          <Plus size={16} weight="bold" />
          Create Group
        </Button>
      </div>

      {inviteCount > 0 && (
        <PendingInvites
          invites={invites}
          onRespond={() => {
            refetchInvites()
            refetch()
          }}
        />
      )}

      {error ? (
        <Card className="p-8 text-center">
          <WarningCircle size={48} className="mx-auto text-destructive mb-3" />
          <p className="text-destructive font-medium mb-2">Failed to load groups</p>
          <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
          <Button variant="outline" size="sm" onClick={refetch}>
            Try Again
          </Button>
        </Card>
      ) : loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <Card className="p-8 text-center">
          <Users size={48} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            No groups yet — create one to start sharing games with friends!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {groups.map((group) => (
            <GroupCard
              key={group.groupId}
              group={group}
              onClick={() => setSelectedGroupId(group.groupId)}
            />
          ))}
        </div>
      )}

      <CreateGroupDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false)
          refetch()
        }}
      />
    </div>
  )
}

function GroupCard({ group, onClick }: { group: UserGroupMembership; onClick: () => void }) {
  const roleBadgeVariant = group.role === 'owner' ? 'default' : 'secondary'

  return (
    <Card
      className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
            <Users size={20} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{group.groupName}</p>
          </div>
        </div>
        <Badge variant={roleBadgeVariant} className="flex-shrink-0 capitalize">
          {group.role}
        </Badge>
      </div>
    </Card>
  )
}
