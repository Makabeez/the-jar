import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { explorerTx } from "@/lib/cookie/constants";
import { formatAgo } from "@/lib/cookie/format";
import { fetchCulture, type CultureItem } from "@/lib/cookie/network";
import { cn } from "@/lib/utils";
import type { MemoKind } from "@/lib/cookie/memo";

type Filter = "all" | "jar" | "chain";

const KIND_VARIANT: Partial<Record<MemoKind, "fortune" | "crumb" | "pulse" | "burn" | "agent" | "default">> = {
  fortune: "fortune",
  crumb: "crumb",
  pulse: "pulse",
  burn: "burn",
  agent: "agent",
};

function matches(filter: Filter, item: CultureItem) {
  if (filter === "all") return true;
  if (filter === "jar") return item.classified.fromJar;
  return !item.classified.fromJar;
}

export function CultureRadar() {
  const [filter, setFilter] = useState<Filter>("all");
  const query = useQuery({
    queryKey: ["culture"],
    queryFn: () => fetchCulture(18),
    refetchInterval: 12_000,
  });

  const items = useMemo(
    () => (query.data ?? []).filter((item) => matches(filter, item) && !item.err),
    [query.data, filter],
  );

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Culture radar</CardTitle>
          <CardDescription>
            Live SPL memos from Cookie Chain — burns, agents, arenas, and inscriptions from this jar.
          </CardDescription>
        </div>
        <div className="flex shrink-0 gap-1 rounded-lg bg-surface-2 p-1">
          {(["all", "jar", "chain"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "h-8 rounded-md px-2.5 text-xs font-medium capitalize",
                filter === id ? "bg-surface text-fg shadow-border" : "text-muted hover:text-fg",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : query.isError ? (
          <p className="text-sm text-muted">
            Could not read memos from the RPC. The chain is still there — try a refresh.
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted">
            {filter === "jar"
              ? "The jar is empty. Bake a fortune, crumb, or pulse to leave the first inscription."
              : "No memos in this window."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((item) => (
              <li key={item.signature} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={KIND_VARIANT[item.classified.kind] ?? "default"}>
                        {item.classified.title}
                      </Badge>
                      <span className="font-mono text-[0.6875rem] tabular-nums text-subtle">
                        {formatAgo(item.blockTime)} · slot {item.slot.toLocaleString()}
                      </span>
                    </div>
                    {item.classified.question ? (
                      <p className="mt-1.5 text-xs text-subtle">{item.classified.question}</p>
                    ) : null}
                    <p className="mt-1 text-sm leading-relaxed text-fg text-pretty">
                      {item.classified.body}
                    </p>
                  </div>
                  <a
                    href={explorerTx(item.signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
                    aria-label="Open on Cookiescan"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
