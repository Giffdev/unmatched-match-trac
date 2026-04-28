# Hicks — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Firestore per-user documents with matches as array. Critical constraint: never break the live site or user data.

## Learnings

### 2026-04-28T16:13:58-07:00: Removed hardcoded password from App.tsx
- The match import gate in `handleReplaceAllMatches` (line ~59) compared user input against a hardcoded password string `'alpha837Soup*'`.
- Replaced with `import.meta.env.VITE_IMPORT_PASSWORD` — Vite exposes `VITE_`-prefixed env vars to client code at build time.
- Added `VITE_IMPORT_PASSWORD=` to `.env.example` so other devs know to configure it.
- `.env` was already in `.gitignore` — no secret exposure risk.
- Build verified clean (`tsc -b --noCheck && vite build` exit 0).

### 2026-04-28T16:16:41-07:00: Fixed race condition in useUserMatches hook
- The persist `useEffect` in `src/hooks/use-user-data.ts` fired on every `matches` state change, spawning concurrent `setUserMatches` Firestore writes that could resolve out of order — a later write with stale data overwriting a valid earlier write.
- The existing `saveGeneration` ref only suppressed stale error toasts; it didn't prevent the actual out-of-order write.
- Fix: added 500ms debounce to the persist effect. Rapid state changes now batch into a single Firestore write. On cleanup (unmount or userId change), the pending write flushes immediately to prevent data loss.
- `loadedFromDb` guard preserved — still prevents re-saving on initial load.
- Public API unchanged: hook still returns `{ matches, setMatches, loading }`.
- Build verified clean (`tsc -b --noCheck && vite build` exit 0).

### 2026-04-28T23:31:30Z: Added React Error Boundaries per-tab
- React error boundaries require class components — functional components can't catch render errors.
- Pattern: each tab's content wrapped individually so one crash doesn't take down the whole app.
- Top-level ErrorBoundary wraps the entire `<main>` content as a last-resort fallback.
- Tab navigation (TabsList + mobile nav) remains OUTSIDE boundaries so users can always navigate away.
- Fallback UI uses existing Tailwind/Shadcn design tokens for visual consistency.

### 2026-04-28T23:31:30Z: Deduplicated calculateHeroStats / calculateUserHeroStats
- Both functions were ~80% identical: filter matches by hero, accumulate W/L/D + vsMatchups.
- Key difference: `calculateHeroStats` identifies opponents by heroId; `calculateUserHeroStats` can scope to a specific playerName.
- Created `calculateHeroStatsCore(matches, heroId, options)` — a private unified function with `playerName` and `preFilter` options.
- Old exports preserved as thin wrappers — zero API surface change, callers unaffected.
- `calculateHeroStats`'s `filterByHeroId` param mapped to a `preFilter` lambda.
- Build verified clean (`tsc -b --noCheck && vite build` exit 0).

### 2026-04-28T23:31:30Z: Memoized stats calculations in PlayersTab and HeroesTab
- PlayersTab: `calculatePlayerStats` call + derived arrays (heroesPlayed, mapsPlayed, neverPlayed, vsPlayers) wrapped in `useMemo` with correct dependency arrays.
- HeroesTab: `calculateUserHeroStats` (personal + all-logged) and `calculateHeroStats` (global) wrapped in `useMemo`. Matchup entries derivation also memoized.
- No changes to stats functions themselves — only call sites.
- All 67 tests pass. Build verified clean.

### 2026-04-28T23:31:30Z: Team Decisions Consolidated (Scribe)
- All work captured and merged into canonical `.squad/decisions.md`
- Error boundaries, stats dedup, and related team decisions now recorded
- Team checkpoint logged; orchestration logs written per-agent


### 2026-04-28T23:31:30Z: Added runtime type validation on Firestore reads
- Created `validateMatch()` type guard in `src/lib/firestore.ts` — checks required fields (id, date, mapId, players, isDraw, userId) with type assertions.
- Created `validateMatches()` — validates array structure, filters out malformed entries with `console.warn` rather than crashing.
- Applied to both `getUserMatches()` and `getAllUserMatches()` return paths.
- Protects against data corruption taking down the entire app.
- All 67 tests pass. Build verified clean.
