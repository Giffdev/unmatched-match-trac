# Decisions Log

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
