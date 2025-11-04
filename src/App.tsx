import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchesTab } from '@/components/matches/MatchesTab'
import { PlayersTab } from '@/components/players/PlayersTab'
import { HeroesTab } from '@/components/heroes/HeroesTab'
import { CollectionTab } from '@/components/collection/CollectionTab'
import { RandomizerTab } from '@/components/randomizer/RandomizerTab'
import { Toaster } from '@/components/ui/sonner'
import type { Match } from '@/lib/types'

function App() {
  const [matches] = useKV<Match[]>('matches', [])
  const [ownedSets] = useKV<string[]>('owned-sets', [])
  const [, setMatches] = useKV<Match[]>('matches', [])
  const [, setOwnedSets] = useKV<string[]>('owned-sets', [])

  const matchesData = matches || []
  const ownedSetsData = ownedSets || []

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Unmatched Tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Log matches, analyze statistics, and discover perfect matchups
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="matches" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="heroes">Heroes</TabsTrigger>
            <TabsTrigger value="collection">Collection</TabsTrigger>
            <TabsTrigger value="randomizer">Randomizer</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <MatchesTab matches={matchesData} setMatches={setMatches} />
          </TabsContent>

          <TabsContent value="players">
            <PlayersTab matches={matchesData} />
          </TabsContent>

          <TabsContent value="heroes">
            <HeroesTab matches={matchesData} />
          </TabsContent>

          <TabsContent value="collection">
            <CollectionTab ownedSets={ownedSetsData} setOwnedSets={setOwnedSets} />
          </TabsContent>

          <TabsContent value="randomizer">
            <RandomizerTab ownedSets={ownedSetsData} matches={matchesData} setMatches={setMatches} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
