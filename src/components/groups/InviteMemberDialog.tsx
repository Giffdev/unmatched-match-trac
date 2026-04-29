import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass } from '@phosphor-icons/react'
import { searchUserByEmail, searchUserByPlayerName } from '@/lib/user-discovery'
import { sendInvite } from '@/lib/group-invites'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import type { DiscoveredUser } from '@/lib/user-discovery'

type InviteMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groupName: string
  existingMemberUids: string[]
  allowMemberInvites: boolean
  isOwner: boolean
}

export function InviteMemberDialog({
  open,
  onOpenChange,
  groupId,
  groupName,
  existingMemberUids,
  allowMemberInvites,
  isOwner,
}: InviteMemberDialogProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState<DiscoveredUser[]>([])
  const [searching, setSearching] = useState(false)
  const [invitingUid, setInvitingUid] = useState<string | null>(null)

  const canInvite = isOwner || allowMemberInvites

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setResults([])
    try {
      const query = searchQuery.trim()
      // Try email first, then player name search
      if (query.includes('@')) {
        const emailResult = await searchUserByEmail(query)
        setResults(emailResult ? [emailResult] : [])
      } else {
        const nameResults = await searchUserByPlayerName(query)
        setResults(nameResults)
      }
    } catch {
      toast.error('Search failed')
    } finally {
      setSearching(false)
    }
  }

  const handleInvite = async (targetUser: DiscoveredUser) => {
    if (!user?.uid) return

    setInvitingUid(targetUser.uid)
    try {
      const inviterName = user.displayName || user.email || 'Someone'
      await sendInvite(groupId, groupName, targetUser.uid, user.uid, inviterName)
      toast.success(`Invite sent to ${targetUser.displayName || targetUser.email}`)
      setResults(prev => prev.filter(u => u.uid !== targetUser.uid))
    } catch (err) {
      toast.error('Failed to send invite')
      console.error(err)
    } finally {
      setInvitingUid(null)
    }
  }

  if (!canInvite) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            <Input
              placeholder="Search by email or player name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="flex-shrink-0"
            >
              <MagnifyingGlass size={18} />
            </Button>
          </div>

          {searching && (
            <p className="text-sm text-muted-foreground text-center py-2">Searching...</p>
          )}

          {!searching && results.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-2">No users found</p>
          )}

          {results.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((discoveredUser) => {
                const isAlreadyMember = existingMemberUids.includes(discoveredUser.uid)
                return (
                  <div
                    key={discoveredUser.uid}
                    className="flex items-center justify-between p-3 rounded-md border border-border"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {discoveredUser.displayName || discoveredUser.email}
                      </p>
                      {discoveredUser.playerName && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{discoveredUser.playerName}
                        </p>
                      )}
                    </div>
                    {isAlreadyMember ? (
                      <Badge variant="secondary" className="flex-shrink-0">Member</Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleInvite(discoveredUser)}
                        disabled={invitingUid === discoveredUser.uid}
                        className="flex-shrink-0"
                      >
                        {invitingUid === discoveredUser.uid ? 'Sending...' : 'Invite'}
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
