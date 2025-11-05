import { useKV } from '@github/spark/hooks'
import { useUserData } from '@/hooks/use-user-data'
import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MatchesTab } from '@/components/matches/MatchesTab'
import { PlayersTab } from '@/components/players/PlayersTab'
import { HeroesTab } from '@/components/heroes/HeroesTab'
import { CollectionTab } from '@/components/collection/CollectionTab'
import { RandomizerTab } from '@/components/randomizer/RandomizerTab'
import { UserProfile } from '@/components/auth/UserProfile'
import { SignInPrompt } from '@/components/auth/SignInPrompt'
import { DataCleanup } from '@/components/auth/DataCleanup'
import { Toaster } from '@/components/ui/sonner'
import type { Match } from '@/lib/types'
import { normalizeMatchPlayerNames } from '@/lib/utils'

type ViewState = 'main' | 'collection'

function App() {
  const [currentUserId, setCurrentUserId] = useKV<string | null>('current-user-id', null)
  const [matches, setMatches] = useUserData<Match[]>('matches', [], currentUserId)
  const [ownedSets, setOwnedSets] = useUserData<string[]>('owned-sets', [], currentUserId)
  const [currentView, setCurrentView] = useState<ViewState>('main')
  const normalizationRan = useRef(false)

  const matchesData = matches || []
  const ownedSetsData = ownedSets || []

  const handleUserChange = async (userId: string) => {
    setCurrentUserId(userId)
  }

  const navigateToCollection = () => {
    setCurrentView('collection')
  }

  const navigateToMain = () => {
    setCurrentView('main')
  }

  useEffect(() => {
    const normalizeExistingMatches = async () => {
      if (normalizationRan.current) return
      if (!currentUserId) return
      if (!matchesData || matchesData.length === 0) return
      
      normalizationRan.current = true
      
      const normalizedMatches = matchesData.map(normalizeMatchPlayerNames)
      const hasChanges = JSON.stringify(matchesData) !== JSON.stringify(normalizedMatches)
      
      if (hasChanges) {
        console.log('Normalizing player names in existing matches...')
        setMatches(normalizedMatches)
      }
    }
    
    normalizeExistingMatches()
  }, [currentUserId, matchesData.length])

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <DataCleanup />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div 
              className={currentView === 'collection' ? 'cursor-pointer' : ''}
              onClick={currentView === 'collection' ? navigateToMain : undefined}
            >
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Unmatched Tracker
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {currentView === 'collection' 
                  ? 'Click title to return to main view'
                  : 'Log matches, analyze statistics, and discover perfect matchups'
                }
              </p>
            </div>
            <UserProfile onNavigateToCollection={navigateToCollection} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!currentUserId ? (
          <SignInPrompt onUserChange={handleUserChange} />
        ) : currentView === 'collection' ? (
          <CollectionTab ownedSets={ownedSetsData} setOwnedSets={setOwnedSets} />
        ) : (
          <Tabs defaultValue="matches" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="matches">Matches</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="heroes">Heroes</TabsTrigger>
              <TabsTrigger value="randomizer">Randomizer</TabsTrigger>
            </TabsList>

            <TabsContent value="matches">
              <MatchesTab 
                matches={matchesData} 
                setMatches={setMatches}
              />
            </TabsContent>

            <TabsContent value="players">
              <PlayersTab matches={matchesData} />
            </TabsContent>

            <TabsContent value="heroes">
              <HeroesTab matches={matchesData} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="randomizer">
              <RandomizerTab ownedSets={ownedSetsData} matches={matchesData} setMatches={setMatches} />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}

export default App
