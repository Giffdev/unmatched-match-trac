# Hicks — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Critical constraint: never break the live site or user data. Testing and safe deployments essential for quality gates.

## Learnings

**Note:** Earlier entries (2026-04-28 through 2026-04-29T10:58:21Z) archived to `history-archive.md` for readability. This file maintains recent work log.
### 2026-04-29T17:58:21Z: Hicks-15 Complete — Retroactive Match Import (Scribe Log)
- Session hicks-15 successfully completed: ImportMatchesDialog, importMatchesToGroup, dedup logic fully delivered
- 4 files created/modified; TypeScript clean build
- Orchestration log written to `.squad/orchestration-log/2026-04-29T17-58-21Z-hicks.md`
- Hicks-16 (log-to-group at match time) now in progress — coordinates with Dallas UI + Lambert tests
- Team decisions consolidated: 6 inbox files merged into `decisions.md` capturing retroactive import + log-to-group directives

### 2026-04-29T11:09:20-07:00: Fixed two critical Game Groups bugs (QA audit)
- **Bug #1 — Pagination duplicates:** `useGroupMatches` hook's `loadMore()` never passed a `startAfter` cursor, always re-fetching page 1. Fixed by: (1) changing `getGroupMatches` to return `{ matches, lastDoc }` so the cursor is available; (2) tracking `lastDocRef` in the hook and passing it on subsequent calls; (3) added `loadingMoreRef` guard to prevent rapid-fire duplicate fetches; (4) `fetchMatches` (initial load / refetch) resets `lastDocRef` so remounts start fresh.
- **Bug #2 — deleteGroup batch overflow:** A single `writeBatch` accumulated ALL subcollection deletes + group doc + per-member user-groups cleanup. For large groups this exceeds Firestore's 500-op hard limit. Fixed by: (1) chunking subcollection deletes into batches of 450; (2) doing member cleanup + group doc deletion in separate final batches, also chunked; (3) handling edge case where group has no members (still deletes group doc).
- Pattern to remember: Any Firestore batch that iterates over user-contributed collections MUST be chunked — use 450 as the safe ceiling (leaves 50-op headroom for metadata ops in the same batch).
- Pattern to remember: Paginated hooks need THREE things — cursor state (`lastDoc`), a loading guard (ref-based, not state-based to avoid stale closures), and reset logic on dependency change.
- All 183 tests pass. TypeScript clean (`npx tsc --noEmit` exit 0).

### 2026-04-29T11:12:40-07:00: Fixed two more critical atomicity bugs (QA audit #2)
- **Bug #3 — acceptInvite non-atomic:** Three sequential writes (updateDoc invite, setDoc user invites, addMemberToGroup batch) meant if step 3 failed, invite showed "accepted" but user was never added. Fix: replaced with `runTransaction()` — all reads and writes happen atomically. Invite status update is LAST in the transaction, so if anything fails the invite stays "pending" and user can retry. Also added guard against double-accept (`status !== 'pending'` check inside transaction).
- **Bug #4 — addMatchToGroups sequential writes:** For-loop with `await setDoc` per group meant partial failures left match in some groups but not others. Fix: pre-generate all doc refs and data, then write everything in a single `writeBatch`. If batch fails, nothing is written. The caller (LogMatchDialog) already only sets `groupRef` on the personal match AFTER `addMatchToGroups` returns successfully, so the flow is now fully atomic.
- Pattern to remember: For cross-document atomicity involving reads, use `runTransaction()`. For write-only atomicity (no reads needed inside the op), `writeBatch()` is simpler and sufficient.
- Pattern to remember: Always put the "point of no return" status change (like marking an invite accepted) as the LAST write in a transaction — makes retry-safe by default.
- All 183 tests pass. TypeScript clean (`npx tsc --noEmit` exit 0).

### 2026-04-29T11:12:40-07:00: Fixed 4 medium-priority QA issues (#5-#8)
- **Issue #5 — Weak dedup in ImportMatchesDialog:** Replaced fingerprint-based `matchKey()` dedup with `sourceMatchId` lookup. Now checks if any existing group match has a `sourceMatchId` matching the personal match ID — works reliably even for same-day/same-heroes/same-map scenarios across multiple groups.
- **Issue #6 — Owner can leave their own group:** Added ownership check in `leaveGroup()` — reads group doc, checks `ownerUid`, throws descriptive error if owner tries to leave. MemberList surfaces the error message via `toast.error(err.message)`.
- **Issue #7 — CreateGroupDialog ignores settings:** Added optional `settings?: Partial<GroupSettings>` param to `createGroup()` with sensible defaults via `??`. CreateGroupDialog now passes `{ allowMemberInvites, autoAddToPersonal }` through.
- **Issue #8 — memberCount not updated after removal:** Wired `onMemberRemoved` in GroupView to `refetchGroup` (the `useGroup` hook already exposes a `refetch` callback). Header now shows correct member count after removal.
- Pattern to remember: For dedup of imported records, use the stable document ID (`sourceMatchId`) rather than computed fingerprints — fingerprints are fragile and collision-prone.
- Pattern to remember: `useGroup` hook already exposes `refetch` — always check hook return values before adding new state management.
- All 183 tests pass. TypeScript clean (`npx tsc --noEmit` exit 0).

### 2026-04-29T11:12:40-07:00: Fixed 6 remaining QA issues (#9-#14)
- **Issue #9 - importMatchesToGroup redundant reads:** Refactored to read personal matches ONCE after all group batches are committed, then do a single setDoc. Eliminates race condition between chunks and reduces Firestore reads from N chunks to 1.
- **Issue #10 - Pending invites never cleaned up:** On accept/decline, the invite is now REMOVED from the user's group-invites array (via filter) instead of just updating status. Keeps the document bounded; user can be re-invited.
- **Issue #11 - GroupsTab missing error state:** Added error destructuring from useGroups, shows WarningCircle + error message + Try Again button when set.
- **Issue #12 - GroupSettingsDialog no editing:** Added editable fields (name, description, allowMemberInvites switch, autoAddToPersonal switch) with Save button. Created updateGroupInfo() in groups.ts for combined name+description+settings update. Props expanded: groupDescription, settings, onUpdated.
- **Issue #13 - Duplicate invites:** Before sending, handleInvite now calls getGroupInvites(groupId) and checks for existing pending invite to same user. Shows toast error if duplicate.
- **Issue #14 - GroupMatchList error state:** Added error state to useGroupMatches hook (exposed in return). GroupMatchList shows WarningCircle + error message + Try Again button on error.
- Pattern to remember: When a dialog's props expand (new required fields), always update the parent component's usage in the same PR.
- Pattern to remember: For invite cleanup, removing from the array (filter) is better than status update -- keeps docs bounded and simplifies getPendingInvites filtering.
- All 183 tests pass. TypeScript clean. Vite build succeeds.

### 2026-04-29T18:36:17Z: Email-based invites for non-registered users (Background Agent)
- **Status:** SUCCESS
- **Task:** Email invite system fully implemented and integrated
- **Outcome:** Modified 5 core files (group-types.ts, group-invites.ts, InviteMemberDialog.tsx, AuthProvider.tsx, PendingInvites.tsx)
- **Key Decision:** Email invites stored at `pending-email-invites/{email}` in Firestore; migrated to UID-based on login via AuthProvider check
- **Verification:** TypeScript compiles clean, build succeeds

### 2026-04-29T11:05:18-07:00: User directive — Quality gate for all feature work
- **By:** Devin Sinha (via Copilot)
- **What:** Hicks (and all agents) need to be more thorough. Too many bugs are being found after delivery. From now on, all feature work must include proper state refresh, UI feedback, and edge case handling before being considered done.
- **Why:** User frustration with repeated bugs in Game Groups feature — state not refreshing after import, stale lists after deletion, etc. Quality gate needed.
- **Action:** Will apply this stricter review bar to all future work.

### 2026-04-29T11:12:40-07:00: User directive — Internal QA before user delivery
- **By:** Devin Sinha (via Copilot)
- **What:** The team must test their own work before presenting to the user. Never ask the user to test — have Lambert verify first. Only report results after internal QA passes.
- **Why:** User request — the team should own quality, not push testing burden to the user.
- **Action:** Integrate Lambert's testing workflow into delivery checklist.
