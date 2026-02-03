# Quick Start Guide

## Installation

```bash
cd /Users/tmcfarlane/repo/opencode/site
bun install
```

## Development

```bash
bun run dev
```

Visit: http://localhost:3001

## Build for Production

```bash
bun run build
```

Output will be in `dist/` directory.

## Preview Production Build

```bash
bun run preview
```

## Project Overview

This is a comprehensive React information center for the Cursor Agent integration with OpenCode. It includes:

### Sections

1. **Hero** - Overview with key statistics
2. **Getting Started** - Step-by-step setup guide
3. **Feature Matrix** - Interactive comparison table with filters
4. **Architecture Comparison** - Toggle between Cursor and Copilot views
5. **Authentication Flow** - Side-by-side flow diagrams
6. **Gap Analysis** - Detailed gaps with severity badges and recommendations

### Tech Stack

- React 18 + TypeScript
- Vite (fast development)
- CSS Modules (matching OpenCode theme)
- No external UI libraries (lightweight)

### Design Features

- Responsive mobile-first design
- Interactive components (filters, toggles)
- Severity badges (Critical, High, Medium, Low)
- Status icons (✓, ✗, ~)
- Modern gradient hero section
- Card-based layouts
- Color scheme matching OpenCode theme

## Customization

### Update Content

- **Features**: Edit `features` array in `src/components/FeatureMatrix.tsx`
- **Gaps**: Edit `gaps` array in `src/components/GapAnalysis.tsx`
- **Architecture**: Edit data in `src/components/ArchitectureComparison.tsx`
- **Auth Flow**: Modify steps in `src/components/AuthFlow.tsx`

### Styling

All components use dedicated CSS files for easy customization:
- Colors: Edit CSS custom properties in `src/index.css`
- Component styles: Each component has its own `.css` file

### Add New Sections

1. Create new component in `src/components/`
2. Import and add to `src/App.tsx`
3. Create corresponding CSS file

## Deployment

The built site can be deployed to any static hosting:

- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

Just run `bun run build` and deploy the `dist/` folder.
