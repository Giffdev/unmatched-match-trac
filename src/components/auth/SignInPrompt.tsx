import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignIn, Eye, EyeClosed, UserPlus, GoogleLogo, EnvelopeSimple, ChartBar, MagnifyingGlass, GridFour, SpinnerGap } from '@phosphor-icons/react'
import { createAccount, signIn, signInWithGoogle, resetPassword } from '@/lib/auth'
import { toast } from 'sonner'
import { GlobalStats } from './GlobalStats'
import { PublicHeroBrowser } from './PublicHeroBrowser'
import { PublicHeatmap } from './PublicHeatmap'

function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
      return 'No account found with this email.'
    case 'auth/wrong-password':
      return 'Incorrect password.'
    case 'auth/invalid-credential':
      return 'Invalid email or password.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.'
    default:
      return (error as Error)?.message || 'An unexpected error occurred.'
  }
}

export function SignInPrompt() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentTab, setCurrentTab] = useState('stats')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        await createAccount(email, password)
        toast.success('Welcome to Unmatched Tracker!')
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
      }
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle()
      toast.success('Signed in with Google!')
    } catch (err) {
      const msg = friendlyAuthError(err)
      if ((err as { code?: string })?.code !== 'auth/popup-closed-by-user') {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first, then click "Forgot password?"')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await resetPassword(email)
      toast.success('Password reset email sent! Check your inbox.')
    } catch (err) {
      setError(friendlyAuthError(err))
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setShowPassword(false)
    setShowConfirmPassword(false)
    setError(null)
  }

  const handleHeroClick = (heroId: string) => {
    setSelectedHeroId(heroId)
    setCurrentTab('heroes')
  }

  return (
    <div className="space-y-6">
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
          {error && (
            <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-sm">Email</Label>
              <div className="relative">
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="pl-9 text-sm md:text-base"
                />
                <EnvelopeSimple className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-sm">Password</Label>
              <div className="relative">
                <Input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
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
              {mode === 'signin' && (
                <Button
                  type="button"
                  variant="link"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="h-auto p-0 text-xs text-muted-foreground"
                >
                  Forgot password?
                </Button>
              )}
            </div>
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
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
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? (
                <SpinnerGap className="mr-2 animate-spin" size={18} />
              ) : mode === 'signin' ? (
                <SignIn className="mr-2" size={18} />
              ) : (
                <UserPlus className="mr-2" size={18} />
              )}
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            size="lg"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <GoogleLogo className="mr-2" size={18} weight="bold" />
            Sign in with Google
          </Button>

          <div className="mt-4 text-center">
            <Button
              type="button"
              variant="link"
              onClick={toggleMode}
              disabled={loading}
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
        <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 h-auto p-1">
          <TabsTrigger value="stats" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
            <ChartBar size={16} className="shrink-0" />
            <span className="hidden sm:inline">Community Stats</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="heroes" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
            <MagnifyingGlass size={16} className="shrink-0" />
            <span className="hidden sm:inline">Hero Browser</span>
            <span className="sm:hidden">Heroes</span>
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
            <GridFour size={16} className="shrink-0" />
            <span className="hidden sm:inline">Matchup Heatmap</span>
            <span className="sm:hidden">Heatmap</span>
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
