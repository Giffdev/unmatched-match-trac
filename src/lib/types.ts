export type User = {
  id: string
  email: string
  name: string
  createdAt: string
}

export type GameMode = 'cooperative' | '1v1' | '2v2' | 'ffa3' | 'ffa4'

export type Hero = {
  id: string
  name: string
  set: string
  sidekick?: string
  imageUrl?: string
}

export type Map = {
  id: string
  name: string
  set: string
  minPlayers: number
  maxPlayers: number
  zones: number
  spaces: number
  imageUrl?: string
}

export type SetInfo = {
  name: string
  franchise: string
}

export type PlayerAssignment = {
  playerName: string
  heroId: string
  turnOrder: number
  heroVariant?: string
}

export type Match = {
  id: string
  date: string
  mode: GameMode
  mapId: string
  players: PlayerAssignment[]
  winnerId?: string
  isDraw: boolean
  userId: string
}

export type PlayerStats = {
  playerName: string
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  heroesPlayed: Record<string, number>
  heroWinRates: Record<string, { wins: number; total: number }>
  mapsPlayed: Record<string, number>
  mapWinRates: Record<string, { wins: number; total: number }>
  vsPlayers: Record<string, { wins: number; losses: number; draws: number; total: number }>
}

export type HeroStats = {
  heroId: string
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  vsMatchups: Record<string, { wins: number; total: number }>
}

export type CommunityData = {
  heroStats: Record<string, HeroStats>
  lastUpdated: string
  totalMatches: number
}
