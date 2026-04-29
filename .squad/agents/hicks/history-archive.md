# Hicks — History Archive

Archived entries from main history.md created 2026-04-29T18:36:17Z

## Early Sessions (2026-04-28 through 2026-04-29T10:58:21Z)

### 2026-04-28T16:13:58-07:00: Removed hardcoded password from App.tsx
- Replaced hardcoded password with `VITE_IMPORT_PASSWORD` environment variable
- Build verified clean

### 2026-04-28T16:16:41-07:00: Fixed race condition in useUserMatches hook
- Added 500ms debounce to persist effect
- Prevents out-of-order Firestore writes
- API unchanged

### 2026-04-28T23:31:30Z: Added React Error Boundaries per-tab
- Each tab's content wrapped individually
- Top-level ErrorBoundary as last-resort fallback
- Prevents whole app crash from tab error

### 2026-04-28T23:31:30Z: Deduplicated calculateHeroStats / calculateUserHeroStats
- Created `calculateHeroStatsCore()` private function
- Old exports preserved as thin wrappers
- Zero API surface change

### 2026-04-28T23:31:30Z: Memoized stats calculations in PlayersTab and HeroesTab
- Wrapped calculations in `useMemo` with correct dependencies
- No changes to stats functions themselves
- All 67 tests pass

### 2026-04-28T23:31:30Z: Added runtime type validation on Firestore reads
- Created `validateMatch()` and `validateMatches()` type guards
- Protects against data corruption
- Applied to both user match read paths

### 2026-04-28T23:55:03Z: Implemented dual-write layer for Firestore subcollection migration (Phase 1-2)
- Added subcollection write/delete/read functions
- Migration state per-user with 'legacy-only' default
- Diff-based approach, writes legacy first then best-effort syncs
- Reads unchanged — still from legacy doc only
- All 94 tests pass

### 2026-04-28T19:19:54-07:00: Proposed Firestore Security Rules
- Identified all document paths
- Key challenge: getAllUserMatches requires authenticated read across user boundaries

### 2026-04-28T19:23:23-07:00: Revised Firestore Security Rules — Public Community Stats
- Option C (Hybrid): public read on match data, owner-only elsewhere
- Conditional read rule using `docId == 'matches'`
- No code changes required

### 2026-04-29T10:04:15-07:00: Game Groups — Phase 1 Data Layer Implementation
- Created 5 new files for data layer (types, CRUD, matches, invites, discovery)
- Collection structure: groups/{groupId}, members, matches, invites
- writeBatch atomicity, arrayUnion/arrayRemove patterns
- TypeScript clean, 94 tests pass

### 2026-04-29T10:18:17-07:00: Firestore Security Rules for Game Groups
- memberUids[] array enables O(1) membership checks
- isAdminOrOwner() helper with cost considerations
- Full access matrix and testing checklist documented
- NOT deployed — on feature branch per team directive

### 2026-04-29T10:31:44-07:00: Fixed group creation — batch write vs security rules race
- Root cause: get() in rules sees pre-batch state during atomic bootstrap
- Fix: Split allow write into allow create + allow update/delete with fallback
- Member subcollection can bootstrap without parent existing

### 2026-04-29T10:38:08-07:00: Fixed redundant @playerName display in MemberList
- Case-insensitive comparison so @playerName only renders when distinct
- Added userData.playerName fallback for displayName chain
- TypeScript clean

### 2026-04-29T10:54:53-07:00: Implemented Retroactive Match Import for Game Groups
- Created ImportMatchesDialog component with dedup logic
- Added importMatchesToGroup() function with 450-op chunking
- Modified GroupView to wire up import button

### 2026-04-29T10:58:21-07:00: Added group assignment at match log time
- Changed LogMatchDialog to always personal + optional groups multi-select
- Created addMatchToGroups() with sourceMatchId back-reference
- Added groupRef to Match type
- All 183 tests pass

## Summary of Phase 1-2

Early phase work established:
- Core data layer for Game Groups with atomic operations
- Security rules with batch optimization
- Retroactive match import infrastructure
- Foundation for email-based invites integration (upcoming)

All TypeScript validation passing. 183 unit tests covering data layer operations. Build green throughout.
