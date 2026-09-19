import { Check, LoaderCircle, Radio, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TxPhase } from "@/lib/cookie/tx";
import { explorerTx } from "@/lib/cookie/constants";
import { shortAddress } from "@/lib/cookie/format";

const STEPS: { id: TxPhase; label: string }[] = [
  { id: "signing", label: "Sign" },
  { id: "sent", label: "Broadcast" },
  { id: "confirming", label: "Confirm" },
  { id: "confirmed", label: "Final" },
];

function rank(phase: TxPhase) {
  if (phase === "idle") return -1;
  if (phase === "error") return -1;
  return STEPS.findIndex((s) => s.id === phase);
}

export function TxStatus({
  phase,
  signature,
  error,
}: {
  phase: TxPhase;
  signature?: string;
  error?: string | null;
}) {
  if (phase === "idle" && !error) return null;
  const current = rank(phase);

  return (
    <div className="mt-4 rounded-lg bg-surface-2 p-3 shadow-border">
      {phase !== "error" ? (
        <ol className="grid grid-cols-4 gap-1">
          {STEPS.map((step, i) => {
            const done = current > i || phase === "confirmed";
            const active = step.id === phase;
            return (
              <li key={step.id} className="flex flex-col items-center gap-1.5 text-center">
                <span
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full text-[0.625rem] font-medium",
                    done || active ? "bg-primary text-primary-fg" : "bg-bg text-subtle",
                  )}
                >
                  {done && !active ? (
                    <Check className="size-3" />
                  ) : active && phase !== "confirmed" ? (
                    <LoaderCircle className="size-3 animate-spin" />
                  ) : active ? (
                    <Check className="size-3" />
                  ) : (
                    i + 1
                  )}
                </span>
                <span className={cn("text-[0.6875rem]", active ? "text-fg" : "text-subtle")}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="flex items-start gap-2 text-sm text-danger">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <span>{error || "The transaction did not land."}</span>
        </p>
      )}
      {signature ? (
        <a
          href={explorerTx(signature)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center gap-1.5 font-mono text-xs text-muted hover:text-fg"
        >
          <Radio className="size-3.5" />
          {shortAddress(signature, 6)}
          <span className="text-subtle">on Cookiescan</span>
        </a>
      ) : null}
    </div>
  );
}
