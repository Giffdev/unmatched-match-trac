# Group Data Integration — UX & Architecture Design

**Author:** Ripley (Lead)  
**Date:** 2026-04-29T13:18:38-07:00  
**Status:** Design Proposal — Awaiting Devin's Review  
**Priority:** High — Defines scope for all group-related feature work

---

## Executive Summary

Group data should flow into existing tabs via an **in-tab context pill** — not a global switcher. Users tap a small "My Data / Group: {name}" toggle *within* each data tab (Players, Heroes, Maps). This avoids polluting the already-crowded mobile bottom nav and keeps the mental model simple: "I'm looking at my stats, or my group's stats."

The key architectural insight: **all stats functions already operate on `Match[]` arrays**. We don't need new computation logic — we just need to supply different match arrays depending on context.

---

## 1. Group Context Switcher

### Recommendation: Per-Tab Context Pill (NOT global switcher)

**Why not global?**
- Mobile bottom nav is already 6 columns (Matches, Players, Heroes, Maps, Groups, Random) — zero room for a global selector
- A global context changes the meaning of *every* tab simultaneously, which is confusing ("wait, am I still viewing my randomizer for the group?")
- Users may want to compare: "Show me MY hero stats" then flip to "Show me group hero stats" — global switching forces full mental context switches

**The Pattern:**

```
┌─────────────────────────────────────────────┐
│ Players Tab                                  │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ [My Data ▼]  ←  tappable pill/select │   │
│  │   ○ My Data                          │   │
│  │   ○ Group: Tuesday Night Unmatched   │   │
│  │   ○ Group: Office League             │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ... stats content changes based on pick ... │
└─────────────────────────────────────────────┘
```

**Implementation:**
- Shadcn `<Select>` component, positioned top-left of each applicable tab
- Default: "My Data" (no behavioral change for non-group users)
- Only shows if user belongs to ≥1 group
- Persisted per-tab in local state (not URL, not Firestore)
- Remembers last selection per session (useState in App or context)

**Mobile UX detail:**
- Pill is compact (one line, ~200px wide)
- Sits above the filter/sort controls that already exist in tabs
- No additional scroll needed — it's the first element

### What tabs get the switcher:

| Tab | Gets Switcher? | Reason |
|-----|---------------|--------|
| Players | ✅ Yes | Group player stats are high value |
| Heroes | ✅ Yes | "Who's best with Bigfoot in our group?" |
| Maps | ✅ Yes | Map win rates per group |
| Matches | ❌ No | Group matches stay in Groups tab (see §4) |
| Groups | ❌ No | Already group-scoped |
| Randomizer | ⚠️ Phase 2 | Could use group's collection for picks |

---

## 2. Players Tab with Group Context

### "My Data" mode (current, unchanged):
- Shows stats computed from personal `matches[]`
- Player selector lists all player names found in YOUR logged matches
- Existing behavior preserved exactly

### "Group: {name}" mode:
- **Data source:** All matches in `groups/{groupId}/matches`
- **Player list:** All unique player names from group matches (typically = group members, but could include guests)
- **Stats shown:** Same `calculatePlayerStats()` function, just fed group matches
- **Key difference from personal:** You see stats for people you don't regularly play with personally, computed across ALL group members' logged matches

### What users get:
- "In our Tuesday group, Alex has a 68% win rate — they're crushing us"
- "Sarah has never played Bigfoot — let's suggest it"
- Head-to-head records within the group

### Component reuse:
- `PlayersTab` already accepts `matches: Match[]` as a prop
- Add optional `contextLabel?: string` prop for display ("Group stats" header)
- Player name list derived from the match array (already done via `getAllPlayerNames()`)
- **Zero new components needed**

---

## 3. Heroes Tab with Group Context

### "My Data" mode (current, unchanged):
- Personal hero stats
- Community hero stats (from `getAllUserMatches()`)

### "Group: {name}" mode:
- Hero stats computed ONLY from group matches
- Shows: "In our group, Bigfoot has 72% win rate across 18 games"
- Matchup heatmap shows group-local matchup data
- Player-specific hero stats within group context

### Key insight:
- `calculateHeroStats()` and `calculateUserHeroStats()` both operate on `Match[]`
- Pass group matches → get group hero stats. No new logic.

### Additional value:
- "Which heroes are OP in our meta?" (group has different skill levels than community)
- "Nobody in our group has beaten Sinbad" — visible from group heatmap

### Component reuse:
- `HeroesTab` accepts `matches: Match[]` — just swap the array
- The community data section should be hidden or replaced with "Group Meta" when in group context
- `HeroMatchupHeatmap` takes matches — works as-is

---

## 4. Matches Tab — No Group Mixing

### Decision: Group matches stay in the Groups tab only

**Rationale:**
- Personal Matches tab is the user's source of truth — their personal log
- Mixing in matches logged by other group members creates confusion ("I didn't log this")
- The existing `groupRef` field on personal matches already links them
- Group match list has `loggedByName` attribution which doesn't fit the personal tab's UI

**What about the user's own group matches?**
- If a user logs a match to a group, it ALSO saves to personal (current behavior per decision `2026-04-29T10:58:21`)
- So personal Matches tab already shows their group matches (with `groupRef` field)
- Optional enhancement (Phase 3): show a small group badge on matches that were also logged to a group

**Alternative considered and rejected:** "Show all group matches" toggle in Matches tab. Rejected because it conflates ownership models and requires complex merge/dedup logic.

---

## 5. Community Tab — Stays Separate

### Decision: Groups do NOT affect community stats

**Rationale:**
- Community = ALL users' public match data (read from collectionGroup query)
- Groups are private, member-gated data
- Mixing would violate privacy expectations ("I thought only my group could see these matches")
- Group matches already have personal copies (via `sourceMatchId` linking) — those personal copies DO contribute to community stats
- No double-counting risk: group-only matches (logged without personal save) don't exist in current architecture

**Future option (not now):** "Compare your group's meta to community meta" — cool but low priority.

---

## 6. Data Architecture

### Queries Needed

| Context | Query | Reads | Indexed? |
|---------|-------|-------|----------|
| Group Players/Heroes/Maps | `groups/{groupId}/matches` (all) | 1 query, N docs | Default (by groupId) |
| Group match list (paginated) | Same, with `orderBy('date', 'desc').limit(20)` | 1 query, 20 docs | Need: `date` DESC index |
| Player stats in group | Client-side filter of above | 0 (already loaded) | N/A |

### Pre-computed vs On-the-fly

**Recommendation: On-the-fly computation for Phase 1, pre-computed for Phase 2 if needed.**

**Why on-the-fly is fine initially:**
- Typical group has 3-8 members, 2-5 matches/week = ~50-200 matches total
- `calculatePlayerStats()` on 200 matches is <5ms
- Already loaded for the match list — no additional reads
- No write amplification (no stats doc to keep in sync)

**When to add pre-computed stats:**
- If a group exceeds 500 matches (unlikely for months)
- If computation measurably impacts LCP on low-end mobile
- If we need stats without loading all matches (e.g., leaderboard preview)

**Pre-computed design (Phase 2, if needed):**
```
groups/{groupId}/stats/current
{
  playerStats: Record<playerName, { wins, losses, draws, total, winRate }>
  heroStats: Record<heroId, { wins, losses, total, winRate }>
  lastUpdated: Timestamp
  matchCount: number
}
```
- Updated via client-side write-through on match save (batch with match write)
- Stale-while-revalidate pattern: show cached stats, recompute if `lastUpdated` < latest match date

### Caching Strategy

```typescript
// New hook: useGroupContext
function useGroupContext(groupId: string | null) {
  // Fetches all group matches ONCE, memoizes
  // Returns { matches, loading, error }
  // Used by Players, Heroes, Maps tabs when group context selected
  // Cache invalidated when groupId changes or new match logged
}
```

- **Key:** Don't re-fetch group matches when switching between Players/Heroes/Maps tabs in same group context. Lift the fetch to a shared provider or use React Query.
- **Optimization:** Since `@tanstack/react-query` is already installed (but unused), this is the perfect first use case.

### Firestore Cost Impact

- Additional reads: 1 query per group context switch (~50-200 doc reads)
- At 5 context switches/session, 3 sessions/week: ~3,000 reads/week = $0.002/week
- Negligible. No optimization needed.

---

## 7. Component Reuse Plan

### Components that need NO changes:
- `MatchCard` — already used by GroupMatchList
- `calculatePlayerStats()` — operates on any `Match[]`
- `calculateHeroStats()` / `calculateUserHeroStats()` — same
- `getAllPlayerNames()` — same
- `HeroMatchupHeatmap` — takes `Match[]`
- `HeroImage` — pure display

### Components that need minor prop additions:

| Component | Change | Details |
|-----------|--------|---------|
| `PlayersTab` | Add `dataSource?: { label: string, matches: Match[] }` | When provided, use these matches instead of prop `matches` |
| `HeroesTab` | Add `dataSource?: { label: string, matches: Match[] }` | Same pattern. Hide community section when in group mode. |
| `MapsTab` | Add `dataSource?: { label: string, matches: Match[] }` | Same pattern. |

### New shared component (small):

```typescript
// src/components/shared/DataContextSelector.tsx
type DataContextSelectorProps = {
  groups: { id: string; name: string }[]
  value: string // 'personal' | groupId
  onChange: (value: string) => void
}
```
- Renders a `<Select>` with "My Data" + group options
- Used identically in Players, Heroes, Maps tabs
- ~30 lines, uses existing Shadcn Select

### State management:

```typescript
// In App.tsx or a new context:
const [dataContext, setDataContext] = useState<{
  players: string  // 'personal' | groupId
  heroes: string
  maps: string
}>({ players: 'personal', heroes: 'personal', maps: 'personal' })
```

Each tab independently remembers its context. Simple, no over-engineering.

---

## 8. Priority & Phasing

### Phase 1: Foundation (1-2 days) — HIGH VALUE, LOW RISK
1. **Create `DataContextSelector` component** (~30 lines)
2. **Create `useGroupMatches` enhancement** — ensure it returns full match list (not just paginated) for stats
3. **Wire into PlayersTab** — add dataSource prop, show group player stats
4. **Wire into HeroesTab** — add dataSource prop, show group hero stats

**Why Players first:** It's the highest-value feature ("who's winning in our group?") and the simplest to implement (PlayersTab already accepts `Match[]`).

### Phase 2: Polish (1 day) — MEDIUM VALUE
5. **Wire into MapsTab** — same pattern
6. **Add group badge to personal matches** that were also logged to a group
7. **Persist context selection** per session (optional, UX nicety)

### Phase 3: Optimization (if needed) — LOW PRIORITY
8. **Integrate React Query** for group match caching across tabs
9. **Pre-computed stats** if performance becomes an issue
10. **"Compare to community" mode** in group context

### What we explicitly defer:
- ❌ Global context switcher (rejected by design)
- ❌ Group matches in Matches tab (rejected, too confusing)
- ❌ Group influence on Community tab (privacy violation)
- ❌ Randomizer with group context (cool but low priority)
- ❌ Pre-computed stats doc (premature optimization)

---

## 9. Quality & Safety Considerations

### Won't break existing behavior:
- Default context is always "My Data" — users without groups see zero change
- `DataContextSelector` only renders when user has groups
- All existing props remain unchanged (dataSource is optional)
- No Firestore schema changes needed
- No new indexes required (default group subcollection query)

### Edge cases to handle:
- User leaves a group while viewing group stats → graceful fallback to "My Data"
- Group has zero matches → show empty state with "Log a match to see group stats"
- Group match with players not in group → still show in stats (handles "guest" players)
- Network error fetching group matches → show error boundary, don't corrupt personal view

### Testing plan (for Lambert):
1. Unit test: `calculatePlayerStats` with GroupMatch[] (should work with no changes — test to verify)
2. Component test: DataContextSelector renders groups, handles selection
3. Integration test: PlayersTab with dataSource override shows correct stats
4. Manual test: Switch between personal/group rapidly — no stale data

---

## 10. Open Questions for Devin

1. **Tab naming:** When in group context, should the tab header change? E.g., "Players" → "Players (Tuesday Night)" — or is the context pill enough?
2. **Notification/badge:** Should the Groups tab badge (pending invites) also show when a group has new matches since last visit?
3. **Randomizer integration:** Would you want "pick heroes from our group's collection" as a future feature?

---

## Summary

The cheapest, safest, highest-value path is:
1. **Per-tab context pill** (not global) using existing Shadcn Select
2. **Feed group matches to existing stat functions** (they already accept `Match[]`)
3. **Players tab first** (most requested, simplest)
4. **No new Firestore queries beyond what GroupMatchList already does**
5. **No pre-computation** until we have evidence it's needed

This gives group members immediate value ("who's crushing it in our group?") without touching personal data, adding complexity to the nav, or requiring schema changes.
