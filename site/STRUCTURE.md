# Site Structure & Content

## Visual Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         HERO SECTION                         │
│  • Cursor Agent Integration title                           │
│  • Description of information center                         │
│  • 4 key stats: CLI-Based Auth, Headless Mode,              │
│    Dynamic Discovery, Local Proxy                           │
│  • Gradient background with accent colors                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GETTING STARTED                           │
│  Step 1: Install Cursor CLI                                 │
│  Step 2: Connect to OpenCode                                │
│  Step 3: Login via Browser                                  │
│  Step 4: Select a Model                                     │
│  • Headless Mode card with CURSOR_API_KEY info             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   FEATURE MATRIX                             │
│  • Category filters (All, Authentication, Model             │
│    Management, API, Advanced, Testing)                      │
│  • Comparison table: Cursor Agent vs GitHub Copilot         │
│  • 15 features compared across 5 categories                 │
│  • Status icons: ✓ Supported, ✗ Not Supported              │
│  • Notes column for additional context                      │
│  • Legend at bottom                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              ARCHITECTURE COMPARISON                         │
│  • Toggle: Cursor Agent <-> GitHub Copilot                  │
│  • Component grid showing architecture pieces               │
│  • Implementation files section                             │
│  • Common Patterns card                                     │
│                                                              │
│  Cursor: 6 components + Local Proxy                         │
│  Copilot: 7 components + Direct API                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION FLOW                         │
│  Side-by-side flow diagrams:                                │
│                                                              │
│  Cursor Flow (5 steps)       Copilot Flow (5 steps)        │
│  1. User initiates           1. User initiates             │
│  2. CLI binary check         2. Device code generation     │
│  3. Browser login            3. User authorization         │
│  4. Verification             4. Token polling              │
│  5. Proxy server start       5. Token storage              │
│                                                              │
│  • Key Differences card                                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GAP ANALYSIS                              │
│  6 detailed gap cards:                                      │
│                                                              │
│  1. Cursor Missing Vision Support [CRITICAL]                │
│  2. Cursor Missing Subagent Marking [HIGH]                  │
│  3. Copilot Missing Test Coverage [HIGH]                    │
│  4. Cursor Proxy Complexity [MEDIUM]                        │
│  5. Copilot Missing Dynamic Discovery [MEDIUM]              │
│  6. Inconsistent Documentation [LOW]                        │
│                                                              │
│  Each card:                                                 │
│  • Severity badge (color-coded)                            │
│  • Integration label                                        │
│  • Description section                                      │
│  • Recommendation section                                   │
│                                                              │
│  • Summary card with priority actions                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FOOTER                               │
│  OpenCode Cursor Agent Integration • 2026 • GitHub Link    │
└─────────────────────────────────────────────────────────────┘
```

## Color Coding

### Severity Badges
- 🔴 **CRITICAL** - Red badge (immediate action required)
- 🟠 **HIGH** - Orange badge (important, plan to address)
- 🔵 **MEDIUM** - Blue badge (nice to have)
- 🟢 **LOW** - Green badge (minor improvement)

### Status Icons
- ✓ - Green (feature supported)
- ✗ - Red (feature not supported)
- ~ - Orange (partial support)

### Section Themes
- **Hero**: Gradient yellow background (#fef08a)
- **Cards**: Light background with subtle borders
- **Interactive**: Hover effects on all clickable elements
- **Links**: Yellow underline accent

## Data Sources

All content is based on the comprehensive architecture analysis:

1. **Feature Matrix**: 15 features across 5 categories
2. **Architecture**: Component breakdowns from actual source code
3. **Auth Flows**: Documented from plugin implementations
4. **Gaps**: Analysis of missing features and test coverage
5. **Recommendations**: Actionable improvements prioritized by severity

## Interactive Elements

1. **Category Filters** (Feature Matrix)
   - Click to filter by category
   - "All" shows everything
   - Active state with accent color

2. **Architecture Toggle**
   - Switch between Cursor and Copilot views
   - Smooth transition
   - Preserves scroll position

3. **Hover Effects**
   - Cards lift on hover
   - Links change color
   - Buttons have background transitions

4. **Responsive Design**
   - Mobile: Single column, stacked flows
   - Tablet: 2-column grids
   - Desktop: Full multi-column layouts
