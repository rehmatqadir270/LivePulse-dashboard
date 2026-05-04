import { LIVE_TOPICS, SSE_HEADERS, SSE_INTERVAL_MS } from "@/lib/constants";

export const runtime = "edge";

function generateTrend(index: number) {
    const topic = LIVE_TOPICS[index % LIVE_TOPICS.length];
    return {
        id: `live-${Date.now()}-${index}`,
        topic,
        votes: Math.floor(Math.random() * 500) + 100,
    };
}

function encodeEvent(data: object): string {
    return `data: ${JSON.stringify(data)}\n\n`;
}

export async function GET() {
    let intervalId: ReturnType<typeof setInterval>;
    let counter = 0;

    const stream = new ReadableStream({
        start(controller) {
            intervalId = setInterval(() => {
                const trend = generateTrend(counter++);
                const chunk = new TextEncoder().encode(encodeEvent(trend));
                controller.enqueue(chunk);
            }, SSE_INTERVAL_MS);
        },
        cancel() {
            clearInterval(intervalId);
        },
    });

    return new Response(stream, { headers: SSE_HEADERS });
}
