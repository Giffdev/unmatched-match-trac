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

### 2026-04-28T23:55:03Z: Implemented dual-write layer for Firestore subcollection migration (Phase 1-2)
- Added subcollection write/delete/read functions in `src/lib/firestore.ts` — writes to `users/{userId}/matches/{matchId}`.
- Added `MigrationState` type and `getMigrationState`/`setMigrationState`/`enableDualWrite` functions for per-user migration control.
- Added `dualWriteMatches()` — diff-based function that always writes legacy first, then best-effort syncs changes to subcollection. Subcollection failures are caught and logged, never thrown.
- Subcollection writes are chunked (400 per batch) to respect Firestore limits.
- Updated `use-user-data.ts` to load migration state on mount (cached in ref), track previous matches for diffing, and call `dualWriteMatches` when state is 'dual-write'.
- Default state is 'legacy-only' — no behavior change unless explicitly enabled per-user.
- Reads are completely unchanged — still from legacy doc only.
- All 94 tests pass. TypeScript clean. Vite build succeeds.

### 2026-04-28T23:55:03Z: Session Complete — Firestore Migration Phase 1-2 + Team Sync
- Dallas completed sidebar refactor investigation (determined not needed)
- Stats memoization + type guards integrated (Hicks-3)
- Diff utility for migration layer delivered by Lambert (27 tests, all passing)
- Dual-write foundation now ready for Phase 3 (backfill + read migration)
- Decisions merged to canonical `.squad/decisions.md`
- Orchestration logs written; team history updated
- Build: all 94 tests passing, TypeScript clean, Vite green

### 2026-04-28T19:19:54-07:00: Proposed Firestore Security Rules (test mode → locked down)
- Firestore currently in TEST MODE — all reads/writes open to anyone.
- Identified all document paths: `users/{userId}`, `users/{userId}/data/matches`, `users/{userId}/data/owned-sets`, `users/{userId}/data/matches-meta`, `users/{userId}/matches/{matchId}`.
- Key challenge: `getAllUserMatches()` lists ALL user docs then reads each user's match data — requires authenticated read across user boundaries.
- Proposed rules follow Arkham Horror pattern: owner-write everywhere, authenticated-read on user profiles + data subcollection.
- Risk: community stats currently require authentication (no public aggregation doc exists). If non-logged-in users need to see community stats, a Cloud Function + `community-stats` doc with `allow read: if true` would be needed.
- Full proposal written to `.squad/decisions/inbox/hicks-firestore-security-rules.md`.

### 2026-04-28T19:23:23-07:00: Revised Firestore Security Rules — Public Community Stats
- Previous proposal (v1) required auth for all reads, which would break the public landing page community stats (GlobalStats, PublicHeroBrowser, PublicHeatmap shown to non-logged-in visitors).
- Devin confirmed: community stats are a conversion feature that MUST remain visible without login.
- Revised to Option C (Hybrid): `users/{userId}` public read (for listing), `data/matches` public read (game results), `owned-sets` and `matches-meta` owner-only, all writes owner-only.
- Key technique: conditional read rule using `docId == 'matches'` to surgically expose only match data.
- No code changes required — existing `getAllUserMatches()` works as-is.
- Removed the collection group wildcard rule (not needed when `users/{userId}` allows public list).

### 2026-04-29T02:29:31Z: Firestore Security Rules Merged to Decisions (Scribe)
- Hicks' v2 rules proposal successfully merged from `.squad/decisions/inbox/` to canonical `decisions.md`
- Decision entry includes full rules, risk assessment, access matrix, and deployment instructions
- Inbox file cleaned up; decision ready for Devin to apply in Firebase Console
- Orchestration log written; awaiting live site verification (Lambert)

