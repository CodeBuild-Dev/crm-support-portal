import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

type Filter = "this_week" | "last_week" | "custom";

const TRACKED_STAGES = ["SRK gestartet", "Vermittlung"] as const;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgoISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 6);
  return d.toISOString().slice(0, 10);
}

function StatCard({
  label,
  count,
  isLoading,
  error,
}: {
  label: string;
  count: number | undefined;
  isLoading: boolean;
  error: Error | null;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : error ? (
          <div className="text-sm text-destructive">Failed to load</div>
        ) : (
          <div className="text-4xl font-semibold tabular-nums">{count ?? 0}</div>
        )}
      </CardContent>
    </Card>
  );
}

function useStageCount(stageName: string, filter: Filter, startDate: string, endDate: string) {
  const enabled = filter !== "custom" || Boolean(startDate && endDate);
  return useQuery({
    queryKey: ["stage-counts", stageName, filter, startDate, endDate],
    queryFn: () =>
      api.stageCounts.get({
        stage_name: stageName,
        filter,
        start_date: filter === "custom" ? startDate : undefined,
        end_date: filter === "custom" ? endDate : undefined,
      }),
    enabled,
  });
}

function StageWidget({ className }: { className?: string }) {
  const [filter, setFilter] = useState<Filter>("this_week");
  const [startDate, setStartDate] = useState(sevenDaysAgoISO);
  const [endDate, setEndDate] = useState(todayISO);

  const queries = [
    useStageCount(TRACKED_STAGES[0], filter, startDate, endDate),
    useStageCount(TRACKED_STAGES[1], filter, startDate, endDate),
  ];

  const anyLoading = queries.some((q) => q.isLoading || q.isFetching);

  const rangeLabel = useMemo(() => {
    const range = queries[0].data;
    if (!range) return null;
    const s = new Date(range.start_date).toLocaleDateString();
    const e = new Date(range.end_date);
    // end is exclusive → show the last inclusive day
    e.setDate(e.getDate() - 1);
    return `${s} – ${e.toLocaleDateString()}`;
  }, [queries]);

  return (
    <div className={cn("w-full max-w-2xl space-y-4", className)}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[180px] flex-1">
          <Label htmlFor="stage-filter" className="mb-1.5 block text-xs text-muted-foreground">
            Time range
          </Label>
          <Select value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <SelectTrigger id="stage-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This week</SelectItem>
              <SelectItem value="last_week">Last week</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filter === "custom" && (
          <>
            <div>
              <Label htmlFor="start-date" className="mb-1.5 block text-xs text-muted-foreground">
                Start
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-date" className="mb-1.5 block text-xs text-muted-foreground">
                End
              </Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}

        <Button
          variant="outline"
          size="icon"
          aria-label="Refresh"
          onClick={() => queries.forEach((q) => q.refetch())}
          disabled={anyLoading}
        >
          <RefreshCw className={cn("h-4 w-4", anyLoading && "animate-spin")} />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {TRACKED_STAGES.map((stage, i) => (
          <StatCard
            key={stage}
            label={stage}
            count={queries[i].data?.count}
            isLoading={queries[i].isLoading}
            error={queries[i].error as Error | null}
          />
        ))}
      </div>

      {rangeLabel && (
        <p className="text-xs text-muted-foreground">Range: {rangeLabel}</p>
      )}
    </div>
  );
}

export default StageWidget;
