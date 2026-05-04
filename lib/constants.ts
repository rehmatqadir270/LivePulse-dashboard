export const SSE_INTERVAL_MS = 5000;

export const SSE_HEADERS = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
};

export const INITIAL_TRENDS_LIMIT = 10;

export const RECONNECT_BASE_DELAY_MS = 1000;
export const RECONNECT_MAX_DELAY_MS = 30000;

export const LIVE_TOPICS = [
    "React 19 Concurrent Features",
    "Bun vs Node.js Benchmarks",
    "Tailwind CSS v4 Alpha",
    "Vite 6 Release Notes",
    "Deno 2.0 Stability",
    "SvelteKit Full-Stack Patterns",
    "shadcn/ui New Components",
    "Astro DB Launch",
    "tRPC v11 Updates",
    "Biome Formatter Adoption",
    "Million.js Virtual DOM",
    "Hono Edge Framework",
];
