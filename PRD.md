# Unmatched Tracker — Product Requirements Document

A web application for tracking Unmatched board game matches, analyzing player and hero statistics, and generating balanced matchups using community-aggregated data.

**Live URL**: https://unmatched-tracker.vercel.app

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.0.0 |
| Language | TypeScript | ~5.7.2 |
| Build | Vite | 7.2.7 |
| UI Components | Shadcn UI (Radix primitives) | v1.x |
| CSS | Tailwind CSS | 4.1.11 |
| CSS Plugins | @tailwindcss/container-queries | 0.1.1 |
| Icons | Phosphor Icons, Lucide React, Heroicons | 2.1.7, 0.484.0, 2.2.0 |
| Charts | Recharts + D3.js | 2.15.1, 7.9.0 |
| Animation | Framer Motion | 12.6.2 |
| Auth | Firebase Auth | 11.9.0 |
| Database | Cloud Firestore | 11.9.0 |
| Hosting | Vercel (serverless) | - |
| Notifications | Sonner (toasts) | 2.0.1 |
| Data Fetching | @tanstack/react-query | 5.83.1 |
| Form Handling | React Hook Form | 7.54.2 |
| Validation | Zod | 3.25.76 |
| Utilities | date-fns, uuid, clsx, tailwind-merge | 3.6.0, 11.1.0, 2.1.1, 3.0.2 |
| Testing | Vitest, @testing-library/react, happy-dom | 4.1.5, 16.3.2, 20.9.0 |
| Firestore Rules Testing | @firebase/rules-unit-testing | 4.0.1 |
| Linting | ESLint | 9.28.0 |

## Game Data

- **Heroes**: 76+ playable characters across 26 sets
- **Maps**: 34+ unique boards (varying player counts, zones, spaces)
- **Franchises**: Battle of Legends, Marvel (multiple sets), The Witcher, Jurassic Park, TMNT, Bruce Lee, Muhammad Ali, Buffy, Shakespeare, and more
- **Game Modes**: Cooperative, 1v1, 2v2, 3-player FFA, 4-player FFA

## Architecture

**Navigation**: Tab-based SPA (no router). 6 primary tabs:
1. **Matches** — Log, edit, delete personal matches
2. **Players** — Player stats and head-to-head records
3. **Heroes** — Hero browser, matchup heatmap, community stats
4. **Maps** — Map performance breakdown, user vs. community comparison
5. **Randomizer** — True random or balanced matchup suggestions
6. **Groups** — Game group management, collaborative match logging, invites

Optional **Collection** tab and **Admin** tab (password-protected, diagnostics/data management).

**State Management**: React hooks + Context API (AuthContext, UserDataContext, GroupsContext). No external state library.

**Data Persistence**:
- **Personal matches**: `users/{userId}/data/matches` (legacy array, pre-subcollection model) OR `users/{userId}/matches/{matchId}` (new subcollection model)
- **Owned sets**: `users/{userId}/data/owned-sets`
- **Group matches**: `groups/{groupId}/matches/{matchId}`
- **Data loading**: `use-user-data.ts` hook with 500ms debounce on writes, `useAllGroupMatches.ts` for group data
- **Community data**: `getAllUserMatches()` aggregates across all users via `collectionGroup` queries (read-only, anonymized)

**Performance Optimizations**:
- Debounced Firestore writes (500ms accumulation window) to prevent race conditions and write storms
- Stats functions memoized to avoid recalculation on component re-renders
- Vitest coverage on critical functions (stats, utils, firestore, groups)
- Asset organization: Heroes and maps organized into `/src/assets/images/heroes/` and `/src/assets/images/maps/` subdirectories

**Error Handling**: Top-level error boundary + per-tab error boundaries isolate failures

---

## Implemented Features

### 1. Authentication
- **Email/password** sign-up and sign-in
- **Google OAuth** login (same email can exist as both auth methods)
- User profile dropdown with initials avatar
- Display name and player name configuration
- Sign-out functionality

### 2. Signed-Out Experience
- **Public Hero Browser**: Browse all heroes, see community stats (total matches, win rate, most common opponents, best/worst maps)
- **Global Stats Overview**: Community match count, most played heroes, popular maps
- **CTA card** encouraging sign-up to track personal matches

### 3. Match Logging (Authenticated)
- **Log New Match** dialog with stepped form:
  1. Select game mode first (required before other fields)
  2. Choose map (filtered by player count)
  3. Assign heroes to players (searchable, all heroes available regardless of collection)
  4. Set turn order
  5. Designate winner or draw
  6. Pick date
- **Hero variant handling**: Yennefer & Triss designate hero vs. sidekick
- **Player name autocomplete** from previously used names
- **Game mode switching** preserves compatible field values
- **Edit Match** dialog (same fields, pre-populated)
- **Delete Match** with confirmation
- **Match list** sorted newest-first, aligned player/hero names

### 4. Players Tab
- Select a player from dropdown (populated from match history)
- **Stats shown**: Total games, wins, losses, draws, win rate
- **Hero breakdown**: Which heroes played, win rate per hero
- **Map breakdown**: Which maps played, win rate per map
- **vs. Opponents**: Head-to-head records
- **Never Played Heroes**: Alphabetical list of unplayed heroes (scrollable, no overflow bugs)
- **Never Played Maps**: Alphabetical list sorted by set then map title

### 5. Heroes Tab
- **Hero Browser**: Searchable list of all heroes with images
- **Hero Detail** (when selected): Personal stats + community stats
- **Hero Matchup Heatmap**: Color-coded grid of hero-vs-hero win rates from community data
  - Visible as a CTA/discovery element (doesn't disappear on hero selection)
  - Clickable hero names navigate to that hero's detail
  - Color intensity reflects win rate; tooltips show exact records
- **Community stats section**: Total matches logged, global win rate, most common opponents, best/worst maps

### 6. Maps Tab
- Browse all maps with images
- Hero performance breakdown per map
- User vs. global win rate comparison on each map
- Player count and zone/space info displayed

### 7. Randomizer Tab
- **True Random**: Picks random heroes + map from owned collection
- **Balanced Mode**: Uses community match data + confidence scoring to suggest close matchups
  - Calculates expected win rates from head-to-head, hero overall, and map performance
  - Confidence indicator shows data quality behind suggestion
  - Weighted algorithm blending direct matchup data (50%), individual hero win rates (30%), and map performance (20%)
- **Collection-filtered**: Only suggests heroes from owned sets
- **Re-roll** individual elements or full matchup
- **Map filtering** by player count

### 8. Collection Tab
- View all 26 sets organized by franchise
- Toggle owned/not owned per set
- Hero count displayed per set
- Changes persist to Firestore immediately
- Only affects randomizer (match logging is unrestricted)

### 9. Game Groups (Authenticated)
- **Create Groups**: New groups with optional description
- **Manage Groups**: Edit group settings, invite members
- **Invite System**:
  - Generate shareable invite links with unique codes
  - "Save invite" for email addresses (stored in Firestore for sign-up lookup — no email sending service)
  - Accept invite via URL link
  - Invite status tracking (pending, accepted, etc.)
- **Group Match Logging**: Log matches within groups with group context
- **Member Management**: View group members, pending invites, invitation history
- **Data Isolation**: Firestore rules enforce group access control per member

### 10. Hero Image System
- Local `.webp` and `.avif` assets for all 76+ heroes
- Fallback UI for missing/unavailable images
- Optimized image loading for mobile performance
- Images displayed in hero browser, match logging, and statistics sections

### 11. Mobile Responsiveness
- Tab navigation with scroll-to-top on tab switch
- Bottom navigation bar optimized for touch
- Responsive card and list layouts
- Full-screen stepped dialogs for match logging on mobile
- Minimum 44px touch targets throughout

### 12. Data Management (Authenticated)
- **CSV Export**: Download all matches as CSV
- **CSV Import**: Bulk import matches from CSV file
- **Data Diagnostics**: Inspect Firestore document health
- **Data Recovery**: Restore from backup states
- **Data Cleanup**: Remove duplicates or malformed entries

---

## Edge Case Handling (Implemented)
- **No matches**: Empty state with "Log Your First Match" CTA
- **Player name normalization**: Trimmed whitespace, suggested existing names
- **Firestore undefined values**: `stripUndefined()` recursively cleans objects before writes (prevents Firestore errors on optional fields)
- **Date parsing**: Always uses local time via string splitting (avoids UTC off-by-one bug)
- **Persistence reliability**: `useEffect`-based auto-save with `loadedFromDb` guard to prevent re-saving on load
- **Statistical insignificance**: Sample sizes noted; minimum thresholds for meaningful win rate display
- **Draw/tie**: Supported as match outcome
- **Mobile**: Bottom nav bar, responsive card layouts, touch-friendly targets
- **Group Invites**: Email addresses stored for pending signup lookup; graceful handling of expired/invalid invite links
- **Hero Images**: Fallback UI for missing images; optimized `.webp`/`.avif` formats

---

## Design System

### Colors
Triadic scheme inspired by Unmatched's vibrant character art:
- **Primary**: Deep Purple (oklch(0.45 0.15 300)) — primary actions, navigation
- **Secondary**: Warm Slate (oklch(0.35 0.02 270)) — structural elements
- **Surface**: Soft Cream (oklch(0.96 0.01 90)) — cards, elevated surfaces
- **Accent**: Vibrant Teal (oklch(0.65 0.14 195)) — key stats, winners, randomizer
- All pairings meet WCAG AA contrast ratios (6.1:1 minimum)

### Typography
- **Font**: Inter (geometric sans-serif, excellent data legibility)
- **Hierarchy**: Bold/32px titles → Semibold/24px sections → Medium/18px cards → Regular/16px body → Medium/14px data labels

### Motion
- Critical feedback: 300ms spring + toast
- Page transitions: 250ms ease-out fade
- Data updates: 400ms ease-in-out
- Hover: 150ms immediate
- Randomizer reveal: Staggered 200ms cascade

### Mobile Patterns
- Bottom navigation bar (5 tabs)
- Full-screen stepped dialogs for match logging
- Stacked layouts for statistics
- Minimum 44px touch targets

---

## Key Technical Decisions

1. **No router** — Single-page tab navigation via React state. Simple for current scope; no URL-based routing needed.
2. **Centralized game data** — `src/lib/data.ts` (~3500 lines) contains all hero/map definitions as static exports. No API calls needed; data ships with bundle.
3. **Firestore per-user documents** — Each user's matches stored as a single array document (`users/{userId}/data/matches`). Simple reads/writes; limits scale to ~1MB/user. Migration to subcollection model planned.
4. **Community stats via full scan** — `getAllUserMatches()` reads all users' documents via `collectionGroup` queries. Works at small scale but will require indexing/aggregation at scale (1000+ users).
5. **No offline support** — Requires internet for all operations. No ServiceWorker or IndexedDB.
6. **stripUndefined() guard** — Critical helper that recursively removes `undefined` values before Firestore writes (Firestore throws on undefined by default). Prevents silent data loss.
7. **Debounced writes** — 500ms accumulation window on Firestore writes prevents race conditions and write storms from rapid state changes.
8. **React Context over Redux** — Light state management via AuthContext and UserDataContext. Sufficient for current complexity; no Redux/MobX needed.
9. **Group data isolated** — Groups stored in top-level `groups/{groupId}` collection (not nested under users). Multi-user ownership model requires separation from personal matches.
10. **Firestore rules for access control** — Group membership enforced via `memberUids[]` array check in rules; no app-level role validation needed (keeps rules simple).
11. **Test coverage on critical logic** — Vitest for stats, utils, firestore, and group operations. Firestore rules tested with emulator + @firebase/rules-unit-testing.

---

## Infrastructure & DevOps

### Testing
- **Unit & Component Tests**: Vitest + React Testing Library + happy-dom
  - 8 test files with comprehensive coverage:
    - `utils.test.ts` — String normalization, array manipulation
    - `stats.test.ts` — Win rate calculations, hero/player breakdowns
    - `firestore.test.ts` — Data validation, stripUndefined behavior
    - `groups.test.ts`, `group-matches.test.ts`, `group-invites.test.ts` — Group data operations
    - `user-discovery.test.ts` — User search and lookup
    - `match-diff.test.ts` — Match delta calculation
  - **Test Scripts**:
    - `npm test` — CI/CD test run (single pass)
    - `npm run test:watch` — Watch mode for development
    - `npm run test:coverage` — Coverage report generation
- **Firestore Security Rules Tests**: @firebase/rules-unit-testing v4 + Firebase Emulator
  - `tests/rules/firestore.rules.test.ts` — Comprehensive rule validation
  - Validates user access control, group membership, invite flows
  - Java 21 required for Firebase Emulator (set up in GitHub Actions)

### CI/CD
- **GitHub Actions**: Two parallel workflows in `tests.yml`
  1. **Unit & Component Tests Job** (ubuntu-latest):
     - Node.js 20 with npm cache
     - Runs Vitest suite
     - Verifies build succeeds with Vite
  2. **Firestore Rules Tests Job** (ubuntu-latest):
     - **Java 21** setup (Temurin distribution) for Firebase Emulator
     - Node.js 20 with npm cache
     - Firebase CLI installation
     - Firestore Emulator startup + Vitest rule validation
- **Deployment**: Vercel auto-deployment on push to `main` branch
  - Configured via `vercel.json` with SPA rewrite rules
  - No manual deployment steps required

### Build Process
- **Vite 7.2.7** — Fast ES module builds
- **TypeScript strict mode** enabled (tsconfig.json)
- **SWC transpilation** via @vitejs/plugin-react-swc
- **Output**: Minified ES modules to `/dist/`
- **Build command**: `tsc -b --noCheck && vite build`
- **Preview**: `vite preview` for local production build testing

### Security
- **Firestore Security Rules**: Comprehensive rule set enforcing:
  - User document access control (read/write by owner only)
  - Group membership verification via `memberUids[]` array in group documents
  - Per-group subcollection access control for matches (`groups/{groupId}/matches`)
  - Member-only access to group data via helper functions (isMember, isOwner, isAdminOrOwner)
  - Invite validation and expiration handling in `group-invites` subcollection
  - Pending email invite storage in `pending-email-invites` collection (for signup lookup, no email service)
  - Community stats queries enabled via public read access to `users/{userId}/data/matches`
- **Authentication**: Firebase Auth with email/password + Google OAuth
- **Environment Variables**: Import password stored in `VITE_IMPORT_PASSWORD` (not hardcoded)
- **Data Validation**: `stripUndefined()` helper prevents Firestore write errors on optional fields

### Database (Firestore)
- **Collections**:
  - `users/{userId}` — User profiles (public read, owner write)
  - `users/{userId}/data/` — Legacy user data (matches array, owned sets, metadata)
  - `users/{userId}/matches/{matchId}` — Individual match subcollection (for migration from legacy array model)
  - `groups/{groupId}` — Group metadata (memberUids array, owner, settings)
  - `groups/{groupId}/members/{memberId}` — Member details (role, display name, joinedAt)
  - `groups/{groupId}/matches/{matchId}` — Group match logs (separate from personal matches)
  - `groups/{groupId}/invites/{inviteId}` — Group invite metadata
  - `pending-email-invites/{email}` — Invite codes awaiting signup (no email service, email lookup only)
- **Limits & Scaling**: 
  - Single user document ~1MB ceiling (~1000 matches at 1KB each)
  - Subcollection model enables infinite individual matches per user (atomic writes, no race conditions)
  - Community stats via `collectionGroup` queries on all matches (works at small-medium scale)
- **Indexing**: Configured for common queries (user matches, group data, community stats aggregation)
- **Backup Strategy**: Regular Firestore exports for disaster recovery; data recovery tools available in Admin tab

---

## Known Limitations & Future Opportunities

### Current Limitations
1. **Legacy Array Document Model**: Matches stored as single array in `users/{userId}/data/matches` doc limits scale to ~1MB (~1000 matches). Migration to subcollection model (`users/{userId}/matches/{matchId}`) planned but not yet deployed.
2. **No Email Service Integration**: Group invite system stores pending emails in Firestore for lookup only. Cloud Functions + SendGrid (or similar) not deployed; emails are not automatically sent on invite.
3. **No Cloud Functions**: All backend logic runs on client or within Firestore rules. Aggregation jobs for large datasets not implemented; community stats rely on client-side computation.
4. **Bundle Size**: ~1.2MB JavaScript (minified). Three icon libraries (Phosphor, Heroicons, Lucide), Three.js, D3, Recharts all shipped eagerly. Opportunity for code splitting and lazy loading.
5. **Community Stats Scalability**: `getAllUserMatches()` scans all users' documents via `collectionGroup` queries. At scale (1000+ users with 1000+ matches each), may face read quota and performance issues. Requires:
   - Aggregation pipeline with Cloud Functions
   - Real-time counters via Firestore counters pattern
   - Or periodic pre-computation of community stats
6. **No Offline Mode**: Requires active internet connection for all operations. ServiceWorker not implemented.
7. **Data Validation**: No runtime type checking on Firestore reads. Legacy or corrupted data could silently fail stats calculations.

### High-Priority Future Enhancements
1. **Firestore Subcollection Migration**: Move matches to `users/{userId}/matches/{matchId}` to enable scale beyond 1MB per user, eliminate write race conditions, improve stats query performance.
2. **Sharing Feature**: Read-only match log sharing with explicit viewer UID lists (depends on subcollection migration).
3. **Email Integration**: Deploy Cloud Function to send group invites; integrate SendGrid or similar service.
4. **Performance**: Code splitting, hero data lazy loading, community stats pre-computation or aggregation service.
5. **Notifications**: Real-time updates for group invites, match logging in shared groups (Firebase Realtime or Cloud Messaging).
6. **Analytics**: Usage tracking, hero popularity trends, win rate evolution over time.
7. **Data Export**: Additional export formats (JSON, Excel with charts, PDF reports).
8. **Offline Support**: ServiceWorker + IndexedDB for offline match logging (sync on reconnect).
