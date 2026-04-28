import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { getUserMatches, getUserOwnedSets } from '@/lib/firestore'

export function DataDiagnostic() {
  const { user } = useAuth()
  const [matchCount, setMatchCount] = useState(0)
  const [ownedSetsCount, setOwnedSetsCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setMatchCount(0)
      setOwnedSetsCount(0)
      return
    }
    getUserMatches(user.uid).then(m => setMatchCount(m.length))
    getUserOwnedSets(user.uid).then(s => setOwnedSetsCount(s.length))
  }, [user])

  if (!user) {
    return null
  }

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
        <CardDescription>
          Signed in as: {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{matchCount}</div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">{ownedSetsCount}</div>
            <div className="text-sm text-muted-foreground">Owned Sets</div>
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Your data is safely stored and will persist between sessions. Sign out and back in to verify.
        </div>
      </CardContent>
    </Card>
  )
}
