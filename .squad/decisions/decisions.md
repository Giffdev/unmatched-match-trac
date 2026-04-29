# Decisions Log

## 2026-04-29 — User Directive: Retroactive Match Import to Groups

**Date:** 2026-04-29T10:39:46-07:00  
**By:** Devin Sinha (via Copilot)

### Directive
Group members (owner or anyone authorized to log matches) should be able to retroactively add their existing personal matches to a group. Provide a selector UI that lets users choose which matches to import (or select all).

**Rationale:** Groups shouldn't start empty if members already have relevant match history. This makes the feature immediately useful without waiting for new games to be played.

---

## 2026-04-29 — User Directive: Log-to-Group at Match Time

**Date:** 2026-04-29T10:55:33-07:00  
**By:** Devin Sinha (via Copilot)

### Directive
When logging a new match, the user should be able to optionally add it to their group(s) at the same time. The match must not be counted duplicate times — it's one match that appears in both the personal record and the group.

**Rationale:** User request — captured for team memory. This is the forward-looking companion to the retroactive import feature.

---

## 2026-04-29 — Lambert: Game Groups Test Coverage Strategy

**Date:** 2026-04-29T10:04:15-07:00  
**By:** Lambert (Tester)  
**Status:** Implemented

### What
Created 89 tests across 4 files covering the Game Groups feature data layer before implementation code lands. Tests validate expected Firestore operations and data invariants.

### Key Testing Decisions

1. **Mock at firebase/firestore module level** — Tests don't import the (not-yet-created) source files directly. They validate Firestore operations (writeBatch, arrayUnion/arrayRemove, where queries) and data shape contracts. Once Hicks' code lands, tests can be updated to call the actual functions.

2. **Double-counting prevention is a first-class test target** — The `isGroupMatch` flag on personal copies must be filtered out during community stats aggregation. This is the highest-risk invariant in the design.

3. **Atomicity via writeBatch is mandatory for** — group creation (group doc + member doc), membership changes (memberUids + member subcollection + reverse index), invite acceptance (status + membership + pending list).

4. **Edge cases that MUST be handled in implementation:**
   - Owner cannot leave without transferring ownership or deleting group
   - Duplicate invites to same user/group must be blocked
   - Expired invites must be validated at accept-time
   - Empty search must short-circuit (no Firestore reads)
   - Match/personal-copy deletion must be atomic

### Impact
- Total test count: 183 (94 existing + 89 new)
- All tests passing, no regressions
- Tests serve as specification for Hicks' implementation

---

## 2026-04-29 — Dallas: Game Groups UI Architecture

**Date:** 2026-04-29T10:04:15-07:00  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented on `feature/game-groups` branch — NOT shipped

### What
Built the complete Game Groups UI layer (hooks + components + integration) on top of Hicks's data layer.

### Key Decisions

1. **Groups as 6th Tab (not a nested view)** — Groups gets its own top-level tab rather than being buried in a settings/profile view. This gives it equal prominence and matches the task spec. Mobile nav expands from 5-column to 6-column grid.

2. **GroupView uses inline sub-tabs (not Shadcn Tabs)** — Inside a group, I used simple button-based sub-tabs (Matches/Members/Stats) with border-bottom active indicator rather than nesting another Shadcn `<Tabs>` component. This avoids the complexity of nested tab state and keeps the DOM simpler.

3. **Log-to-group selector in LogMatchDialog** — When a user belongs to 1+ groups, a "Log to" Select appears at the top of LogMatchDialog. Choosing a group routes to `logGroupMatch()` instead of the personal `onSave()` callback. This is minimally invasive — the rest of the form is unchanged.

4. **Notification badge approach**
   - Mobile: small red dot (2x2) positioned on the Groups nav button
   - Desktop: numbered badge (4x4) positioned on the TabsTrigger

5. **Hooks follow existing pattern** — All hooks use `useState` + `useEffect` + `useCallback(fetch)` — same as `use-auth.ts` and `use-user-data.ts`. No React Query or SWR introduced to keep the dependency footprint unchanged.

### Files Created
- `src/hooks/use-groups.ts` — useGroups, useGroup, usePendingInvites
- `src/hooks/use-group-matches.ts` — useGroupMatches (paginated)
- `src/hooks/use-group-members.ts` — useGroupMembers
- `src/components/groups/GroupsTab.tsx`
- `src/components/groups/GroupView.tsx`
- `src/components/groups/CreateGroupDialog.tsx`
- `src/components/groups/InviteMemberDialog.tsx`
- `src/components/groups/PendingInvites.tsx`
- `src/components/groups/MemberList.tsx`
- `src/components/groups/GroupMatchList.tsx`

### Files Modified
- `src/App.tsx` — added 6th tab (desktop + mobile)
- `src/components/matches/LogMatchDialog.tsx` — added group target selector

### Verification
- 183 tests pass (`npx vitest run`)
- Build clean (`npx vite build`)
- No existing functionality modified

---

## 2026-04-29 — Hicks: Game Groups Data Layer Decisions

**Date:** 2026-04-29T10:04:15-07:00  
**By:** Hicks (Full-Stack Dev)  
**Status:** Implemented (Phase 1 — local only, feature/game-groups branch)

### Key Data Layer Decisions

1. **stripUndefined duplicated per-module (not imported from firestore.ts)** — Each group module has its own `stripUndefined` copy. Reason: `firestore.ts` doesn't export it, and importing creates coupling to a file focused on legacy match operations. Can refactor to shared utility later.

2. **Reverse index stores full membership objects (not just IDs)** — `users/{userId}/data/groups` stores `UserGroupMembership[]` with groupId, groupName, and role. This avoids N+1 reads when showing a user's group list — no need to fetch each group doc just to display the name.

3. **Invites stored in TWO places**
   - `groups/{groupId}/invites/{inviteId}` — for group owners to see all invites
   - `users/{userId}/data/group-invites` — for invitees to see their pending invites without querying all groups
   - Trade-off: slight denormalization vs. query simplicity. Accept/decline updates both locations.

4. **autoAddToPersonal appends to legacy matches array** — When `autoAddToPersonal` is true, `logGroupMatch` appends to the user's `users/{userId}/data/matches` doc with a `groupRef` field. This ensures group matches appear on personal dashboard (per Devin's decision). The `groupRef` field allows future filtering/deduplication from community stats.

5. **Owner-only edit/delete enforced at application layer** — `updateGroupMatch` and `deleteGroupMatch` check `loggedBy === userId` before proceeding. Security rules should enforce this too, but app-layer check provides clear error messages.

6. **User discovery requires `playerNameLower` field** — `searchUserByPlayerName` uses a Firestore range query on `playerNameLower`. This field must be added to user profile creation/update flows — not yet done (Phase 2 concern).

### Files Created
- `src/lib/group-types.ts`
- `src/lib/groups.ts`
- `src/lib/group-matches.ts`
- `src/lib/group-invites.ts`
- `src/lib/user-discovery.ts`

---

## 2026-04-29 — Hicks: Game Groups Security Rules Decision

**Date:** 2026-04-29T10:18:17-07:00  
**By:** Hicks (Full-Stack Dev)  
**Status:** Implemented (feature/game-groups branch only — NOT deployed)

### Decision
Created `firestore.rules` with comprehensive security rules for Game Groups while preserving all existing user rules.

### Key Design Choices

1. **memberUids[] on group doc for O(1) membership checks** — Avoids `get()` calls when checking group-level access. Subcollection rules still need `get()` but it's cached per-request.

2. **Owner-only group updates** — Simplifies the update rule. Admin role is checked only for member management and invite operations (via members subcollection lookup).

3. **loggedBy enforcement on create** — `request.resource.data.loggedBy == request.auth.uid` prevents any member from logging matches attributed to someone else.

4. **Dual-access pattern for invites** — Both group members and the specific invitee can read invite docs. This allows invitees to see their pending invites without being group members yet.

5. **Helper functions scoped to groups match block** — Keeps rules DRY and readable. Functions like `isMemberOfGroup()` and `isAdminOrOwner()` encapsulate the `get()` patterns.

### Files
- `firestore.rules` — The actual rules
- `firestore.rules.docs.md` — Team documentation with access matrix and testing checklist

### Next Steps
- Lambert to write rule unit tests (firebase-rules-unit-testing)
- Do NOT deploy until full feature is tested locally
- Consider tightening invite create rules later (e.g., require admin for invite-only groups)

---

## 2026-04-28 — Debounce Firestore Writes in useUserMatches

**Date:** 2026-04-28T16:16:41-07:00  
**By:** Hicks (Full-Stack Dev)  
**Status:** Implemented

### What
Added 500ms debounce to the persist effect in `src/hooks/use-user-data.ts`. Rapid `matches` state changes now accumulate, with only the final state written after 500ms of quiet. On effect cleanup (unmount or userId change), pending writes flush immediately to prevent data loss.

### Why
The persist effect fired on every `setMatches()` call, spawning concurrent Firestore writes. Network latency is unpredictable, so writes resolved out of order — stale payloads overwrote latest data. This was especially dangerous during CSV import (hundreds of match changes) or rapid user interactions.

### How
- 500ms debounce threshold: imperceptible to users, eliminates all concurrent-write scenarios.
- On cleanup, any pending write flushes immediately.
- `saveGeneration` counter still suppresses error toasts from stale saves.
- `loadedFromDb` guard still prevents writing on initial load.
- Public API unchanged: `{ matches, setMatches, loading }`.
- No new dependencies. Build passes.

### Risk
If the browser tab closes within the 500ms debounce window, the final write may not fire. Acceptable since `beforeunload` is unreliable anyway, and cleanup handles all React-lifecycle scenarios.

---

## 2026-04-28 — Remove Hardcoded Password from App.tsx

**Date:** 2026-04-28T16:13:58-07:00  
**By:** Hicks (Full-Stack Dev)  
**Status:** Implemented — pending review by Ripley

### What
Replaced the hardcoded password `'alpha837Soup*'` in `src/App.tsx` (line 59) with `import.meta.env.VITE_IMPORT_PASSWORD`. Added the variable to `.env.example`.

### Why
Hardcoded secrets in source code are a critical security risk — they end up in version control, CI logs, and client bundles. Moving to an environment variable keeps the secret out of the repo while preserving identical runtime behavior.

### Impact
- `src/App.tsx`: 1 line changed (string literal → env var reference)
- `.env.example`: 1 line added (`VITE_IMPORT_PASSWORD=`)
- No functional change to the import flow — password prompt still works identically
- Deployers (Vercel) must set `VITE_IMPORT_PASSWORD` in environment settings

### Risk
Low. If `VITE_IMPORT_PASSWORD` is not set, the comparison will always fail (undefined !== user input), effectively disabling the import gate — a safe-fail posture. To restore access, set the env var.

---

## 2026-04-28 — User Directive: No Hardcoded Secrets

**Date:** 2026-04-28T16:13:58Z  
**By:** Devin Sinha (via Copilot)

### Directive
No hardcoded passwords in source code — ever. Use environment variables for secrets.

---

## Codebase Audit Summary - Ripley (Lead)

**Date:** 2026-04-28T15:30:28-07:00  
**Status:** Analysis Complete - No Code Changes Made

### Executive Summary
The app is functional and stable for a single-user/small-group use case, but has **critical scaling bottlenecks** and **security issues** that must be addressed before growth. The biggest risk areas are the Firestore data model and the getAllUserMatches pattern.

### RED CRITICAL (Fix Immediately)

#### 1. Security: Hardcoded Password in Client Bundle
- **File:** src/App.tsx:59
- **Issue:** `if (password !== 'alpha837Soup*')` - admin import password is shipped to every user in the JS bundle.
- **Risk:** HIGH - anyone can inspect the bundle and use this to replace all match data.
- **Status:** ✅ RESOLVED (Hicks moved to env var)

#### 2. N+1 Firestore Reads - getAllUserMatches()
- **File:** src/lib/firestore.ts:43-57
- **Used in:** 7 components independently
- **Issue:** Each component independently fetches ALL users' collections. For N users, this does N+1 Firestore reads PER component mount. No caching, no shared state, no deduplication.
- **Impact:** Firestore billing scales as O(users x components_mounted) per page load.
- **Risk:** HIGH - cost explosion and quota hits as user count grows.
- **Fix:** Centralize into a single React Query or context-based cache with TTL.

#### 3. Unbounded Document Size - Single-Array Data Model
- **File:** src/lib/firestore.ts:21-29
- **Issue:** All matches stored as a single matches[] array field in one document (users/{uid}/data/matches). Firestore documents max at 1MB.
- **Risk:** HIGH to data integrity - when a user logs ~500+ matches, writes will silently fail or throw.
- **Fix:** Migrate to subcollection model (users/{uid}/matches/{matchId}) or paginated documents.

### ORANGE HIGH PRIORITY (Next Sprint)

#### 4. No Debouncing on Firestore Writes
- **File:** src/hooks/use-user-data.ts:26-36
- **Issue:** Every setMatches call triggers an immediate Firestore write of the ENTIRE matches array. Rapid operations (e.g., normalization on load, batch imports) cause redundant full-document writes.
- **Risk:** MEDIUM - data corruption unlikely, but Firestore write costs and potential race conditions.
- **Fix:** Add 500ms debounce to the persist effect.

#### 5. No Lazy Loading - All Tabs Eagerly Mounted
- **Issue:** All 5 main tabs + their dependencies are loaded synchronously. No React.lazy() anywhere.
- **Impact:** Initial bundle includes ALL tab code + heavy deps (recharts, d3, framer-motion, Three.js).
- **Risk:** LOW to site stability, HIGH to performance.
- **Fix:** Wrap each TabContent in React.lazy() + Suspense.

#### 6. Three Redundant Icon Libraries
- **Deps:** @heroicons/react, @phosphor-icons/react, lucide-react
- **Issue:** Three icon libraries bundled but Phosphor Icons is the primary one used. Others add ~50-100KB.
- **Risk:** LOW - no functionality issue, pure bundle waste.
- **Fix:** Consolidate to Phosphor only.

#### 7. Three.js in Dependencies
- **Issue:** three (Three.js, ~600KB minified) is in dependencies. No obvious 3D rendering found in the app.
- **Risk:** LOW - just bundle bloat.
- **Fix:** Remove if unused, or lazy-load if used in a single feature.

### YELLOW MEDIUM PRIORITY (Backlog)

#### 8. data.ts - 42KB of Static Data with Image Imports
- **File:** src/lib/data.ts (269 lines but 42KB due to long ability descriptions)
- **Issue:** 105 image imports (26MB total on disk) are bundled through Vite. All hero/map images load eagerly regardless of which heroes the user has.
- **Fix:** Move to a JSON data file + dynamic imports for images. Only load images for heroes in the user's collection.

#### 9. Stats Recalculation Without Memoization
- **Files:** src/lib/stats.ts, src/components/heroes/HeroesTab.tsx:174-176
- **Issue:** calculateHeroStats, calculateUserHeroStats are called inline without memoization when a hero is selected. For the heatmap, aggregateCommunityData iterates ALL matches x ALL heroes (O(n*h)).
- **Fix:** Memoize with useMemo keyed on [matches, selectedHero]. Pre-compute community data once.

#### 10. JSON.stringify Comparison for Normalization
- **File:** src/App.tsx:83
- **Issue:** JSON.stringify(matchesData) !== JSON.stringify(normalizedMatches) - serializes entire match array twice on every load to detect normalization changes.
- **Fix:** Compare individual fields or use a dirty flag.

#### 11. getHeroById / getMapById - Linear Scan
- **File:** src/lib/data.ts:256-262
- **Issue:** HEROES.find(h => h.id === id) - called dozens of times per render. O(n) each time.
- **Fix:** Build a Map<string, Hero> lookup once at module load.

#### 12. Large Components Without Extraction
- **Files:** PublicHeroBrowser.tsx (24KB), HeroesTab.tsx (22KB), LogMatchDialog.tsx (22KB), MapsTab.tsx (21KB)
- **Issue:** Monolithic components mixing data fetching, business logic, and UI. Hard to test and reason about.
- **Fix:** Extract sub-components. Separate data-fetching hooks from presentation.

### GREEN LOW PRIORITY (Good Practice)

#### 13. No Per-Tab Error Boundaries
- Only one ErrorBoundary at the app root. A crash in one tab takes down the entire app.
- **Fix:** Wrap each tab in its own ErrorBoundary.

#### 14. Mobile Nav Duplicated Logic
- **File:** src/App.tsx:196-258
- Bottom nav bar repeats similar button markup 5 times. Extract a NavButton component.

#### 15. Unused Dependencies
- @tanstack/react-query is installed but no usage found (data fetching is manual).
- react-hook-form + zod + @hookform/resolvers - check if actively used or leftover.
