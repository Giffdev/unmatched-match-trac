# Lambert — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Critical constraint: never break the live site or user data. Testing is essential for safe deployments.

## Learnings

### 2026-04-28: Test Coverage Survey
- **Test infrastructure: NONE.** Zero test files exist (no *.test.ts, *.spec.ts, no __tests__ dirs). No test framework installed (no vitest, jest, testing-library in deps). No test scripts in package.json.
- **Key testable modules (pure logic, no UI):**
  - `src/lib/stats.ts` — calculatePlayerStats, calculateHeroStats, aggregateCommunityData, getBalancedMatchupScored
  - `src/lib/utils.ts` — normalizeHeroId, normalizePlayerName, normalizeMatchPlayerNames, getHeroDisplayName
  - `src/lib/firestore.ts` — stripUndefined (pure fn), getUserMatches, setUserMatches
  - `src/lib/import-matches-v2.ts` — match data import builder
- **Key UI components (need component tests):**
  - `src/components/matches/LogMatchDialog.tsx` — match logging form
  - `src/components/matches/CsvImportDialog.tsx` — CSV import
  - `src/components/randomizer/RandomizerTab.tsx` — randomizer with balanced mode
  - `src/components/players/`, `src/components/heroes/`, `src/components/maps/` — stats display
- **Build:** `tsc -b --noCheck && vite build` (no test step)
- **Recommended framework:** Vitest (native Vite integration) + @testing-library/react for component tests

### 2026-04-28T23:31:30Z: Vitest Infrastructure Setup
- **Installed:** vitest 4.1.5, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, happy-dom
- **Config:** Dedicated `vitest.config.ts` with happy-dom environment, globals: true, `@` alias for src/
- **Scripts:** `npm test` (vitest run), `npm run test:watch` (vitest), `npm run test:coverage` (vitest run --coverage)
- **Test location:** `src/lib/__tests__/{module}.test.ts`
- **Initial suite:** 67 tests across 3 files (utils, stats, firestore)
- **Pattern:** Factory functions for test data (e.g. `createMatch(overrides)`) to keep tests DRY
- **Key finding:** `stripUndefined` in firestore.ts is not exported — tested via local copy. If it needs direct testing later, it should be extracted/exported.
- **Key finding:** `getBalancedMatchupScored` uses Math.random() internally — tests focus on deterministic edge cases (empty data, exclusion logic, confidence levels)
- **All 67 tests pass, build remains green.**

### 2026-04-28T23:31:30Z: Team Decisions Consolidated (Scribe)
- All 4 agents' work captured and merged into `.squad/decisions.md`
- Orchestration logs written per-agent with status updates
- Session checkpoint logged for team visibility
- Decisions now canonical reference for all 5 team decisions

### 2026-04-28T23:55:03Z: Firestore Migration Diff Tests
- **Created:** `src/lib/match-diff.ts` — pure utility with `diffMatches()`, `isValidMigrationState()`, `getDefaultMigrationState()`
- **Created:** `src/lib/__tests__/match-diff.test.ts` — 27 tests covering diff logic + migration state validation
- **Coverage:** additions, deletions, modifications, mixed ops, complete replacement, 500+ match arrays, duplicate IDs, undefined fields, large objects, performance
- **Pattern:** Pure functions decoupled from Firebase — Hicks can import `diffMatches` into the dual-write layer
- **All 94 tests pass (67 existing + 27 new)**

### 2026-04-28T23:55:03Z: Session Complete — Firestore Migration Phase 1-2 Delivered
- Diff utilities integrated into Hicks' dual-write foundation
- Stats memoization + type guards landed (Hicks-3)
- Sidebar investigation completed (Dallas)
- All orchestration logs written and decisions merged
- Team history updated across all agents
- Build: 94 tests passing, TypeScript clean, Vite build succeeds
- Phase 1-2 milestone complete; ready for Phase 3 (backfill + read migration)

### 2026-04-29T02:29:31Z: Firestore Rules Ready for Verification (Scribe)
- Hicks' revised v2 security rules (Option C Hybrid) merged to canonical decisions.md
- Rules enable public community stats access while protecting sensitive data
- No code changes required; existing `getAllUserMatches()` works as-is
- Awaiting your verification: open app in incognito (not logged in), confirm community stats load, sign in and verify personal features, verify setDoc fails with permission denied
- Orchestration log written; decision ready for Devin to deploy to Firebase Console

### 2026-04-28T19:29:31-07:00: Firestore Security Rules — Live Verification PASSED
- **Test suite:** All 94 tests pass (vitest run) — no regressions
- **Live site (non-authenticated, headless Chromium):**
  - Site loads, title "Unmatched Tracker"
  - 3 public tabs visible: Community Stats, Hero Browser, Matchup Heatmap
  - Community Stats tab loads and shows real data ("Insights from 80 matches played by the community", hero stats like Bruce Lee 7 games, Tomoe Gozen 5 games)
  - Hero Browser tab loads with hero content
  - Matchup Heatmap tab accessible and clickable
  - **Zero console errors** — no permission-denied, no Firestore errors, no page errors, no warnings
- **Verdict:** Rules are correctly configured. Public read access works for community features. No over-restriction detected.
- **Methodology:** Used playwright-core (headless Chromium) to simulate unauthenticated user, captured all console messages, navigated all public tabs, waited for data to load.

### 2026-04-29T10:04:15-07:00: Game Groups Feature — Test Suite Created
- **Created 4 test files (89 tests):**
  - `src/lib/__tests__/groups.test.ts` — 28 tests: CRUD, membership (add/remove/leave), writeBatch atomicity, arrayUnion/arrayRemove, edge cases (empty name, duplicate members, last-member-owner)
  - `src/lib/__tests__/group-matches.test.ts` — 22 tests: log to group, autoAddToPersonal, community stats double-counting prevention, pagination, update/delete authorization (loggedBy check), edge cases
  - `src/lib/__tests__/group-invites.test.ts` — 21 tests: send invite, permission enforcement, accept (atomic membership add), decline (no membership change), pending list read, edge cases (duplicate, expired, non-existent user, already-member)
  - `src/lib/__tests__/user-discovery.test.ts` — 18 tests: email exact match, playerName prefix search (case-insensitive via normalized field), empty/special char handling, exclude current user, exclude existing members
- **Pattern:** Tests mock `firebase/firestore` at module level. Source files (`groups.ts`, `group-matches.ts`, etc.) are being created by Hicks in parallel — tests validate expected Firestore operations (writeBatch, arrayUnion, arrayRemove, where queries) and data invariants.
- **Key design invariant tested:** Group matches appear on personal dashboard but DON'T double-count in community stats (via `isGroupMatch` flag filtering).
- **Key edge cases discovered:**
  - Owner cannot leave group without transferring ownership or deleting
  - Duplicate invite to same user/group must be blocked (check existing pending)
  - Expired invites must be checked at accept-time, not just at display
  - Empty/whitespace-only search must short-circuit (no full table scan)
  - Personal match copy deletion must be atomic with group match deletion
- **All 183 tests pass (94 existing + 89 new). Build green.**

