import { useAuth } from '@/hooks/use-auth'
import { useUserMatches, useUserOwnedSets } from '@/hooks/use-user-data'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { MatchesTab } from '@/components/matches/MatchesTab'
import { PlayersTab } from '@/components/players/PlayersTab'
import { HeroesTab } from '@/components/heroes/HeroesTab'
import { CollectionTab } from '@/components/collection/CollectionTab'
import { RandomizerTab } from '@/components/randomizer/RandomizerTab'
import { MapsTab } from '@/components/maps/MapsTab'
import { GroupsTab } from '@/components/groups/GroupsTab'
import { UserProfile } from '@/components/auth/UserProfile'
import { SignInPrompt } from '@/components/auth/SignInPrompt'
import { DataCleanup } from '@/components/auth/DataCleanup'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Toaster } from '@/components/ui/sonner'
import { ListChecks, Users, User, Shuffle, MapTrifold, UsersThree } from '@phosphor-icons/react'
import { usePendingInvites, useGroups } from '@/hooks/use-groups'
import { useGroupMatches } from '@/hooks/use-group-matches'
import type { Match } from '@/lib/types'
import { normalizeMatchPlayerNames } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'


type ViewState = 'main' | 'collection'

function App() {
  const { user, loading } = useAuth()
  const currentUserId = user?.uid ?? null
  const { matches, setMatches, loading: matchesLoading } = useUserMatches(currentUserId)
  const { ownedSets, setOwnedSets } = useUserOwnedSets(currentUserId)
  const [currentView, setCurrentView] = useState<ViewState>('main')
  const [currentTab, setCurrentTab] = useState('matches')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)
  const normalizationRan = useRef(false)
  const isMobile = useIsMobile()
  const { count: pendingInviteCount } = usePendingInvites(currentUserId)
  const { groups: userGroups } = useGroups(currentUserId)

  // Per-tab data context: 'personal' or a groupId
  const [playersContext, setPlayersContext] = useState<string>('personal')
  const [heroesContext, setHeroesContext] = useState<string>('personal')

  // Fetch group matches when a group is selected
  const { matches: playersGroupMatches } = useGroupMatches(playersContext !== 'personal' ? playersContext : null)
  const { matches: heroesGroupMatches } = useGroupMatches(heroesContext !== 'personal' ? heroesContext : null)

  // Build group list for selector
  const groupOptions = useMemo(() => userGroups.map(g => ({ id: g.groupId, name: g.groupName })), [userGroups])

  // Build dataSource objects for tabs when in group context
  const playersDataSource = useMemo(() => {
    if (playersContext === 'personal') return undefined
    const group = userGroups.find(g => g.groupId === playersContext)
    return { label: group?.groupName || 'Group', matches: playersGroupMatches as Match[] }
  }, [playersContext, playersGroupMatches, userGroups])

  const heroesDataSource = useMemo(() => {
    if (heroesContext === 'personal') return undefined
    const group = userGroups.find(g => g.groupId === heroesContext)
    return { label: group?.groupName || 'Group', matches: heroesGroupMatches as Match[] }
  }, [heroesContext, heroesGroupMatches, userGroups])


  const matchesData = matches || []
  const ownedSetsData = ownedSets || []

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

  const handleImportMatches = (newMatches: Match[]) => {
    setMatches((currentMatches) => [...(currentMatches || []), ...newMatches])
  }

  const handleReplaceAllMatches = async () => {
    if (!currentUserId) return
    const confirmation = prompt('This will REPLACE ALL your matches. Type "REPLACE ALL" to confirm:')
    if (confirmation !== 'REPLACE ALL') {
      if (confirmation !== null) alert('Import cancelled — confirmation text did not match.')
      return
    }
    try {
      const { getImportMatchesV2 } = await import('@/lib/import-matches-v2')
      const newMatches = getImportMatchesV2().map(m => ({ ...m, userId: currentUserId }))
      setMatches(() => newMatches)
      alert(`Replaced all matches with ${newMatches.length} matches`)
    } catch (err) {
      alert('Import failed: ' + err)
    }
  }

  // Scroll to top when switching tabs (fixes mobile nav not resetting scroll position)
  // On iOS Safari, window.scrollTo alone may not work — the actual scroll element
  // can be document.documentElement or document.body depending on the browser.
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    document.documentElement.scrollTop = 0
    document.body.scrollTop = 0
  }, [currentTab])

  useEffect(() => {
    const normalizeExistingMatches = async () => {
      if (normalizationRan.current) return
      if (!currentUserId || matchesLoading) return
      if (!matchesData || matchesData.length === 0) return
      
      normalizationRan.current = true
      
      const normalizedMatches = matchesData.map(normalizeMatchPlayerNames)
      const hasChanges = JSON.stringify(matchesData) !== JSON.stringify(normalizedMatches)
      
      if (hasChanges) {
        console.log('Normalizing player names and hero IDs in existing matches...')
        setMatches(() => normalizedMatches)
      }
    }
    
    normalizeExistingMatches()
  }, [currentUserId, matchesData.length, matchesLoading])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      <Toaster />
      <DataCleanup />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div 
              className={`flex-1 min-w-0 ${currentView === 'collection' ? 'cursor-pointer' : ''}`}
              onClick={currentView === 'collection' ? navigateToMain : undefined}
            >
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-foreground truncate">
                Unmatched Tracker
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1 hidden sm:block">
                Log matches, analyze statistics, and discover perfect matchups
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              {currentUserId && currentView === 'main' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={navigateToCollection}
                  className="text-muted-foreground hover:text-foreground text-xs md:text-sm px-2 md:px-4"
                >
                  <span className="hidden sm:inline">Manage Collection</span>
                  <span className="sm:hidden">Collection</span>
                </Button>
              )}
              {currentUserId && <UserProfile onImportMatches={handleImportMatches} />}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6">
        <ErrorBoundary fallbackTitle="Something went wrong">
        {!currentUserId ? (
          <SignInPrompt />
        ) : currentView === 'collection' ? (
          <CollectionTab
            ownedSets={ownedSetsData} 
            setOwnedSets={setOwnedSets}
            onBack={navigateToMain}
          />
        ) : (
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            {!isMobile && (
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="matches">Matches</TabsTrigger>
                <TabsTrigger value="players">Players</TabsTrigger>
                <TabsTrigger value="heroes">Heroes</TabsTrigger>
                <TabsTrigger value="maps">Maps</TabsTrigger>
                <TabsTrigger value="groups" className="relative">
                  Groups
                  {pendingInviteCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center">
                      {pendingInviteCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="randomizer">Randomizer</TabsTrigger>
              </TabsList>
            )}

            <TabsContent value="matches">
              <ErrorBoundary fallbackTitle="Something went wrong in Matches">
                <MatchesTab 
                  matches={matchesData} 
                  setMatches={setMatches}
                  onHeroClick={handleHeroClick}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="players">
              <ErrorBoundary fallbackTitle="Something went wrong in Players">
                <PlayersTab 
                  matches={matchesData}
                  ownedSets={ownedSetsData}
                  onHeroClick={handleHeroClick}
                  dataSource={playersDataSource}
                  groups={groupOptions}
                  dataContext={playersContext}
                  onDataContextChange={setPlayersContext}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="heroes">
              <ErrorBoundary fallbackTitle="Something went wrong in Heroes">
                <HeroesTab 
                  matches={matchesData} 
                  currentUserId={currentUserId}
                  initialSelectedHero={selectedHeroId}
                  onHeroChange={() => setSelectedHeroId(null)}
                  dataSource={heroesDataSource}
                  groups={groupOptions}
                  dataContext={heroesContext}
                  onDataContextChange={setHeroesContext}
                />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="maps">
              <ErrorBoundary fallbackTitle="Something went wrong in Maps">
                <MapsTab matches={matchesData} />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="groups">
              <ErrorBoundary fallbackTitle="Something went wrong in Groups">
                <GroupsTab />
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="randomizer">
              <ErrorBoundary fallbackTitle="Something went wrong in Randomizer">
                <RandomizerTab ownedSets={ownedSetsData} matches={matchesData} setMatches={setMatches} />
              </ErrorBoundary>
            </TabsContent>
          </Tabs>
        )}
        </ErrorBoundary>
      </main>

      {isMobile && currentUserId && currentView === 'main' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-20">
          <div className="grid grid-cols-6 h-14">
            <button
              onClick={() => setCurrentTab('matches')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'matches' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <ListChecks size={20} weight={currentTab === 'matches' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Matches</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('players')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'players' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Users size={20} weight={currentTab === 'players' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Players</span>
            </button>
            
            <button
              onClick={() => setCurrentTab('heroes')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'heroes' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <User size={20} weight={currentTab === 'heroes' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Heroes</span>
            </button>

            <button
              onClick={() => setCurrentTab('maps')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'maps' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <MapTrifold size={20} weight={currentTab === 'maps' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Maps</span>
            </button>

            <button
              onClick={() => setCurrentTab('groups')}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'groups' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <UsersThree size={20} weight={currentTab === 'groups' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Groups</span>
              {pendingInviteCount > 0 && (
                <span className="absolute top-1 right-1/4 w-2 h-2 bg-destructive rounded-full" />
              )}
            </button>
            
            <button
              onClick={() => setCurrentTab('randomizer')}
              className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                currentTab === 'randomizer' 
                  ? 'text-primary' 
                  : 'text-muted-foreground'
              }`}
            >
              <Shuffle size={20} weight={currentTab === 'randomizer' ? 'fill' : 'regular'} />
              <span className="text-[10px] leading-tight">Random</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  )
}

export default App
