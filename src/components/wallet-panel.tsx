import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { explorerAccount, explorerTx } from "@/lib/cookie/constants";
import { formatAgo, lamportsToCook, shortAddress } from "@/lib/cookie/format";
import { fetchBalance, fetchHoldings, fetchRecentWalletTxs } from "@/lib/cookie/network";
import { useMounted } from "@/hooks/use-mounted";

export function WalletPanel() {
  const mounted = useMounted();
  const { publicKey, connected, wallet } = useWallet();
  const address = mounted && connected ? publicKey?.toBase58() : undefined;

  const balance = useQuery({
    queryKey: ["cook-balance", address],
    queryFn: () => fetchBalance(address!),
    enabled: Boolean(address),
    refetchInterval: 12_000,
  });
  const holdings = useQuery({
    queryKey: ["holdings", address],
    queryFn: () => fetchHoldings(address!),
    enabled: Boolean(address),
    refetchInterval: 30_000,
  });
  const txs = useQuery({
    queryKey: ["wallet-txs", address],
    queryFn: () => fetchRecentWalletTxs(address!, 6),
    enabled: Boolean(address),
    refetchInterval: 12_000,
  });

  if (!address) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet</CardTitle>
          <CardDescription>
            Connect Nightly to read your COOK balance, DAS holdings, and recent signatures.
            Reads are free; nothing is signed until you bake.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription>
          {wallet?.adapter.name ?? "Connected"} ·{" "}
          <a
            className="font-mono text-muted hover:text-fg"
            href={explorerAccount(address)}
            target="_blank"
            rel="noreferrer"
          >
            {shortAddress(address, 6)}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">COOK</p>
          <p className="mt-1 font-mono text-2xl tabular-nums text-fg">
            {balance.isLoading ? "…" : lamportsToCook(balance.data ?? 0, 6)}
          </p>
        </div>
        <div>
          <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">
            Holdings via Cookie DAS
          </p>
          {holdings.isLoading ? (
            <Skeleton className="h-12" />
          ) : holdings.data && holdings.data.length > 0 ? (
            <ul className="space-y-1.5">
              {holdings.data.slice(0, 8).map((h) => (
                <li key={h.mint} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-fg">{h.symbol}</span>
                  <span className="font-mono tabular-nums text-muted">
                    {h.uiAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No SPL tokens indexed for this wallet yet.</p>
          )}
        </div>
        <div>
          <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wide text-subtle">
            Recent signatures
          </p>
          {txs.isLoading ? (
            <Skeleton className="h-16" />
          ) : (
            <ul className="divide-y divide-border">
              {(txs.data ?? []).map((tx) => (
                <li key={tx.signature} className="flex items-center justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs text-fg">
                      {shortAddress(tx.signature, 8)}
                    </p>
                    <p className="text-[0.6875rem] text-subtle">
                      {formatAgo(tx.blockTime)}
                      {tx.classified.fromJar ? ` · ${tx.classified.title}` : ""}
                    </p>
                  </div>
                  <a
                    href={explorerTx(tx.signature)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
                    aria-label="Open transaction"
                  >
                    <ArrowUpRight className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
