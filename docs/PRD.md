# Unmatched Tracker — Product Requirements Document

**Last Updated:** 2026-04-29  
**Version:** 1.0 (Current State)  
**Live URL:** https://unmatched-tracker.vercel.app

---

## 1. Product Overview

### What is Unmatched Tracker?

Unmatched Tracker is a web-based match logging and statistics platform for players of the **Unmatched** board game. It enables users to:
- Log match results with detailed game information (heroes, maps, players, outcomes)
- Analyze personal statistics (win rates, hero performance, matchups)
- View community-wide statistics across all logged matches
- Share match data with friends via **Game Groups** for collaborative league play
- Discover balanced hero matchups based on historical game data
- Manage their personal game collection (owned sets/heroes)

### Target User

- **Primary:** Casual to competitive Unmatched players who want to track their games and learn from data
- **Secondary:** Board game groups/league organizers managing multi-player match records

### Key Value Propositions

1. **Personal Statistics:** "How's my win rate? Which heroes am I best with?"
2. **Community Insights:** "Which matchups are balanced? What's the meta?"
3. **Group Play:** "Let's pool our group's matches and see who's winning"
4. **No Backend Friction:** Serverless, Firebase-based, no accounts beyond Google Sign-In or email

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Runtime** | Node.js (Vite dev, no backend) | Serverless |
| **Frontend Framework** | React | 19.0.0 |
| **Language** | TypeScript | ~5.7.2 |
| **Build Tool** | Vite | 7.2.7 |
| **Styling** | Tailwind CSS + Framer Motion | 4.1.11 + 12.6.2 |
| **UI Components** | Shadcn UI + Radix UI | Latest |
| **State Management** | React Hooks + TanStack Query | 5.83.1 |
| **Authentication** | Firebase Auth | 11.9.0 |
| **Database** | Cloud Firestore | (GCP-hosted) |
| **Deployment** | Vercel | (manual `npx vercel --prod --yes`) |
| **Testing** | Vitest + happy-dom | 4.1.5 + 20.9.0 |
| **Validation** | Zod | 3.25.76 |
| **Charting** | Recharts | 2.15.1 |
| **Data Viz** | D3 (light use) | 7.9.0 |
| **Icons** | Phosphor + Lucide React | @phosphor-icons/react 2.1.7 + lucide-react 0.484.0 |

---

## 3. Features by Tab

### 3.1 Matches Tab

**Purpose:** Personal match log. Source of truth for user's recorded games.

**Features:**
- **Log Match Dialog** — Multi-step form to add a new match:
  - Game date picker
  - Mode selector (Cooperative, 1v1, 2v2, FFA-3, FFA-4)
  - Map selector (searchable dropdown with player-count display)
  - Player roster builder (add players, assign heroes, set turn order)
  - Hero picker (searchable with Yennefer/Triss variant selection for applicable heroes)
  - Result selector:
    - Competitive: radio buttons for winner (by hero) or draw
    - Cooperative: win/loss radio buttons
  - Optional: assign match to one or more groups
  - Auto-saves via Firestore

- **Edit Match Dialog** — Modify or delete existing matches (same form)
- **Match List** — Displays all personal matches sorted by date (newest first):
  - Match date, mode, players, heroes, winner, map
  - Click to edit or delete
  - Click hero name to jump to Heroes tab

- **Scroll-to-Top** — Navigating tabs resets scroll position (mobile UX fix)
- **Mobile Bottom Nav** — Persistent navigation bar (mobile only)

**Data Source:**
- `users/{userId}/data/matches` (legacy document) **AND**
- `users/{userId}/matches/{matchId}` (subcollection, migration in progress)

---

### 3.2 Players Tab

**Purpose:** Analyze per-player statistics across all matches.

**Features:**
- **Data Context Selector** — Top of tab:
  - "My Data" (default) — personal matches only
  - "Group: {name}" — stats from group's shared match log (if user belongs to groups)
  - Selector only shows if user has ≥1 group membership

- **Player Selector** — Dropdown listing all unique player names from context's match data
  - Auto-populated from matches (no manual entry)

- **Player Statistics Card** — Once player selected, shows:
  - **Overall Stats:** Total games, wins, losses, draws, win rate (%)
  - **Hero Performance:** Which heroes played, win rate per hero, games per hero
  - **Map Performance:** Win rate by map, games per map
  - **Head-to-Head:** Matchup records vs other players (wins/losses/draws)

- **Group Context**: When viewing group stats, shows player leaderboards across all group members' contributed matches

---

### 3.3 Heroes Tab

**Purpose:** Analyze hero-level performance and matchups.

**Features:**
- **Data Context Selector** — Same pattern as Players tab
  - Personal or group context

- **Hero Selector** — Dropdown of all heroes:
  - With hero images (grid view or list)
  - Search by name

- **Hero Stats Card** — Once hero selected, shows:
  - **Overall Performance:** Total games, win rate, wins, losses, draws
  - **Matchup Heatmap:** Win rates vs every other hero (visual grid, color-coded)
  - **Player-Specific Stats** (optional): If hero appears in multiple players' logs, can drill down by player

- **Community Stats** (Personal Context Only):
  - Aggregated across ALL users' public match data (via `collectionGroup` query)
  - Shows "meta" trends: which heroes are balanced, which are overpowered
  - Disabled when viewing group context (group is private)

- **Hero Details:**
  - Hero image, faction, HP, move range, attack type
  - Sidekick count/stats (if applicable)
  - Hero ability title and description

---

### 3.4 Maps Tab

**Purpose:** Map performance analysis — which maps favor which heroes/players.

**Features:**
- **Data Context Selector** — Personal or group context
- **Map Selector** — Dropdown of all maps, with images
- **Map Stats Card** — Once map selected:
  - Total games played on map, win rates by player, win rates by hero
  - Matchup performance (hero A vs hero B on this specific map)

---

### 3.5 Groups Tab

**Purpose:** Create and manage game groups for collaborative match logging.

**Features:**
- **Create Group Dialog:**
  - Group name (e.g., "Tuesday Night Unmatched")
  - Optional group description
  - Auto-saves to `groups/{groupId}` collection
  - Creator becomes group owner

- **Group List:**
  - Cards showing all groups user is a member of
  - Member count, match count, creation date
  - One-tap to enter group details

- **Group View** (when group selected):
  - **Group Info:** Name, member list, match count
  - **Invite Members:**
    - Search by email (queries `users` collection by email)
    - Auto-resolves email → UID
    - Sends invite (stored in `groups/{groupId}/invites/{uid}`)
    - Pending invites shown with badge count
  - **Group Match Log:**
    - All matches logged to this group (subcollection: `groups/{groupId}/matches`)
    - Attribution: "Logged by {player name}"
    - Paginated (default 20 per page)
  - **Group Settings** (Owner only):
    - Edit group name/description
    - View member roles
    - Remove members (soft delete from `memberUids`)
    - Leave group (if not sole owner)

- **Pending Invites:**
  - Displayed at top of Groups tab
  - "You have 3 pending invitations"
  - Accept/Decline for each invite
  - Badge on Groups tab shows count

- **Match Logging to Groups:**
  - Personal matches ALWAYS saved to personal log first
  - User can optionally check boxes to also log to one or more groups
  - Match gets `groupRef: { groupId, groupMatchId }` field (dedup signal)
  - Group copy gets `sourceMatchId` pointing to personal match

---

### 3.6 Randomizer Tab

**Purpose:** Generate random hero pairings for casual play (optional in Group Collections phase).

**Features:**
- **Collection Management:** Select owned sets/heroes to include
- **Match Generator:**
  - Number of players (2, 3, or 4)
  - Mode selector
  - Generate random hero assignments
  - Can randomize multiple times before committing
- **Quick Logging:** "Log this match" button to fast-track generated matches to personal log

---

### 3.7 Collection Tab (Accessed via "Manage Collection" button in header)

**Purpose:** Manage which sets and heroes user owns.

**Features:**
- **Set Selector:** Browse all available Unmatched sets
- **Hero Selector:** Within each set, toggle which heroes are owned
- **Owned Heroes Count:** Display owned vs. total available
- **Import/Export:** (Optional) CSV export of owned collection
- **Firestore Storage:** Stored at `users/{userId}/data/owned-sets`

---

## 4. Cross-Cutting Features

### 4.1 Authentication & Authorization

- **Methods:** Google Sign-In + Email/Password
- **Firestore Rules:** 
  - Users can only write their own match data
  - Users can only read their own personal data (unless shared via group)
  - Match data is publicly readable (for community stats) — via security rules allowing read on `users/{userId}/data/matches`
  - Groups are member-gated: only users in `memberUids[]` can read/write

- **User Profile:**
  - Display name
  - Email address
  - Created date
  - Auth provider (email vs Google)

### 4.2 Mobile Responsiveness

- **Bottom Navigation:** 6-tab fixed nav on mobile (Matches, Players, Heroes, Maps, Groups, Randomizer)
- **Responsive Typography:** Headings and text scale for small screens
- **Touch-Friendly:** Button/tap targets ≥44px
- **Data Context Selector:** Compact pill design on narrow screens
- **Scroll-to-Top:** iOS Safari quirk fix (window.scrollTo + document.documentElement.scrollTop + document.body.scrollTop)

### 4.3 Data Context Selector (Per-Tab)

- **Component:** `DataContextSelector` (Shadcn Select)
- **Behavior:** Available on Players, Heroes, Maps tabs when user has ≥1 group
  - Switches stats calculation to group matches instead of personal
  - Does NOT affect Matches tab (keeps personal log pure)
  - Does NOT affect Community stats (stays private)
- **State:** Persisted per-tab in React state (lives in App.tsx)

### 4.4 Error Boundaries

- **Per-Tab Isolation:** Each tab wrapped in `ErrorBoundary` (top-level + per-tab)
- **Fallback UI:** "Something went wrong in [Tab Name]. Please try refreshing the page."
- **Privacy:** Errors logged to console, not exposed to user

### 4.5 Toast Notifications

- **Library:** Sonner (toast notifications)
- **Use Cases:**
  - Match saved/updated/deleted
  - Invite sent/accepted/declined
  - Import completed
  - Firestore errors (network, permissions, etc.)

### 4.6 Dark Mode Support

- **Library:** next-themes
- **System Preference:** Defaults to OS dark/light mode
- **Toggle:** Available in user profile menu (if implemented)

### 4.7 Sign-In Flow

- **Unauthenticated View:** `SignInPrompt` component
  - "Sign in with Google" button
  - "Sign in with Email" form
  - Recovery/password reset links

- **Post-Sign-In:** Main app loads with user's match data

### 4.8 Data Cleanup

- **Component:** `DataCleanup` (runs on mount)
- **Purpose:** Validates and normalizes existing matches (e.g., hero IDs, player names)
- **Safety:** Checks before updating; only commits if changes detected

---

## 5. Data Model

### 5.1 Firestore Collections

#### `users/{userId}`
```
{
  email: string
  displayName?: string
  playerName?: string
  createdAt: Timestamp
  authProvider: 'email' | 'google'
}
```

#### `users/{userId}/data/matches` (Legacy Document)
```
{
  matches: Match[]  // Array of match objects
}
```

#### `users/{userId}/matches/{matchId}` (Subcollection — Phase 1-2, Migration In Progress)
```
{
  date: string (YYYY-MM-DD)
  mode: 'cooperative' | '1v1' | '2v2' | 'ffa3' | 'ffa4'
  mapId: string
  players: PlayerAssignment[]
  winnerId?: string (hero ID of winner)
  isDraw: boolean
  userId: string
  cooperativeResult?: 'win' | 'loss'
  groupRef?: { groupId: string; groupMatchId: string }
}
```

#### `users/{userId}/data/owned-sets`
```
{
  sets: string[]  // Array of set names user owns
}
```

#### `users/{userId}/profile` (Optional future use)
```
{
  playerName: string
  displayName: string
  bio?: string
  avatarUrl?: string
}
```

#### `groups/{groupId}`
```
{
  groupName: string
  description?: string
  createdAt: Timestamp
  ownerId: string
  memberUids: string[]  // For security rule enforcement
}
```

#### `groups/{groupId}/members/{userId}`
```
{
  userId: string
  displayName: string
  role: 'owner' | 'member'
  joinedAt: Timestamp
}
```

#### `groups/{groupId}/matches/{matchId}`
```
{
  date: string
  mode: GameMode
  mapId: string
  players: PlayerAssignment[]
  winnerId?: string
  isDraw: boolean
  loggedBy: string  // Display name of user who logged
  loggedByUid: string
  sourceMatchId?: string  // Back-reference to personal match (if logged to personal first)
  groupId: string
}
```

#### `groups/{groupId}/invites/{userId}`
```
{
  invitedAt: Timestamp
  invitedBy: string  // Display name
  invitedByUid: string
  status: 'pending' | 'accepted' | 'declined'
}
```

#### `users` (Public Directory, for invite lookup)
```
{
  email: string
  displayName?: string
  uid: string
}
```

### 5.2 Type System

**Key Types (TypeScript):**

```typescript
type Match = {
  id: string
  date: string  // YYYY-MM-DD
  mode: GameMode
  mapId: string
  players: PlayerAssignment[]
  winnerId?: string
  isDraw: boolean
  userId: string
  cooperativeResult?: 'win' | 'loss'
  groupRef?: { groupId: string; groupMatchId: string }
}

type GameMode = 'cooperative' | '1v1' | '2v2' | 'ffa3' | 'ffa4'

type PlayerAssignment = {
  playerName: string
  heroId: string
  turnOrder: number
  heroVariant?: string  // e.g., 'yennefer-or-triss'
}

type Hero = {
  id: string
  name: string
  set: string
  hp: number
  move: number
  attack: 'MELEE' | 'RANGED'
  sidekicks?: Sidekick[]
  imageUrl?: string
  abilityTitle?: string
  abilityDescription?: string
}

type Map = {
  id: string
  name: string
  set: string
  minPlayers: number
  maxPlayers: number
  zones?: number
  spaces?: number
  imageUrl?: string
}

type PlayerStats = {
  playerName: string
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number  // percentage
  heroesPlayed: Record<string, number>
  heroWinRates: Record<string, { wins: number; total: number }>
  mapsPlayed: Record<string, number>
  mapWinRates: Record<string, { wins: number; total: number }>
  vsPlayers: Record<string, { wins: number; losses: number; draws: number; total: number }>
}

type HeroStats = {
  heroId: string
  totalGames: number
  wins: number
  losses: number
  draws: number
  winRate: number
  vsMatchups: Record<string, { wins: number; total: number }>
}
```

---

## 6. Architecture

### 6.1 App Structure

```
src/
├── App.tsx                          # Main tab router + state
├── components/
│   ├── auth/                        # Auth UI (SignIn, UserProfile, DataCleanup)
│   ├── matches/                     # Matches tab (LogMatchDialog, EditMatchDialog, MatchCard)
│   ├── players/                     # Players tab (player selector, stats display)
│   ├── heroes/                      # Heroes tab (hero selector, matchup heatmap)
│   ├── maps/                        # Maps tab
│   ├── groups/                      # Groups tab (create, invite, match log)
│   ├── randomizer/                  # Randomizer tab
│   ├── collection/                  # Collection management (Manage Collection view)
│   ├── shared/                      # Reusable components (DataContextSelector, MapSelector, HeroSelector, etc.)
│   ├── ui/                          # Shadcn UI components (Button, Dialog, Select, etc.)
│   └── ErrorBoundary.tsx            # React error boundary wrapper
├── hooks/
│   ├── use-auth.ts                  # Firebase Auth (useAuth)
│   ├── use-user-data.ts             # useUserMatches, useUserOwnedSets (Firestore sync)
│   ├── use-groups.ts                # useGroups, usePendingInvites
│   ├── use-group-matches.ts         # useGroupMatches (paginated group match list)
│   ├── use-group-members.ts         # useGroupMembers
│   ├── use-mobile.ts                # useIsMobile (media query hook)
│   └── useGroupMatches.ts           # (older, may be deprecated)
├── lib/
│   ├── types.ts                     # TypeScript interfaces (Match, Hero, etc.)
│   ├── stats.ts                     # calculatePlayerStats, calculateHeroStats
│   ├── firestore.ts                 # Firestore CRUD (getUserMatches, setUserMatches, etc.)
│   ├── groups.ts                    # Group management (createGroup, addMatchToGroups, etc.)
│   ├── group-invites.ts             # Invite logic (sendInvite, acceptInvite, etc.)
│   ├── group-matches.ts             # Group match queries (getGroupMatches, etc.)
│   ├── group-types.ts               # Group-specific types
│   ├── firebase.ts                  # Firebase app init
│   ├── data.ts                      # Hero/Map data (static)
│   ├── utils.ts                     # Utility functions (normalizeHeroId, etc.)
│   ├── user-discovery.ts            # Email → UID resolution
│   └── __tests__/                   # Vitest test files (utils.test.ts, stats.test.ts, firestore.test.ts)
└── vite.config.ts, tsconfig.json, etc.
```

### 6.2 Tab-Based SPA (No Router)

- **Navigation Model:** React state (`currentTab: string`)
- **No URL Routing:** Tabs are client-side state, not URL params
- **Mobile Bottom Nav:** 6 sticky buttons (mobile only)
- **Desktop Tab List:** Horizontal tab bar (desktop only)
- **Switching Behavior:** Instant switch, scroll-to-top, state preserved

### 6.3 State Management

- **Auth State:** Firebase AuthState, managed by `useAuth` hook
- **Match Data:** React Query-like approach:
  - `useUserMatches()` hook fetches from Firestore, maintains in-memory state
  - `setMatches()` updater function writes to Firestore
  - Auto-sync: changes propagate in real-time via Firestore listener

- **Tab State:** Local React state in `App.tsx`:
  - `currentTab` (string)
  - `playersContext` / `heroesContext` (per-tab group selection)
  - `selectedHeroId` (for hero navigation)

- **Group State:**
  - `useGroups()` — fetches user's groups
  - `usePendingInvites()` — fetches pending invites
  - `useGroupMatches()` — fetches group's match log (paginated)

### 6.4 Firestore Integration

- **Dual-Write Phase:** In-progress migration to subcollection model
  - **Legacy:** `users/{userId}/data/matches` (single document, array field)
  - **New:** `users/{userId}/matches/{matchId}` (subcollection, one doc per match)
  - **Current behavior:** Both written simultaneously for safety
  - **Reads:** Still from legacy document (Phase 3-4 will switch to subcollection)

- **Optimization:** Diff-based sync minimizes write operations
- **Batching:** Group writes batched in chunks (< 500 ops/batch limit)

---

## 7. Recent Additions & Milestones

### 7.1 Game Groups System (Latest)

**What's New:**
- **Create Groups:** Users can create named groups (e.g., "Tuesday League")
- **Invite Members:** Email-based invite flow (auto-resolve to UID)
- **Group Match Log:** Shared subcollection for collaborative logging
- **Shared Stats:** Players/Heroes/Maps tabs can switch to group context via selector
- **Match Attribution:** Group matches show "Logged by {player}"
- **Deduplication:** Personal matches get `groupRef` field when also saved to group; group matches get `sourceMatchId`

**Phasing:**
- Phase 1 (Done): Group creation, invites, group match list, member management
- Phase 2 (In Progress): Data context selector for Players/Heroes/Maps tabs
- Phase 3 (Planned): Backfill and validation of group data
- Phase 4 (Planned): Community stats refinement for group privacy

### 7.2 Firestore Subcollection Migration (In Progress)

**What Changed:**
- Legacy: All matches stored in single `users/{userId}/data/matches` document (1MB limit issues at ~500+ matches)
- New: Individual match documents in `users/{userId}/matches/{matchId}` subcollection
- **Safety Mechanism:** Dual-write phase (write to both simultaneously), lazy migration on login
- **No Breaking Changes:** Default behavior unchanged for all users until Phase 4

### 7.3 Shared Component Extraction (Recent)

**Refactoring:**
- Extracted 4 reusable components from Match dialogs:
  - `MapSelector` — Searchable combobox with player-count display
  - `HeroSelector` — Searchable with variant picker
  - `PlayerCard` — Player row (name + hero selector + remove)
  - `MatchResultSection` — Competitive vs cooperative result handling
- **Impact:** ~60% code duplication eliminated across `LogMatchDialog` and `EditMatchDialog`

### 7.4 Error Boundaries (Implemented)

- Per-tab error isolation (6 ErrorBoundary wraps)
- Friendly fallback UI ("Something went wrong...")
- Prevents white-screen crashes

### 7.5 Test Infrastructure (Implemented)

- **Framework:** Vitest + happy-dom
- **Coverage:** 67 tests covering:
  - `utils.ts` — 20 tests (normalization, validation)
  - `stats.ts` — 34 tests (calculations)
  - `firestore.ts` — 13 tests (data validation)
- **Scripts:** `npm test`, `npm run test:watch`, `npm run test:coverage`

---

## 8. Known Issues & Backlog

### P1 — Critical (Action Required)

*From decisions.md:*

1. **Firestore 1MB Document Size Limit**
   - Issue: Single-document model reaches 1MB at ~1000 matches (safe ceiling: 500)
   - Status: Subcollection migration in Phase 1-2
   - Action: Monitor and complete Phase 3-4 (read switch, legacy cleanup)

### P2 — High (Next Quarter)

1. **Hardcoded Password Removal** ✅ DONE (no longer in codebase)
2. **Group Feature QA Issues** (noted in decisions.md as HOLD state):
   - `loadMore` pagination duplicates matches
   - `deleteGroup` can exceed batch limit
   - `acceptInvite` non-atomic (state consistency risk)
   - `addMatchToGroups` sequential with no rollback
   - **Action:** Code review + atomic transaction refactoring before shipping

3. **State Refresh Issues** (user directive):
   - Groups feature state not refreshing after import/deletion
   - **Action:** Ensure all group mutations call `refetch()` hooks

### P3 — Medium (Later)

1. **Sidebar Size** — 672 lines, consider extracting sub-components
2. **Stats Memoization** — Optimize hero stat calculations for large datasets
3. **CSV Import Validation** — Extract validation logic into dedicated module
4. **Hero Lookup Performance** — Index hero lookups if perf degrades

---

## 9. Deployment

### 9.1 Environment

- **Hosting:** Vercel (serverless)
- **Database:** Cloud Firestore (GCP)
- **CDN:** Vercel's global CDN (auto)
- **SSL:** Automatic (vercel.app domain)

### 9.2 Build Process

```bash
# Development
npm run dev                          # Local Vite dev server (http://localhost:5173)

# Production Build
npm run build                        # Compile TypeScript, bundle with Vite
npm run preview                      # Local preview of production build

# Testing
npm test                             # Run Vitest (CI mode)
npm run test:watch                   # Watch mode
npm run test:coverage                # Coverage report

# Linting
npm run lint                         # ESLint check

# Manual Deploy
npx vercel --prod --yes              # Deploy to production (must run in repo root)
```

### 9.3 Deployment Checklist

- ✅ `npm run build` succeeds
- ✅ `npm test` passes (all tests green)
- ✅ `npm run lint` clean
- ✅ TypeScript compiles (`npx tsc --noEmit`)
- ✅ Firestore rules validated (apply via Firebase Console)
- ✅ `.env.local` configured (Firebase config)
- ⚠️ **Critical:** Never break live site or user data

### 9.4 Firestore Security Rules (Applied)

**Hybrid Model (Option C):**
- Public read on match data only (for community stats, non-authed users)
- Authenticated write for match ownership
- Member-gated read/write for group data

---

## 10. Performance & Safety Constraints

### 10.1 Data Integrity

- **Core Principle:** Never break live site or corrupt user data
- **Match Data Validation:** `validateMatch()` filters malformed entries, logs warnings
- **Undefined Stripping:** `stripUndefined()` prevents Firestore serialization errors
- **Atomic Writes:** Group operations use `writeBatch()` to keep `memberUids[]` and member subcollection in sync
- **Dual-Write Safety:** Legacy writes succeed before subcollection writes (best-effort)

### 10.2 Performance Targets

- **LCP (Largest Contentful Paint):** <3s (typical user, <100 matches)
- **FID (First Input Delay):** <100ms (instant UI feedback)
- **Stats Calculation:** <5ms for <500 matches (on-the-fly, not pre-computed)
- **Page Load:** ~2-3s over 4G (Vite optimized bundle, code split via lazy imports)

### 10.3 Firestore Costs (Typical User)

- **Reads:** ~100/week (login, fetch personal matches, view community)
- **Writes:** ~5/week (logging matches)
- **Estimated Cost:** $0.002-0.01/month per user

---

## 11. Future Roadmap (Not Committed)

### Phase 3: Group Data Completeness
- Backfill and validation of group match subcollections
- Switch reads from legacy to subcollection model
- Cleanup: deprecate legacy doc writes

### Phase 4: Community Stats Refinement
- Public group stats (opt-in, privacy-first)
- "Compare group meta to community meta"
- Group leaderboards

### Phase 5: Advanced Features (Nice-to-Have)
- **Share Match Logs** — Viewer list for granular access control
- **Match Comments** — Post-game discussion threads
- **Replay/Analysis** — Turn-by-turn breakdown
- **Notifications** — New group matches, invite reminders
- **Mobile App** — React Native wrapper (if scale demands)

---

## 12. Team Responsibilities

| Role | Responsibility |
|------|-----------------|
| **Ripley (Lead)** | Architecture decisions, code review, safety gates, data integrity oversight |
| **Dallas (Frontend Dev)** | Component development, UX refinement, mobile polish |
| **Hicks (Full-Stack)** | Firestore operations, group backend logic, performance optimization |
| **Lambert (Tester)** | QA, test coverage, edge case validation, user acceptance testing |

---

## 13. Support & Contact

- **Live URL:** https://unmatched-tracker.vercel.app
- **Repository:** Giffdev/unmatched-match-trac (GitHub)
- **Firestore Console:** Firebase → Project: unmatched-tracker
- **Deployment:** Vercel Dashboard (Giffdev account)

---

**Document Version History:**
- **v1.0** (2026-04-29) — Initial comprehensive PRD based on current production state

---

*This document is the source of truth for what the Unmatched Tracker app does TODAY. Aspirational features are tracked separately in the Backlog section or in decision documents. Always update this PRD when significant features are added or removed.*
