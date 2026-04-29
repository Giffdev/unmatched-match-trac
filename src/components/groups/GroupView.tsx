import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, GearSix, Plus } from '@phosphor-icons/react'
import { useGroup } from '@/hooks/use-groups'
import { useAuth } from '@/hooks/use-auth'
import { GroupMatchList } from './GroupMatchList'
import { MemberList } from './MemberList'
import { InviteMemberDialog } from './InviteMemberDialog'

type GroupViewProps = {
  groupId: string
  onBack: () => void
}

type SubTab = 'matches' | 'members' | 'stats'

export function GroupView({ groupId, onBack }: GroupViewProps) {
  const { user } = useAuth()
  const userId = user?.uid ?? null
  const { group, loading } = useGroup(groupId)
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('matches')
  const [inviteOpen, setInviteOpen] = useState(false)

  const isOwner = group?.createdBy === userId

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading group...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Group not found</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-9 w-9">
          <ArrowLeft size={20} />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-foreground truncate">{group.name}</h2>
          <p className="text-sm text-muted-foreground">
            {group.memberCount} {group.memberCount === 1 ? 'member' : 'members'}
          </p>
        </div>
        {isOwner && (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <GearSix size={20} />
          </Button>
        )}
      </div>

      {group.description && (
        <p className="text-sm text-muted-foreground px-1">{group.description}</p>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-border">
        {(['matches', 'members', 'stats'] as SubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 ${
              activeSubTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {activeSubTab === 'matches' && (
        <GroupMatchList groupId={groupId} />
      )}

      {activeSubTab === 'members' && (
        <div className="space-y-4">
          {isOwner && (
            <Button
              onClick={() => setInviteOpen(true)}
              size="sm"
              variant="outline"
              className="gap-1.5"
            >
              <Plus size={16} />
              Invite Member
            </Button>
          )}
          <MemberList groupId={groupId} currentUserId={userId} isOwner={isOwner} onMemberRemoved={() => {}} />
        </div>
      )}

      {activeSubTab === 'stats' && (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Group stats coming soon</p>
        </div>
      )}

      <InviteMemberDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        groupId={groupId}
        groupName={group.name}
        existingMemberUids={group.memberUids}
        allowMemberInvites={group.settings.allowMemberInvites}
        isOwner={isOwner}
      />
    </div>
  )
}
