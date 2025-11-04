import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignIn, Eye, EyeClosed } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'
import { toast } from 'sonner'
import { GlobalStats } from './GlobalStats'

const ALLOWED_EMAIL = 'giffdev@gmail.com'

type SignInPromptProps = {
  onUserChange: (userId: string) => void
}

export function SignInPrompt({ onUserChange }: SignInPromptProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [users] = useKV<User[]>('users', [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (email.toLowerCase() !== ALLOWED_EMAIL) {
      toast.error('Access restricted to authorized accounts only')
      return
    }

    const currentUsers = await window.spark.kv.get<User[]>('users') || []
    const user = currentUsers.find(u => u.email === ALLOWED_EMAIL)
    
    if (!user) {
      toast.error('Account not found')
      return
    }

    const storedPassword = await window.spark.kv.get<string>(`password-${user.id}`)
    if (storedPassword !== password) {
      toast.error('Invalid password')
      return
    }

    onUserChange(user.id)
    toast.success(`Welcome back, ${user.name}!`)
  }

  return (
    <div className="space-y-8">
      <GlobalStats />
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Unmatched Tracker</CardTitle>
          <CardDescription>
            Sign in to access your match history, statistics, and collection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input
                  id="signin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosed className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full">
              <SignIn className="mr-2" />
              Sign In
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
