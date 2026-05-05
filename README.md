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

## Common Questions & Implementation Answers

### Q1: How do you handle serverless timeout constraints with SSE?

**Answer**: For this assessment, we use **Server-Sent Events (SSE) with ReadableStream** which works indefinitely on Vercel's Edge Runtime (supports streaming connections). This avoids traditional serverless timeout issues altogether.

**For Production at Scale**: When deployed on traditional serverless platforms (AWS Lambda, Google Cloud Functions with 15-min timeout), SSE long-lived connections become problematic. Production solutions include:

- **Pusher**: Managed real-time service handling all persistent connections, we publish trends server-side
- **Ably**: Similar to Pusher, handles connection management, fallback protocols (WebSocket, polling)
- **Pub/Sub Models**: Redis pub/sub, AWS SNS/SQS for message broadcasting across serverless functions
- **Apache Kafka**: High-throughput event streaming for massive scale, multiple consumer groups
- **Dedicated Server**: Deploy on traditional server (Heroku, railway.app) for unlimited connections
- **Edge Runtime**: Vercel, Cloudflare Workers support streaming (current approach)

**Current Implementation**: Deployed on Next.js Edge Runtime which supports indefinite streaming, eliminating timeout concerns for the assessment.

### Q2: How do you solve the hydration puzzle between server and client rendering?

**Answer**: The key is ensuring server-rendered HTML exactly matches client hydration:

- Server reads `data/trends.json` and renders 10 initial trends synchronously
- Passes `initialTrends` as JSON prop to client component
- Client `useState` initializes with same data (no mismatch)
- After hydration, client connects to EventSource for live updates
- Use `suppressHydrationWarning` on dynamic attributes (connection status indicator)

**Implementation**: `app/page.tsx` reads seed data server-side, `TrendsLiveSync.tsx` receives it as prop and initializes useState, preventing hydration mismatches.

### Q3: How would you scale this to 100k+ concurrent users?

**Answer**: Current architecture supports scaling through:

- **Load Balancing**: Multiple server instances behind load balancer (each server handles independent SSE streams)
- **Trend Synchronization**: Redis pub/sub broadcasts trends across all servers so clients receive same data regardless of which server they connect to
- **Database**: Replace in-memory trends with MongoDB/PostgreSQL for persistence and vote aggregation
- **Caching**: Edge cache initial trends at CDN level, invalidate on new trends
- **Rate Limiting**: Implement per-user vote rate limits to prevent spam
- **Monitoring**: Track connection count, trend generation latency, vote submission times

**Current Limitation**: Single instance, in-memory trends. Production would require above scaling patterns.

### Q4: What accessibility considerations have been implemented?

**Answer**: The application includes comprehensive accessibility features:

- **ARIA Live Regions**: `aria-live="polite"` announces connection status changes to screen readers
- **Semantic HTML**: Form elements, proper button semantics, no divs as buttons
- **Labeling**: Every interactive element has `aria-label` (votes, voting button)
- **Screen Reader Friendly**: Status updates appear in hidden `sr-only` div
- **Color Contrast**: Dark slate-900 background with light slate-100 text meets WCAG AA standards
- **Keyboard Navigation**: All buttons and forms fully keyboard accessible
- **Skip Links**: Recommended pattern for long trend lists

**Implementation**: Accessible throughout `TrendsLiveSync.tsx` and `TrendRow` component with proper ARIA attributes and semantic markup.
- `npm run type-check` - Run TypeScript type checking

## License

This project is provided as-is for assessment purposes.
