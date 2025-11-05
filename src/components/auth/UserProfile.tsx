import { useEffect, useState } from 'react'
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
import { SignOut, User as UserIconPhosphor } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'
import { toast } from 'sonner'

export function UserProfile() {
  const [currentUserId] = useKV<string | null>('current-user-id', null)
  const [users, setUsers] = useKV<User[]>('users', [])
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [showPlayerNameDialog, setShowPlayerNameDialog] = useState(false)
  const [playerNameInput, setPlayerNameInput] = useState('')

  useEffect(() => {
    if (currentUserId && users) {
      const user = users.find(u => u.id === currentUserId)
      setCurrentUser(user || null)
      setPlayerNameInput(user?.playerName || '')
    } else {
      setCurrentUser(null)
    }
  }, [currentUserId, users])

  const handleSignOut = async () => {
    await window.spark.kv.set('current-user-id', null)
    window.location.reload()
  }

  const handleSavePlayerName = async () => {
    if (!currentUser || !currentUserId || !users) return
    
    const trimmedName = playerNameInput.trim()
    if (!trimmedName) {
      toast.error('Player name cannot be empty')
      return
    }

    const updatedUser = { ...currentUser, playerName: trimmedName }
    const updatedUsers = users.map(u => u.id === currentUserId ? updatedUser : u)
    
    await setUsers(updatedUsers)
    setCurrentUser(updatedUser)
    setShowPlayerNameDialog(false)
    toast.success('Player name updated!')
  }

  if (!currentUser) {
    return null
  }

  const initials = currentUser.name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{currentUser.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {currentUser.email}
              </p>
              {currentUser.playerName && (
                <p className="text-xs leading-none text-muted-foreground mt-1">
                  Player: {currentUser.playerName}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowPlayerNameDialog(true)}>
            <UserIconPhosphor className="mr-2" />
            Set Player Name
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignOut}>
            <SignOut className="mr-2" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showPlayerNameDialog} onOpenChange={setShowPlayerNameDialog}>
        <DialogContent>
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
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlayerNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSavePlayerName}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
