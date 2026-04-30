# Project Context

- **Project:** unmatched-match-trac (Unmatched Tracker)
- **Created:** 2026-04-28
- **Live:** https://unmatched-tracker.vercel.app (Vercel auto-deploy on main)

## Core Context

Web app for tracking Unmatched board game matches. Built with React 19, TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha.

**Critical Constraint:** Never break the live site or user data. Testing and safe deployments are key.

**Architecture:** Tab-based SPA (no router). 7 tabs: Matches, Players, Heroes, Maps, Randomizer, Collection, Groups + optional Admin.

## Recent Session Summary (2026-04-30)

This session: Documentation refresh for session continuity. Scribe created comprehensive identity documentation:

- **`.squad/identity/now.md`** — Current project state: features live, recent work (Game Groups completion, password security, debounced writes, testing), what's working, known issues, pending items, deploy readiness
- **`.squad/identity/wisdom.md`** — Hard-won team knowledge: build/test/deploy commands, Firebase rules deployment (manual, not CLI), Firebase dependencies (rules-unit-testing v4), Java 21 for emulator, no email infrastructure, tab-based SPA patterns, hero/map images locally, Firestore self-join for groups, batch size limits, debounced writes, dual-write foundation, atomicity patterns (runTransaction vs writeBatch), testing conventions, quality directives, live URL, bundle optimization opportunities, React hooks gotchas, Firestore undefined handling, community stats aggregation, group feature gotchas

**All decisions merged to canonical `.squad/decisions.md`:**
- User directive: Critical constraint (protect live site)
- Dallas: Scroll-to-top on tab change
- Lambert: Vitest infrastructure
- Ripley: Codebase audit, Firestore migration plan, Game Groups design, Group UX integration
- Hicks: Password security, debounced writes, email-based invites
- Team Quality Directives: Quality gate for feature work, internal QA before delivery

**Team Checkpoint (2026-04-29T18:36:17Z):**
- 183 tests passing (Vitest + React Testing Library)
- Game Groups feature complete and stable on main
- CI/CD verified (GitHub Actions, Vercel auto-deploy working)
- Firestore rules verified (public community stats accessible, no console errors)
- All agents' work logged in orchestration files

## Learnings

**Project State:**
- Core 5 tabs (Matches, Players, Heroes, Maps, Randomizer) mature and stable
- Game Groups (creation, invites, match logging) complete (2026-04-29)
- Collection tab for owned sets
- Admin panel (password-protected CSV import/export)
- Authentication: Firebase Auth (email + Google)
- Community stats: Public read access via collectionGroup query
- Mobile: Bottom nav, responsive UI
- Firestore: User profile docs public read; data subcollections owner read; groups with memberUids + members subcollection

**Testing:**
- 183 tests (Vitest + React Testing Library + happy-dom)
- Components: utils, stats, firestore, groups (CRUD), group-matches, group-invites, user-discovery, match-diff, HeroImage
- Rules tests: Firebase Emulator + @firebase/rules-unit-testing v4
- CI: GitHub Actions (unit tests + rules tests, Java 21 for emulator)

**Build:**
- `npm run build`: `tsc -b --noCheck && vite build`
- `npm run test`: vitest run (183 tests)
- `npm run test:rules`: firebase emulators:exec + vitest
- Deploy: `npx vercel --prod --yes` or auto-deploy on main
- Environment: VITE_IMPORT_PASSWORD, Firebase config in Vercel

**Data & Security:**
- Firestore rules: Comprehensive (public community stats, user/group isolation, member enforcement)
- Security: Removed hardcoded admin password (now VITE_IMPORT_PASSWORD env var)
- Debounced writes: 500ms accumulation prevents race conditions
- Dual-write foundation: Ready for subcollection migration (Phase 1-2 done)
- No email service: Group invites stored in Firestore for lookup; shareable links are working mechanism

**Known Issues:**
- Subcollection migration Phase 3 pending (matches still in legacy array doc, ~1MB ceiling)
- Bundle size 1.2MB (no code splitting)
- No offline support (no ServiceWorker)
- Community stats scalability limited (collectionGroup at 1000+ users)

**Quality Directives (User Feedback):**
- All feature work must include state refresh, UI feedback, edge case handling
- Internal QA before user delivery (Lambert tests first)
- Team owns quality, not user
- Too many bugs after delivery in past — stricter review bar now

