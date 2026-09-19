import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ChainDashboard } from "@/components/chain-dashboard";
import { CultureRadar } from "@/components/culture-radar";
import { OvenPanel } from "@/components/oven-panel";
import { WalletPanel } from "@/components/wallet-panel";
import { LINKS } from "@/lib/cookie/constants";
import { fetchNetworkSnapshot } from "@/lib/cookie/network";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const net = useQuery({
    queryKey: ["network"],
    queryFn: fetchNetworkSnapshot,
    refetchInterval: 5_000,
  });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <section className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">
            Cookie Chain cApp
          </p>
          <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight">
            The chain remembers what you bake.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Ask the oracle. Inscribe the answer as an SPL memo. Watch Cookie Chain
            culture land in sub-second slots — burns, agents, arenas, and this jar.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-subtle">
            <a className="hover:text-fg" href={LINKS.bridge} target="_blank" rel="noreferrer">
              Bridge COOK
            </a>
            <a className="hover:text-fg" href={LINKS.gettingStarted} target="_blank" rel="noreferrer">
              Docs
            </a>
            <a className="hover:text-fg" href="/guide">
              Nightly guide
            </a>
          </div>
        </section>

        <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <OvenPanel slot={net.data?.slot} />
          <ChainDashboard />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <CultureRadar />
          <WalletPanel />
        </div>
      </main>
    </AppShell>
  );
}
