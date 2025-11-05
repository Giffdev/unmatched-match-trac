import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Upload, CheckCircle, Warning, Sparkle } from '@phosphor-icons/react'
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

  const findHeroByName = async (name: string): Promise<string | null> => {
    if (!name) return null
    const normalized = name.trim().toLowerCase()
    const hero = HEROES.find(h => h.name.toLowerCase() === normalized)
    if (hero) return hero.id
    
    const heroNames = HEROES.map(h => `${h.id}: ${h.name}`).join('\n')
    const promptText = `You are matching a hero name from a CSV import to the correct hero ID in the Unmatched database.

Input name: "${name}"

Available heroes:
${heroNames}

If the input name closely matches one of the heroes (accounting for typos, abbreviations, alternate spellings, nicknames, etc.), return ONLY the hero ID (the part before the colon).
If there is no reasonable match, return exactly "NONE".

Examples:
- "robert muldoon" → "ingen"
- "ingen" → "ingen"
- "Sherlock" → "sherlock-holmes"
- "Dr Strange" → "doctor-strange"
- "T Rex" → "t-rex"
- "Random Unknown Hero" → "NONE"

Return only the ID or "NONE", nothing else.`
    
    try {
      const result = await window.spark.llm(promptText, 'gpt-4o-mini', false)
      const cleanResult = result.trim().toLowerCase()
      if (cleanResult === 'none') return null
      
      const matchedHero = HEROES.find(h => h.id === cleanResult)
      return matchedHero?.id || null
    } catch (error) {
      console.error('Error matching hero with LLM:', error)
      return null
    }
  }

  const findMapByName = async (name: string): Promise<string | null> => {
    if (!name) return null
    const normalized = name.trim().toLowerCase()
    const map = MAPS.find(m => m.name.toLowerCase() === normalized)
    if (map) return map.id
    
    const mapNames = MAPS.map(m => `${m.id}: ${m.name}`).join('\n')
    const promptText = `You are matching a map name from a CSV import to the correct map ID in the Unmatched database.

Input name: "${name}"

Available maps:
${mapNames}

If the input name closely matches one of the maps (accounting for typos, abbreviations, alternate spellings, etc.), return ONLY the map ID (the part before the colon).
If there is no reasonable match, return exactly "NONE".

Examples:
- "Raptor Paddock" → "raptor-paddock"
- "T-Rex Paddock" → "t-rex-paddock"
- "T. Rex Paddock" → "t-rex-paddock"
- "Soho" → "soho"
- "Random Unknown Map" → "NONE"

Return only the ID or "NONE", nothing else.`
    
    try {
      const result = await window.spark.llm(promptText, 'gpt-4o-mini', false)
      const cleanResult = result.trim().toLowerCase()
      if (cleanResult === 'none') return null
      
      const matchedMap = MAPS.find(m => m.id === cleanResult)
      return matchedMap?.id || null
    } catch (error) {
      console.error('Error matching map with LLM:', error)
      return null
    }
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

  const inferCSVMapping = async (headers: string[], sampleRows: string[][]): Promise<Record<string, number>> => {
    const heroNames = HEROES.map(h => h.name).join(', ')
    const mapNames = MAPS.map(m => m.name).join(', ')
    const sampleData = sampleRows.map((row, i) => `Row ${i + 1}: ${row.join(', ')}`).join('\n')
    
    const promptText = `You are analyzing a CSV file for an Unmatched board game match tracker.

CSV Headers: ${headers.join(', ')}

Sample Data Rows (first 3):
${sampleData}

Available Heroes in database: ${heroNames}
Available Maps in database: ${mapNames}

Required fields to map:
- date: The date of the match (look for date/when/timestamp columns)
- mode: Game mode (1v1, 2v2, ffa3, ffa4, cooperative - look for mode/type/format columns)
- map: The map name (look for map/board/location columns)
- player1_name: First player's name
- player1_hero: First player's hero
- player2_name: Second player's name  
- player2_hero: Second player's hero
- player3_name: Third player's name (optional)
- player3_hero: Third player's hero (optional)
- player4_name: Fourth player's name (optional)
- player4_hero: Fourth player's hero (optional)
- winner: Winner's name or "DRAW" (look for winner/result columns)
- is_draw: Boolean indicating if match was a draw (look for draw/tie columns)

Return a JSON object mapping each required field to its column index (0-based).
If a field cannot be found, use -1 as the index.
Be smart about variations in column names (e.g., "Player 1" vs "P1" vs "Player1").

Example output format:
{
  "date": 0,
  "mode": 1,
  "map": 2,
  "player1_name": 3,
  "player1_hero": 4,
  "player2_name": 5,
  "player2_hero": 6,
  "player3_name": -1,
  "player3_hero": -1,
  "player4_name": -1,
  "player4_hero": -1,
  "winner": 7,
  "is_draw": 8
}`

    try {
      const result = await window.spark.llm(promptText, 'gpt-4o-mini', true)
      const mapping = JSON.parse(result)
      return mapping
    } catch (error) {
      console.error('Error inferring CSV mapping:', error)
      throw new Error('Failed to automatically detect CSV structure. Please check your CSV format.')
    }
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
      const dataRows = rows.slice(1)
      const sampleRows = dataRows.slice(0, 3)

      toast.info('Analyzing CSV structure with AI...')
      const mapping = await inferCSVMapping(headers, sampleRows)
      
      const getCell = (row: string[], field: string): string => {
        const index = mapping[field]
        if (index === undefined || index === -1 || index >= row.length) return ''
        return row[index]?.trim() || ''
      }
      
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i]
        const rowNum = i + 2
        
        try {
          const date = getCell(row, 'date')
          const modeStr = getCell(row, 'mode')
          const mapName = getCell(row, 'map')
          const isDrawStr = getCell(row, 'is_draw')
          const winner = getCell(row, 'winner')

          if (!date) {
            errors.push(`Row ${rowNum}: Missing date`)
            continue
          }

          let mode = modeStr.toLowerCase() as Match['mode']
          if (!mode) {
            mode = '1v1'
          } else if (!['1v1', '2v2', 'ffa3', 'ffa4', 'cooperative'].includes(mode)) {
            errors.push(`Row ${rowNum}: Invalid mode "${modeStr}". Must be: 1v1, 2v2, ffa3, ffa4, or cooperative`)
            continue
          }

          const mapId = await findMapByName(mapName)
          if (!mapId) {
            errors.push(`Row ${rowNum}: Map "${mapName}" not found`)
            continue
          }

          const players: PlayerAssignment[] = []
          const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : 4
          
          for (let p = 1; p <= 4; p++) {
            const playerName = getCell(row, `player${p}_name`)
            const heroName = getCell(row, `player${p}_hero`)
            
            if (p <= playerCount) {
              if (!playerName) {
                errors.push(`Row ${rowNum}: Missing Player${p} name`)
                continue
              }
              if (!heroName) {
                errors.push(`Row ${rowNum}: Missing Player${p} hero`)
                continue
              }
              
              const heroId = await findHeroByName(heroName)
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

          const isDraw = isDrawStr.toLowerCase() === 'true' || winner.toLowerCase() === 'draw'

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
          <Sparkle className="h-5 w-5" />
          Smart CSV Import
        </CardTitle>
        <CardDescription>
          Upload any CSV file with match data - AI will automatically detect the format and match hero/map names
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
                  {importing ? 'Analyzing CSV...' : 'Select CSV File to Import'}
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
              <div className="flex items-center gap-2 text-accent font-medium">
                <Sparkle className="h-4 w-4" />
                <span>AI-Powered Smart Import</span>
              </div>
              <p>
                Just upload your CSV! The AI will automatically detect columns for:
                date, game mode, map, player names, heroes, and winner.
              </p>
              <p>
                <strong>Smart matching:</strong> Hero and map names don't need to match exactly.
                The AI will intelligently match variations like "Robert Muldoon" → InGen, 
                "T-Rex Paddock" → T. Rex Paddock, "Sherlock" → Sherlock Holmes, etc.
              </p>
              <p className="text-xs">
                <strong>Supported variations:</strong> "Player 1" / "P1" / "Player1", 
                "Hero 1" / "Character 1", "Winner" / "Result", and many more!
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
