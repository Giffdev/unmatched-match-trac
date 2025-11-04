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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SignIn, SignOut, User } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

type UserInfo = {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
}

export function UserProfile() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useKV<number | null>('current-user-id', null)

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await window.spark.user()
        setUser(userData)
        if (userData && !currentUserId) {
          setCurrentUserId(userData.id)
        }
      } catch (error) {
        console.error('Failed to load user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()
  }, [])

  const handleSignIn = async () => {
    try {
      const userData = await window.spark.user()
      setUser(userData)
      if (userData) {
        setCurrentUserId(userData.id)
      }
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignOut = () => {
    setCurrentUserId(null)
    window.location.reload()
  }

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user || !currentUserId) {
    return (
      <Button onClick={handleSignIn} variant="outline" size="sm">
        <SignIn className="mr-2" />
        Sign In
      </Button>
    )
  }

  const initials = user.login
    .split('-')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.login} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium leading-none">{user.login}</p>
            {user.email && (
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <SignOut className="mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
