# Unmatched Tracker — Product Requirements Document

A web application for tracking Unmatched board game matches, analyzing player and hero statistics, and generating balanced matchups using community-aggregated data.

**Live URL**: https://unmatched-tracker.vercel.app

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 7.2 |
| UI Components | Shadcn UI (Radix primitives) + Tailwind CSS 4.1 |
| Icons | Phosphor Icons, Lucide React, Heroicons |
| Charts | Recharts + D3.js |
| Animation | Framer Motion |
| Auth | Firebase Auth (email/password + Google OAuth) |
| Database | Cloud Firestore |
| Hosting | Vercel (serverless) |
| Notifications | Sonner (toasts) |

## Game Data

- **Heroes**: 76+ playable characters across 26 sets
- **Maps**: 34+ unique boards (varying player counts, zones, spaces)
- **Franchises**: Battle of Legends, Marvel (multiple sets), The Witcher, Jurassic Park, TMNT, Bruce Lee, Muhammad Ali, Buffy, Shakespeare, and more
- **Game Modes**: Cooperative, 1v1, 2v2, 3-player FFA, 4-player FFA

## Architecture

**Navigation**: Tab-based SPA (no router). 5 primary tabs + Collection view.

**State Management**: React hooks + Context API. No external state library.

**Data Persistence**: Firestore documents per user:
```
users/{userId}/data/matches    → Array of Match objects
users/{userId}/data/owned-sets → Array of set name strings
```

**Community Data**: `getAllUserMatches()` aggregates across all users for global stats (read-only, anonymized).

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

### 9. Data Management (Authenticated)
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

1. **No router** — Single-page tab navigation via React state. Simple for current scope.
2. **All heroes in one data file** (`data.ts`, ~3500 lines) — Static game content, no API calls needed.
3. **Firestore per-user documents** — Each user's matches stored as a single array document. Simple reads/writes, but limits scale to ~1MB per user.
4. **Community stats via full scan** — `getAllUserMatches()` reads all users' data. Works at small scale but will need indexing/aggregation at scale.
5. **No offline support** — Requires internet for all operations.
6. **stripUndefined()** — Critical helper that recursively removes `undefined` values before Firestore writes (Firestore throws on undefined by default).
