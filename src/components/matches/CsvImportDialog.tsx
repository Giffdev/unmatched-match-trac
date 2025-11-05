import { useState, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { HEROES, MAPS } from '@/lib/data'
import { Upload } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'
import { normalizePlayerName } from '@/lib/utils'

type CsvImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (matches: Match[]) => Promise<void>
  currentUserId: string
  onClearData: () => void
}

export function CsvImportDialog({ open, onOpenChange, onImport, currentUserId, onClearData }: CsvImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const normalizeText = (text: string): string => {
    return text
      .trim()
      .toUpperCase()
      .replace(/[^\w\s&'-]/g, '')
  }

  const findHeroByName = (name: string): { heroId: string; variant?: string } | null => {
    const normalized = normalizeText(name)
    
    const hero = HEROES.find(h => {
      const heroNormalized = normalizeText(h.name)
      return heroNormalized === normalized
    })

    if (hero) return { heroId: hero.id }

    const specialCases: Record<string, { heroId: string; variant?: string }> = {
      'SQUIRREL GIRL': { heroId: 'squirrel-girl' },
      'MS MARVEL': { heroId: 'ms-marvel' },
      'WINTER SOLDIER': { heroId: 'winter-soldier' },
      'CLOAK  DAGGER': { heroId: 'cloak-dagger' },
      'CLOAK DAGGER': { heroId: 'cloak-dagger' },
      'BLACK PANTHER': { heroId: 'black-panther' },
      'BLACK WIDOW': { heroId: 'black-widow' },
      'LITTLE RED RIDING HOOD': { heroId: 'little-red' },
      'ROBERT MULDOON': { heroId: 'ingen' },
      'SUN WUKONG': { heroId: 'sun-wukong' },
      'BLOODY MARY': { heroId: 'bloody-mary' },
      'BRUCE LEE': { heroId: 'bruce-lee' },
      'HARRY HOUDINI': { heroId: 'houdini' },
      'THE GENIE': { heroId: 'the-genie' },
      'DOCTOR STRANGE': { heroId: 'doctor-strange' },
      'SPIDERMAN': { heroId: 'spider-man' },
      'SPIDER MAN': { heroId: 'spider-man' },
      'SHEHULK': { heroId: 'she-hulk' },
      'SHE HULK': { heroId: 'she-hulk' },
      'KING ARTHUR': { heroId: 'king-arthur' },
      'JEKYLL  HYDE': { heroId: 'jekyll-hyde' },
      'INVISIBLE MAN': { heroId: 'invisible-man' },
      'ROBIN HOOD': { heroId: 'robin-hood' },
      'TOMOE GOZEN': { heroId: 'tomoe-gozen' },
      'ODA NOBUNAGA': { heroId: 'oda-nobunaga' },
      'THE WAYWARD SISTERS': { heroId: 'wayward-sisters' },
      'SHAKESPEARE': { heroId: 'william-shakespeare' },
      'T REX': { heroId: 't-rex' },
      'TREX': { heroId: 't-rex' },
      'ANCIENT LESCHEN': { heroId: 'ancient-leshen' },
      'GERALT OF RIVIA': { heroId: 'geralt' },
      'YENNEFER': { heroId: 'yennefer-triss', variant: 'yennefer' },
      'TRISS': { heroId: 'yennefer-triss', variant: 'triss' },
      'YENNEFER  TRISS': { heroId: 'yennefer-triss', variant: 'yennefer' },
      'PHILIPPA': { heroId: 'philippa' },
      'DR JILL TRENT': { heroId: 'dr-jill-trent' },
    }

    return specialCases[normalized] || null
  }

  const findMapByName = (name: string): string | null => {
    const normalized = normalizeText(name)
    
    const map = MAPS.find(m => {
      const mapNormalized = normalizeText(m.name)
      return mapNormalized === normalized
    })

    if (map) return map.id

    const specialCases: Record<string, string> = {
      'NAVY PIER': 'navy-pier',
      'HELICARRIER': 'helicarrier',
      'HEOROT': 'heorot',
      'RAPTOR PADDOCK': 'raptor-paddock',
      'HANGING GARDENS': 'hanging-gardens',
      'HELLS KITCHEN': 'hells-kitchen',
      'SARPEDON': 'sarpedon',
      'KING SOLOMONS MINE': 'king-solomons-mine',
      'SANCTUM SANCTORUM': 'sanctum-sanctorum',
      'AZUCHI CASTLE': 'azuchi-castle',
      'GLOBE THEATRE': 'globe-theatre',
      'SOHO': 'soho',
      'BASKERVILLE MANOR': 'baskerville-manor',
      'SHERWOOD FOREST': 'sherwood-forest',
      'YUKON': 'yukon',
      'FAYRLUND FOREST': 'fayrlund-forest',
      'KAER MORHEN': 'kaer-morhen',
      'NAGLFAR': 'naglfar',
      'STREETS OF NOVIGRAD': 'streets-of-novigrad',
    }

    return specialCases[normalized] || null
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setSelectedFile(file)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const handleImport = async () => {
    if (!selectedFile) {
      toast.error('Please select a CSV file first')
      return
    }

    setIsProcessing(true)

    try {
      const csvData = await selectedFile.text()
      const lines = csvData.trim().split('\n')
      const matches: Match[] = []
      const errors: string[] = []

      console.log(`Total lines in CSV: ${lines.length}`)

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) {
          console.log(`Skipping empty line ${i + 1}`)
          continue
        }
        
        const parts = line.split(',')
        
        if (parts.length < 7) {
          errors.push(`Line ${i + 1}: Invalid format (expected 7 columns, got ${parts.length})`)
          console.log(`Line ${i + 1} error: Invalid format`, line)
          continue
        }

        const [dateStr, player1, player2, char1, char2, mapName, victor] = parts

        const dateParts = dateStr.split('/')
        if (dateParts.length !== 3) {
          errors.push(`Line ${i + 1}: Invalid date format "${dateStr}"`)
          console.log(`Line ${i + 1} error: Invalid date`, dateStr)
          continue
        }

        const month = dateParts[0].padStart(2, '0')
        const day = dateParts[1].padStart(2, '0')
        const year = dateParts[2]
        const isoDate = `${year}-${month}-${day}`

        const hero1Id = findHeroByName(char1)
        const hero2Id = findHeroByName(char2)
        const mapId = findMapByName(mapName)

        if (!hero1Id) {
          errors.push(`Line ${i + 1}: Unknown hero "${char1}"`)
          console.log(`Line ${i + 1} error: Unknown hero`, char1)
          continue
        }
        if (!hero2Id) {
          errors.push(`Line ${i + 1}: Unknown hero "${char2}"`)
          console.log(`Line ${i + 1} error: Unknown hero`, char2)
          continue
        }
        if (!mapId) {
          errors.push(`Line ${i + 1}: Unknown map "${mapName}"`)
          console.log(`Line ${i + 1} error: Unknown map`, mapName)
          continue
        }

        const player1Name = normalizePlayerName(player1.trim())
        const player2Name = normalizePlayerName(player2.trim())
        
        if (player1Name === '#VALUE!' || player2Name === '#VALUE!') {
          errors.push(`Line ${i + 1}: Invalid player name`)
          console.log(`Line ${i + 1} error: Invalid player name`)
          continue
        }

        const victorName = victor.trim().toUpperCase()
        let winnerId: string | undefined
        
        if (victorName === player1Name.toUpperCase() || victorName === player1.trim().toUpperCase()) {
          winnerId = hero1Id.heroId
        } else if (victorName === player2Name.toUpperCase() || victorName === player2.trim().toUpperCase()) {
          winnerId = hero2Id.heroId
        }

        const match: Match = {
          id: `imported-${Date.now()}-${i}`,
          date: isoDate,
          mode: '1v1',
          mapId: mapId,
          players: [
            { playerName: player1Name, heroId: hero1Id.heroId, turnOrder: 1, ...(hero1Id.variant && { heroVariant: hero1Id.variant }) },
            { playerName: player2Name, heroId: hero2Id.heroId, turnOrder: 2, ...(hero2Id.variant && { heroVariant: hero2Id.variant }) }
          ],
          winnerId: winnerId,
          isDraw: false,
          userId: currentUserId
        }

        matches.push(match)
      }

      console.log(`Successfully parsed ${matches.length} matches`)
      console.log(`Errors: ${errors.length}`)

      if (matches.length > 0) {
        console.log('Clearing existing data...')
        onClearData()
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log('Importing new matches...')
        await onImport(matches)
        
        setIsProcessing(false)
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }

        if (errors.length > 0) {
          console.error('Import errors:', errors)
          toast.warning(`Imported ${matches.length} matches with ${errors.length} errors. Check console for details.`)
        } else {
          toast.success(`Successfully imported ${matches.length} matches!`)
        }

        onOpenChange(false)
      } else {
        setIsProcessing(false)
        toast.error('No valid matches found in CSV')
      }
    } catch (error) {
      setIsProcessing(false)
      toast.error('Failed to read CSV file')
      console.error('CSV import error:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import CSV Data</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import match data. All existing data will be cleared and replaced.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              Warning: This will delete all existing match data and replace it with the imported data.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="flex gap-2">
              <input
                id="csv-file"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2" />
                {selectedFile ? selectedFile.name : 'Choose CSV file...'}
              </Button>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Expected CSV Format:</p>
            <code className="text-xs block">
              DATE,PLAYER 1,PLAYER 2,CHARACTER 1,CHARACTER 2,MAP,VICTOR
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Date format: M/D/YYYY (e.g., 5/24/2023)
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isProcessing || !selectedFile}
            variant="destructive"
          >
            {isProcessing ? 'Importing...' : 'Clear Data & Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
