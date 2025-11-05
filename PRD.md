# Planning Guide

A comprehensive web application for tracking Unmatched board game matches, analyzing player statistics, and generating balanced matchups with community data aggregation.

**Experience Qualities**: 
1. **Effortless** - Logging matches should feel quick and intuitive, whether on mobile during game night or desktop afterward
2. **Insightful** - Statistics and visualizations should reveal patterns and tell stories about play history at a glance
3. **Engaging** - Discovering matchup data and generating balanced random games should feel like a game itself

**Complexity Level**: Complex Application (advanced functionality, accounts)
- This application requires persistent user data, multi-player tracking, statistical analysis, community aggregation, and sophisticated filtering/randomization logic across hundreds of hero combinations and matchup permutations.

## Essential Features

### Global Statistics (Unauthenticated)
- **Functionality**: Display community-wide statistics showing most played heroes, highest win rates, and popular maps without requiring login
- **Purpose**: Provides immediate value to new visitors and demonstrates the app's capabilities while encouraging sign-up
- **Trigger**: User visits the app without being logged in
- **Progression**: View global stats cards → See most played heroes, top win rates, popular maps → Read about community data → Sign in or sign up to contribute
- **Success criteria**: Stats aggregate all user data, update when matches are logged, display correctly with no data, require minimum 3 games for win rate calculations

### User Authentication
- **Functionality**: Create account and sign in with email and password to access personalized match tracking
- **Purpose**: Enables multi-user support and ensures each user only sees their own data
- **Trigger**: User enters email/password on landing page sign in/sign up form
- **Progression**: Enter email and password → Create account or sign in → User profile displays in header with initials avatar → Access personal match data
- **Success criteria**: User can create account, sign in/out, initials display in header dropdown, matches filtered by user ID

### Match Logging
- **Functionality**: Record complete game details including map (filtered by player count), game mode (cooperative, 1v1, 2v2, 3-player FFA, 4-player FFA), heroes used (searchable from ALL heroes, not limited to collection), player names, turn order, and winner. Special handling for Yennefer & Triss hero variant selection.
- **Purpose**: Creates the data foundation for all statistics and insights
- **Trigger**: User clicks "Log New Match" button
- **Progression**: Select game mode → Choose map (filtered to only show maps suitable for player count) → Search and assign heroes to players with turn order (search narrows hero list as user types) → For Yennefer & Triss, designate which is the hero and which is the sidekick → Designate winner → Review and save → See confirmation toast
- **Success criteria**: Match appears in match history with all details including map stats (zones, spaces) and hero variants; statistics update immediately; only appropriate maps shown based on game mode; all heroes searchable and selectable regardless of collection status; Yennefer & Triss variant properly recorded and displayed

### Player Statistics View
- **Functionality**: Filter and analyze performance data for any logged player name
- **Purpose**: Reveals individual play patterns, favorite heroes, unexplored characters, and win rates
- **Trigger**: User navigates to Players tab or clicks player name in match history
- **Progression**: Select/search player → View hero usage chart → See win/loss breakdown → Explore never-played heroes → Filter by game mode or opponent
- **Success criteria**: Accurate percentages, clear visualizations, ability to drill down into specific matchups

### Hero Matchup Analysis
- **Functionality**: Display win rates for heroes overall and in specific head-to-head matchups, both locally and across all community data
- **Purpose**: Identifies strong/weak heroes and reveals counter-pick strategies
- **Trigger**: User navigates to Heroes tab or clicks hero name
- **Progression**: Select hero → View overall win rate → See matchup grid against all other heroes → Toggle between personal data and community data → Filter by map or game mode
- **Success criteria**: Clear comparison tables, color-coded win rates, statistically significant sample sizes noted

### Global Results Heatmap
- **Functionality**: Display comprehensive matchup heatmap showing win rates for all hero-vs-hero combinations based on aggregated community data from 1v1 matches
- **Purpose**: Provides at-a-glance meta-game overview, revealing dominant heroes, favorable matchups, and strategic insights across the entire roster
- **Trigger**: User navigates to Global tab
- **Progression**: View complete matchup matrix → Read win percentages for any hero-vs-hero pairing → Click hero name to navigate to detailed hero statistics → Understand color-coding and data confidence through legend
- **Success criteria**: Only shows heroes with logged match data; clicking hero name navigates to Heroes tab with that hero pre-selected; color intensity reflects both win rate and sample size; tooltips show exact win/loss record; mobile-friendly scrolling table

### Collection Management
- **Functionality**: Users indicate which Unmatched sets they own to filter available heroes for the randomizer ONLY
- **Purpose**: Ensures randomizer only suggests heroes the user can actually play, while match logging remains unrestricted
- **Trigger**: User navigates to Collection tab or prompted during first randomization
- **Progression**: View all sets organized by release → Toggle owned/not owned → See hero count update → Changes immediately affect randomizer pool (but not match logging)
- **Success criteria**: Persistent collection data, accurate hero filtering in randomizer, easy bulk selection, match logging unaffected by collection

### Match Randomizer
- **Functionality**: Generate random matchup suggestions with map (filtered by player count) and heroes, optionally balanced by win rates
- **Purpose**: Removes decision paralysis and ensures variety in play experiences
- **Trigger**: User clicks "Random Match" button
- **Progression**: Choose game mode → Select randomization type (true random vs balanced) → View suggested matchup with map (showing player count, zones, spaces) and heroes → Re-roll specific elements or accept all → Save directly as new match when played
- **Success criteria**: Only suggests owned heroes, only suggests maps appropriate for player count (e.g., 2-player-only maps won't appear in 4-player games), balanced mode keeps win rates within 10% difference, results feel fair and exciting

### Community Data Aggregation
- **Functionality**: Anonymously combine match data from all users to show global win rates and matchup statistics
- **Purpose**: Provides larger sample sizes for meta-game analysis and helps new players understand hero balance
- **Trigger**: Automatic on every match save; viewable via toggle in statistics views
- **Progression**: Match saved → Data anonymously added to community pool → Global stats recalculated → Users can toggle "My Data" vs "Community Data" views
- **Success criteria**: Privacy preserved (no personal identifiers), accurate aggregation, clear labeling of data source

## Edge Case Handling
- **No matches logged yet**: Show engaging empty state with "Log Your First Match" CTA and sample statistics visualization
- **Player name variations**: Normalize capitalization and trim whitespace; suggest existing names as user types
- **Incomplete match data**: Validate required fields before save; allow drafts for partial data
- **No owned sets**: Prompt user to add collection before using randomizer; provide quick-add popular sets
- **Statistical insignificance**: Display sample size; gray out or mark matchups with <3 games as "insufficient data"
- **Tie games**: Include "draw" option in winner selection
- **Mobile data entry**: Large touch targets, minimal typing with dropdowns/autocomplete, swipe gestures for quick navigation

## Design Direction
The design should feel like a premium companion app to a beloved board game—sophisticated yet playful, data-rich yet never overwhelming. It should balance the tactical seriousness of competitive analysis with the joy of discovery and randomization. A minimal interface lets the colorful hero artwork and clear data visualizations take center stage, with smooth transitions creating continuity between logging matches and exploring statistics.

## Color Selection
Triadic color scheme inspired by Unmatched's vibrant character art and strategic gameplay, using bold accent colors against a neutral foundation to make data pop and maintain readability across dense statistical tables.

- **Primary Color**: Deep Purple (oklch(0.45 0.15 300)) - Represents strategy and premium quality, used for primary actions and navigation
- **Secondary Colors**: Warm Slate (oklch(0.35 0.02 270)) for structural elements; Soft Cream (oklch(0.96 0.01 90)) for cards and elevated surfaces
- **Accent Color**: Vibrant Teal (oklch(0.65 0.14 195)) - Creates energy and excitement for key stats, winners, and randomizer results
- **Foreground/Background Pairings**: 
  - Background (Warm White oklch(0.98 0.005 90)): Dark Purple text (oklch(0.25 0.05 300)) - Ratio 11.2:1 ✓
  - Card (Soft Cream oklch(0.96 0.01 90)): Dark Purple text (oklch(0.25 0.05 300)) - Ratio 10.5:1 ✓
  - Primary (Deep Purple oklch(0.45 0.15 300)): White text (oklch(1 0 0)) - Ratio 7.8:1 ✓
  - Accent (Vibrant Teal oklch(0.65 0.14 195)): Dark text (oklch(0.2 0.02 270)) - Ratio 8.9:1 ✓
  - Muted (Light Gray oklch(0.92 0.005 270)): Medium Gray text (oklch(0.5 0.02 270)) - Ratio 6.1:1 ✓

## Font Selection
The typeface should feel modern and authoritative for data while remaining friendly for player names and casual content—a geometric sans-serif with excellent legibility at small sizes for dense statistical tables.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight letter-spacing (-0.02em) 
  - H2 (Section Headers): Inter Semibold/24px/normal letter-spacing
  - H3 (Card Titles): Inter Medium/18px/normal letter-spacing
  - Body (General Text): Inter Regular/16px/relaxed line-height (1.6)
  - Data Labels: Inter Medium/14px/tabular numbers for alignment
  - Small Print (Metadata): Inter Regular/13px/muted color

## Animations
Animations should create spatial continuity as users navigate between logging matches and exploring their statistics, with purposeful motion that reinforces cause-and-effect relationships—such as a new match adding to a growing chart or a randomizer result "dealing cards" onto the screen.

- **Purposeful Meaning**: Match saves trigger subtle success pulses; statistics update with smooth number counting; hero cards flip/slide into view
- **Hierarchy of Movement**: 
  - Critical feedback (match saved): 300ms spring animation with toast
  - Page transitions: 250ms ease-out with subtle fade
  - Data updates (chart changes): 400ms ease-in-out for readability
  - Hover states: 150ms for immediate responsiveness
  - Randomizer reveal: Staggered 200ms cascade for excitement

## Component Selection
- **Components**: 
  - Dialog for match logging form (large, stepped interface)
  - Card for match history items and hero displays
  - Tabs for main navigation (Matches, Players, Heroes, Collection, Randomizer)
  - Select dropdowns for hero/map/mode selection with search
  - Table for matchup grids and statistical comparisons
  - Badge for game modes, win/loss indicators, set names
  - Progress bars for win rate visualizations
  - Avatar for player identifiers
  - Separator for visual grouping
  - ScrollArea for long lists of matches/heroes
  - Toggle for My Data vs Community Data views
  - Button variants: default for primary actions, outline for secondary, ghost for subtle actions
  
- **Customizations**: 
  - Hero card component with image, name, set, and win rate overlay
  - Match card showing timeline-style game summary
  - Stat visualization components using recharts for win rate charts
  - Matchup grid using Table with color-coded cells
  - Turn order indicator (1-4 badges) for player assignments
  
- **States**: 
  - Buttons: Distinct hover with lift effect, pressed with slight scale-down, disabled grayed out
  - Form inputs: Focused ring in accent color, error states in destructive color with icon
  - Hero cards: Selectable state with accent border, hover shows additional stats
  - Match cards: Expandable to show full details, edit/delete actions on hover
  
- **Icon Selection**: 
  - Phosphor icons throughout: Plus for add match, ChartBar for statistics, Shuffle for randomizer, Trophy for winners, User for players, Sword for heroes, MapPin for maps
  
- **Spacing**: 
  - Consistent 4/8/16/24/32px rhythm
  - Cards use p-6 internal padding
  - Sections separated by mb-8
  - Form fields have mb-4 spacing
  - Grid gaps of gap-4 for card layouts, gap-6 for major sections
  
- **Mobile**: 
  - Tabs collapse to bottom navigation bar on mobile
  - Match logging form becomes full-screen stepped dialog
  - Statistics switch from side-by-side to stacked layout
  - Tables become horizontally scrollable cards with key data prioritized
  - Touch targets minimum 44px with generous padding around interactive elements
  - Randomizer results stack vertically with swipe-to-refresh gesture
