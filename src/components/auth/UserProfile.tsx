import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SignOut, UserCircle, Upload, Gear } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'
import { toast } from 'sonner'
import { CSVImport } from './CSVImport'
import { useAuth } from '@/hooks/use-auth'
import { signOutUser } from '@/lib/auth'
import { updateUserProfile } from '@/lib/firestore'

type UserProfileProps = {
  onImportMatches?: (matches: Match[]) => void
}

export function UserProfile({ onImportMatches }: UserProfileProps) {
  const { user, loading, refreshProfile } = useAuth()
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [playerNameInput, setPlayerNameInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOutUser()
    } catch {
      toast.error('Failed to sign out')
    }
  }

  const handleOpenPlayerNameDialog = () => {
    setPlayerNameInput(user?.playerName || '')
    setShowPlayerNameDialog(true)
  }

  const handleSavePlayerName = async () => {
    if (!user) return

    const trimmedName = playerNameInput.trim()
    if (!trimmedName) {
      toast.error('Player name cannot be empty')
      return
    }

    setSaving(true)
    try {
      await updateUserProfile(user.uid, { playerName: trimmedName })
      if (refreshProfile) {
        await refreshProfile()
      }
      setShowPlayerNameDialog(false)
      toast.success('Player name updated!')
    } catch {
      toast.error('Failed to update player name')
    } finally {
      setSaving(false)
    }
  }

  const handleImportComplete = (matches: Match[]) => {
    setShowImportDialog(false)
    if (onImportMatches) {
      onImportMatches(matches)
    }
  }

  if (loading || !user) {
    return null
  }

  const displayName = user.displayName || user.name || user.email || 'User'
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const providerLabel =
    user.authProvider === 'google' ? 'Google' :
    user.authProvider === 'email' ? 'Email' :
    undefined

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 md:h-10 md:w-10 rounded-full p-0">
            <Avatar className="h-8 w-8 md:h-10 md:w-10">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs md:text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              {user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
              )}
              {user.playerName && (
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  Player: {user.playerName}
                </p>
              )}
              {providerLabel && (
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  <Gear className="inline mr-1" size={12} />
                  Signed in via {providerLabel}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenPlayerNameDialog}>
            <UserCircle className="mr-2" size={16} />
            Set Player Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2" size={16} />
            Import from CSV
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <SignOut className="mr-2" size={16} />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPlayerNameDialog} onOpenChange={setShowPlayerNameDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Player Name</DialogTitle>
            <DialogDescription>
              Enter the player name you use when logging matches. This helps track your personal statistics accurately.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="player-name">Player Name</Label>
              <Input
                id="player-name"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="e.g., Mike, Sarah, Alex"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSavePlayerName()
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlayerNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlayerName} disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Matches from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file containing your match history from external tracking systems.
            </DialogDescription>
          </DialogHeader>
          <CSVImport
            currentUserId={user.uid}
            onImportComplete={handleImportComplete}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
