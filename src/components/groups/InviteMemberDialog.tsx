import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MagnifyingGlass, Check, Copy } from '@phosphor-icons/react'
import { searchUserByEmail, searchUserByPlayerName } from '@/lib/user-discovery'
import { sendInvite, sendEmailInvite, getGroupInvites } from '@/lib/group-invites'
import { getOrCreateInviteCode } from '@/lib/groups'
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
  const [invitingEmail, setInvitingEmail] = useState(false)
  const [searchDone, setSearchDone] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)

  const canInvite = isOwner || allowMemberInvites

  // Generate invite link when dialog opens
  useEffect(() => {
    if (open && canInvite) {
      setLinkLoading(true)
      getOrCreateInviteCode(groupId)
        .then((code) => {
          const baseUrl = window.location.origin + window.location.pathname
          setInviteLink(`${baseUrl}?join=${code}`)
        })
        .catch(() => {
          setInviteLink(null)
        })
        .finally(() => setLinkLoading(false))
    }
    if (!open) {
      setLinkCopied(false)
    }
  }, [open, groupId, canInvite])

  const handleCopyLink = async () => {
    if (!inviteLink) return
    try {
      await navigator.clipboard.writeText(inviteLink)
      setLinkCopied(true)
      toast.success('Invite link copied!')
      setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setSearching(true)
    setResults([])
    setSearchDone(false)
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
      setSearchDone(true)
    }
  }

  const handleInvite = async (targetUser: DiscoveredUser) => {
    if (!user?.uid) return

    setInvitingUid(targetUser.uid)
    try {
      // Check for existing pending invite
      const existingInvites = await getGroupInvites(groupId)
      const hasPending = existingInvites.some(
        i => i.invitedUid === targetUser.uid && i.status === 'pending'
      )
      if (hasPending) {
        toast.error(`An invite is already pending for ${targetUser.displayName || targetUser.email}`)
        return
      }

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

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleEmailInvite = async () => {
    if (!user?.uid) return
    const email = searchQuery.trim()
    if (!isValidEmail(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setInvitingEmail(true)
    try {
      // Check for existing pending invite for this email in the group
      const existingInvites = await getGroupInvites(groupId)
      const hasPending = existingInvites.some(
        i => i.invitedEmail === email.toLowerCase() && i.status === 'pending'
      )
      if (hasPending) {
        toast.error(`An invite is already pending for ${email}`)
        return
      }

      const inviterName = user.displayName || user.email || 'Someone'
      await sendEmailInvite(groupId, groupName, email, user.uid, inviterName)
      toast.success(`Invite sent to ${email}`)
      setSearchQuery('')
      setSearchDone(false)
    } catch (err) {
      toast.error('Failed to send invite')
      console.error(err)
    } finally {
      setInvitingEmail(false)
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
          {/* Invite Link Section */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Share invite link</p>
            <div className="flex gap-2">
              <Input
                readOnly
                value={linkLoading ? 'Generating...' : (inviteLink || 'Error generating link')}
                className="text-xs font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                disabled={linkLoading || !inviteLink}
                className="flex-shrink-0"
              >
                {linkCopied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join the group when logged in.
            </p>
          </div>

          <div className="border-t border-border" />

          {/* Search Section */}
          <p className="text-sm font-medium">Or search for a user</p>
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

          {!searching && results.length === 0 && searchDone && searchQuery && (
            <div className="text-center py-2 space-y-2">
              <p className="text-sm text-muted-foreground">No users found</p>
              {searchQuery.includes('@') && isValidEmail(searchQuery.trim()) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailInvite}
                  disabled={invitingEmail}
                >
                  {invitingEmail ? 'Sending...' : `Invite ${searchQuery.trim()} by email`}
                </Button>
              )}
            </div>
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
