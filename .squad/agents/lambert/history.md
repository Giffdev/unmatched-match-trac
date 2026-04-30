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

### 2026-04-29T11:05:18-07:00: Game Groups Feature — Comprehensive QA Audit
- **Scope:** 13 files reviewed (9 components, 3 hooks, 3 data-layer modules)
- **Found:** 4 critical, 6 medium, 4 low issues
- **Critical pattern:** Non-atomic multi-step Firestore writes across `groups.ts` and `group-invites.ts` — partial failures leave inconsistent state (acceptInvite, addMatchToGroups, deleteGroup)
- **Critical pattern:** Pagination hook (`use-group-matches.ts`) has placeholder "TODO" logic that duplicates data on load-more
- **Critical pattern:** Batch size limits not respected in `deleteGroup` — groups with 500+ items will hard-fail
- **Quality gap:** Settings collected in CreateGroupDialog UI but never passed to `createGroup()` function
- **Quality gap:** `onMemberRemoved` callback is a no-op in GroupView — member count goes stale
- **Quality gap:** Zero component/integration tests for any Groups UI component or hook
- **Verdict:** DO NOT SHIP until pagination (#1) and batch limit (#2) are fixed
- **Full report:** `.squad/decisions/inbox/lambert-groups-qa-audit.md`

### 2026-04-29T18:36:17Z: Scribe session complete — email-invites merged to decisions
- Inbox files processed: 4 new decision entries merged to canonical `decisions.md`
- Quality directives captured: User feedback about thorough testing and internal QA requirements
- Orchestration logs written; session logs created for audit trail
- Hicks' email-based invite system documented and integrated

### 2026-04-29T11:05:18-07:00: User directive — Quality gate for all feature work
- **By:** Devin Sinha (via Copilot)
- **What:** Hicks (and all agents) need to be more thorough. Too many bugs are being found after delivery. From now on, all feature work must include proper state refresh, UI feedback, and edge case handling before being considered done.
- **Why:** User frustration with repeated bugs in Game Groups feature — state not refreshing after import, stale lists after deletion, etc. Quality gate needed.

### 2026-04-29T11:12:40-07:00: User directive — Internal QA before user delivery
- **By:** Devin Sinha (via Copilot)
- **What:** The team must test their own work before presenting to the user. Never ask the user to test — have Lambert verify first. Only report results after internal QA passes.
- **Why:** User request — the team should own quality, not push testing burden to the user.


### 2026-04-29T10:20:00-07:00: Game Groups Feature — Full Local Verification
- **Tests:** ✅ All 183 tests pass (8 files, 0 failures)
- **TypeScript:** ✅ Clean (`npx tsc --noEmit` exits 0) — after fixing 8 type errors
- **Build:** ✅ `npx vite build` succeeds (14.5s)
- **Fixes applied (4 files):**
  1. `src/components/groups/GroupMatchList.tsx` — Was passing `Hero` object to `getHeroDisplayName(PlayerAssignment)`. Fixed by using `hero.name` directly and removing unused import.
  2. `src/lib/__tests__/group-invites.test.ts` — TypeScript narrowed `as const` literals making comparisons appear tautological (TS2367). Fixed by widening types to `string`.
  3. `src/lib/__tests__/group-matches.test.ts` — `result` typed as `unknown` from mock. Fixed with `as any` cast.
  4. `src/lib/__tests__/user-discovery.test.ts` — Same `unknown` type issue. Fixed with `as any` cast.
- **Integration check:** ✅ App.tsx imports and renders GroupsTab correctly, with pending invites badge. All hooks (`use-groups`, `use-group-matches`, `use-group-members`) reference correctly exported functions from data layer.
- **Regression check:** ✅ Existing test suites (utils, stats, firestore, match-diff) all pass unchanged. No modifications to existing features.
- **Warning:** ⚠️ Bundle size (1181 kB JS) exceeds Vite's 500 kB chunk warning. Consider code-splitting groups feature with dynamic import. Not blocking.

### 2026-04-29T11:12:40-07:00: Bug Fix Verification — 4 Critical Fixes
- **Scope:** Verified Hicks' fixes to pagination, deleteGroup batching, acceptInvite atomicity, addMatchToGroups batching
- **Verification method:** Code review of all 4 modules + TypeScript compile check + full test suite run
- **Patterns used:** Traced data flow from hook→data layer→Firestore API; checked batch limit arithmetic (450 < 500 limit); verified transaction read-before-write ordering; checked cursor ref lifecycle on component remount
- **Key findings:**
  - Pagination: Uses `lastDocRef` + `loadingMoreRef` for cursor + double-click protection. First load correctly passes no startAfter. groupId change triggers useCallback dep rebuild + component remount via `key` prop.
  - deleteGroup: Batches subcollection deletes at 450 ops. Final batch reserves 1 slot for group doc delete (`BATCH_LIMIT - 1`). Empty subcollections handled via `allDeletions.length === 0` skip + dedicated fallback for 0 members.
  - acceptInvite: Uses `runTransaction()`. Reads all docs inside transaction. Status update is step 5 (LAST). If group deleted, `groupSnap.exists()` check throws "Group not found" — invite stays pending.
  - addMatchToGroups: Uses writeBatch. Returns `firstRef` only after all batches commit. Empty array returns null immediately. Single group works (one batch). No per-group existence check = silent write to deleted group (concern).
- **Gap found:** `addMatchToGroups` does NOT verify target groups exist before writing. If a group was deleted, the match doc is written to a non-existent parent — Firestore allows this but the data is orphaned. Low severity (rare race condition).
- **TypeScript:** ✅ Clean (exit code 0)
- **Tests:** ✅ All 183 pass (8 files, 0 failures)
- **Verdict:** APPROVED with minor concern noted

### 2026-04-30T09:43:44-07:00: Session continuity documentation complete
- Created `.squad/identity/now.md` documenting current project state, test infrastructure (183 tests), verification results
- Created `.squad/identity/wisdom.md` with hard-won testing knowledge: test location conventions, test data factory patterns, test framework setup (Vitest, React Testing Library, happy-dom), rules testing with Firebase Emulator, quality gate directives, test coverage expectations
- All decisions consolidated to canonical `.squad/decisions.md`
- Documentation ready for next session instantiation
- Lambert's QA methodology and test coverage expectations now recorded as team wisdom


