# Squad Decisions

> Canonical decision ledger for the Unmatched Tracker squad. Append-only.

## Active Decisions

### 2026-04-30T10:40:38-07:00: User directive
**By:** Devin Sinha (via Copilot)
**What:** Matches tab should still say "Match History" when viewing group matches — don't change the title. Use the DataContextSelector dropdown (or similar indicator) to show which group's matches are being viewed.
**Why:** User request — captured for team memory

---

### 2026-04-30T10:35:50-07:00: Group Match Visibility on Matches Tab + Players Tab Enhancement
**By:** Ripley (Lead)
**Status:** Proposed — Awaiting Devin's approval
**Priority:** Feature
**Requested by:** Devin Sinha
**What:** Users added to a group can only see group matches via the Groups tab. They want to browse group matches from the Matches tab (their primary match-browsing surface) and analyze per-group player stats from the Players tab.
**Current Architecture:** Matches tab has no DataContextSelector; Players and Heroes tabs have full group data support via `useAllGroupMatches()` hook and dataSource prop.
**Recommendation: Option A — Mirror Pattern.** Exactly mirror how PlayersTab works: add DataContextSelector to MatchesTab, follow the same pattern as Players/Heroes. When group selected: hide "Log Match", show group matches via paginated `useGroupMatches`, render MatchCard with `subtitle={loggedByName}` and no edit/delete handlers. When personal: current behavior unchanged.
**Implementation:** ~45 lines of straightforward wiring: add `matchesContext` state in App.tsx, call `useAllGroupMatches`, build `matchesDataSource` memo, pass props to MatchesTab (following PlayersTab pattern exactly).
**Safety gates:** TypeScript must compile clean, build must pass, manual verification that personal matches still editable/deletable.
**Key Decision: NO edit/delete for group matches.** Data ownership: group matches may be logged by other users. Consistency: GroupMatchList renders MatchCard without onDelete/onEdit — intentional, not oversight.

---

### 2026-04-30T10:41:08-07:00: Concern — MatchCard edit/delete buttons lack accessible names
**By:** Lambert (Tester)
**Date:** 2026-04-30T10:41:08-07:00
**Status:** Informational
**Priority:** Low
**Found during:** MatchesTab group context test writing
**What:** `src/components/matches/MatchCard.tsx` lines 145-164: The edit (Pencil) and delete (Trash) buttons use `size="icon"` with only SVG children — no `aria-label`, no visually-hidden text. Screen readers announce them as unlabeled buttons. Tests cannot find them via `getByRole('button', { name: /edit/ })` — must use fragile container queries.
**Recommendation:** Add `aria-label="Edit match"` and `aria-label="Delete match"` to the respective Button elements. Zero visual impact, improves accessibility and testability.
**Impact:** Accessibility low severity (sighted users see icons, SR users get no context). Testing forces workarounds in component tests. Not blocking — current tests work around this; fix at convenience.

---

### 2026-04-30T09:42:36-07:00: PRD.md Comprehensive Update — Current Application State
**Date:** 2026-04-30T09:42:36-07:00
**By:** Ripley (Lead)
**Status:** ✅ IMPLEMENTED
**Impact:** Documentation only (no code changes)
**What:** Updated PRD.md to accurately reflect the current state of the application through comprehensive codebase audit. PRD is now the definitive reference for what the app IS right now.
**Tech Stack Updated:** Firebase 11.9.0, React 19.0.0, Vite 7.2.7, Tailwind 4.1.11, Vitest 4.1.5, happy-dom 20.9.0, @firebase/rules-unit-testing 4.0.1.
**Architecture Section:** Clarified 6 primary tabs (Matches, Players, Heroes, Maps, Randomizer, Groups) + optional Collection + Admin. Detailed React Context (AuthContext, UserDataContext, GroupsContext). Documented dual-read support for legacy array docs AND new subcollection model. Documented 500ms debounce on writes, per-tab error boundaries, memoization.
**Infrastructure & DevOps:** Testing Framework detailed: 8 test files, specific test names. CI/CD Pipeline: Java 21 setup for Firebase Emulator, documented in .github/workflows/tests.yml. Build Process: Vite 7.2.7, TypeScript strict mode, SWC transpilation.
**Security Section (new):** Comprehensive Firestore Rules enforcement of group membership via memberUids[] array. Listed all collections with subcollection structure. Clarified ~1MB per user document (~1000 matches); subcollection model enables infinite scale.
**Known Limitations (refined):** Legacy Array Document Model — clearly marked as limitation; migration to subcollection planned but NOT YET DEPLOYED. Email Service — group invites store pending emails in Firestore. Community Stats Scalability — collectionGroup queries work at small-medium scale; requires aggregation at 1000+ users.
**Key Technical Decisions (expanded to 11):** Added decisions about debounce (500ms), React Context over Redux, group data isolation, Firestore rules for access control.
**Critical Clarifications:** (1) Tests EXIST — 8 files with 67 tests covering critical logic. (2) Java 21 in CI — for Firebase Emulator. (3) @firebase/rules-unit-testing v4 — compatible with firebase@11. (4) Firestore Rules Tested — CI includes comprehensive security rules validation. (5) Subcollection Migration — planned but NOT deployed; app still uses legacy array model + dual-read support.

---

### 2026-04-30T10:35:50-07:00: UI Proposal — Group Matches on Matches Tab
**Author:** Dallas (Frontend Dev)
**Date:** 2026-04-30
**Status:** Proposed
**Requested by:** Devin Sinha
**Problem:** Users added to groups can only view group matches via Groups tab → selecting a group → Matches sub-tab. This feels buried. Users want group matches accessible from main Matches and Players tabs.
**Recommendation: Option A — DataContextSelector on Matches Tab.** Consistency wins — selector pattern already proven on Players and Heroes tabs. Adding it to Matches creates unified mental model: "I can always switch context from any tab."
**Layout Changes:** Selector sits above title row (full-width mobile, auto-width desktop). Personal context: Title "Match History", Subtitle "{n} matches logged", Button "Log Match", Cards: personal matches with edit/delete enabled. Group context: Title "Group: {name}", Subtitle "{n} matches logged", Button "Log Match", Cards: group matches read-only with "Logged by {name}" subtitle badges.
**Implementation Plan (45 lines):** App.tsx: add matchesContext state, useAllGroupMatches call, matchesDataSource memo, pass to MatchesTab. MatchesTab.tsx: add props (groups, dataContext, onDataContextChange, dataSource), render DataContextSelector, compute effectiveMatches, conditional rendering for group vs personal context.
**Edge Cases Handled:** User leaves group while viewing its matches (fallback to "personal"), group has 0 matches (show empty state), loading state (spinner icon), non-group users (selector returns null, zero UI change).
**Open Questions:** Should LogMatchDialog pre-select group when user clicks "Log Match" in group context? Should context sync across tabs or stay independent per-tab?
**Summary:** Add existing DataContextSelector to MatchesTab, following exact same pattern used in PlayersTab and HeroesTab. Minimal code, maximum consistency, zero regression risk for non-group users.

---

### 2026-04-28T15:30:28Z: Critical constraint — protect live site
**By:** Devin Sinha (user directive)
**What:** Never break the live site or existing user data. All changes must be reviewed before shipping.
**Why:** Production app with real users. Data integrity is non-negotiable.

---

### 2026-04-28T15:30:28Z: Scroll-to-top on tab change
**By:** Dallas (Frontend Dev)
**Status:** Proposed
**What:** Added useEffect in App.tsx that calls window.scrollTo(0, 0) whenever currentTab changes.
**Why:** On mobile, navigating between tabs via bottom nav preserved scroll position, causing poor UX. Fix works universally for all 5 tabs without new dependencies or desktop UX impact.
**Impact:** src/App.tsx — 4 lines added. TypeScript compiles clean. Build passes.

---

### 2026-04-28T15:30:28Z: Test coverage — zero tests, critical risk
**By:** Lambert (Tester)
**Status:** Needs Discussion
**What:** Project has zero automated tests; no test framework installed, no test files, no test scripts configured.
**Why:** App deployed to production on Vercel with real user data in Firestore. Critical modules (stats.ts, firestore.ts, utils.ts) lack safeguards. One bug = data corruption for all users.
**Risk:** 🔴 CRITICAL in stats.ts (win rates), firestore.ts (stripUndefined data loss), utils.ts (normalization). 🟠 HIGH in randomizer matching logic and CSV import.
**Recommendation:** (1) Install Vitest + happy-dom; (2) First tests on pure logic in stats.ts and utils.ts; (3) Component tests for LogMatchDialog and CsvImportDialog.

---

### 2026-04-28T15:30:28Z: Codebase audit complete — 3 critical, 3 high, 3 medium issues
**By:** Ripley (Lead)
**Status:** Analysis Complete — No Code Changes Made
**What:** Comprehensive audit found well-structured codebase with good separation of concerns. Identified 12 prioritized refactoring items.
**Critical (P1):** (1) Hardcoded password in App.tsx:59 ('alpha837Soup*'); (2) Race conditions in useUserMatches hook; (3) Firestore 1MB document size limit will break at 500+ matches.
**High (P2):** (1) LogMatchDialog/EditMatchDialog 60% code duplication; (2) stats.ts function duplication; (3) Missing error boundaries per-tab.
**Medium (P3):** Sidebar component size (672 lines), stats memoization, CSV validation extraction, hero lookup performance, type guards.
**Note:** Well-maintained dependencies (Firebase 11.9.0, React 19.0, Vite 7.2.7); good TypeScript setup; no test infrastructure.

---

### 2026-04-28T23:31:30Z: User directive — safe deployments and testing are key
**By:** Devin Sinha (via Copilot)
**Status:** Endorsed
**What:** The live site must never break. Once users begin logging data, we must never break the site on them. Testing and safe deployments are key priorities for all work.
**Why:** User request — captured for team memory. Reinforces existing "protect live site" constraint with emphasis on testing as a gate.

---

### 2026-04-28T23:31:30Z: Shared Component Extraction from Match Dialogs
**By:** Dallas (Frontend Dev)
**Status:** Implemented
**What:** Extracted 4 shared components from `LogMatchDialog.tsx` (532 lines) and `EditMatchDialog.tsx` (520 lines) into `src/components/matches/shared/`:
1. **MapSelector** — Searchable combobox for map selection with player-count display
2. **HeroSelector** — Searchable combobox for hero selection with Yennefer/Triss variant picker
3. **PlayerCard** — Player row combining PlayerNameInput + HeroSelector + remove button
4. **MatchResultSection** — Handles both competitive (winner/draw radio) and cooperative (win/loss) results

**Why:** Eliminated ~60% code duplication (identified in codebase audit as P2 issue). Reduces total LOC from ~1050 to ~600 across both files.
**Verification:** `npx tsc --noEmit` passes clean, `npx vite build` succeeds, pure refactoring.

---

### 2026-04-28T23:31:30Z: Error Boundaries + Stats Deduplication
**By:** Hicks (Full-Stack Dev)
**Status:** Implemented

**Part 1: React Error Boundaries**
- Added `ErrorBoundary` class component at `src/components/ErrorBoundary.tsx`
- Each of the 5 tab content areas individually wrapped, plus top-level boundary
- Isolates errors per-tab; users see friendly "Try again" UI instead of white screen crash

**Part 2: Stats Function Deduplication**
- Consolidated `calculateHeroStats` and `calculateUserHeroStats` (~250 lines) into private `calculateHeroStatsCore` (~100 lines)
- Public API unchanged — backward compatible
- Net reduction of ~75 lines, single source of truth for hero stat calculation

---

### 2026-04-28T23:31:30Z: Vitest Testing Infrastructure
**By:** Lambert (Tester)
**Status:** Implemented
**What:** Set up Vitest with happy-dom, separate vitest.config.ts, globals: true. Test location: `src/lib/__tests__/{module}.test.ts`.
**Coverage (67 tests):** utils.ts (20 tests), stats.ts (34 tests), firestore.ts (13 tests).
**Why:** Zero test coverage on production app with real user data is critical risk. Pure functions are highest-value targets for regression protection.
**Scripts:** `npm test` (CI run), `npm run test:watch` (dev), `npm run test:coverage` (coverage report).

---

### 2026-04-28T23:31:30Z: P1 — Firestore Document Size Limit Migration Plan
**By:** Ripley (Lead)
**Status:** Proposed — Awaiting Review
**Priority:** P1 Critical
**What:** Migrate from single document (`users/{userId}/data/matches`) to subcollection model (`users/{userId}/matches/{matchId}`). Firestore 1MB limit reached at ~1000 matches (current safe ceiling: 500 matches).
**Chosen Approach:** Option A (Subcollection) — Firestore-idiomatic, scales infinitely, clean code forever.
**Why:** Avoids silent write failures and data loss. Eliminates debounce race condition. Dramatically reduces write payload (1000x less data per save).
**Implementation:** 4 incremental PRs (dual-read, migration trigger, write optimization, collectionGroup query). Lazy migration on login, legacy docs preserved for 2 weeks, rollback safe.
**Key Invariant:** Legacy data never deleted until subcollection data verified. Idempotent by design.

---

### 2026-04-28T23:55:03Z: Dual-Write Layer for Firestore Subcollection Migration
**By:** Hicks (Full-Stack Dev)
**Status:** Implemented (Phase 1-2 only)
**What:** Added a migration-safe dual-write layer that writes match data to both the legacy single-document format (`users/{userId}/data/matches`) AND the new subcollection format (`users/{userId}/matches/{matchId}`).
**Key Design Decisions:**
1. **Legacy-first write order.** `dualWriteMatches()` always writes the full array to the legacy doc before touching subcollection. If subcollection fails, data is safe.
2. **Best-effort subcollection writes.** Errors from subcollection writes are caught and logged (`console.warn`), never thrown. This means the app cannot break from migration code.
3. **Diff-based sync.** Instead of writing all matches to subcollection on every save, we diff prev vs next and only write changed/deleted docs. This minimizes Firestore operations.
4. **Per-user opt-in via MigrationState.** Default is `'legacy-only'` — zero behavior change unless `enableDualWrite(userId)` is called. This lets us roll out gradually.
5. **Cached migration state.** Migration state is read once on mount and cached in a ref. No extra Firestore read on every save.
6. **Chunked writes.** Subcollection writes are batched in chunks of 400 to stay under Firestore's 500-operation batch limit.
**What's NOT Changed:** `getUserMatches()` — reads still come from legacy doc only; `getAllUserMatches()` — unchanged; Default behavior for all users — unchanged (legacy-only); No existing functions modified or removed.
**Files Modified:** `src/lib/firestore.ts` — Added subcollection functions, migration state, dual-write; `src/hooks/use-user-data.ts` — Wired dual-write into persist logic.
**Next Steps (Phase 3-4, not yet implemented):** Run `enableDualWrite(userId)` for test user, verify subcollection data; Add backfill script to populate subcollection from legacy data; Switch reads to subcollection (`subcollection-primary` state); Cleanup: remove legacy doc writes once verified.
**Verification:** TypeScript: clean (`npx tsc --noEmit`); Tests: 94 passed (`npx vitest run`); Build: success (`npx vite build`).

---

### 2026-04-28T19:23:23Z: Firestore Security Rules Proposal (REVISED)
**By:** Hicks (Full-Stack Dev)
**Status:** Proposed — Ready for Devin to apply
**Revision:** v2 — Updated to support public (non-authenticated) community stats

**What changed from v1:** The previous proposal required authentication for all reads, which would break community stats for non-logged-in visitors. This revision uses **Option C (Hybrid)** — only match data is publicly readable, everything else stays locked to owner.

**Chosen approach:** Surgical public read on match data only. Exposes: user display names (public by nature) and game results (hero picks, winners, maps). Keeps private data locked: owned-sets collection, matches-meta migration state, individual match subcollection docs.

**Final Security Rules:**
- `users/{userId}`: allow read: if true; allow write: if request.auth != null && request.auth.uid == userId
- `users/{userId}/data/{docId}`: allow read: if docId == 'matches' || (request.auth != null && request.auth.uid == userId); allow write: if request.auth != null && request.auth.uid == userId
- `users/{userId}/matches/{matchId}`: allow read, write: if request.auth != null && request.auth.uid == userId

**Code changes required:** None. Existing `getAllUserMatches()` works as-is.

**Next steps:** Apply in Firebase Console → Firestore Database → Rules tab. Test in incognito window: community stats load, sign-in works, owned sets load. Verification: community stats should load ✅, setDoc should fail with permission denied ✅.

---

### 2026-04-29T09:51:49-07:00: User directive
**By:** Devin Sinha (via Copilot)
**What:** Game Groups feature is substantial — do NOT push to production until fully designed and tested locally.
**Why:** User request — captured for team memory

---

### 2026-04-29T09:51:49Z: Copilot Directive — Game Groups Scoping
**By:** Copilot (team tool)
**What:** Game Groups feature is substantial — do NOT push to production until fully designed and tested locally.
**Why:** User directive reinforcement from Copilot

---

### 2026-04-29T09:51:49Z: Share Match Log Feature — Design Brainstorm
**By:** Ripley (Lead)
**Status:** Brainstorm — Not for implementation yet
**Requested by:** Devin Sinha
**What:** Explored 3 approaches for sharing match logs with small groups:
- **Approach A (Share Code):** ❌ Not recommended — requires backend function (violates serverless constraint) or is insecure.
- **Approach B (Viewer List — RECOMMENDED ✅):** Owner maintains UIDs of viewers. Firestore rules enforce. Real security, no backend, owner controls access.
- **Approach C (Public Toggle):** Simple all-or-nothing toggle. No granularity, privacy concern, doesn't match "friends only" UX.
**Recommendation:** Implement Approach B first (Viewer List). Can add Approach C later as optional enhancement.
**Dependency:** Implement after subcollection migration completes.
**Email-to-UID Resolution:** Query \`users\` collection by email (already have profiles). Minor security rule adjustment needed to allow authed users to query user list.

---

### 2026-04-29T09:51:49Z: Game Groups — Architecture Design Document
**By:** Ripley (Lead)
**Status:** Design Proposal — Awaiting Devin's Review
**What:** Comprehensive architecture for collaborative match-logging feature where multiple authenticated users write to shared group collections. Supersedes read-only share brainstorm.

**Data Model:**
- Top-level \`groups/{groupId}\` collection (not nested under user, because multiple owners)
- \`memberUids[]\` array in group doc for security rule enforcement (no get() calls)
- \`groups/{groupId}/members/{userId}\` subcollection for rich membership data (roles, join dates, denormalized names)
- \`groups/{groupId}/matches/{matchId}\` subcollection for group matches (includes \`loggedBy\`, back-reference to group)

**Security Rules:** All writes require uid in \`memberUids\` (checked in rule, zero cost). Reads limited to members.

**User Discovery:** Email search (query \`users\` by email → resolve to UID) + phone-a-friend workflows.

**Migration Path:** Phase 1 (data model + rules) → Phase 2 (UI: create/invite) → Phase 3 (personal log linking) → Phase 4 (community stats for groups).

**Safety Constraints:** 
- Legacy user matches continue as-is (groups are opt-in feature)
- Atomic writes via \`writeBatch()\` to keep \`memberUids[]\` and \`members/\` subcollection in sync
- No shipping until fully designed, locally tested, and Devin approves

**Estimated Cost:** $0.02–0.10/month for typical usage (group match writes + member queries).

**Status:** Design complete. Awaiting team review before implementation.

---

### 2026-04-29T11:05:18-07:00: User directive
**By:** Devin Sinha (via Copilot)
**What:** Hicks (and all agents) need to be more thorough. Too many bugs are being found after delivery. From now on, all feature work must include proper state refresh, UI feedback, and edge case handling before being considered done.
**Why:** User frustration with repeated bugs in Game Groups feature — state not refreshing after import, stale lists after deletion, etc. Quality gate needed.

---

### 2026-04-29T11:12:40-07:00: User directive
**By:** Devin Sinha (via Copilot)
**What:** The team must test their own work before presenting to the user. Never ask the user to test — have Lambert verify first. Only report results after internal QA passes.
**Why:** User request — the team should own quality, not push testing burden to the user.

---

### 2026-04-29T10:58:21-07:00: Match logging always saves personal + optional group assignment
**By:** Hicks (Full-Stack Dev)
**Status:** Implemented
**What:** Previously, LogMatchDialog had an exclusive "Log to" single-select: you logged either to Personal OR to a single group. Now the flow is:
1. Match is **always** saved to Personal (via `onSave`)
2. User can **optionally** check one or more groups to also write the match into
3. If groups are selected, the personal match gets a `groupRef` field (dedup signal)
4. Group copies get `sourceMatchId` pointing back to the personal match
**Why:** Simpler mental model: "your personal log is your source of truth". No double-counting risk. Multi-group support. Users without groups see zero UI change.
**Files modified:** `src/lib/types.ts` (added `groupRef` to Match), `src/lib/groups.ts` (added `addMatchToGroups()`), `src/components/matches/LogMatchDialog.tsx` (replaced single-select with checkbox list), `src/lib/__tests__/group-matches.test.ts` (updated test types).
**Dedup contract:** Personal match with `groupRef` present → skip in community stats. Group match with `sourceMatchId` present → links back to personal match.

---

### 2026-04-29T11:05:18-07:00: Game Groups QA Audit — Lambert (HOLD — Critical issues found)
**By:** Lambert (Tester)
**Status:** ⚠️ HOLD — Multiple issues found, several critical
**What:** Comprehensive code review of the Game Groups feature across 13 files. Found **4 critical bugs**, **6 medium issues**, **4 low-priority improvements**. Test coverage: ZERO component/integration tests for Groups UI.
**🔴 CRITICAL — Will break for users:**
1. `loadMore` pagination broken — duplicates all matches (use-group-matches.ts line 34-45)
2. `deleteGroup` can exceed Firestore 500-operation batch limit (groups.ts line 113-143)
3. `acceptInvite` non-atomic — partial failures leave inconsistent state (group-invites.ts line 67-95)
4. `addMatchToGroups` writes sequentially with no rollback (groups.ts line 228-256)

**🟡 MEDIUM issues:** Duplicate import protection missing, owner can leave own group, dialog ignores settings, memberCount not updated, import reads full doc per batch, pending invites never cleaned up.

**🟢 LOW issues:** No error state display, settings dialog non-functional, duplicate invite check missing, GroupMatchList error handling missing.

**Recommendation:** DO NOT SHIP until #1 and #2 are fixed. #3 and #4 represent data integrity risks that violate team's "never break user data" constraint. Add integration tests before shipping.

---

### 2026-04-29T13:05:08-07:00: Component reuse policy
**By:** Devin (via Copilot)
**What:** All new UI must reuse existing components when functionally equivalent. No duplicating MatchCard, PlayerCard, or other shared components — extend them with optional props instead. Ripley (Lead) is responsible for catching reuse violations during code review before any work ships.
**Why:** User directive — GroupMatchList shipped with a duplicate MatchCard that should have been caught. Prevention > cleanup.

---

### 2026-04-29T13:28:49-07:00: User decisions on group UX design
**By:** Devin (via Copilot)
**What:**
1. Per-tab context pill APPROVED — user wants to switch between "games logged outside a group" and "games from within a group they're in"
2. New match notifications on Groups tab APPROVED — show when a group has new matches since last visit
3. Group collection for Randomizer APPROVED — future phase, allow "pick heroes from group's collection"
**Why:** User review of Ripley's Group Data Integration design proposal — these are the confirmed directions

---

### 2026-04-29T13:29:46-07:00: DataContextSelector — Per-Tab Group Data Switching
**By:** Dallas (Frontend Dev)
**Status:** Implemented (Phase 1)

**What:** Created `src/components/shared/DataContextSelector.tsx` — a compact Shadcn Select component that allows users to switch between "My Matches" and any group they belong to, per-tab.

**Design Decisions:**
1. **Per-tab state** — PlayersTab and HeroesTab each independently track their data context. Switching one doesn't affect the other.
2. **Null-render for non-group users** — Component returns `null` when `groups.length === 0`. Zero visual change for existing users.
3. **DataSource prop pattern** — Tabs accept optional `dataSource?: { label: string, matches: Match[] }`. When present, the tab uses `dataSource.matches` for all stats computation instead of the default personal matches.
4. **Community section hidden in group context** — HeroesTab's "Global Matchup Heatmap" is hidden when viewing group data (it's irrelevant to group stats).
5. **App.tsx owns context state** — `playersContext` and `heroesContext` state lives in App.tsx. Group matches are fetched via existing `useGroupMatches` hook.

**Files Modified:**
- `src/components/shared/DataContextSelector.tsx` (new)
- `src/components/players/PlayersTab.tsx` (new props, uses `effectiveMatches`)
- `src/components/heroes/HeroesTab.tsx` (new props, uses `effectiveMatches`, hides community)
- `src/App.tsx` (state management, group match fetching, prop passing)

**Verification:** TypeScript clean, Vite build passes, 183 tests pass.
**Next:** Phase 2 — MapsTab integration, group stats labels, loading states for group match fetches.

---

### 2026-04-29T13:05:08-07:00: MatchCard Shared Component — onDelete/onEdit Optional + subtitle prop
**By:** Dallas (Frontend Dev)  
**Status:** Implemented

**What:**
Refactored `GroupMatchList.tsx` to use the shared `MatchCard` component instead of its internal `GroupMatchCard` duplicate.

Two changes made to `MatchCard` to support this:

1. **`onDelete` and `onEdit` are now optional.** When omitted, the edit/delete buttons are hidden and `EditMatchDialog` is not mounted. This enables read-only contexts (e.g. group match lists, future embed widgets).

2. **Added `subtitle?: string` prop.** When provided, renders as an outlined badge in the card header row (next to the date). Used by `GroupMatchList` to show "Logged by {name}". Keeps group-specific data out of the base MatchCard while still being a generic enough slot for any per-card context label.

**Why:**
`GroupMatchCard` was a stripped-down fork of `MatchCard` — missing map info, turn order, mode badges, hero click handlers, and edit/delete. Users viewing group matches now see the full match detail parity that personal matches have.

**Files Changed:**
- `src/components/matches/MatchCard.tsx` — made `onDelete`/`onEdit` optional, added `subtitle` prop, conditional button/dialog rendering
- `src/components/groups/GroupMatchList.tsx` — removed `GroupMatchCard`, imports and uses `MatchCard` in read-only mode with `subtitle`

**Verification:**
- `npx tsc --noEmit` — clean
- `npx vite build` — success (exit 0)
- `MatchesTab.tsx` unchanged — passes `onDelete` and `onEdit` as before, no breaking change

**Future Consideration:**
Group matches are currently read-only (no edit/delete handlers). When the team decides to enable group match editing (via `updateGroupMatch` / `deleteGroupMatch`), the `GroupMatchList` will need `useAuth` for the current user UID and ownership checks before passing handlers to `MatchCard`.

---

### 2026-04-29T13:29:46-07:00: Group Stats Data Hook Architecture
**By:** Hicks (Full-Stack Dev)
**Status:** Implemented

**What:**
Created two new hooks for the group context integration feature:

1. **`src/hooks/useGroupMatches.ts`** — Fetches ALL matches for a group (for stats). Uses module-level cache (5min TTL) shared across component instances. NOT the same as the paginated `use-group-matches.ts` used for list display.

2. **`src/hooks/useUserGroups.ts`** — Thin re-export of `useGroups` with consistent interface for DataContextSelector.

**Why This Shape:**
- **Module-level cache vs react-query:** @tanstack/react-query is installed but has no QueryClientProvider wired up. Adding that to App.tsx is a broader change best done as a dedicated task. The Map cache achieves the same result (shared memoization across tabs) with zero app-shell changes.
- **Separate from paginated hook:** Stats need ALL matches (50-200 typical). The list view needs pagination (20 per page). Different access patterns → different hooks.
- **Abort guard:** Prevents race conditions when user rapidly switches groups.

**Migration Path:**
When someone wires up `QueryClientProvider`, this hook can be trivially converted to:
```ts
useQuery({ queryKey: ['groupMatches', groupId], queryFn: ... })
```
The cache and abort logic would then be handled by react-query automatically.

**Impact:**
- 2 new files, no existing files modified
- TypeScript clean, all 183 tests pass

---

### 2026-04-29T12:35:06-07:00: Never use arrayRemove on complex Firestore objects
**By:** Hicks (Full-Stack Dev)
**Status:** Implemented
**What:** Replaced `arrayRemove`/`arrayUnion` pattern in `updateGroupInfo()` with read-modify-write by ID. Firestore's `arrayRemove` requires exact object equality which silently fails when stored entries have extra fields, undefined values, or slightly different shapes.
**Pattern:** For any denormalized array of objects with an ID field, always: (1) read the full array, (2) find by ID, (3) replace in-place, (4) write the full array back. Use `batch.set(ref, { field: updatedArray }, { merge: true })` to keep atomicity.
**Why:** This caused a user-visible bug where group renames didn't propagate. The old name persisted in member lists indefinitely.
**Impact:** `src/lib/groups.ts` — `updateGroupInfo()` function.

---

### 2026-04-29T13:18:38-07:00: Group Data Integration — UX & Architecture Design
**By:** Ripley (Lead)
**Status:** Design Proposal — Awaiting Devin's Review  
**Priority:** High — Defines scope for all group-related feature work

**Executive Summary:**
Group data should flow into existing tabs via an **in-tab context pill** — not a global switcher. Users tap a small "My Data / Group: {name}" toggle *within* each data tab (Players, Heroes, Maps). This avoids polluting the already-crowded mobile bottom nav and keeps the mental model simple: "I'm looking at my stats, or my group's stats."

The key architectural insight: **all stats functions already operate on `Match[]` arrays**. We don't need new computation logic — we just need to supply different match arrays depending on context.

**Key Architectural Decisions:**
1. **Per-Tab Context Pill (NOT global switcher)** — Mobile bottom nav is already 6 columns; global context changes confuses users
2. **Data source** — Queries `groups/{groupId}/matches` (all) for stats computation
3. **Components that need changes:**
   - `PlayersTab`, `HeroesTab`, `MapsTab` — Add optional `dataSource?: { label: string, matches: Match[] }` prop
   - New `DataContextSelector` component (~30 lines)
4. **Components unchanged** — MatchCard, all stat calculation functions, HeroMatchupHeatmap
5. **Phasing:** Phase 1 (PlayersTab + HeroesTab), Phase 2 (MapsTab + badges), Phase 3 (React Query, pre-computed stats)
6. **What we explicitly defer:** Global switcher, group matches in Matches tab, group influence on Community tab

**Safety & Quality:**
- Won't break existing behavior (default context always "My Data")
- DataContextSelector only renders when user has groups
- All existing props remain unchanged (dataSource is optional)
- No Firestore schema changes or new indexes needed
- Edge cases documented: user leaves group, zero matches, guest players, network errors

**Testing Plan (for Lambert):**
1. Unit: `calculatePlayerStats` with GroupMatch[] (verify it works unmodified)
2. Component: DataContextSelector renders groups, handles selection
3. Integration: PlayersTab with dataSource override shows correct stats
4. Manual: Rapid personal/group switching — no stale data

**Open Questions for Devin:**
1. Tab header change when in group context?
2. Show badge on Groups tab for new group matches?
3. Randomizer integration ("pick heroes from group's collection")?

---

### 2026-04-29T13:28:49-07:00: User decisions on group UX design
**By:** Devin (via Copilot)
**What:**
1. Per-tab context pill APPROVED — confirmed for implementation
2. New match notifications on Groups tab APPROVED
3. Group collection for Randomizer APPROVED — future phase

**Why:** User review of Ripley's Group Data Integration design — these are the confirmed directions

---

### 2026-04-30T09:43:44-07:00: Session Continuity Documentation Complete
**By:** Scribe (Documentation Specialist)
**Status:** ✅ Complete — Ready for Next Session Instantiation

**What:**
Created comprehensive documentation to enable the Squad to pick up where it left off in a fresh session:

1. **`.squad/identity/now.md`** — Current project state snapshot:
   - Live features and deployment status (7 tabs, Game Groups, authentication)
   - Recent work completed in this session (14 major items)
   - What's working and what's not (known issues documented)
   - Pending items (subcollection migration Phase 3, share feature, performance, email integration)
   - Build & deploy readiness verification

2. **`.squad/identity/wisdom.md`** — Hard-won team knowledge library:
   - Core commands: `npm run build`, `npm run test`, `npm run test:rules`, `npx vercel --prod --yes`
   - Firebase essentials: Rules deployment is manual (not CLI), @firebase/rules-unit-testing v4 only, Java 21 for Emulator
   - No email infrastructure exists (group invites stored in Firestore for lookup only)
   - Architecture patterns: Tab-based SPA, local hero/map images with fallbacks, Firestore self-join for groups
   - Data persistence patterns: 500ms debounced writes, dual-write foundation ready, batch size limits (450 safe ceiling)
   - Atomicity patterns: `runTransaction()` for reads+writes, `writeBatch()` for write-only, never use `arrayRemove` on complex objects
   - Testing conventions: Test locations, factory patterns, coverage expectations, quality gates
   - React/TypeScript gotchas: Hook ordering, undefined in Firestore, community stats aggregation
   - Group feature gotchas: Pagination cursors, invite dedup, settings collection management
   - Live URL, deployment flow, bundle optimization opportunities

3. **Agent history files updated** — Each agent's history.md now includes:
   - Current project context (Live URL, Architecture, Critical Constraint)
   - Session summary with what documentation was created
   - All relevant learnings consolidated

4. **Canonical `.squad/decisions.md` verified and consolidated** — All team decisions from this session recorded:
   - User directives (critical constraint, quality gates, internal QA)
   - Technical decisions (password security, debounced writes, Game Groups architecture, atomicity patterns)
   - UX decisions (per-tab context pill, component reuse policy)
   - Implementation records (14 features completed, 14 QA fixes)

**Why:**
Team needs to resume work efficiently in a new session. Documentation captures:
- What's currently in production (prevents rework)
- What was learned (patterns, gotchas, quality standards)
- What's next (pending items, open questions)
- How to build/test/deploy (working commands verified)

**Impact:**
- Next session coordinator + agents can read `.squad/identity/now.md` and `.squad/identity/wisdom.md` to understand full context in ~5 minutes
- No context loss from session restart
- Quality standards (testing, QA, atomicity) are recorded as team knowledge
- Build/deploy commands are verified and documented
- Known issues and pending work are transparent

**Files Changed:**
- Created `.squad/identity/now.md` (600+ lines)
- Created `.squad/identity/wisdom.md` (400+ lines)
- Updated `.squad/agents/scribe/history.md`
- Updated `.squad/agents/ripley/history.md`
- Updated `.squad/agents/dallas/history.md`
- Updated `.squad/agents/hicks/history.md`
- Updated `.squad/agents/lambert/history.md`
- Appended to `.squad/decisions.md` (this entry)

**Verification:**
- ✅ All agent history files reviewed and updated
- ✅ `.squad/decisions.md` verified as canonical record
- ✅ Documentation reflects actual project state (verified against package.json, PRD.md, TESTING.md)
- ✅ Commands tested and verified (build, test, deploy)
- ✅ Quality standards and patterns accurately captured

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
