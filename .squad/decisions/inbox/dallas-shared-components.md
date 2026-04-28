# Decision: Shared Component Extraction from Match Dialogs

**Date:** 2026-04-28T23:31:30Z  
**By:** Dallas (Frontend Dev)  
**Status:** Implemented

## What

Extracted 4 shared components from `LogMatchDialog.tsx` (532 lines) and `EditMatchDialog.tsx` (520 lines) into `src/components/matches/shared/`:

1. **MapSelector** — Searchable combobox for map selection with player-count display
2. **HeroSelector** — Searchable combobox for hero selection with Yennefer/Triss variant picker
3. **PlayerCard** — Player row combining PlayerNameInput + HeroSelector + remove button
4. **MatchResultSection** — Handles both competitive (winner/draw radio) and cooperative (win/loss) results

Barrel export via `shared/index.ts`.

## Why

- LogMatchDialog and EditMatchDialog were ~60% duplicate code (identified in codebase audit as P2 issue)
- Both contained identical MapSelector, HeroSelector, player card rendering, and result section implementations
- Reduces total LOC from ~1050 to ~600 across both files
- Future changes to map/hero pickers only need updating in one place

## Decisions Made

1. **Used LogMatchDialog's responsive styling** — it had better mobile-responsive classes (`min-w-0`, `shrink-0`, `whitespace-normal`, `h-auto min-h-9 py-2`) that were missing from EditMatchDialog's version. This is a minor visual improvement to EditMatchDialog but functionally identical.
2. **MatchResultSection handles both modes** — single component with `isCooperative` prop renders either competitive or cooperative result UI, rather than two separate components.
3. **PlayerCard owns the visual layout only** — state mutation callbacks are passed in from parents. No state lives in the shared component.
4. **Did NOT extract DatePicker or GameModeSelect** — these are small, tightly coupled to dialog-specific logic (reset behavior differs), and extracting them would add complexity without meaningful deduplication benefit.

## Impact

- `src/components/matches/shared/MapSelector.tsx` (new)
- `src/components/matches/shared/HeroSelector.tsx` (new)
- `src/components/matches/shared/PlayerCard.tsx` (new)
- `src/components/matches/shared/MatchResultSection.tsx` (new)
- `src/components/matches/shared/index.ts` (new)
- `src/components/matches/LogMatchDialog.tsx` (refactored, ~330 lines → was 532)
- `src/components/matches/EditMatchDialog.tsx` (refactored, ~310 lines → was 520)

## Verification

- `npx tsc --noEmit` passes clean
- `npx vite build` succeeds
- No behavioral changes — pure refactoring
