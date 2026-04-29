# Dallas — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Tab-based SPA with bottom nav bar on mobile. Critical constraint: never break the live site or user data.

## Learnings

- **2026-04-28:** Tab navigation is managed via `currentTab` state in `App.tsx` (line ~30). Bottom nav is a fixed nav bar rendered only on mobile (`isMobile && currentUserId && currentView === 'main'`). Desktop uses Shadcn `TabsList` with `TabsTrigger` components.
- **2026-04-28:** Key file: `src/App.tsx` — contains all tab state, bottom nav, and main layout. Tab content components live in `src/components/{matches,players,heroes,maps,randomizer}/`.
- **2026-04-28:** Scroll-to-top on tab change: implemented via `useEffect` on `currentTab` calling `window.scrollTo(0, 0)`. This is safe for desktop too since desktop tabs also trigger `setCurrentTab`.
- **2026-04-28 (Hicks):** `src/hooks/use-user-data.ts` now implements 500ms debounce on Firestore persist effect. Pattern: accumulate rapid state changes, write only final state after quiet period. Cleanup flushes pending writes immediately. Eliminates out-of-order concurrent writes.
- **2026-04-28:** Extracted shared components from LogMatchDialog + EditMatchDialog into `src/components/matches/shared/`: MapSelector (searchable combobox for maps), HeroSelector (searchable combobox for heroes with Yennefer/Triss variant picker), PlayerCard (player row with name input + hero selector + remove button), MatchResultSection (competitive winner/draw + cooperative win/loss). Barrel export via `shared/index.ts`. Both dialogs now import from `./shared` and are ~50% shorter. The shared components use the more responsive LogMatchDialog styling (min-w-0, shrink-0 utilities).

### 2026-04-28T23:31:30Z: Team Decisions Consolidated (Scribe)
- Work captured and merged into canonical `.squad/decisions.md`
- Shared component extraction decision recorded with implementation details
- Team checkpoint logged for visibility

### 2026-04-28T23:55:03Z: Firestore Migration Session — Phase 1-2 Complete
- Team completed dual-write migration foundation (led by Hicks)
- Sidebar refactor investigation completed: determined Shadcn primitives already well-decomposed, no refactoring needed
- Stats memoization + type guards implemented (Hicks-3)
- Diff utility + 27 tests delivered (Lambert-2)
- Session logged in `.squad/log/` and orchestration logs in `.squad/orchestration-log/`
- All decisions merged to canonical `decisions.md`

- **2026-04-28T19:43:11-07:00:** Moved trophy icon from far-right grid column to inline with winner's player name in `MatchCard.tsx`. Changed grid from fixed `${maxNameLen}ch` first column to `auto` sizing. Trophy now renders as "PlayerName 🏆" making winner immediately visible. Removed unused `maxNameLen` variable. 94 tests pass, build clean.
- **2026-04-28T20:29:25-07:00:** Aligned hero names into a separate column in MatchCard. Moved from per-row grids to a single parent grid with CSS subgrid rows (`grid-cols-subgrid col-span-5`). Columns: turn-badge | player-name+trophy | "as" | hero-name | draw-badge. Hero names now align vertically across all players in a match. Uses `min-w-0 + truncate` for mobile overflow. 94 tests pass, build clean, deployed to prod.
- **2026-04-28T20:39:21-07:00:** Fixed widescreen wasted space and hero name centering in match history. Changes: (1) Match list container → `grid grid-cols-1 xl:grid-cols-2 gap-4 max-w-6xl mx-auto` for 2-col layout centered on wide viewports. (2) Player info grid uses `md:mx-auto md:w-fit` to center hero names within each card on wider screens. (3) Hero name column changed from `1fr` to `auto` so grid sizes to content instead of stretching. (4) Individual cards get `max-w-2xl xl:max-w-none` to cap single-column width on medium screens. Mobile layout unchanged. 94 tests pass, build clean, deployed to prod.
