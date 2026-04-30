---
updated_at: 2026-04-30T09:43:44-07:00
live_url: https://unmatched-tracker.vercel.app
session_state: "Documentation refresh; Game Groups feature stable on main"
---

# Current Project State

**Date:** 2026-04-30T09:43:44-07:00

## What's Live & Deployed ✅

| Feature | Status | Notes |
|---------|--------|-------|
| **Core 5 Tabs** | ✅ Live | Matches, Players, Heroes, Maps, Randomizer + Collection, Groups |
| **Authentication** | ✅ Live | Email/password + Google OAuth |
| **Match Logging** | ✅ Live | Personal and group matches, stepped form |
| **Stats** | ✅ Live | Player/hero/map win rates, head-to-head, community aggregation |
| **Game Groups** | ✅ Live | Create, invite, log group matches, manage membership |
| **Group Invites** | ✅ Live | Shareable links (`?join=<code>`), email-based pending invites |
| **CSV Import/Export** | ✅ Live | Bulk data portability |
| **Admin Panel** | ✅ Live | Data diagnostics, export, import (password-protected) |
| **Mobile UI** | ✅ Live | Bottom nav, responsive layouts, touch targets |
| **CI/CD** | ✅ Live | GitHub Actions (183 tests + build); Vercel auto-deploy |
| **Firestore Rules** | ✅ Deployed | Public community stats, user/group isolation |

## Recent Work Completed (This Session)

**Security & Data Integrity:**
1. Hardcoded password removed, moved to `VITE_IMPORT_PASSWORD` env var
2. 500ms debounce added to prevent Firestore write race conditions
3. Dual-write foundation prepared for subcollection migration

**Game Groups Feature (Complete):**
1. Architecture designed: groups collection, memberUids array + members subcollection, group-matches subcollection
2. Invite system: shareable links with unique codes, email-based pending invites, atomic join flow
3. Match logging: log to group or personal, optional auto-copy to personal stats
4. Member management: add, remove, role enforcement (owner can't leave without deletion)
5. Data layer: 6 modules (group-types, groups, group-matches, group-invites, user-discovery, import-matches-v2)
6. UI layer: 7 components (GroupsTab, GroupView, dialogs, member list, match list)
7. Hooks: useGroups, useGroupMatches, useGroupMembers, plus existing useGroup
8. Integration: DataContextSelector for per-tab group context filtering (Players + Heroes tabs)
9. QA fixes: 14 critical/medium issues resolved (pagination, atomicity, batch limits, state refresh)

**Testing & Verification:**
1. 183 tests passing (Vitest + React Testing Library)
2. Component tests for all new groups UI
3. Firestore rules tests verify security model
4. Live site verification: public community stats work, no console errors
5. Full integration check: TypeScript clean, build succeeds

**Code Quality:**
1. Shared components extracted (MapSelector, HeroSelector, PlayerCard, MatchResultSection)
2. Duplication reduced between LogMatchDialog and EditMatchDialog
3. Stats memoization improved (useMemo patterns)
4. Type guards added for runtime safety

## What's Working

- ✅ Deployments (Vercel auto-deploy on main)
- ✅ Testing (CI/CD enforces tests before merge)
- ✅ Data persistence (debounce + migration foundation)
- ✅ Authentication (Firebase Auth + profiles)
- ✅ Group features (creation, invites, member management, match logging)
- ✅ Community stats (public aggregation working)
- ✅ Mobile experience (responsive, touch-friendly)

## Known Issues & Limitations

- ⚠️ **Subcollection Migration:** Still in foundation phase. Matches stored in legacy array doc (~1MB ceiling for 500+ matches). Phase 3 (backfill + read migration) pending
- ⚠️ **Bundle Size:** 1.2MB JS shipped (Three.js, D3, Recharts, 3 icon libraries). No code splitting yet
- ⚠️ **Email Service:** Group invites stored in Firestore but not automatically sent. No SendGrid integration
- ⚠️ **Offline Mode:** No ServiceWorker. Internet required for all operations
- ⚠️ **Scalability:** Community stats via collectionGroup queries work at current scale (~80 users) but will need aggregation service at 1000+ users

## Pending Items

- 🔄 Firestore subcollection migration Phase 3 (backfill + read migration)
- 🔄 Share feature (read-only match log viewing via explicit viewer UIDs)
- 🔄 Performance optimization (code splitting, lazy loading)
- 🔄 Email integration (Cloud Function + SendGrid)
- 🔄 Real-time notifications (Firebase or Cloud Messaging)

## Build & Deploy Readiness

- ✅ `npm run test` — 183 tests pass
- ✅ `npm run build` — Vite succeeds
- ✅ `npm run lint` — ESLint clean
- ✅ Firestore rules — Deployed to Firebase Console
- ✅ Environment vars — Set in Vercel (VITE_IMPORT_PASSWORD, Firebase config)
- ✅ Deploy — `npx vercel --prod --yes` or auto-deploy on main
