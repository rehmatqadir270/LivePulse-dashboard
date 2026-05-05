import { readFileSync } from "fs";
import { join } from "path";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INITIAL_TRENDS_LIMIT } from "@/lib/constants";
import { voteTrend } from "@/app/actions/voteTrend";

interface Trend {
  id: string;
  topic: string;
  votes: number;
}

export async function TrendsList() {
  const trendsPath = join(process.cwd(), "data", "trends.json");
  const trendsData: Trend[] = JSON.parse(readFileSync(trendsPath, "utf-8"));
  const initialTrends = trendsData.slice(0, INITIAL_TRENDS_LIMIT);

  return (
    <section aria-label="Initial trending topics">
      <div className="space-y-3">
        {initialTrends.map((trend) => (
          <Card
            key={trend.id}
            className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow"
            role="article"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-lg">{trend.topic}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className="text-sm font-semibold"
                  aria-label={`${trend.votes} votes`}
                >
                  {trend.votes.toLocaleString()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <form action={voteTrend}>
                <input type="hidden" name="trendId" value={trend.id} />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  aria-label={`Vote for ${trend.topic}`}
                >
                  Vote
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
