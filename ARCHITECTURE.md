# Architecture & Approach

## Assessment Objectives

This project demonstrates a professional real-time web application with:
- Modern server and client component architecture
- Real-time data synchronization via Server-Sent Events (SSE)
- Hybrid rendering for optimal user experience
- Production-grade error handling and accessibility
- Optimized performance with memoization and optimistic updates

## System Architecture

**Data Flow**:
1. Server (Next.js) → Client: Initial 10 trends via server rendering
2. Server → Client: New trends streamed every 5 seconds via SSE
3. Client → Server: Vote submissions via Server Actions

**Key Components**:
- `app/api/trends/route.ts` - SSE endpoint generating trends every 5 seconds
- `app/components/TrendsLiveSync.tsx` - Client component managing live updates, EventSource connection, and votes
- `app/page.tsx` - Server component providing initial seed data
- `app/actions/voteTrend.ts` - Server Action for vote validation

## Technical Approach

### Hybrid Rendering Pattern

Server-rendered initial content + client-side progressive enhancement:
- Server reads seed data and renders 10 initial trends immediately
- No loading spinner (fast First Contentful Paint)
- Client hydrates and connects to live stream
- New trends appear sorted by vote count in real-time

### Real-Time Streaming with SSE

EventSource connection for one-way server-to-client communication:
- Simple HTTP protocol (works through proxies and firewalls)
- No additional libraries required (native browser API)
- Automatic browser reconnection handling
- Custom exponential backoff: 1s → 2s → 4s → 8s → 16s → 30s (capped)

**Why SSE over WebSockets**: Simpler protocol, less overhead for one-way communication

### Optimistic UI Updates

Vote count incremented immediately on click:
- Local state updates instantly
- Button shows "..." during server submission
- Zero perceived latency using `useTransition` hook
- Suitable for low-risk operations (vote increment)

### Duplicate Detection

Each trend has unique ID (`live-${timestamp}-${index}`):
```typescript
const exists = prevTrends.some((t) => t.id === newTrend.id);
if (exists) return prevTrends;  // Skip duplicate
```

### Sorting Strategy

All trends sorted by votes descending, no forced-to-top logic:
```typescript
updated.sort((a, b) => b.votes - a.votes)
```

## Performance Optimizations

- **Component Memoization**: TrendRow wrapped in `memo()` prevents re-renders of unmodified trends
- **Ref Management**: EventSource and reconnection timeouts managed via useRef to persist across renders
- **useTransition**: Keeps UI responsive during async vote submission
- **Event Cleanup**: Proper removal of listeners and clearing timeouts on component unmount

## Accessibility Features

- ARIA live regions announce connection status changes
- Semantic HTML: form elements, buttons with aria-labels
- Color contrast meets WCAG AA standards (slate-900 background with light text)
- Screen reader friendly trend labels and vote counts

## Key Design Decisions

**Server Component for Initial Data**
- Rationale: Fast page load, SEO-friendly HTML, immediate content visibility
- Alternative: Full client-side fetch adds latency and extra API call

**SSE over WebSockets**
- Rationale: Simpler protocol for one-way server-to-client communication, native browser support, works through proxies
- Alternative: WebSockets add overhead and complexity for this use case

**Optimistic Updates for Votes**
- Rationale: Low-risk operations (simple increment), instant user feedback, zero perceived latency
- Alternative: Waiting for server confirmation creates perceived lag and poor UX

**Exponential Backoff Reconnection**
- Rationale: Prevents connection storms during outages, adapts to server recovery time, transparent to user
- Alternative: Fixed delay or immediate retry hammers server and increases load during failures

**Vote Validation Only (No Persistence)**
- Rationale: Sufficient for assessment scope, demonstrates validation patterns
- Alternative: Database persistence adds significant implementation scope

## Error Handling

- **Connection Failures**: EventSource error listener triggers exponential backoff reconnection, UI shows status
- **JSON Parse Errors**: Try-catch logs error, continues processing remaining trends
- **Invalid Votes**: Server-side validation rejects non-string trend IDs

## Scalability Considerations

**Current Limitations**:
- Single server instance (single /api/trends endpoint)
- In-memory trend generation (no database)
- No user tracking or persistence

**Production Scaling**:
- Load balancer for multiple server instances
- Redis pub/sub for trend synchronization
- Database for trend persistence and vote history
- Serverless timeout handling (heartbeat messages)

