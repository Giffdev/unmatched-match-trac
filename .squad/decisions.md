# Squad Decisions

> Canonical decision ledger for the Unmatched Tracker squad. Append-only.

## Active Decisions

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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
