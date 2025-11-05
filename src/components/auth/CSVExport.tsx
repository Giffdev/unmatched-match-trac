import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DownloadSimple } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Match } from '@/lib/types'
import { getHeroById, getMapById } from '@/lib/data'
import { getHeroDisplayName } from '@/lib/utils'

type CSVExportProps = {
  matches: Match[]
}

export function CSVExport({ matches }: CSVExportProps) {
  const exportToCSV = () => {
    if (matches.length === 0) {
      toast.error('No matches to export')
      return
    }

    const headers = [
      'Date',
      'Mode',
      'Map',
      'Player1Name',
      'Player1Hero',
      'Player2Name',
      'Player2Hero',
      'Player3Name',
      'Player3Hero',
      'Player4Name',
      'Player4Hero',
      'Winner',
      'IsDraw'
    ]

    const rows = matches.map(match => {
      const map = getMapById(match.mapId)
      const mapName = map?.name || 'Unknown'
      
      const sortedPlayers = [...match.players].sort((a, b) => a.turnOrder - b.turnOrder)
      
      const playerData: string[] = []
      for (let i = 0; i < 4; i++) {
        if (i < sortedPlayers.length) {
          const player = sortedPlayers[i]
          playerData.push(player.playerName)
          playerData.push(getHeroDisplayName(player))
        } else {
          playerData.push('')
          playerData.push('')
        }
      }

      let winner = ''
      if (match.isDraw) {
        winner = 'DRAW'
      } else if (match.winnerId) {
        const winningPlayer = match.players.find(p => p.heroId === match.winnerId)
        if (winningPlayer) {
          winner = winningPlayer.playerName
        }
      }

      return [
        match.date,
        match.mode,
        mapName,
        ...playerData,
        winner,
        match.isDraw.toString()
      ]
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(cell => {
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const timestamp = new Date().toISOString().split('T')[0]
    a.download = `unmatched-matches-${timestamp}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success(`Exported ${matches.length} matches to CSV`)
  }

  return (
    <Card className="max-w-3xl mx-auto mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DownloadSimple className="h-5 w-5" />
          Export Matches to CSV
        </CardTitle>
        <CardDescription>
          Download all your matches as a CSV backup file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={exportToCSV}
          disabled={matches.length === 0}
          className="w-full"
        >
          <DownloadSimple className="h-4 w-4 mr-2" />
          Export {matches.length} Match{matches.length !== 1 ? 'es' : ''} to CSV
        </Button>

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <p><strong>Recommendation:</strong> Export your data regularly as a backup. You can reimport this CSV file if you ever lose your data.</p>
        </div>
      </CardContent>
    </Card>
  )
}
