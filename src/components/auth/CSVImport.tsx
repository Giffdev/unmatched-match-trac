import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Upload, CheckCircle, Warning, DownloadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Match, PlayerAssignment } from '@/lib/types'
import { HEROES, MAPS } from '@/lib/data'

type CSVImportProps = {
  currentUserId: string | null | undefined
  onImportComplete: (matches: Match[]) => void
}

export function CSVImport({ currentUserId, onImportComplete }: CSVImportProps) {
  const [importing, setImporting] = useState(false)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
    matches: Match[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const downloadTemplate = () => {
    const template = `Date,Mode,Map,Player1Name,Player1Hero,Player2Name,Player2Hero,Player3Name,Player3Hero,Player4Name,Player4Hero,Winner,IsDraw
2024-01-15,1v1,Sarpedon,Mike,Alice,Sarah,Medusa,,,,,Mike,false
2024-01-16,2v2,Sarpedon,Mike,King Arthur,Sarah,Sinbad,Alex,Alice,Jordan,Medusa,Mike & Sarah,false
2024-01-17,ffa3,Baskerville Manor,Mike,Bruce Lee,Sarah,Robin Hood,Alex,Bigfoot,,,Alex,false
2024-01-18,1v1,Sarpedon,Mike,Sherlock Holmes,Sarah,Dracula,,,,,DRAW,true`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'unmatched-import-template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Template downloaded')
  }

  const findHeroByName = (name: string): string | null => {
    if (!name) return null
    const normalized = name.trim().toLowerCase()
    const hero = HEROES.find(h => h.name.toLowerCase() === normalized)
    return hero?.id || null
  }

  const findMapByName = (name: string): string | null => {
    if (!name) return null
    const normalized = name.trim().toLowerCase()
    const map = MAPS.find(m => m.name.toLowerCase() === normalized)
    return map?.id || null
  }

  const parseCSV = (text: string): string[][] => {
    const lines = text.split('\n').filter(line => line.trim())
    return lines.map(line => {
      const values: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      values.push(current.trim())
      
      return values
    })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!currentUserId) {
      toast.error('Please sign in before importing data')
      return
    }

    setImporting(true)
    const errors: string[] = []
    const matches: Match[] = []

    try {
      const text = await file.text()
      const rows = parseCSV(text)
      
      if (rows.length < 2) {
        throw new Error('CSV file must contain a header row and at least one data row')
      }

      const headers = rows[0].map(h => h.toLowerCase().trim())
      
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i]
        const rowNum = i + 1
        
        try {
          const getCell = (headerName: string): string => {
            const index = headers.findIndex(h => h.includes(headerName))
            return index >= 0 ? row[index]?.trim() || '' : ''
          }

          const date = getCell('date')
          const mode = getCell('mode') as Match['mode']
          const mapName = getCell('map')
          const isDraw = getCell('draw').toLowerCase() === 'true'
          const winner = getCell('winner')

          if (!date) {
            errors.push(`Row ${rowNum}: Missing date`)
            continue
          }

          if (!mode || !['1v1', '2v2', 'ffa3', 'ffa4', 'cooperative'].includes(mode)) {
            errors.push(`Row ${rowNum}: Invalid mode "${mode}". Must be: 1v1, 2v2, ffa3, ffa4, or cooperative`)
            continue
          }

          const mapId = findMapByName(mapName)
          if (!mapId) {
            errors.push(`Row ${rowNum}: Map "${mapName}" not found`)
            continue
          }

          const players: PlayerAssignment[] = []
          const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : 4
          
          for (let p = 1; p <= 4; p++) {
            const playerName = getCell(`player${p}name`)
            const heroName = getCell(`player${p}hero`)
            
            if (p <= playerCount) {
              if (!playerName) {
                errors.push(`Row ${rowNum}: Missing Player${p} name`)
                continue
              }
              if (!heroName) {
                errors.push(`Row ${rowNum}: Missing Player${p} hero`)
                continue
              }
              
              const heroId = findHeroByName(heroName)
              if (!heroId) {
                errors.push(`Row ${rowNum}: Hero "${heroName}" not found for Player${p}`)
                continue
              }
              
              players.push({
                playerName: playerName.trim(),
                heroId,
                turnOrder: p
              })
            }
          }

          if (players.length !== playerCount) {
            continue
          }

          const match: Match = {
            id: `import-${Date.now()}-${i}`,
            date,
            mode,
            mapId,
            players,
            isDraw,
            userId: currentUserId
          }

          if (!isDraw && winner) {
            const winnerPlayer = players.find(p => 
              winner.toLowerCase().includes(p.playerName.toLowerCase())
            )
            if (winnerPlayer) {
              match.winnerId = winnerPlayer.heroId
            }
          }

          matches.push(match)
        } catch (error) {
          errors.push(`Row ${rowNum}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      setImportResults({
        success: matches.length,
        errors,
        matches
      })

      if (matches.length > 0) {
        toast.success(`Successfully parsed ${matches.length} matches`)
      }
      
      if (errors.length > 0) {
        toast.warning(`${errors.length} errors encountered during import`)
      }

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to parse CSV file')
      errors.push(error instanceof Error ? error.message : 'Unknown error')
      setImportResults({ success: 0, errors, matches: [] })
    } finally {
      setImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const confirmImport = () => {
    if (importResults && importResults.matches.length > 0) {
      onImportComplete(importResults.matches)
      toast.success(`Imported ${importResults.matches.length} matches!`)
      setImportResults(null)
    }
  }

  return (
    <Card className="max-w-3xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Matches from CSV
        </CardTitle>
        <CardDescription>
          Restore your lost data by importing matches from a CSV file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentUserId ? (
          <Alert variant="destructive">
            <Warning className="h-4 w-4" />
            <AlertTitle>Sign In Required</AlertTitle>
            <AlertDescription>
              You must be signed in to import match data.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="w-full"
              >
                <DownloadSimple className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>

              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={importing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                <Button
                  variant="default"
                  disabled={importing}
                  className="w-full pointer-events-none"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importing ? 'Processing...' : 'Select CSV File to Import'}
                </Button>
              </div>
            </div>

            {importResults && (
              <div className="space-y-4 pt-4 border-t">
                <Alert variant={importResults.success > 0 ? 'default' : 'destructive'}>
                  {importResults.success > 0 ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Import Preview</AlertTitle>
                      <AlertDescription>
                        Successfully parsed {importResults.success} match{importResults.success !== 1 ? 'es' : ''}.
                        {importResults.errors.length > 0 && ` ${importResults.errors.length} error${importResults.errors.length !== 1 ? 's' : ''} encountered.`}
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <Warning className="h-4 w-4" />
                      <AlertTitle>Import Failed</AlertTitle>
                      <AlertDescription>
                        No matches could be imported. Check the errors below.
                      </AlertDescription>
                    </>
                  )}
                </Alert>

                {importResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-destructive">Errors:</h3>
                    <div className="max-h-48 overflow-y-auto bg-destructive/10 p-3 rounded text-xs space-y-1">
                      {importResults.errors.map((error, idx) => (
                        <div key={idx} className="text-destructive">• {error}</div>
                      ))}
                    </div>
                  </div>
                )}

                {importResults.success > 0 && (
                  <div className="flex gap-2">
                    <Button
                      onClick={confirmImport}
                      className="flex-1"
                    >
                      Confirm Import ({importResults.success} matches)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setImportResults(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground pt-2 border-t space-y-2">
              <p><strong>CSV Format:</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>Date:</strong> YYYY-MM-DD format (e.g., 2024-01-15)</li>
                <li><strong>Mode:</strong> 1v1, 2v2, ffa3, ffa4, or cooperative</li>
                <li><strong>Map:</strong> Exact map name (e.g., "Sarpedon")</li>
                <li><strong>Players:</strong> Player1Name, Player1Hero, Player2Name, Player2Hero, etc.</li>
                <li><strong>Winner:</strong> Player name who won (or "DRAW")</li>
                <li><strong>IsDraw:</strong> true or false</li>
              </ul>
              <p className="text-accent">Download the template for an example format!</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
