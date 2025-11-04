import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SignIn } from '@phosphor-icons/react'

type SignInPromptProps = {
  onSignIn: () => void
}

export function SignInPrompt({ onSignIn }: SignInPromptProps) {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle>Welcome to Unmatched Tracker</CardTitle>
        <CardDescription>
          Sign in to start tracking your matches, analyzing statistics, and discovering perfect matchups.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onSignIn} className="w-full">
          <SignIn className="mr-2" />
          Sign In with GitHub
        </Button>
      </CardContent>
    </Card>
  )
}
