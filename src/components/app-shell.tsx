import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CookieMark } from "@/components/cookie-mark";
import { WalletConnect } from "@/components/wallet-connect";
import { LINKS } from "@/lib/cookie/constants";
import { formatInt } from "@/lib/cookie/format";
import { fetchNetworkSnapshot } from "@/lib/cookie/network";

export function AppShell({ children }: { children: ReactNode }) {
  const net = useQuery({
    queryKey: ["network"],
    queryFn: fetchNetworkSnapshot,
    refetchInterval: 5_000,
  });

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-40 border-b border-border bg-bg/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <CookieMark className="size-7" />
            <span className="font-display text-lg tracking-tight">The Jar</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-2 font-mono text-xs tabular-nums text-muted sm:inline-flex">
              <span className="size-1.5 rounded-full bg-success" />
              {net.data ? `slot ${formatInt(net.data.slot)}` : "connecting"}
            </span>
            <Link
              to="/guide"
              className="hidden h-11 items-center px-2 text-sm text-muted hover:text-fg md:inline-flex"
            >
              Setup
            </Link>
            <WalletConnect />
          </div>
        </div>
      </header>
      <div>{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>The Jar · on-chain fortunes for Cookie Chain</p>
          <nav className="flex flex-wrap gap-x-4 gap-y-2">
            <a href={LINKS.bridge} target="_blank" rel="noreferrer" className="hover:text-fg">
              Bridge
            </a>
            <a href={LINKS.swap} target="_blank" rel="noreferrer" className="hover:text-fg">
              Cookieswap
            </a>
            <a href={LINKS.cookiebox} target="_blank" rel="noreferrer" className="hover:text-fg">
              Cookiebox
            </a>
            <a href={LINKS.explorer} target="_blank" rel="noreferrer" className="hover:text-fg">
              Cookiescan
            </a>
            <a href={LINKS.docs} target="_blank" rel="noreferrer" className="hover:text-fg">
              Docs
            </a>
            <a href={LINKS.nightly} target="_blank" rel="noreferrer" className="hover:text-fg">
              Nightly
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
