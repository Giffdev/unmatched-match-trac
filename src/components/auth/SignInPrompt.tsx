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

      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-sm">
            {mode === 'signin' 
              ? 'Sign in to access your match history, statistics, and collection.'
              : 'Create a new account to start tracking your Unmatched games.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-sm">Email</Label>
              <Input
                id="auth-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm md:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 text-sm md:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeClosed className="text-muted-foreground" size={18} />
                  ) : (
                    <Eye className="text-muted-foreground" size={18} />
                  )}
                </Button>
              </div>
            </div>
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="pr-10 text-sm md:text-base"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="text-muted-foreground" size={18} />
                    ) : (
                      <Eye className="text-muted-foreground" size={18} />
                    )}
                  </Button>
                </div>
              </div>
            )}
            <Button type="submit" className="w-full" size="lg">
              {mode === 'signin' ? (
                <>
                  <SignIn className="mr-2" size={18} />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="mr-2" size={18} />
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
              className="text-xs md:text-sm text-muted-foreground"
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
        <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6">
          <TabsTrigger value="stats" className="text-xs md:text-sm flex-col md:flex-row gap-1 md:gap-2 py-2">
            <ChartBar size={16} className="md:hidden" />
            <ChartBar size={18} className="hidden md:block" />
            <span className="hidden sm:inline">Community Stats</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="heroes" className="text-xs md:text-sm flex-col md:flex-row gap-1 md:gap-2 py-2">
            <MagnifyingGlass size={16} className="md:hidden" />
            <MagnifyingGlass size={18} className="hidden md:block" />
            <span className="hidden sm:inline">Hero Browser</span>
            <span className="sm:hidden">Heroes</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs md:text-sm flex-col md:flex-row gap-1 md:gap-2 py-2">
            <GridFour size={16} className="md:hidden" />
          <TabsTrigger value="heatmap" className="text-xs md:text-sm flex-col md:flex-row gap-1 md:gap-2 py-2">
            <GridFour size={16} className="md:hidden" />
            <GridFour size={18} className="hidden md:block" />
            <span className="hidden sm:inline">Matchup Heatmap</span>
            <span className="sm:hidden">Heatmap</span>
          </TabsTrigger>
        </TabsContent>
        
        <TabsContent value="heroes">
          <PublicHeroBrowser selectedHeroId={selectedHeroId} />
        </TabsContent>
        
        <TabsContent value="heatmap">
          <PublicHeatmap onHeroClick={handleHeroClick} />
        </TabsContent>
      </Tabs>
        <TabsContent value="heatmap">
          <PublicHeatmap onHeroClick={handleHeroClick} />
        </TabsContent>
