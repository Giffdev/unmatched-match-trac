import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useKV } from '@github/spark/hooks'
import type { Match, User } from '@/lib/types'

export function DataDiagnostic() {
  const [currentUserId] = useKV<string | null>('current-user-id', null)
  const [users] = useKV<User[]>('users', [])
  const [matchCount, setMatchCount] = useState(0)
  const [ownedSetsCount, setOwnedSetsCount] = useState(0)

  useEffect(() => {
    loadUserData()
  }, [currentUserId])

  const loadUserData = async () => {
    if (!currentUserId) {
      setMatchCount(0)
      setOwnedSetsCount(0)
      return
    }

    const matchKey = `matches-${currentUserId}`
    const setsKey = `owned-sets-${currentUserId}`
    
    const matches = await window.spark.kv.get<Match[]>(matchKey)
    const sets = await window.spark.kv.get<string[]>(setsKey)
    
    setMatchCount(matches?.length || 0)
    setOwnedSetsCount(sets?.length || 0)
  }

  const currentUser = users?.find(u => u.id === currentUserId)

  if (!currentUser) {
    return null
  }

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>Account Status</CardTitle>
        <CardDescription>
          Signed in as: {currentUser.email}
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
