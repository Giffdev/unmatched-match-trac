# Testing Strategy

## Overview

This project uses a layered testing approach designed to catch the bugs that have historically made it to production:

| Layer | Tool | What it catches |
|-------|------|-----------------|
| Firestore Rules | `@firebase/rules-unit-testing` + emulator | Permission bugs (invite acceptance, self-join, member doc creation) |
| Unit Tests | Vitest | Logic bugs (stats calculation, data transforms, utility functions) |
| Component Tests | Vitest + React Testing Library | Render crashes, missing fallbacks, broken image imports |
| CI Pipeline | GitHub Actions | Prevents broken code from deploying |

## Running Tests

### Unit & Component Tests (no emulator needed)

```bash
npm run test          # Run once
npm run test:watch    # Watch mode
npm run test:coverage # With coverage report
```

### Firestore Rules Tests (requires emulator)

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Run rules tests (starts emulator automatically)
npm run test:rules
```

### All Tests in CI

Tests run automatically on every push to `main` and every PR via GitHub Actions (`.github/workflows/tests.yml`).

## Test Structure

```
src/
├── lib/__tests__/              # Unit tests for business logic
│   ├── firestore.test.ts       # stripUndefined utility
│   ├── groups.test.ts          # Group CRUD operations
│   ├── group-invites.test.ts   # Invite flow logic
│   ├── group-matches.test.ts   # Group match operations
│   ├── match-diff.test.ts      # Match diffing/sync
│   ├── stats.test.ts           # Stats calculations
│   ├── user-discovery.test.ts  # User search logic
│   └── utils.test.ts           # General utilities
├── components/
│   └── heroes/__tests__/
│       └── HeroImage.test.tsx  # Component rendering & fallbacks
tests/
└── rules/
    └── firestore.rules.test.ts # Security rules against emulator
```

## What Each Layer Catches

### Firestore Rules Tests (`tests/rules/`)
These test the actual `firestore.rules` file against real Firestore emulator scenarios:
- ✅ User can create a group with themselves as owner
- ✅ User can join a group (add self to memberUids) via invite
- ✅ User can create their own member doc with `member` role
- ✅ Blocks privilege escalation (can't self-assign `admin` role)
- ✅ Only owner can delete group
- ✅ Unauthenticated users are blocked
- ✅ Non-owners can't modify group settings

**Why this matters:** The #1 recurring bug has been Firestore rules blocking legitimate operations. These tests run the actual rules against the emulator — if a rule change breaks invite acceptance, we'll know before deploy.

### Component Tests (`src/components/*/__tests__/`)
- ✅ HeroImage renders without crashing
- ✅ Fallback placeholder shows when image URL is missing/broken
- ✅ No crash when hero data is incomplete

**Why this matters:** Catches the "deleted image import" bug — if an image fails to load, the component gracefully falls back instead of crashing.

## Adding New Tests

### New Firestore rule scenario
Add a test in `tests/rules/firestore.rules.test.ts` following the pattern:
```ts
it('describes the scenario', async () => {
  const user = testEnv.authenticatedContext('userId')
  // Setup data...
  await assertSucceeds(/* or assertFails */)
})
```

### New component test
Create `__tests__/ComponentName.test.tsx` next to the component:
```tsx
import { render, screen } from '@testing-library/react'
import { ComponentName } from '../ComponentName'

it('renders correctly', () => {
  render(<ComponentName {...props} />)
  expect(screen.getByText('expected text')).toBeTruthy()
})
```

## CI Pipeline

The GitHub Actions workflow (`.github/workflows/tests.yml`) runs on every push/PR to `main`:

1. **Unit & Component Tests** — Runs `npm run test` and `npm run build`
2. **Firestore Rules Tests** — Starts Firebase emulator and runs rules tests

Both must pass before Vercel deploys.
