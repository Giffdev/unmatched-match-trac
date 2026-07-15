import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartBar, MagnifyingGlass, GridFour } from '@phosphor-icons/react'
import { GlobalStats } from '@/components/auth/GlobalStats'
import { PublicHeroBrowser } from '@/components/auth/PublicHeroBrowser'
import { PublicHeatmap } from '@/components/auth/PublicHeatmap'

export function CommunityTab() {
  const [currentTab, setCurrentTab] = useState('stats')
  const [selectedHeroId, setSelectedHeroId] = useState<string | null>(null)

  // Scroll to top when switching sub-tabs (consistent with rest of app)
  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
    })
  }, [currentTab])

  const handleHeroClick = (heroId: string) => {
    setSelectedHeroId(heroId)
    setCurrentTab('heroes')
  }

  return (
    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4 md:mb-6 h-auto p-1">
        <TabsTrigger value="stats" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
          <ChartBar size={16} className="shrink-0" />
          <span className="hidden sm:inline">Community Stats</span>
          <span className="sm:hidden">Stats</span>
        </TabsTrigger>
        <TabsTrigger value="heroes" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
          <MagnifyingGlass size={16} className="shrink-0" />
          <span className="hidden sm:inline">Hero Browser</span>
          <span className="sm:hidden">Heroes</span>
        </TabsTrigger>
        <TabsTrigger value="heatmap" className="text-xs md:text-sm gap-1.5 md:gap-2 py-2 px-2 md:px-3">
          <GridFour size={16} className="shrink-0" />
          <span className="hidden sm:inline">Matchup Heatmap</span>
          <span className="sm:hidden">Heatmap</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        <GlobalStats />
      </TabsContent>

      <TabsContent value="heroes">
        <PublicHeroBrowser selectedHeroId={selectedHeroId} />
      </TabsContent>

      <TabsContent value="heatmap">
        <PublicHeatmap onHeroClick={handleHeroClick} />
      </TabsContent>
    </Tabs>
  )
}
