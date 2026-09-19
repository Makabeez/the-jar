import "@/polyfills";
import { useMemo, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { COOKIE_RPC } from "@/lib/cookie/constants";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 4_000,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  const wallets = useMemo(() => [], []);

  return (
    <QueryClientProvider client={queryClient}>
      <ConnectionProvider endpoint={COOKIE_RPC}>
        <WalletProvider wallets={wallets} autoConnect>
          <TooltipProvider delayDuration={180}>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                className:
                  "!bg-surface !text-fg !border-0 !shadow-[var(--shadow-border)] !font-sans",
              }}
            />
          </TooltipProvider>
        </WalletProvider>
      </ConnectionProvider>
    </QueryClientProvider>
  );
}
