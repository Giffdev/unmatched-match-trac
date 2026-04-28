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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
