# Unmatched Tracker

[![Live app](https://img.shields.io/badge/live-unmatched--tracker.vercel.app-111827)](https://unmatched-tracker.vercel.app)
[![Tests](https://github.com/Giffdev/unmatched-match-trac/actions/workflows/tests.yml/badge.svg)](https://github.com/Giffdev/unmatched-match-trac/actions/workflows/tests.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Unmatched Tracker is a responsive web app for recording games of
[Unmatched](https://restorationgames.com/unmatched/), exploring personal and
community results, and choosing what to play next.

**Try it at [unmatched-tracker.vercel.app](https://unmatched-tracker.vercel.app).**
Community statistics, the hero browser, and the matchup heatmap are available
before signing in; an account is required to save personal data.

## Features

- **Match history** — Log, edit, and delete competitive 1v1, 2v2, three- or
  four-player free-for-all, and cooperative games, including the date, map,
  fighters, turn order, and result.
- **Player, hero, and map analysis** — Review records, win rates, frequently
  played and unplayed content, head-to-head matchups, map popularity, and
  personal results alongside community data.
- **Community insights** — Browse aggregate hero and map statistics, inspect
  hero details, and explore a global matchup heatmap.
- **Match randomizer** — Generate heroes and maps for supported player counts,
  reroll individual choices, restrict results to owned sets, or use community
  results to suggest a balanced 1v1 matchup.
- **Collection tracking** — Record owned sets, filter by franchise, and use the
  collection to constrain randomizer choices and collection-aware statistics.
- **Groups** — Create play groups, invite members by link, email, or
  player search, share group match histories, and import existing personal
  matches into a group. Match, player, and hero views can switch to group data
  where supported.
- **Accounts and data import** — Sign in with email/password or Google, recover
  an email/password account, choose a player name, and import match history
  from CSV.
- **Mobile-friendly navigation** — The dashboard adapts from desktop tabs to a
  persistent bottom navigation bar on smaller screens.

## Technology

- React 19 and TypeScript
- Vite 7 with SWC
- Tailwind CSS 4 and Radix UI components
- Firebase Authentication and Cloud Firestore
- TanStack Query, React Hook Form, Zod, Recharts, and D3
- Vitest, Testing Library, and Firebase Emulator Suite rules tests
- Vercel hosting

## Local development

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm
- A Firebase project with Authentication and Cloud Firestore configured

### Setup

```bash
git clone https://github.com/Giffdev/unmatched-match-trac.git
cd unmatched-match-trac
npm ci --legacy-peer-deps
```

Copy `.env.example` to `.env.local` and provide the Firebase web application
configuration:

```dotenv
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Then start the development server:

```bash
npm run dev
```

Vite prints the local URL when the server starts.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Compile the TypeScript project and create a production build |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest unit and component test suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:rules` | Test Firestore security rules with the Firebase emulator |

`npm run test:rules` requires Java and the Firebase CLI (`firebase-tools`) in
addition to the normal project dependencies.

## Data and deployment

Authentication and application data are provided by Firebase. Personal match
and collection writes are scoped to the signed-in user by Firestore security
rules. Match data used for community statistics is readable across users;
group features operate within the authenticated app rather than as a private,
invite-enforced data boundary.

The production site is deployed to Vercel. `vercel.json` rewrites application
routes to the SPA entry point, and the repository includes a manually
triggered production deployment workflow.

## License and game attribution

The repository is available under the [MIT License](LICENSE).

Unmatched Tracker is an unofficial fan project. It is not affiliated with or
endorsed by Restoration Games, Mondo Games, or the owners of any characters
and properties represented in Unmatched. Unmatched and related names and
artwork belong to their respective owners.
