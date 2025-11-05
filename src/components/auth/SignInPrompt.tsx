import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignIn, Eye, EyeClosed, UserPlus, ChartBar, MagnifyingGlass, GridFour } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import type { User } from '@/lib/types'
import { toast } from 'sonner'
import { GlobalStats } from './GlobalStats'
import { PublicHeroBrowser } from './PublicHeroBrowser'
import { PublicHeatmap } from './PublicHeatmap'

type SignInPromptProps = {
  onUserChange: (userId: string) => void
}

export function SignInPrompt({ onUserChange }: SignInPromptProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [users] = useKV<User[]>('users', [])
  const [currentTab, setCurrentTab] = useState('stats')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    const currentUsers = await window.spark.kv.get<User[]>('users') || []
    const user = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const currentUsers = await window.spark.kv.get<User[]>('users') || []
    const existingUser = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      toast.error('An account with this email already exists')
      return
    }

    const emailUsername = email.split('@')[0]
    const displayName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1)

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: displayName,
      email: email.toLowerCase(),
      createdAt: new Date().toISOString()
    }

    await window.spark.kv.set('users', [...currentUsers, newUser])
    await window.spark.kv.set(`password-${newUser.id}`, password)

    onUserChange(newUser.id)
    toast.success(`Welcome to Unmatched Tracker, ${newUser.name}!`)
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  const handleHeroClick = (heroId: string) => {
    setSelectedHeroId(heroId)
    setCurrentTab('heroes')
  }

  return (
    <div className="space-y-8">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Sign in to access your match history, statistics, and collection.'
              : 'Create a new account to start tracking your Unmatched games.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <div className="relative">
                <Input
                  id="auth-password"
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
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="text-muted-foreground" />
                    ) : (
                      <Eye className="text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              {mode === 'signin' ? (
                <>
                  <SignIn className="mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={toggleMode}
              className="text-sm text-muted-foreground"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="stats">
            <ChartBar className="mr-2" size={18} />
            Community Stats
          </TabsTrigger>
          <TabsTrigger value="heroes">
            <MagnifyingGlass className="mr-2" size={18} />
            Hero Browser
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <GridFour className="mr-2" size={18} />
            Matchup Heatmap
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <GlobalStats />
        </TabsContent>
        
        <TabsContent value="heroes">
          <PublicHeroBrowser selectedHeroId={selectedHeroId} />
        </TabsContent>
        
        <TabsContent value="heatmap">
          <PublicHeatmap onHeroClick={handleHeroClick} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
