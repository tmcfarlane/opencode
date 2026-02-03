# Cursor Agent Integration - Information Center

Comprehensive React-based information center for the Cursor Agent integration with OpenCode.

## Features

- **Hero Section**: Overview of Cursor Agent integration with key statistics
- **Getting Started**: Step-by-step guide for setting up Cursor Agent
- **Feature Comparison Matrix**: Interactive table comparing Cursor Agent vs GitHub Copilot
- **Architecture Comparison**: Deep dive into implementation patterns
- **Authentication Flow**: Visual comparison of auth flows
- **Gap Analysis**: Identified gaps and recommendations

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing fast development
- **CSS Modules** for styling (matching OpenCode theme)
- No external dependencies (besides React)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm/pnpm/yarn/bun

### Installation

```bash
# Using npm
npm install

# Using bun (recommended)
bun install
```

### Development

```bash
# Using npm
npm run dev

# Using bun
bun run dev
```

The site will be available at `http://localhost:3001`

### Build

```bash
# Using npm
npm run build

# Using bun
bun run build
```

The production build will be in the `dist/` directory.

### Preview Production Build

```bash
# Using npm
npm run preview

# Using bun
bun run preview
```

## Project Structure

```
site/
├── src/
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── Hero.css
│   │   ├── GettingStarted.tsx
│   │   ├── GettingStarted.css
│   │   ├── FeatureMatrix.tsx
│   │   ├── FeatureMatrix.css
│   │   ├── ArchitectureComparison.tsx
│   │   ├── ArchitectureComparison.css
│   │   ├── AuthFlow.tsx
│   │   ├── AuthFlow.css
│   │   ├── GapAnalysis.tsx
│   │   └── GapAnalysis.css
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Design System

The site follows OpenCode's design system with:

- **Colors**: HSL-based color palette matching OpenCode theme
- **Typography**: System fonts with fallbacks
- **Components**: Reusable card, badge, and table patterns
- **Responsive**: Mobile-first approach with breakpoints at 768px

## Features in Detail

### Interactive Feature Matrix

- Filter by category (Authentication, Model Management, API Compatibility, etc.)
- Visual status indicators (✓ Supported, ✗ Not Supported, ~ Partial)
- Detailed notes for each feature

### Architecture Toggle

- Switch between Cursor Agent and GitHub Copilot views
- Component breakdown with descriptions
- Implementation file references

### Gap Analysis Cards

- Severity badges (Critical, High, Medium, Low)
- Integration labels (Cursor Agent, GitHub Copilot, Both)
- Detailed descriptions and actionable recommendations

## Contributing

This is an internal information center. To update content:

1. Edit component files in `src/components/`
2. Update data structures (features array, gaps array, etc.)
3. Run `npm run dev` to preview changes
4. Build and deploy when ready

## License

MIT - Part of the OpenCode project
