import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignIn, UserPlus, Eye, EyeClosed } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'
import { toast } from 'sonner'
import { GlobalStats } from './GlobalStats'

type SignInPromptProps = {
  onUserChange: (userId: string) => void
}

export function SignInPrompt({ onUserChange }: SignInPromptProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [users, setUsers] = useKV<User[]>('users', [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const currentUsers = await window.spark.kv.get<User[]>('users') || []
    const user = currentUsers.find(u => u.email === email.toLowerCase())
    if (!user) {
      toast.error('User not found. Please create an account.')
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const currentUsers = await window.spark.kv.get<User[]>('users') || []
    if (currentUsers.some(u => u.email === email.toLowerCase())) {
      toast.error('An account with this email already exists')
      return
    }

    const emailName = email.split('@')[0]
    const displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1)

    const newUser: User = {
      id: crypto.randomUUID(),
      email: email.toLowerCase(),
      name: displayName,
      createdAt: new Date().toISOString()
    }

    setUsers(current => [...(current || []), newUser])
    await window.spark.kv.set(`password-${newUser.id}`, password)
    
    onUserChange(newUser.id)
    toast.success(`Welcome, ${newUser.name}!`)
  }

  return (
    <div className="space-y-8">
      <GlobalStats />
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Welcome to Unmatched Tracker</CardTitle>
          <CardDescription>
            Sign in to start tracking your matches, analyzing statistics, and discovering perfect matchups.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
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
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
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
                  <UserPlus className="mr-2" />
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
