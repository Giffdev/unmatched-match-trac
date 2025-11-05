import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { SignOut, User as UserIcon, Package } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'

type UserProfileProps = {
  onCollectionClick?: () => void
}

export function UserProfile({ onCollectionClick }: UserProfileProps) {
  const [currentUserId] = useKV<string | null>('current-user-id', null)
  const [users] = useKV<User[]>('users', [])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  useEffect(() => {
    if (currentUserId && users) {
      const user = users.find(u => u.id === currentUserId)
      setCurrentUser(user || null)
    } else {
      setCurrentUser(null)
    }
  }, [currentUserId, users])

  const handleSignOut = async () => {
    const confirmed = confirm('Are you sure you want to sign out?')
    if (!confirmed) return
    
    await window.spark.kv.set('current-user-id', null)
    window.location.reload()
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
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {onCollectionClick && (
          <>
            <DropdownMenuItem onClick={onCollectionClick}>
              <Package className="mr-2" />
              Manage Collection
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleSignOut}>
          <SignOut className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
