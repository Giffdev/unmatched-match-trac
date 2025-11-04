import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { HEROES, MAPS } from '@/lib/data'
import type { Match } from '@/lib/types'

type CsvImportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (matches: Match[]) => void
  currentUserId: string
}

export function CsvImportDialog({ open, onOpenChange, onImport, currentUserId }: CsvImportDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const normalizeText = (text: string): string => {
    return text
      .trim()
      .toUpperCase()
      .replace(/[^\w\s&'-]/g, '')
  }

  const findHeroByName = (name: string): string | null => {
    const normalized = normalizeText(name)
    
    const hero = HEROES.find(h => {
      const heroNormalized = normalizeText(h.name)
      return heroNormalized === normalized
    })

    if (hero) return hero.id

    const specialCases: Record<string, string> = {
      'SQUIRREL GIRL': 'squirrel-girl',
      'MS MARVEL': 'ms-marvel',
      'WINTER SOLDIER': 'winter-soldier',
      'CLOAK  DAGGER': 'cloak-dagger',
      'CLOAK DAGGER': 'cloak-dagger',
      'BLACK PANTHER': 'black-panther',
      'BLACK WIDOW': 'black-widow',
      'LITTLE RED RIDING HOOD': 'little-red',
      'ROBERT MULDOON': 'ingen',
      'SUN WUKONG': 'sun-wukong',
      'BLOODY MARY': 'bloody-mary',
      'BRUCE LEE': 'bruce-lee',
      'HARRY HOUDINI': 'houdini',
      'THE GENIE': 'the-genie',
      'DOCTOR STRANGE': 'doctor-strange',
      'SPIDERMAN': 'spider-man',
      'SPIDER MAN': 'spider-man',
      'SHEHULK': 'she-hulk',
      'SHE HULK': 'she-hulk',
      'KING ARTHUR': 'king-arthur',
      'JEKYLL  HYDE': 'jekyll-hyde',
      'INVISIBLE MAN': 'invisible-man',
      'ROBIN HOOD': 'robin-hood',
      'TOMOE GOZEN': 'tomoe-gozen',
      'ODA NOBUNAGA': 'oda-nobunaga',
      'THE WAYWARD SISTERS': 'wayward-sisters',
      'SHAKESPEARE': 'william-shakespeare',
      'T REX': 't-rex',
      'TREX': 't-rex',
      'ANCIENT LESCHEN': 'ancient-leshen',
      'GERALT OF RIVIA': 'geralt',
      'YENNEFER': 'yennefer-triss',
      'TRISS': 'yennefer-triss',
      'PHILIPPA': 'philippa',
      'DR JILL TRENT': 'dr-jill-trent',
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

  const handleImport = async () => {
    setIsProcessing(true)

    const csvData = `DATE,PLAYER 1,PLAYER 2,CHARACTER 1,CHARACTER 2,MAP,VICTOR,Victor's Character
5/24/2023,SARAH,DEVIN,SQUIRREL GIRL,MS. MARVEL,NAVY PIER,SARAH,#VALUE!
5/24/2023,DEVIN,#VALUE!,WINTER SOLDIER,CLOAK & DAGGER,NAVY PIER,SARAH,#VALUE!
5/26/2023,SARAH,SARAH,BLACK PANTHER,BLACK WIDOW,Helicarrier,DEVIN,SQUIRREL GIRL
5/31/2023,SARAH,SARAH,RAPTORS,LITTLE RED RIDING HOOD,HEOROT,DEVIN,CLOAK & DAGGER
5/31/2023,DEVIN,SARAH,Robert Muldoon,YENNENGA,RAPTOR PADDOCK,DEVIN,BLACK WIDOW
5/31/2023,DEVIN,SARAH,SUN WUKONG,BLOODY MARY,HANGING GARDENS,DEVIN,LITTLE RED RIDING HOOD
6/12/2023,DEVIN,SARAH,SQUIRREL GIRL,MS. MARVEL,NAVY PIER,DEVIN,Robert Muldoon
6/15/2023,DEVIN,SARAH,DAREDEVIL,ELEKTRA,HELL'S KITCHEN,SARAH,SUN WUKONG
6/17/2023,DEVIN,SARAH,BRUCE LEE,MEDUSA,SARPEDON,DEVIN,SQUIRREL GIRL
7/15/2023,SARAH,DEVIN,BRUCE LEE,HARRY HOUDINI,KING SOLOMON'S MINE,SARAH,ELEKTRA
7/15/2023,DEVIN,SARAH,THE GENIE,BRUCE LEE,KING SOLOMON'S MINE,SARAH,BRUCE LEE
7/17/2023,SARAH,DEVIN,DOCTOR STRANGE,SPIDER-MAN,SANCTUM SANCTORUM,SARAH,BRUCE LEE
7/17/2023,DEVIN,SARAH,SHE-HULK,SPIDER-MAN,SANCTUM SANCTORUM,SARAH,BRUCE LEE
10/1/2023,DEVIN,STEPHEN,ALICE,SINBAD,SARPEDON,DEVIN,DOCTOR STRANGE
10/1/2023,DEVIN,STEPHEN,JEKYLL & HYDE,KING ARTHUR,BASKERVILLE MANOR,STEPHEN,SPIDER-MAN
10/1/2023,STEPHEN,DEVIN,MEDUSA,BIGFOOT,SARPEDON,STEPHEN,ALICE
10/3/2023,DEVIN,STEPHEN,KING ARTHUR,BEOWULF,SHERWOOD FOREST,DEVIN,KING ARTHUR
10/3/2023,DEVIN,STEPHEN,BEOWULF,KING ARTHUR,SHERWOOD FOREST,DEVIN,MEDUSA
10/4/2023,DEVIN,STEPHEN,BEOWULF,DRACULA,YUKON,STEPHEN,KING ARTHUR
10/6/2023,STEPHEN,DEVIN,BIGFOOT,INVISIBLE MAN,SOHO,STEPHEN,BEOWULF
10/6/2023,DEVIN,STEPHEN,INVISIBLE MAN,ROBIN HOOD,BASKERVILLE MANOR,STEPHEN,DRACULA
3/7/2024,DEVIN,SARAH,TOMOE GOZEN,ODA NOBUNAGA,AZUCHI CASTLE,SARAH,BIGFOOT
3/7/2024,DEVIN,SARAH,TOMOE GOZEN,ODA NOBUNAGA,AZUCHI CASTLE,SARAH,ROBIN HOOD
3/7/2024,SARAH,DEVIN,ODA NOBUNAGA,TOMOE GOZEN,AZUCHI CASTLE,SARAH,ODA NOBUNAGA
3/7/2024,SARAH,DEVIN,TOMOE GOZEN,ODA NOBUNAGA,AZUCHI CASTLE,SARAH,ODA NOBUNAGA
7/13/2024,DEVIN,SARAH,TITANIA,THE WAYWARD SISTERS,Globe Theatre,DEVIN,ODA NOBUNAGA
7/13/2024,STEPHEN,DEVIN,THE WAYWARD SISTERS,HAMLET,Globe Theatre,DEVIN,TOMOE GOZEN
7/13/2024,DEVIN,STEPHEN,SHAKESPEARE,TITANIA,Globe Theatre,STEPHEN,TITANIA
7/14/2024,SARAH,DEVIN,TITANIA,HAMLET,Globe Theatre,SARAH,TITANIA
9/27/2024,DEVIN,SARAH,ODA NOBUNAGA,HARRY HOUDINI,Globe Theatre,SARAH,TITANIA
9/28/2024,SARAH,DEVIN,TOMOE GOZEN,THE GENIE,Globe Theatre,SARAH,TITANIA
10/16/2024,DEVIN,SARAH,T. Rex,BLACK WIDOW,RAPTOR PADDOCK,DEVIN,HARRY HOUDINI
10/20/2024,DEVIN,SARAH,WINTER SOLDIER,MS. MARVEL,HEOROT,SARAH,TOMOE GOZEN
1/4/2025,DEVIN,SARAH,CIRI,ANCIENT LESCHEN,FAYRLUND FOREST,DEVIN,T. Rex
1/4/2025,DEVIN,SARAH,GERALT OF RIVIA,CIRI,KAER MORHEN,SARAH,MS. MARVEL
1/4/2025,SARAH,DEVIN,PHILIPPA,Triss,NAGLFAR,SARAH,CIRI
1/4/2025,DEVIN,SARAH,Yennefer,PHILIPPA,STREETS OF NOVIGRAD,DEVIN,CIRI
1/10/2025,SARAH,DEVIN,Yennefer,ANCIENT LESCHEN,KAER MORHEN,DEVIN,PHILIPPA
1/11/2025,DEVIN,SARAH,DR. JILL TRENT,DRACULA,SOHO,DEVIN,Yennefer`

    const lines = csvData.trim().split('\n')
    const matches: Match[] = []
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const parts = line.split(',')
      
      if (parts.length < 7) {
        errors.push(`Line ${i + 1}: Invalid format`)
        continue
      }

      const [dateStr, player1, player2, char1, char2, mapName, victor] = parts

      const dateParts = dateStr.split('/')
      if (dateParts.length !== 3) {
        errors.push(`Line ${i + 1}: Invalid date format`)
        continue
      }

      const day = dateParts[0].padStart(2, '0')
      const month = dateParts[1].padStart(2, '0')
      const year = dateParts[2]
      const isoDate = `${year}-${month}-${day}`

      const hero1Id = findHeroByName(char1)
      const hero2Id = findHeroByName(char2)
      const mapId = findMapByName(mapName)

      if (!hero1Id) {
        errors.push(`Line ${i + 1}: Unknown hero "${char1}"`)
        continue
      }
      if (!hero2Id) {
        errors.push(`Line ${i + 1}: Unknown hero "${char2}"`)
        continue
      }
      if (!mapId) {
        errors.push(`Line ${i + 1}: Unknown map "${mapName}"`)
        continue
      }

      const player1Name = player1.trim()
      const player2Name = player2.trim()
      
      if (player1Name === '#VALUE!' || player2Name === '#VALUE!') {
        errors.push(`Line ${i + 1}: Invalid player name`)
        continue
      }

      const victorName = victor.trim().toUpperCase()
      let winnerId: string | undefined
      
      if (victorName === player1Name.toUpperCase()) {
        winnerId = hero1Id
      } else if (victorName === player2Name.toUpperCase()) {
        winnerId = hero2Id
      }

      const match: Match = {
        id: `imported-${Date.now()}-${i}`,
        date: isoDate,
        mode: '1v1',
        mapId: mapId,
        players: [
          { playerName: player1Name, heroId: hero1Id, turnOrder: 1 },
          { playerName: player2Name, heroId: hero2Id, turnOrder: 2 }
        ],
        winnerId: winnerId,
        isDraw: false,
        userId: currentUserId
      }

      matches.push(match)
    }

    setIsProcessing(false)

    if (errors.length > 0) {
      console.error('Import errors:', errors)
      toast.error(`Import completed with ${errors.length} errors. Check console for details.`)
    } else {
      toast.success(`Successfully imported ${matches.length} matches!`)
    }

    onImport(matches)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Import CSV Data</DialogTitle>
          <DialogDescription>
            This will import the pre-configured match data for giffdev@gmail.com
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertDescription>
            This action will import historical match data from a CSV file. This is a one-time import and should only be used once.
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isProcessing}>
            {isProcessing ? 'Importing...' : 'Import Matches'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
