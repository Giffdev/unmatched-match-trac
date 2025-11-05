import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, Warning } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'

export function DataRecovery() {
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<{
    allKeys: string[]
    matchKeys: string[]
    possibleMatches: Record<string, number>
  } | null>(null)

  const scanStorage = async () => {
    setScanning(true)
    try {
      const allKeys = await window.spark.kv.keys()
      const matchKeys = allKeys.filter(key => key.includes('match'))
      
      const possibleMatches: Record<string, number> = {}
      
      for (const key of matchKeys) {
        const data = await window.spark.kv.get<Match[]>(key)
        if (Array.isArray(data) && data.length > 0) {
          possibleMatches[key] = data.length
        }
      }
      
      setResults({
        allKeys,
        matchKeys,
        possibleMatches
      })
    } catch (error) {
      console.error('Error scanning storage:', error)
    } finally {
      setScanning(false)
    }
  }

  const inspectKey = async (key: string) => {
    const data = await window.spark.kv.get(key)
    console.log(`Data at key "${key}":`, data)
    alert(`Check console for data at key: ${key}`)
  }

  return (
    <Card className="max-w-3xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Data Recovery Tool
        </CardTitle>
        <CardDescription>
          Scan storage for all saved data and check for missing matches
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!results && (
          <Button onClick={scanStorage} disabled={scanning} className="w-full">
            {scanning ? 'Scanning...' : 'Scan Storage for Data'}
          </Button>
        )}

        {results && (
          <div className="space-y-4">
            <Alert>
              <Warning className="h-4 w-4" />
              <AlertDescription>
                Found {results.allKeys.length} total keys in storage
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h3 className="font-semibold text-sm">All Storage Keys ({results.allKeys.length}):</h3>
              <div className="max-h-48 overflow-y-auto bg-muted p-3 rounded text-xs font-mono space-y-1">
                {results.allKeys.map(key => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span>{key}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => inspectKey(key)}
                      className="h-6 text-xs"
                    >
                      Inspect
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(results.possibleMatches).length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-accent">
                  Found Match Data:
                </h3>
                <div className="bg-accent/10 p-3 rounded space-y-2">
                  {Object.entries(results.possibleMatches).map(([key, count]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="font-mono text-sm">{key}</span>
                      <span className="font-bold text-accent">{count} matches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={() => setResults(null)} variant="outline" className="w-full">
              Scan Again
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <strong>Note:</strong> This tool helps locate data in storage. Click "Inspect" on any key to view its contents in the browser console.
        </div>
      </CardContent>
    </Card>
  )
}
