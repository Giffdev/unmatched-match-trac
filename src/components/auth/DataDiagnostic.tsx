import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'
import type { Match, User } from '@/lib/types'

export function DataDiagnostic() {
  const [allKeys, setAllKeys] = useState<string[]>([])
  const [currentUserId] = useKV<string | null>('current-user-id', null)
  const [users] = useKV<User[]>('users', [])
  const [matchData, setMatchData] = useState<Record<string, number>>({})

  useEffect(() => {
    loadKeys()
  }, [])

  const loadKeys = async () => {
    const keys = await window.spark.kv.keys()
    setAllKeys(keys)

    const matchKeys = keys.filter(k => k.startsWith('matches-'))
    const data: Record<string, number> = {}

    for (const key of matchKeys) {
      const matches = await window.spark.kv.get<Match[]>(key)
      if (matches && Array.isArray(matches)) {
        data[key] = matches.length
      }
    }

    setMatchData(data)
  }

  const migrateToCurrentUser = async (fromKey: string) => {
    if (!currentUserId) {
      toast.error('No user signed in')
      return
    }

    const sourceMatches = await window.spark.kv.get<Match[]>(fromKey)
    const sourceSets = await window.spark.kv.get<string[]>(fromKey.replace('matches-', 'owned-sets-'))
    
    if (!sourceMatches || !Array.isArray(sourceMatches)) {
      toast.error('No data found in source')
      return
    }

    const targetKey = `matches-${currentUserId}`
    const targetSetsKey = `owned-sets-${currentUserId}`

    const existingMatches = await window.spark.kv.get<Match[]>(targetKey) || []
    const existingSets = await window.spark.kv.get<string[]>(targetSetsKey) || []

    await window.spark.kv.set(targetKey, [...existingMatches, ...sourceMatches])
    
    if (sourceSets && Array.isArray(sourceSets)) {
      const mergedSets = Array.from(new Set([...existingSets, ...sourceSets]))
      await window.spark.kv.set(targetSetsKey, mergedSets)
    }

    toast.success(`Migrated ${sourceMatches.length} matches to current user!`)
    await loadKeys()
    window.location.reload()
  }

  const currentUser = users?.find(u => u.id === currentUserId)

  return (
    <Card className="max-w-2xl mx-auto mb-6">
      <CardHeader>
        <CardTitle>Data Diagnostic</CardTitle>
        <CardDescription>
          Current user: {currentUser?.email || 'None'} (ID: {currentUserId || 'None'})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">All Users:</h3>
          <ul className="space-y-1 text-sm">
            {users?.map(u => (
              <li key={u.id} className="flex items-center gap-2">
                <span className={u.id === currentUserId ? 'font-bold text-primary' : ''}>
                  {u.email} ({u.name})
                </span>
                <span className="text-muted-foreground text-xs">ID: {u.id}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Match Data Found:</h3>
          {Object.keys(matchData).length === 0 ? (
            <p className="text-sm text-muted-foreground">No match data found in any user account</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(matchData).map(([key, count]) => {
                const userId = key.replace('matches-', '')
                const user = users?.find(u => u.id === userId)
                const isCurrentUser = userId === currentUserId

                return (
                  <li key={key} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div>
                      <div className={`font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                        {user?.email || 'Unknown user'}
                        {isCurrentUser && ' (Current)'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {count} matches
                      </div>
                    </div>
                    {!isCurrentUser && currentUserId && (
                      <Button 
                        size="sm" 
                        onClick={() => migrateToCurrentUser(key)}
                      >
                        Copy to Current User
                      </Button>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className="pt-4 border-t">
          <h3 className="font-semibold mb-2">All Storage Keys ({allKeys.length}):</h3>
          <div className="max-h-40 overflow-y-auto text-xs text-muted-foreground font-mono space-y-1">
            {allKeys.map(key => (
              <div key={key}>{key}</div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
