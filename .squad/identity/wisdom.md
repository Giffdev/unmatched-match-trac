---
last_updated: 2026-04-30T09:43:44-07:00
---

# Team Wisdom

Reusable patterns and heuristics learned through work. NOT transcripts — each entry is a distilled, actionable insight.

## Build & Deploy Commands

**Core commands that work:**
- `npm run build` — Use exact command: `tsc -b --noCheck && vite build` (no extra flags)
- `npm run test` — Vitest single run, 183 tests
- `npm run test:watch` — Development watch mode
- `npm run test:coverage` — Coverage report generation
- `npm run test:rules` — Firebase Emulator + Firestore rules tests (requires Java 21)
- `npm run lint` — ESLint check
- `npx vercel --prod --yes` — Deploy to production (or push to main for auto-deploy)
- `npm install --legacy-peer-deps` — CI/CD must use this flag; some deps have peer conflicts

**CI Pipeline (GitHub Actions):**
- Java 21 (Temurin distribution) required for Firebase Emulator (`actions/setup-java@v4`)
- Two parallel jobs: unit tests + firestore rules tests
- Both must pass before merge

## Firebase & Firestore Essentials

**Firebase Rules Deployment:**
- ⚠️ Firebase CLI auth doesn't work in CI — rules must be deployed manually via Firebase Console
- Rules file: `firestore.rules` (48KB)
- Deployment: Go to Firebase Console → Rules → Copy/paste updated file → Publish
- Rules changes need manual verification test in incognito window

**Firestore Dependencies:**
- `@firebase/rules-unit-testing` must be v4.x (NOT v5) — project uses firebase@^11 which is incompatible with v5
- Version lock: package.json has `"@firebase/rules-unit-testing": "^4.0.1"`
- If upgrade needed, check firebase version compatibility first

**Java Version for Emulator:**
- Firebase Emulator requires Java 21 (Temurin)
- GitHub Actions: use `actions/setup-java@v4 with distribution: temurin, java-version: 21`
- CI will fail silently (gradle build fails) if Java version wrong — watch for "Could not determine java version"

## No Email Infrastructure

**Critical:** App has no email sending service deployed.

**Group Invites:**
- Email addresses are stored in `pending-email-invites/{email}` Firestore collection for lookup only
- `sendEmailInvite()` only writes Firestore docs; no SendGrid/SendGrid integration exists
- When invited user signs up, AuthProvider checks `pending-email-invites[newUser.email]` and migrates to UID-based invite
- Shareable invite links (`?join=<code>`) are the working invite mechanism (don't depend on email)

**Future:** Cloud Function + SendGrid setup needed to auto-send emails on invite

## Architecture Patterns

**Tab-based SPA:**
- No router (no react-router, no Next.js)
- Tabs are local state in App.tsx (`currentTab`, `setCurrentTab`)
- Bottom navigation bar on mobile only (fixed-position footer)
- Tab switch calls `window.scrollTo(0, 0)` for UX (implemented in App.tsx useEffect)
- Each tab is a component: MatchesTab, PlayersTab, HeroesTab, MapsTab, RandomizerTab, CollectionTab, GroupsTab

**Hero & Map Images:**
- Local `.webp` and `.avif` assets only (no CDN, no external URLs)
- 76+ heroes + 34+ maps in `/src/assets/images/`
- Fallback UI for missing images (renders placeholder instead of crashing)
- HeroImage component handles loading/error states

**Firestore Self-Join Pattern (Game Groups):**
- Invite code is the access gate
- User calls `joinGroupByInviteCode(groupId, code)` after validating code
- Rules allow user to add their own UID to group's `memberUids[]` array
- User creates their own member doc at `groups/{groupId}/members/{userId}` with role (member/admin/owner)
- No backend permission needed beyond Firestore rules

**Firestore Batch Limit Pattern:**
- Max 500 operations per batch
- Use 450 as safe ceiling in loops (leaves 50-op headroom)
- Chunk deletions: `for (let i = 0; i < docs.length; i += 450) { batch.delete(...) }`
- Final batch handles remaining ops + metadata updates

## Data Persistence & Race Conditions

**Debounced Writes (500ms):**
- Rapid state changes are accumulated for 500ms, then written as one Firestore doc
- Pattern: `useEffect` with debounce on `JSON.stringify(state)` dependency
- Cleanup flushes pending writes immediately (on unmount or final effect cleanup)
- Eliminates out-of-order concurrent writes that caused stale data

**Dual-Write Foundation (Ready):**
- Phase 1-2 complete: read new subcollection model, write to both old + new
- Old path: `users/{userId}/data/matches` (array document, ~1MB ceiling)
- New path: `users/{userId}/matches/{matchId}` (atomic per-match writes)
- Migration pending: Phase 3 (backfill all legacy data, switch reads to new path)

**Firestore Size Limits:**
- Single document max 1MB (~1000 matches at 1KB each)
- Legacy matches array will break at 500+ matches without subcollection migration
- Group match subcollections have no size limit (one doc per match)

## Atomicity in Firestore

**For reads + writes:** Use `runTransaction()`
- Example: acceptInvite reads group, then updates group + user + invite
- Put status change (point of no return) as LAST write in transaction
- If anything fails, transaction rolls back entire operation (invite stays pending for retry)

**For writes only:** Use `writeBatch()`
- Simpler than transaction when no reads needed
- Better performance (no read locks)
- Example: addMatchToGroups writes to 3 group docs atomically

**Never use `arrayRemove` on complex objects** — depends on exact field equality which is fragile
- Instead: read array, find entry by ID, replace value, write full array with `merge: true`

## Testing & Quality

**Test Infrastructure:**
- Vitest (native Vite integration, v4.1.5)
- React Testing Library for component tests
- happy-dom environment (lightweight DOM for unit tests)
- Firestore rules tests use Firebase Emulator + @firebase/rules-unit-testing v4

**Test Location Convention:**
- Unit tests: `src/lib/__tests__/{module}.test.ts`
- Component tests: `src/components/{path}/__tests__/{Component}.test.tsx`
- Rules tests: `tests/rules/firestore.rules.test.ts`

**Test Data Factory Pattern:**
- Use factory functions to keep tests DRY: `createMatch(overrides)`, `createGroup(overrides)`
- Makes test setup readable and maintainable

**Quality Gate Directives (User Requirement):**
1. All feature work must include proper state refresh, UI feedback, edge case handling
2. Internal QA before user delivery (Lambert tests first, then report)
3. Never ask user to test — team owns quality
4. Too many bugs found after delivery in past — stricter review bar now

## Live URL & Deployment

- **Live:** https://unmatched-tracker.vercel.app
- **Deployment:** Vercel (auto-deploy on push to main branch, OR manual `npx vercel --prod --yes`)
- **Git flow:** Push to main → GitHub Actions tests → Vercel deploys (no manual steps)

## Bundle Size & Performance

**Current state:**
- 1.2MB JavaScript bundle
- Three icon libraries (Phosphor, Heroicons, Lucide) shipped eagerly
- Three.js, D3.js, Recharts also shipped eagerly
- No code splitting yet

**Future optimization:**
- Dynamic imports for groups feature (separate chunk)
- Lazy load hero data
- Conditional bundle trees for icon libraries (pick one)
- Pre-compute community stats server-side instead of client-side

## React & TypeScript Gotchas

**React Hooks Rules:**
- Early returns must come AFTER all hook calls
- If component has `if (...) return null` early in component body, move ALL hooks above it
- React counts hook order on every render — mismatch causes "Rendered fewer hooks than expected" error

**Firestore undefined values:**
- Firestore doesn't accept `undefined` (throws "Cannot use undefined")
- Use `stripUndefined()` helper: recursively removes undefined before writes
- Pattern: `batch.set(stripUndefined(docData), merge: true)`

**Community stats aggregation:**
- `getAllUserMatches()` uses `collectionGroup('data')` to query all users' matches docs
- Works at small scale (<100 users) but needs aggregation service at 1000+ users
- Pre-computed stats or Cloud Functions recommended before scaling

## Group Feature Gotchas

**Pagination cursor management:**
- Paginated hook needs: cursor state (`lastDoc`), loading guard (ref-based, not state), reset logic on dependency change
- First load passes no `startAfter`; subsequent pages pass `lastDocRef`
- Component remount must reset cursor (use `key` prop)

**Group member cleanup on delete:**
- Removing user from `users/{userId}/data/groups` array requires array element matching — use read-modify-write pattern
- Never use `arrayRemove` for complex objects; use `arrayUnion` with updated object instead

**Invite dedup:**
- Check `getGroupInvites(groupId)` for existing pending invite before sending
- Use `sourceMatchId` for retroactive import dedup (not computed fingerprints)

**Settings collection:**
- `GroupSettings` in createGroup dialog must be passed through to `createGroup()` function
- Defaults provided with `??` operator in data layer
- Dialog props must expand when new fields added; update parent usage too
