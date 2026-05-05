import { readFileSync } from "fs";
import { join } from "path";
import { TrendsLiveSync } from "@/app/components/TrendsLiveSync";
import { INITIAL_TRENDS_LIMIT } from "@/lib/constants";

interface Trend {
  id: string;
  topic: string;
  votes: number;
}

export default function Home() {
  const trendsPath = join(process.cwd(), "data", "trends.json");
  const trendsData: Trend[] = JSON.parse(readFileSync(trendsPath, "utf-8"));
  const initialTrends = trendsData.slice(0, INITIAL_TRENDS_LIMIT);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" suppressHydrationWarning>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Live Feed
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Live Pulse
          </h1>
          <p className="text-base sm:text-lg text-slate-400">
            Real-time trending topics updates, delivered live
          </p>
        </header>

        <div className="bg-slate-800/40 backdrop-blur border border-slate-700 rounded-xl p-6 sm:p-8 shadow-2xl">
          <TrendsLiveSync initialTrends={initialTrends} />
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-700">
          <p className="text-sm text-slate-500 text-center">
            Live streaming via Server-Sent Events • New Trends every 5 seconds
          </p>
        </footer>
      </div>
    </main>
  );
}
