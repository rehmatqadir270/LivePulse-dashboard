# Live Pulse Dashboard

A real-time trending topics dashboard that streams live trend updates to connected clients using Server-Sent Events (SSE). The application demonstrates hybrid server-client rendering, live data synchronization, and production-grade frontend architecture.

## Overview

Live Pulse Dashboard is built to showcase modern full-stack web development patterns, combining server-side rendering with client-side streaming for a responsive real-time experience. The dashboard displays trending topics with vote counts and allows users to vote on trends in real time.

## Features

- Real-time trend streaming via Server-Sent Events
- Hybrid rendering: server-rendered initial state with client-side live updates
- Automatic reconnection with exponential backoff
- Duplicate trend detection and merging
- Optimistic UI updates for instant vote feedback
- Vote count persistence through Server Actions
- Professional dark theme with accessibility support
- Responsive design with ranking visualization
- Progress bars showing relative vote distribution

## Tech Stack

- **Framework**: Next.js 16.2.4 with App Router
- **Language**: TypeScript 5 with full type safety
- **UI Components**: shadcn/ui (Card, Button, Badge)
- **Styling**: Tailwind CSS v4 with dark theme
- **Runtime**: Node.js with Edge Runtime support for SSE
- **State Management**: React Hooks (useState, useCallback, useTransition, useEffect)
- **Build Tool**: Next.js built-in (ESNext/SWC compiler)

## Project Structure

```
app/
├── api/trends/route.ts          # SSE endpoint for streaming trends
├── components/
│   ├── TrendsLiveSync.tsx       # Client component with live streaming
│   ├── TrendsList.tsx           # Server component for initial data
│   └── ui/                       # shadcn/ui component library
├── actions/voteTrend.ts         # Server Action for vote submission
├── layout.tsx                    # Root layout with metadata
└── page.tsx                      # Main page component

data/
└── trends.json                   # Seed data for initial trends

lib/
└── constants.ts                  # Global configuration constants

public/                           # Static assets
```

## Installation

Clone the repository and install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The application will auto-reload as you make changes.

## Building for Production

Build the project:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Architecture

For a comprehensive explanation of the architecture, design patterns, and technical approach, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Key Implementation Details

### Server-Sent Events (SSE) Endpoint

The `/api/trends` endpoint generates new trends every 5 seconds and streams them to connected clients using SSE. Each trend includes a unique identifier, topic, and vote count.

### Hybrid Rendering

- **Initial Load**: Server renders 10 seed trends from `data/trends.json` for immediate content
- **Live Updates**: Client-side EventSource connection receives new trends and merges them without duplicates
- **Sorting**: All trends sorted by vote count in descending order

### State Management

The TrendsLiveSync component manages:
- Current trend list with real-time updates
- Connection status and reconnection attempts
- Vote updates with optimistic UI feedback
- EventSource lifecycle

### Reconnection Strategy

Implements exponential backoff reconnection:
- Initial delay: 1 second
- Maximum delay: 30 seconds
- Each failed attempt increases delay by factor of 2

### Vote Handling

Votes are submitted via Server Action with:
- Optimistic local update (immediate +1 to vote count)
- Server validation and persistence
- Visual feedback during submission (button shows "...")

## Performance Considerations

- Memoized TrendRow component prevents unnecessary re-renders
- useTransition hook for smooth vote submission feedback
- Efficient EventSource connection management with proper cleanup
- CSS containment through Tailwind's transition utilities

## Accessibility

- ARIA live regions for status updates (`aria-live="polite"`)
- Semantic HTML structure
- Screen-reader friendly status messages
- Proper form semantics and button labeling
- Sufficient color contrast in dark theme

## Error Handling

- Graceful connection error recovery
- Duplicate trend detection and filtering
- JSON parsing error handling with logging
- Visual feedback for connection state

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## License

This project is provided as-is for assessment purposes.
