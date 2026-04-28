# Dallas — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Tab-based SPA with bottom nav bar on mobile. Critical constraint: never break the live site or user data.

## Learnings

- **2026-04-28:** Tab navigation is managed via `currentTab` state in `App.tsx` (line ~30). Bottom nav is a fixed nav bar rendered only on mobile (`isMobile && currentUserId && currentView === 'main'`). Desktop uses Shadcn `TabsList` with `TabsTrigger` components.
- **2026-04-28:** Key file: `src/App.tsx` — contains all tab state, bottom nav, and main layout. Tab content components live in `src/components/{matches,players,heroes,maps,randomizer}/`.
- **2026-04-28:** Scroll-to-top on tab change: implemented via `useEffect` on `currentTab` calling `window.scrollTo(0, 0)`. This is safe for desktop too since desktop tabs also trigger `setCurrentTab`.
- **2026-04-28 (Hicks):** `src/hooks/use-user-data.ts` now implements 500ms debounce on Firestore persist effect. Pattern: accumulate rapid state changes, write only final state after quiet period. Cleanup flushes pending writes immediately. Eliminates out-of-order concurrent writes.

