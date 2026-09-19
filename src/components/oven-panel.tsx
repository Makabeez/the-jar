import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { Flame, Radio, ScrollText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { TxStatus } from "@/components/tx-status";
import { LINKS, MAX_CRUMB_CHARS, MAX_QUESTION_CHARS } from "@/lib/cookie/constants";
import { encodeJarMemo } from "@/lib/cookie/memo";
import { bakeMemo, type TxPhase } from "@/lib/cookie/tx";
import { askOracle } from "@/lib/fortune";
import { useMounted } from "@/hooks/use-mounted";
import { rememberBake } from "@/lib/cookie/local-bakes";

export function OvenPanel({ slot }: { slot?: number }) {
  const mounted = useMounted();
  const wallet = useWallet();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("fortune");
  const [question, setQuestion] = useState("");
  const [crumb, setCrumb] = useState("");
  const [fortune, setFortune] = useState<string | null>(null);
  const [fortuneSource, setFortuneSource] = useState<"oracle" | "jar" | null>(null);
  const [asking, setAsking] = useState(false);
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [signature, setSignature] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const connected = mounted && wallet.connected && Boolean(wallet.publicKey);

  function onPhase(next: TxPhase, sig?: string) {
    setPhase(next);
    if (sig) setSignature(sig);
  }

  async function afterBake(kind: "fortune" | "crumb" | "pulse", memo: string, sig: string) {
    rememberBake({
      kind,
      memo,
      signature: sig,
      slot: slot ?? 0,
      at: Date.now(),
      address: wallet.publicKey?.toBase58() ?? "",
    });
    await queryClient.invalidateQueries({ queryKey: ["culture"] });
    await queryClient.invalidateQueries({ queryKey: ["cook-balance"] });
    await queryClient.invalidateQueries({ queryKey: ["wallet-txs"] });
    toast.success("Baked on Cookie Chain");
  }

  async function handleAsk() {
    const q = question.trim();
    if (q.length < 3) {
      toast.error("Ask something a little more specific.");
      return;
    }
    setAsking(true);
    setFortune(null);
    setError(null);
    try {
      const res = await askOracle({ data: { question: q, slot } });
      setFortune(res.text);
      setFortuneSource(res.source);
    } catch {
      toast.error("The oracle went quiet. Try again.");
    } finally {
      setAsking(false);
    }
  }

  async function handleBake(memo: string, kind: "fortune" | "crumb" | "pulse") {
    if (!connected) {
      toast.error("Connect Nightly on the Cookie network first.");
      return;
    }
    setError(null);
    setSignature(undefined);
    setPhase("signing");
    try {
      const result = await bakeMemo(wallet, memo, onPhase);
      await afterBake(kind, memo, result.signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Bake failed";
      setPhase("error");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <Card className="scroll-mt-20 p-0">
      <CardHeader>
        <CardTitle>Bake into the jar</CardTitle>
        <CardDescription>
          Fortunes, crumbs, and pulses are SPL memos on Cookie Chain. Fees are a few micro-COOK.
          Switch Nightly to the Cookie network before you sign.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="fortune">
              <Sparkles className="size-3.5" />
              Fortune
            </TabsTrigger>
            <TabsTrigger value="crumb">
              <ScrollText className="size-3.5" />
              Crumb
            </TabsTrigger>
            <TabsTrigger value="pulse">
              <Radio className="size-3.5" />
              Pulse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fortune" className="space-y-3">
            <label className="block text-xs font-medium text-muted" htmlFor="question">
              Ask the oracle
            </label>
            <Input
              id="question"
              value={question}
              maxLength={MAX_QUESTION_CHARS}
              placeholder="Will this batch land?"
              onChange={(e) => setQuestion(e.target.value)}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                variant="secondary"
                onClick={() => void handleAsk()}
                disabled={asking}
              >
                {asking ? "Listening…" : "Ask the oracle"}
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  fortune &&
                  void handleBake(encodeJarMemo("fortune", question, fortune), "fortune")
                }
                disabled={!fortune || phase === "signing" || phase === "sent" || phase === "confirming"}
              >
                <Flame className="size-4" />
                Bake fortune
              </Button>
            </div>
            {fortune ? (
              <blockquote className="rounded-lg bg-bg px-4 py-3 text-sm leading-relaxed text-fg">
                <p className="font-display text-base leading-snug">{fortune}</p>
                <p className="mt-2 text-xs text-subtle">
                  {fortuneSource === "oracle" ? "Spoken by the oracle" : "Drawn from the jar"}
                </p>
              </blockquote>
            ) : null}
          </TabsContent>

          <TabsContent value="crumb" className="space-y-3">
            <label className="block text-xs font-medium text-muted" htmlFor="crumb">
              Leave a crumb
            </label>
            <Textarea
              id="crumb"
              value={crumb}
              maxLength={MAX_CRUMB_CHARS}
              placeholder="GM from the kitchen."
              onChange={(e) => setCrumb(e.target.value)}
            />
            <div className="flex items-center justify-between text-xs text-subtle">
              <span>
                {crumb.trim().length}/{MAX_CRUMB_CHARS}
              </span>
              <Button
                onClick={() => void handleBake(encodeJarMemo("crumb", crumb), "crumb")}
                disabled={
                  crumb.trim().length < 2 ||
                  phase === "signing" ||
                  phase === "sent" ||
                  phase === "confirming"
                }
              >
                <Flame className="size-4" />
                Bake crumb
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="pulse" className="space-y-3">
            <p className="text-sm leading-normal text-muted text-pretty">
              A pulse is a 1-lamport self-transfer plus a memo. It proves you were here, at this
              slot, on this chain.
            </p>
            <Button
              className="w-full"
              onClick={() => void handleBake(encodeJarMemo("pulse"), "pulse")}
              disabled={phase === "signing" || phase === "sent" || phase === "confirming"}
            >
              <Radio className="size-4" />
              Send on-chain pulse
            </Button>
          </TabsContent>
        </Tabs>

        <TxStatus phase={phase} signature={signature} error={error} />

        {!connected ? (
          <p className="mt-4 text-xs leading-normal text-subtle text-pretty">
            Need COOK for fees?{" "}
            <a className="text-muted underline-offset-2 hover:text-fg hover:underline" href={LINKS.bridge} target="_blank" rel="noreferrer">
              Bridge from Solana
            </a>
            {" · "}
            <a className="text-muted underline-offset-2 hover:text-fg hover:underline" href="/guide">
              Nightly setup
            </a>
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
