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
