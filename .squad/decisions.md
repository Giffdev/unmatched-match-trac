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

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
