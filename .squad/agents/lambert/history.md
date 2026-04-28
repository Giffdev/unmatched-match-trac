# Lambert — History

## Project Context
Unmatched Tracker: a web app for tracking Unmatched board game matches. Built with React 19 + TypeScript, Vite 7.2, Shadcn UI, Tailwind CSS 4.1, Firebase Auth + Cloud Firestore, deployed on Vercel. User: Devin Sinha. Critical constraint: never break the live site or user data. Testing is essential for safe deployments.

## Learnings

### 2026-04-28: Test Coverage Survey
- **Test infrastructure: NONE.** Zero test files exist (no *.test.ts, *.spec.ts, no __tests__ dirs). No test framework installed (no vitest, jest, testing-library in deps). No test scripts in package.json.
- **Key testable modules (pure logic, no UI):**
  - `src/lib/stats.ts` — calculatePlayerStats, calculateHeroStats, aggregateCommunityData, getBalancedMatchupScored
  - `src/lib/utils.ts` — normalizeHeroId, normalizePlayerName, normalizeMatchPlayerNames, getHeroDisplayName
  - `src/lib/firestore.ts` — stripUndefined (pure fn), getUserMatches, setUserMatches
  - `src/lib/import-matches-v2.ts` — match data import builder
- **Key UI components (need component tests):**
  - `src/components/matches/LogMatchDialog.tsx` — match logging form
  - `src/components/matches/CsvImportDialog.tsx` — CSV import
  - `src/components/randomizer/RandomizerTab.tsx` — randomizer with balanced mode
  - `src/components/players/`, `src/components/heroes/`, `src/components/maps/` — stats display
- **Build:** `tsc -b --noCheck && vite build` (no test step)
- **Recommended framework:** Vitest (native Vite integration) + @testing-library/react for component tests

### 2026-04-28: Vitest Infrastructure Setup
- **Installed:** vitest 4.1.5, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, happy-dom
- **Config:** Dedicated `vitest.config.ts` with happy-dom environment, globals: true, `@` alias for src/
- **Scripts:** `npm test` (vitest run), `npm run test:watch` (vitest), `npm run test:coverage` (vitest run --coverage)
- **Test location:** `src/lib/__tests__/{module}.test.ts`
- **Initial suite:** 67 tests across 3 files (utils, stats, firestore)
- **Pattern:** Factory functions for test data (e.g. `createMatch(overrides)`) to keep tests DRY
- **Key finding:** `stripUndefined` in firestore.ts is not exported — tested via local copy. If it needs direct testing later, it should be extracted/exported.
- **Key finding:** `getBalancedMatchupScored` uses Math.random() internally — tests focus on deterministic edge cases (empty data, exclusion logic, confidence levels)
- **All 67 tests pass, build remains green.**
