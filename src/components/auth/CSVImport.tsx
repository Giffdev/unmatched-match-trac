import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Upload, CheckCircle, Warning, ArrowRight, MagnifyingGlass } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Match, PlayerAssignment } from '@/lib/types'
import { HEROES, MAPS } from '@/lib/data'
import { useAuth } from '@/hooks/use-auth'

// Fields the app needs mapped from CSV columns
const APP_FIELDS = [
  { key: 'date', label: 'Date', required: true },
  { key: 'mode', label: 'Game Mode' },
  { key: 'map', label: 'Map', required: true },
  { key: 'player1_name', label: 'Player 1 Name', required: true },
  { key: 'player1_hero', label: 'Player 1 Hero', required: true },
  { key: 'player2_name', label: 'Player 2 Name', required: true },
  { key: 'player2_hero', label: 'Player 2 Hero', required: true },
  { key: 'player3_name', label: 'Player 3 Name' },
  { key: 'player3_hero', label: 'Player 3 Hero' },
  { key: 'player4_name', label: 'Player 4 Name' },
  { key: 'player4_hero', label: 'Player 4 Hero' },
  { key: 'winner', label: 'Winner' },
  { key: 'is_draw', label: 'Is Draw' },
] as const

type AppFieldKey = (typeof APP_FIELDS)[number]['key']

// Header keyword patterns for auto-detection
const HEADER_PATTERNS: Record<AppFieldKey, RegExp[]> = {
  date: [/^date$/i, /^when$/i, /^timestamp$/i, /^match.?date$/i, /^played$/i],
  mode: [/^mode$/i, /^game.?mode$/i, /^type$/i, /^format$/i],
  map: [/^map$/i, /^board$/i, /^location$/i, /^arena$/i],
  player1_name: [/^player.?1$/i, /^p1$/i, /^player.?1.?name$/i, /^player.?one$/i],
  player1_hero: [/^(player.?1.?)?hero.?1?$/i, /^p1.?hero$/i, /^character.?1$/i, /^player.?1.?hero$/i, /^hero$/i],
  player2_name: [/^player.?2$/i, /^p2$/i, /^player.?2.?name$/i, /^player.?two$/i, /^opponent$/i],
  player2_hero: [/^(player.?2.?)?hero.?2$/i, /^p2.?hero$/i, /^character.?2$/i, /^player.?2.?hero$/i],
  player3_name: [/^player.?3$/i, /^p3$/i, /^player.?3.?name$/i],
  player3_hero: [/^(player.?3.?)?hero.?3$/i, /^p3.?hero$/i, /^character.?3$/i, /^player.?3.?hero$/i],
  player4_name: [/^player.?4$/i, /^p4$/i, /^player.?4.?name$/i],
  player4_hero: [/^(player.?4.?)?hero.?4$/i, /^p4.?hero$/i, /^character.?4$/i, /^player.?4.?hero$/i],
  winner: [/^winner$/i, /^result$/i, /^won$/i, /^victor$/i],
  is_draw: [/^draw$/i, /^is.?draw$/i, /^tie$/i, /^is.?tie$/i],
}

type Step = 'upload' | 'map-columns' | 'review' | 'done'

type CSVImportProps = {
  currentUserId: string | null | undefined
  onImportComplete: (matches: Match[]) => void
}

// Normalize a string for fuzzy matching: lowercase, strip punctuation, collapse whitespace
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Simple fuzzy match: returns a score (higher = better). 0 means no match.
function fuzzyScore(input: string, candidate: string): number {
  const a = normalize(input)
  const b = normalize(candidate)
  if (!a || !b) return 0
  if (a === b) return 100
  if (b.startsWith(a) || a.startsWith(b)) return 80
  if (b.includes(a) || a.includes(b)) return 60
  // Check if all words in input appear in candidate
  const aWords = a.split(' ')
  const bWords = b.split(' ')
  const allWordsMatch = aWords.every(w => bWords.some(bw => bw.includes(w) || w.includes(bw)))
  if (allWordsMatch) return 40
  return 0
}

function findHeroByName(name: string): { heroId: string; variant?: string } | null {
  if (!name) return null
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()

  // Special cases for Yennefer & Triss dual hero
  if (lower === 'yennefer') return { heroId: 'yennefer-triss', variant: 'yennefer' }
  if (lower === 'triss') return { heroId: 'yennefer-triss', variant: 'triss' }

  // Exact match on name
  const exact = HEROES.find(h => h.name.toLowerCase() === lower)
  if (exact) return { heroId: exact.id }

  // Exact match on id
  const byId = HEROES.find(h => h.id === lower)
  if (byId) return { heroId: byId.id }

  // Fuzzy match – pick best score
  let bestScore = 0
  let bestHero: typeof HEROES[number] | null = null
  for (const hero of HEROES) {
    const nameScore = fuzzyScore(trimmed, hero.name)
    const idScore = fuzzyScore(trimmed, hero.id.replace(/-/g, ' '))
    const score = Math.max(nameScore, idScore)
    if (score > bestScore) {
      bestScore = score
      bestHero = hero
    }
  }

  if (bestHero && bestScore >= 40) return { heroId: bestHero.id }
  return null
}

function findMapByName(name: string): string | null {
  if (!name) return null
  const trimmed = name.trim()
  const lower = trimmed.toLowerCase()

  const exact = MAPS.find(m => m.name.toLowerCase() === lower)
  if (exact) return exact.id

  const byId = MAPS.find(m => m.id === lower)
  if (byId) return byId.id

  let bestScore = 0
  let bestMap: typeof MAPS[number] | null = null
  for (const map of MAPS) {
    const nameScore = fuzzyScore(trimmed, map.name)
    const idScore = fuzzyScore(trimmed, map.id.replace(/-/g, ' '))
    const score = Math.max(nameScore, idScore)
    if (score > bestScore) {
      bestScore = score
      bestMap = map
    }
  }

  if (bestMap && bestScore >= 40) return bestMap.id
  return null
}

function parseCSV(text: string): string[][] {
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

function autoDetectMapping(headers: string[]): Record<AppFieldKey, number> {
  const mapping: Record<string, number> = {}
  const used = new Set<number>()

  for (const field of APP_FIELDS) {
    const patterns = HEADER_PATTERNS[field.key]
    for (const pattern of patterns) {
      const idx = headers.findIndex((h, i) => !used.has(i) && pattern.test(h.trim()))
      if (idx !== -1) {
        mapping[field.key] = idx
        used.add(idx)
        break
      }
    }
    if (mapping[field.key] === undefined) {
      mapping[field.key] = -1
    }
  }
  return mapping as Record<AppFieldKey, number>
}

export function CSVImport({ currentUserId, onImportComplete }: CSVImportProps) {
  const { user } = useAuth()
  const resolvedUserId = currentUserId ?? user?.uid

  const [step, setStep] = useState<Step>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [dataRows, setDataRows] = useState<string[][]>([])
  const [columnMapping, setColumnMapping] = useState<Record<AppFieldKey, number>>({} as Record<AppFieldKey, number>)
  const [importResults, setImportResults] = useState<{
    success: number
    errors: string[]
    matches: Match[]
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetState = useCallback(() => {
    setStep('upload')
    setHeaders([])
    setDataRows([])
    setColumnMapping({} as Record<AppFieldKey, number>)
    setImportResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!resolvedUserId) {
      toast.error('Please sign in before importing data')
      return
    }

    file.text().then(text => {
      const rows = parseCSV(text)
      if (rows.length < 2) {
        toast.error('CSV file must contain a header row and at least one data row')
        return
      }
      const csvHeaders = rows[0]
      const csvData = rows.slice(1)
      setHeaders(csvHeaders)
      setDataRows(csvData)

      const detected = autoDetectMapping(csvHeaders)
      setColumnMapping(detected)
      setStep('map-columns')
      toast.info('CSV loaded! Review column mapping below.')
    }).catch(() => {
      toast.error('Failed to read CSV file')
    })
  }

  const updateMapping = (field: AppFieldKey, colIndex: number) => {
    setColumnMapping(prev => ({ ...prev, [field]: colIndex }))
  }

  const processMatches = () => {
    if (!resolvedUserId) return

    const errors: string[] = []
    const matches: Match[] = []

    const getCell = (row: string[], field: AppFieldKey): string => {
      const index = columnMapping[field]
      if (index === undefined || index === -1 || index >= row.length) return ''
      return row[index]?.trim() || ''
    }

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i]
      const rowNum = i + 2

      try {
        const dateStr = getCell(row, 'date')
        const modeStr = getCell(row, 'mode')
        const mapName = getCell(row, 'map')
        const isDrawStr = getCell(row, 'is_draw')
        const winner = getCell(row, 'winner')

        if (!dateStr) {
          errors.push(`Row ${rowNum}: Missing date`)
          continue
        }

        let date: string
        try {
          const parsedDate = new Date(dateStr)
          if (isNaN(parsedDate.getTime())) {
            errors.push(`Row ${rowNum}: Invalid date format "${dateStr}"`)
            continue
          }
          const year = parsedDate.getFullYear()
          const month = String(parsedDate.getMonth() + 1).padStart(2, '0')
          const day = String(parsedDate.getDate()).padStart(2, '0')
          date = `${year}-${month}-${day}`
        } catch {
          errors.push(`Row ${rowNum}: Unable to parse date "${dateStr}"`)
          continue
        }

        let mode = modeStr.toLowerCase() as Match['mode']
        if (!mode) {
          mode = '1v1'
        } else if (!['1v1', '2v2', 'ffa3', 'ffa4', 'cooperative'].includes(mode)) {
          errors.push(`Row ${rowNum}: Invalid mode "${modeStr}". Must be: 1v1, 2v2, ffa3, ffa4, or cooperative`)
          continue
        }

        const mapId = findMapByName(mapName)
        if (!mapId) {
          errors.push(`Row ${rowNum}: Map "${mapName}" not found`)
          continue
        }

        const players: PlayerAssignment[] = []
        const playerCount = mode === '1v1' ? 2 : mode === '2v2' ? 4 : mode === 'ffa3' ? 3 : 4
        let playerError = false

        for (let p = 1; p <= playerCount; p++) {
          const playerName = getCell(row, `player${p}_name` as AppFieldKey)
          const heroName = getCell(row, `player${p}_hero` as AppFieldKey)

          if (!playerName) {
            errors.push(`Row ${rowNum}: Missing Player ${p} name`)
            playerError = true
            break
          }
          if (!heroName) {
            errors.push(`Row ${rowNum}: Missing Player ${p} hero`)
            playerError = true
            break
          }

          const heroMatch = findHeroByName(heroName)
          if (!heroMatch) {
            errors.push(`Row ${rowNum}: Hero "${heroName}" not found for Player ${p}`)
            playerError = true
            break
          }

          const assignment: PlayerAssignment = {
            playerName: playerName.trim(),
            heroId: heroMatch.heroId,
            turnOrder: p,
          }
          if (heroMatch.variant) {
            assignment.heroVariant = heroMatch.variant
          }
          players.push(assignment)
        }

        if (playerError || players.length !== playerCount) continue

        const isDraw = isDrawStr.toLowerCase() === 'true' || winner.toLowerCase() === 'draw'

        const match: Match = {
          id: `import-${Date.now()}-${i}`,
          date,
          mode,
          mapId,
          players,
          isDraw,
          userId: resolvedUserId,
        }

        if (!isDraw && winner) {
          const winnerPlayer = players.find(p =>
            winner.toLowerCase().includes(p.playerName.toLowerCase()),
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

    setImportResults({ success: matches.length, errors, matches })
    setStep('review')

    if (matches.length > 0) {
      toast.success(`Parsed ${matches.length} match${matches.length !== 1 ? 'es' : ''}!`)
    }
    if (errors.length > 0) {
      toast.warning(`${errors.length} error${errors.length !== 1 ? 's' : ''} encountered`)
    }
  }

  const confirmImport = () => {
    if (importResults && importResults.matches.length > 0) {
      onImportComplete(importResults.matches)
      toast.success(`Imported ${importResults.matches.length} matches!`)
      resetState()
    }
  }

  const previewRows = dataRows.slice(0, 5)

  return (
    <div className="space-y-4">
      {!resolvedUserId ? (
        <Alert variant="destructive">
          <Warning className="h-4 w-4" />
          <AlertTitle>Sign In Required</AlertTitle>
          <AlertDescription>
            You must be signed in to import match data.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-3">
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button variant="default" className="w-full pointer-events-none">
                  <Upload className="h-4 w-4 mr-2" />
                  Select CSV File to Import
                </Button>
              </div>
              <div className="text-xs text-muted-foreground pt-2 border-t space-y-2">
                <div className="flex items-center gap-2 font-medium">
                  <MagnifyingGlass className="h-4 w-4" />
                  <span>Smart CSV Import</span>
                </div>
                <p>
                  Upload your CSV and we'll auto-detect columns for date, game mode,
                  map, player names, heroes, and winner. You can adjust mappings manually
                  if needed.
                </p>
                <p>
                  <strong>Fuzzy matching:</strong> Hero and map names are matched flexibly —
                  "Sherlock" matches "Sherlock Holmes", "T-Rex Paddock" matches "T. Rex Paddock", etc.
                </p>
                <p>
                  <strong>Yennefer & Triss:</strong> Enter just "Yennefer" or "Triss"
                  and the correct variant will be selected automatically.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 'map-columns' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Map CSV Columns</h3>
              <p className="text-xs text-muted-foreground">
                We auto-detected some mappings. Adjust any that look wrong, then click "Process Matches".
              </p>

              {/* Preview table */}
              {previewRows.length > 0 && (
                <div className="border rounded-md overflow-hidden">
                  <div className="text-xs font-medium px-3 py-1.5 bg-muted">
                    CSV Preview (first {previewRows.length} rows)
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {headers.map((h, i) => (
                            <TableHead key={i} className="text-xs whitespace-nowrap">
                              [{i}] {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {previewRows.map((row, ri) => (
                          <TableRow key={ri}>
                            {headers.map((_, ci) => (
                              <TableCell key={ci} className="text-xs whitespace-nowrap">
                                {row[ci] ?? ''}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Mapping selects */}
              <div className="grid gap-2">
                {APP_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <span className="text-xs w-36 shrink-0">
                      {field.label}
                      {'required' in field && field.required && <span className="text-destructive ml-0.5">*</span>}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <Select
                      value={String(columnMapping[field.key] ?? -1)}
                      onValueChange={v => updateMapping(field.key, parseInt(v, 10))}
                    >
                      <SelectTrigger className="h-8 text-xs flex-1">
                        <SelectValue placeholder="(unmapped)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="-1">(unmapped)</SelectItem>
                        {headers.map((h, i) => (
                          <SelectItem key={i} value={String(i)}>
                            [{i}] {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={processMatches} className="flex-1">
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Process Matches
                </Button>
                <Button variant="outline" onClick={resetState}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Confirm */}
          {step === 'review' && importResults && (
            <div className="space-y-4">
              <Alert variant={importResults.success > 0 ? 'default' : 'destructive'}>
                {importResults.success > 0 ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>Ready to Import!</AlertTitle>
                    <AlertDescription>
                      Successfully parsed {importResults.success} match{importResults.success !== 1 ? 'es' : ''}.
                      {importResults.errors.length > 0 && ` ${importResults.errors.length} error${importResults.errors.length !== 1 ? 's' : ''} encountered.`}
                      <strong className="block mt-2 text-foreground">Click "Confirm Import" below to save these matches.</strong>
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
                  <Button onClick={confirmImport} className="flex-1 animate-pulse" size="lg">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirm Import ({importResults.success} matches)
                  </Button>
                  <Button variant="outline" onClick={() => setStep('map-columns')}>
                    Back
                  </Button>
                  <Button variant="outline" onClick={resetState}>
                    Cancel
                  </Button>
                </div>
              )}

              {importResults.success === 0 && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep('map-columns')}>
                    Back to Mapping
                  </Button>
                  <Button variant="outline" onClick={resetState}>
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
