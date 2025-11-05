import { useKV } from '@github/spark/hooks'
import { useUserData } from '@/hooks/use-user-data'
import { useState, useEffect, useRef } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MatchesTab } from '@/components/matches/MatchesTab'
import { PlayersTab } from '@/components/players/PlayersTab'
import { HeroesTab } from '@/components/heroes/HeroesTab'
import { CollectionTab } from '@/components/collection/CollectionTab'
import { RandomizerTab } from '@/components/randomizer/RandomizerTab'
import { GlobalResultsTab } from '@/components/global/GlobalResultsTab'
import { UserProfile } from '@/components/auth/UserProfile'
import { SignInPrompt } from '@/components/auth/SignInPrompt'
import { DataCleanup } from '@/components/auth/DataCleanup'
import { Toaster } from '@/components/ui/sonner'
import { ListChecks, Users, User, Globe, Shuffle } from '@phosphor-icons/react'
import type { Match } from '@/lib/types'
import { normalizeMatchPlayerNames } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'

type ViewState = 'main' | 'collection'

function App() {
  const [currentUserId, setCurrentUserId] = useKV<string | null>('current-user-id', null)
  const [matches, setMatches] = useUserData<Match[]>('matches', [], currentUserId)
  const [ownedSets, setOwnedSets] = useUserData<string[]>('owned-sets', [], currentUserId)
  const [currentView, setCurrentView] = useState<ViewState>('main')
  const [currentTab, setCurrentTab] = useState('matches')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  const normalizationRan = useRef(false)
  const isMobile = useIsMobile()

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

  const handleHeroClick = (heroId: string) => {
    setSelectedHeroId(heroId)
    setCurrentTab('heroes')
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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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
                Log matches, analyze statistics, and discover perfect matchups
              </p>
            </div>
            <div className="flex items-center gap-4">
              {currentUserId && currentView === 'main' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={navigateToCollection}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Manage Collection
                </Button>
              )}
              {currentUserId && <UserProfile />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!currentUserId ? (
          <SignInPrompt onUserChange={handleUserChange} />
        ) : currentView === 'collection' ? (
          <CollectionTab ownedSets={ownedSetsData} setOwnedSets={setOwnedSets} />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            {!isMobile && (
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="heroes">Heroes</TabsTrigger>
                <TabsTrigger value="global">Global Stats</TabsTrigger>
                <TabsTrigger value="randomizer">Randomizer</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="matches">
              <MatchesTab 
                matches={matchesData} 
                setMatches={setMatches}
                onHeroClick={handleHeroClick}
              />
            </TabsContent>

            <TabsContent value="players">
              <PlayersTab 
                matches={matchesData}
                ownedSets={ownedSetsData}
                onHeroClick={handleHeroClick}
              />
            </TabsContent>

            <TabsContent value="heroes">
              <HeroesTab 
                matches={matchesData} 
                currentUserId={currentUserId}
                initialSelectedHero={selectedHeroId}
                onHeroChange={() => setSelectedHeroId(null)}
              />
            </TabsContent>

            <TabsContent value="global">
              <GlobalResultsTab 
                matches={matchesData} 
                currentUserId={currentUserId}
                onHeroClick={handleHeroClick}
              />
            </TabsContent>

            <TabsContent value="randomizer">
              <RandomizerTab ownedSets={ownedSetsData} matches={matchesData} setMatches={setMatches} />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {isMobile && currentUserId && currentView === 'main' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
          <div className="grid grid-cols-5 h-16">
            <button
              onClick={() => setCurrentTab('matches')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentTab === 'matches' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <ListChecks size={24} weight={currentTab === 'matches' ? 'fill' : 'regular'} />
              <span className="text-xs">Matches</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('players')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentTab === 'players' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Users size={24} weight={currentTab === 'players' ? 'fill' : 'regular'} />
              <span className="text-xs">Players</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('heroes')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentTab === 'heroes' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <User size={24} weight={currentTab === 'heroes' ? 'fill' : 'regular'} />
              <span className="text-xs">Heroes</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('global')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentTab === 'global' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Globe size={24} weight={currentTab === 'global' ? 'fill' : 'regular'} />
              <span className="text-xs">Stats</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('randomizer')}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                currentTab === 'randomizer' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Shuffle size={24} weight={currentTab === 'randomizer' ? 'fill' : 'regular'} />
              <span className="text-xs">Random</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default App
