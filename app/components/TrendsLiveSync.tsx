"use client";

import { useEffect, useState, useCallback, useRef, memo, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { voteTrend } from "@/app/actions/voteTrend";
import {
  RECONNECT_BASE_DELAY_MS,
  RECONNECT_MAX_DELAY_MS,
} from "@/lib/constants";

interface Trend {
  id: string;
  topic: string;
  votes: number;
}

interface TrendsLiveSyncProps {
  initialTrends: Trend[];
}

const TrendRow = memo(function TrendRow({
  trend,
  rank,
  isNew,
  onVote,
}: {
  trend: Trend;
  rank: number;
  isNew: boolean;
  onVote: (id: string) => void;
}) {
  const percentage = Math.min((trend.votes / 2000) * 100, 100);
  const [isPending, startTransition] = useTransition();

  const handleVote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onVote(trend.id);
    
    startTransition(async () => {
      const formData = new FormData();
      formData.set("trendId", trend.id);
      await voteTrend(formData);
    });
  };

  return (
    <form
      onSubmit={handleVote}
      className={`group relative transition-all duration-300 ${
        isNew ? "animate-in fade-in slide-in-from-top-2 duration-500" : ""
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 rounded-lg transition-opacity" />

      <div className="relative flex items-center gap-4 px-5 py-4 rounded-lg border border-slate-700/50 group-hover:border-slate-600 transition-colors">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700/50 flex-shrink-0">
          <span className="text-xs font-bold text-slate-300">{rank}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-100 text-sm truncate group-hover:text-white transition-colors">
            {trend.topic}
          </h3>
          <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${percentage}%` }}
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <div
              className="text-xl font-bold text-white"
              aria-label={`${trend.votes} votes`}
            >
              {trend.votes.toLocaleString()}
            </div>
            {isNew && (
              <div className="text-xs text-purple-400 font-medium mt-0.5">
                New
              </div>
            )}
          </div>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            disabled={isPending}
            className="border-slate-600 text-slate-300 hover:text-white hover:border-purple-500 hover:bg-purple-500/10 transition-all disabled:opacity-50"
            aria-label={`Vote for ${trend.topic}`}
          >
            {isPending ? "..." : "▲"}
          </Button>
        </div>
      </div>
    </form>
  );
});

export function TrendsLiveSync({ initialTrends }: TrendsLiveSyncProps) {
  const [trends, setTrends] = useState<Trend[]>(initialTrends);
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempt, setReconnectAttempt] = useState(0);
  const [newTrendIds, setNewTrendIds] = useState<Set<string>>(new Set());
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVote = useCallback((trendId: string) => {
    setTrends((prevTrends) =>
      prevTrends.map((trend) =>
        trend.id === trendId ? { ...trend, votes: trend.votes + 1 } : trend
      )
    );
  }, []);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      return;
    }

    const eventSource = new EventSource("/api/trends");

    eventSource.addEventListener("open", () => {
      setIsConnected(true);
      setReconnectAttempt(0);
    });

    eventSource.addEventListener("message", (event) => {
      try {
        const newTrend: Trend = JSON.parse(event.data);
        setTrends((prevTrends) => {
          const exists = prevTrends.some((t) => t.id === newTrend.id);
          if (exists) {
            return prevTrends;
          }
          const updated = [newTrend, ...prevTrends];
          setNewTrendIds((prev) => {
            const newSet = new Set(prev);
            newSet.add(newTrend.id);
            setTimeout(() => {
              setNewTrendIds((curr) => {
                const next = new Set(curr);
                next.delete(newTrend.id);
                return next;
              });
            }, 15000);
            return newSet;
          });
          return updated.sort((a, b) => b.votes - a.votes);
        });
      } catch (error) {
        console.error("Failed to parse trend:", error);
      }
    });

    eventSource.addEventListener("error", () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);

      const nextAttempt = reconnectAttempt + 1;
      const delay = Math.min(
        RECONNECT_BASE_DELAY_MS * Math.pow(2, nextAttempt - 1),
        RECONNECT_MAX_DELAY_MS
      );

      setReconnectAttempt(nextAttempt);
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, delay);
    });

    eventSourceRef.current = eventSource;
  }, [reconnectAttempt]);

  useEffect(() => {
    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return (
    <section aria-live="polite" aria-label="Trending topics">
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {isConnected ? "Connected to live updates" : `Reconnecting... attempt ${reconnectAttempt}`}
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected
                ? "bg-green-500 shadow-lg shadow-green-500/50 animate-pulse"
                : "bg-yellow-500 shadow-lg shadow-yellow-500/50"
            }`}
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-slate-300">
            {isConnected ? "Live Feed Active" : `Reconnecting (${reconnectAttempt})`}
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          {trends.length} Trending
        </div>
      </div>

      <div className="space-y-3">
        {trends.length > 0 ? (
          trends.map((trend, idx) => (
            <TrendRow
              key={trend.id}
              trend={trend}
              rank={idx + 1}
              isNew={newTrendIds.has(trend.id)}
              onVote={handleVote}
            />
          ))
        ) : (
          <div className="text-center py-12 text-slate-500">
            <div className="text-sm">Loading live trends...</div>
          </div>
        )}
      </div>
    </section>
  );
}
