import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AVG_FEE_COOK, GENESIS_HASH, explorerAccount } from "@/lib/cookie/constants";
import { formatCompact, formatInt, shortAddress } from "@/lib/cookie/format";
import { fetchNetworkSnapshot } from "@/lib/cookie/network";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-3">
      <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-1 font-mono text-lg tabular-nums leading-none text-fg">{value}</p>
      {hint ? <p className="mt-1 text-[0.6875rem] text-subtle">{hint}</p> : null}
    </div>
  );
}

export function ChainDashboard() {
  const query = useQuery({
    queryKey: ["network"],
    queryFn: fetchNetworkSnapshot,
    refetchInterval: 5_000,
  });
  const n = query.data;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Chain pulse</CardTitle>
          {n ? (
            <span className="inline-flex items-center gap-1.5 text-xs text-success">
              <span className="size-1.5 rounded-full bg-success" />
              Live · {n.latencyMs} ms
            </span>
          ) : null}
        </div>
        <CardDescription>
          Cookie Chain SVM · genesis {shortAddress(GENESIS_HASH, 4)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading || !n ? (
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Slot" value={formatInt(n.slot)} />
              <Stat label="Block height" value={formatInt(n.blockHeight)} />
              <Stat
                label="TPS"
                value={n.tps.toFixed(1)}
                hint={`${n.nonVoteTps.toFixed(2)} non-vote`}
              />
              <Stat
                label="Epoch"
                value={`${n.epoch}`}
                hint={`${Math.round(n.epochProgress * 100)}% · ${formatInt(n.slotIndex)} / ${formatInt(n.slotsInEpoch)}`}
              />
              <Stat label="Transactions" value={formatCompact(n.transactionCount)} />
              <Stat
                label="Validators"
                value={`${n.validatorCount}`}
                hint={n.delinquentCount ? `${n.delinquentCount} delinquent` : "none delinquent"}
              />
            </div>
            <div>
              <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">
                TPS · last samples
              </p>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={n.samples} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                    <XAxis dataKey="slot" hide />
                    <YAxis tick={{ fill: "var(--color-subtle)", fontSize: 10 }} width={40} />
                    <RechartsTooltip
                      contentStyle={{
                        background: "var(--color-surface-2)",
                        border: "none",
                        borderRadius: 8,
                        color: "var(--color-fg)",
                        fontSize: 12,
                      }}
                      labelFormatter={(label) => `slot ${label}`}
                      formatter={(value) => [
                        Number(value).toFixed(2),
                        "TPS",
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="tps"
                      stroke="var(--color-primary)"
                      fill="var(--color-primary)"
                      fillOpacity={0.12}
                      strokeWidth={1.5}
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <p className="text-[0.6875rem] leading-normal text-subtle">
              Avg fee {AVG_FEE_COOK} COOK per signature.{" "}
              <a
                className="text-muted underline-offset-2 hover:text-fg hover:underline"
                href={explorerAccount(GENESIS_HASH)}
                target="_blank"
                rel="noreferrer"
              >
                Explorer
              </a>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
