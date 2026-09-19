import { useMemo, useState } from "react";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, Copy, LogOut, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LINKS } from "@/lib/cookie/constants";
import { fetchBalance } from "@/lib/cookie/network";
import { lamportsToCook, shortAddress } from "@/lib/cookie/format";
import { useMounted } from "@/hooks/use-mounted";

export function WalletConnect() {
  const mounted = useMounted();
  const {
    wallets,
    select,
    disconnect,
    connected,
    connecting,
    publicKey,
    wallet,
  } = useWallet();
  const [copied, setCopied] = useState(false);

  const sorted = useMemo(() => {
    const adapters = wallets.map((w) => w.adapter);
    return [...adapters].sort((a, b) => {
      const an = a.name.toLowerCase().includes("nightly") ? -1 : 0;
      const bn = b.name.toLowerCase().includes("nightly") ? -1 : 0;
      return an - bn;
    });
  }, [wallets]);

  const address = publicKey?.toBase58();

  const balance = useQuery({
    queryKey: ["cook-balance", address],
    queryFn: () => fetchBalance(address!),
    enabled: Boolean(address),
    refetchInterval: 12_000,
  });

  function onSelect(name: string) {
    try {
      select(name as WalletName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not connect wallet";
      if (!/reject|denied|cancel/i.test(msg)) toast.error(msg);
    }
  }

  async function copyAddress() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success("Address copied");
    window.setTimeout(() => setCopied(false), 1400);
  }

  if (!mounted) {
    return (
      <Button variant="secondary" size="sm" disabled>
        <Wallet />
        Wallet
      </Button>
    );
  }

  if (connected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="sm" className="max-w-[11.5rem]">
            <span className="size-1.5 shrink-0 rounded-full bg-success" />
            <span className="truncate font-mono text-xs tabular-nums">
              {shortAddress(address)}
            </span>
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            {wallet?.adapter.name ?? "Wallet"}
          </DropdownMenuLabel>
          <div className="px-2.5 pb-2">
            <p className="font-mono text-[0.6875rem] text-muted break-all">
              {address}
            </p>
            <p className="mt-2 font-mono text-sm tabular-nums text-fg">
              {balance.isLoading ? "…" : `${lamportsToCook(balance.data ?? 0, 5)} COOK`}
            </p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void copyAddress()}>
            {copied ? <Check /> : <Copy />}
            Copy address
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void disconnect()}>
            <LogOut />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={connecting}>
          <Wallet />
          {connecting ? "Connecting" : "Connect wallet"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Cookie Chain wallet</DropdownMenuLabel>
        {sorted.length === 0 ? (
          <div className="px-2.5 py-2 text-sm text-muted">
            No Wallet Standard wallet found. Install Nightly, switch it to Cookie, then refresh.
          </div>
        ) : (
          sorted.map((adapter) => (
            <DropdownMenuItem
              key={adapter.name}
              onSelect={() => onSelect(adapter.name)}
            >
              {adapter.icon ? (
                <img
                  src={adapter.icon}
                  alt=""
                  className="size-4 rounded-sm"
                  crossOrigin="anonymous"
                />
              ) : (
                <Wallet />
              )}
              <span>{adapter.name}</span>
              {adapter.name.toLowerCase().includes("nightly") ? (
                <span className="ml-auto text-2xs text-muted">Required</span>
              ) : null}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href={LINKS.nightly} target="_blank" rel="noreferrer">
            Get Nightly
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={LINKS.bridge} target="_blank" rel="noreferrer">
            Bridge COOK
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
