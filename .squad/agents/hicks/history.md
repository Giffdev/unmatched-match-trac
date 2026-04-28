# Hicks — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Firestore per-user documents with matches as array. Critical constraint: never break the live site or user data.

## Learnings

### 2026-04-28T16:13:58-07:00: Removed hardcoded password from App.tsx
- The match import gate in `handleReplaceAllMatches` (line ~59) compared user input against a hardcoded password string `'alpha837Soup*'`.
- Replaced with `import.meta.env.VITE_IMPORT_PASSWORD` — Vite exposes `VITE_`-prefixed env vars to client code at build time.
- Added `VITE_IMPORT_PASSWORD=` to `.env.example` so other devs know to configure it.
- `.env` was already in `.gitignore` — no secret exposure risk.
- Build verified clean (`tsc -b --noCheck && vite build` exit 0).

### 2026-04-28T16:16:41-07:00: Fixed race condition in useUserMatches hook
- The persist `useEffect` in `src/hooks/use-user-data.ts` fired on every `matches` state change, spawning concurrent `setUserMatches` Firestore writes that could resolve out of order — a later write with stale data overwriting a valid earlier write.
- The existing `saveGeneration` ref only suppressed stale error toasts; it didn't prevent the actual out-of-order write.
- Fix: added 500ms debounce to the persist effect. Rapid state changes now batch into a single Firestore write. On cleanup (unmount or userId change), the pending write flushes immediately to prevent data loss.
- `loadedFromDb` guard preserved — still prevents re-saving on initial load.
- Public API unchanged: hook still returns `{ matches, setMatches, loading }`.
- Build verified clean (`tsc -b --noCheck && vite build` exit 0).
