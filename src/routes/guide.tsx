import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LINKS } from "@/lib/cookie/constants";

export const Route = createFileRoute("/guide")({ component: Guide });

const STEPS = [
  {
    n: "01",
    title: "Install Nightly",
    body: "Nightly is the wallet Cookie Chain documents first. It ships Cookie as a built-in SVM network — no custom RPC paste required.",
    href: LINKS.nightly,
    cta: "Download Nightly",
  },
  {
    n: "02",
    title: "Switch to Cookie",
    body: "Open Nightly, use the network switcher (top right, under SVM), and select Cookie. A wallet still pointed at Solana mainnet will simulate the wrong chain and refuse to sign.",
  },
  {
    n: "03",
    title: "Bridge COOK",
    body: "Fees are paid in COOK and are tiny — about 0.000005 COOK per signature. Bridge sCOOK from Solana through the Hyperlane warp route. Reserves sit in an m-of-n community multi-sig.",
    href: LINKS.bridge,
    cta: "Open the bridge",
    extra: LINKS.onboard,
    extraCta: "Visual onboard",
  },
  {
    n: "04",
    title: "Connect and bake",
    body: "Return here, connect Nightly, and bake a fortune, crumb, or pulse. You will sign in the wallet, then watch the transaction move from broadcast to confirmed on Cookiescan.",
    href: "/",
    cta: "Back to the jar",
    internal: true,
  },
];

function Guide() {
  return (
    <AppShell>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Setup</p>
        <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight">
          Get onto Cookie Chain
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Four steps. After that, every bake is a real SVM transaction with a
          Cookiescan receipt.
        </p>

        <ol className="mt-10 space-y-4">
          {STEPS.map((step) => (
            <li key={step.n}>
              <Card>
                <CardHeader>
                  <p className="font-mono text-xs tabular-nums text-subtle">{step.n}</p>
                  <CardTitle>{step.title}</CardTitle>
                  <CardDescription>{step.body}</CardDescription>
                </CardHeader>
                {step.cta ? (
                  <CardContent className="flex flex-wrap gap-3">
                    {step.internal ? (
                      <Link
                        to="/"
                        className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
                      >
                        {step.cta}
                      </Link>
                    ) : (
                      <a
                        href={step.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-fg"
                      >
                        {step.cta}
                      </a>
                    )}
                    {step.extra ? (
                      <a
                        href={step.extra}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-11 items-center rounded-md px-4 text-sm text-muted shadow-border hover:text-fg"
                      >
                        {step.extraCta}
                      </a>
                    ) : null}
                  </CardContent>
                ) : null}
              </Card>
            </li>
          ))}
        </ol>

        <section className="mt-10 space-y-2 text-sm leading-relaxed text-muted">
          <h2 className="font-display text-lg text-fg">Useful links</h2>
          <p>
            RPC <span className="font-mono text-2xs text-fg">https://rpc.cookiescan.io</span>
          </p>
          <p>
            DAS <a className="hover:text-fg" href={LINKS.das}>{LINKS.das}</a>
            {" · "}
            Swap <a className="hover:text-fg" href={LINKS.swap}>Cookieswap</a>
            {" · "}
            Liquidity <a className="hover:text-fg" href={LINKS.cookiebox}>Cookiebox</a>
          </p>
        </section>
      </main>
    </AppShell>
  );
}
