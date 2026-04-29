# Ripley — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches, analyzing player/hero statistics, and generating balanced matchups. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Critical constraint: never break the live site or user data.

## Learnings

### 2026-04-28T15:30:28-07:00 — Codebase Audit
- **Entry point:** `src/main.tsx` → `AuthProvider` → `App.tsx` (tab-based SPA)
- **Data layer:** `src/lib/firestore.ts` is the Firestore interface. `src/hooks/use-user-data.ts` manages load/save.
- **Data model:** Single document per user with all matches in an array field. 1MB Firestore limit = ~500 match ceiling.
- **Static data:** `src/lib/data.ts` (42KB) contains all hero/map definitions with inline image imports (105 images, 26MB).
- **Stats:** `src/lib/stats.ts` (16KB) — pure computation, no caching.
- **Critical pattern:** `getAllUserMatches()` is called independently by 7 components with no shared cache.
- **Security:** Hardcoded admin password in client bundle (`App.tsx:59`).
- **Bundle risks:** Three icon libraries (Phosphor, Heroicons, Lucide), Three.js, d3, recharts all shipped eagerly.
- **No lazy loading, no React.lazy, no code splitting beyond Vite defaults.**
- **Largest components:** PublicHeroBrowser (24KB), HeroesTab (22KB), LogMatchDialog (22KB), MapsTab (21KB).
- **`@tanstack/react-query` is installed but appears unused** — data fetching is manual useEffect + useState.

### Codebase Audit Session (2026-04-28)

**Critical Security Issue Found:**
- Hardcoded password `'alpha837Soup*'` in App.tsx line 59 for match import. Immediately requires moving to environment variables and implementing proper auth mechanism.

**Data Integrity Risks Identified:**
- Race condition in useUserMatches hook: rapid state updates can cause out-of-order Firestore writes. Requires debouncing/write queue.
- Firestore document size risk: all matches stored in single document. Will fail at 500+ matches (~1MB limit). Needs migration to subcollection model.
- No runtime type validation on Firestore reads. Corrupted legacy data could silently fail.

**Code Duplication Patterns:**
- LogMatchDialog (532 lines) and EditMatchDialog (520 lines): 60% duplicate code. Extract MapSelector, HeroSelector, PlayerForm to shared components.
- stats.ts: calculateHeroStats and calculateUserHeroStats are 80% identical (125 lines). Consolidate with parameterized core function.

**Component Complexity:**
- Five files exceed 400 lines: sidebar.tsx (672), CSVImport (537), LogMatchDialog (532), EditMatchDialog (520), HeroesTab (483).
- No error boundaries on individual tabs; single tab crash kills entire app.
- Missing: memoization in stats calculations, O(n) hero/map lookups, validation layer.

**Strengths:**
- Good separation: stats logic, Firebase layer, UI components well-decoupled.
- Strong typing with TypeScript throughout.
- Proper hook design for data persistence.
- Mobile-first responsive UI.

**Recommendations by Priority:**
1. **P1 (Critical):** Remove password, fix race conditions, prevent Firestore size limits
2. **P2 (High):** Extract duplicate components, add error boundaries, improve normalization
3. **P3 (Medium):** Refactor sidebar, memoize stats, add data validation

Full audit written to `.squad/decisions/inbox/ripley-codebase-audit.md`.

### 2026-04-28T23:13 UTC — Password Removal Complete (Hicks)
- **Status:** ✅ RESOLVED — P1 security issue addressed
- **Change:** Hardcoded password moved to `VITE_IMPORT_PASSWORD` environment variable
- **Files:** `src/App.tsx` (1 line), `.env.example` (1 line added)
- **Build:** ✅ Passes cleanly
- **Next:** Deploy teams must set env var in Vercel settings

### 2026-04-28T23:16 UTC — Debounce Firestore Writes (Hicks)
- **Status:** ✅ RESOLVED — P1 data integrity issue addressed
- **Change:** Added 500ms debounce to persist effect in `src/hooks/use-user-data.ts`
- **Problem:** Rapid state changes spawned concurrent Firestore writes; network latency caused writes to resolve out of order, stale payloads overwriting latest data
- **Solution:** Accumulate rapid changes, write only final state after 500ms quiet. Cleanup flushes pending writes immediately.
- **Build:** ✅ Passes cleanly
- **API:** Unchanged

### 2026-04-28T23:31 UTC — Firestore Migration Plan Designed (Ripley)
- **Status:** 📋 PLAN WRITTEN — Awaiting team review
- **Decision:** Option A (subcollection model) chosen over chunked docs or hybrid
- **Path change:** `users/{userId}/data/matches` → `users/{userId}/matches/{matchId}`
- **Key insight:** Match object is ~500-800 bytes. Ceiling is ~1,000 matches, not 500 as initially estimated. Still critical.
- **Migration strategy:** Lazy migration on login, version flag in `matches-meta` doc, idempotent retry
- **Safety invariant:** Legacy document NEVER deleted until subcollection verified. Two-week bake period.
- **Performance win:** Individual doc writes (500B) vs full-array writes (500KB) = 1000x less write data
- **Bonus:** collectionGroup query for getAllUserMatches is actually faster than current N-sequential-reads
- **Implementation:** 4 incremental PRs, each independently shippable and rollbackable
- **Eliminates:** The debounce race condition entirely (atomic per-match writes replace full-array overwrites)
- **Plan location:** `.squad/decisions/inbox/ripley-firestore-migration-plan.md`

### 2026-04-28T23:31:30Z: Team Decisions Consolidated (Scribe)
- Firestore migration plan and all team work captured in canonical `.squad/decisions.md`
- All 5 decisions now recorded: user directive, Dallas extraction, Hicks error boundaries + stats, Lambert Vitest, Ripley Firestore plan
- Orchestration logs written per agent; team checkpoint recorded

### 2026-04-29T09:41:50-07:00 — Share Feature Brainstorm (Ripley)
- **Request:** Devin wants Flysto-style shared match log viewing (small friend group, read-only)
- **Recommended approach:** Explicit viewer list stored in `users/{userId}/data/sharing` doc with Firestore rules enforcing access via `get()` in rule conditions
- **Key insight:** Firestore rules can't validate "knows a secret code" — share codes require a Cloud Function (violates serverless constraint). Viewer UID list is the only truly secure serverless option.
- **Dependency:** Must complete subcollection migration first — sharing reads from `/matches/{matchId}` subcollection, not legacy array doc
- **Email→UID resolution:** Query existing `users` collection by email field (already stored in profiles)
- **Reverse index needed:** `viewers/{viewerUid}/shared-with-me` for "what logs can I view?" queries
- **Future option:** Public profile toggle (Approach C) as simple complement for less privacy-sensitive users
- **Decision file:** `.squad/decisions/inbox/ripley-share-feature-brainstorm.md`

### 2026-04-29T09:51:49-07:00 — Game Groups Architecture Design (Ripley)
- **Status:** 📋 DESIGN WRITTEN — Awaiting Devin's answers to 5 critical questions
- **Evolution:** Previous read-only sharing concept → full collaborative Game Groups (all members write)
- **Data model decision:** Top-level `groups/{groupId}` collection (not nested under users) — only correct choice for multi-user ownership
- **Membership enforcement:** `memberUids[]` array in group doc for security rules (single `get()` per check) + `members/` subcollection for rich display data. Both kept in sync via batch writes.
- **Match storage:** `groups/{groupId}/matches/{matchId}` subcollection — separate from personal matches by default
- **Personal-copy linking:** Optional per-group setting. Group matches don't pollute personal stats unless user opts in.
- **Key tradeoff:** Array-in-doc for security rule checks vs subcollection for rich data → use BOTH, sync atomically
- **Security rules:** Only 1 `get()` per rule evaluation. Admin role enforced at app level (not rules) to avoid rule complexity explosion.
- **Zero migration risk:** Groups are isolated collection — no impact on existing personal matches, community stats, or subcollection migration
- **User discovery:** Email exact-match + playerNameLower prefix query on existing `users` collection (already publicly readable)
- **Incremental deploy:** 7 phases, feature-flag gated, trivial rollback (remove UI tab)
- **Cost:** < $0.01/month for 10 users, 5 groups, 20 matches/week
- **Blocking questions for Devin:** (1) Personal copy linking default, (2) Who can invite, (3) Match ownership after leaving, (4) Max groups cap, (5) Group matches in community stats
- **Design file:** `.squad/decisions/inbox/ripley-game-groups-design.md`

