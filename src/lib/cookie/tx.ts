import { Buffer } from "buffer";
import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { getConnection } from "./connection";
import { MEMO_PROGRAM_ID } from "./constants";

export type TxPhase = "idle" | "signing" | "sent" | "confirming" | "confirmed" | "error";

export type TxResult = {
  signature: string;
  status: "confirmed";
};

export class TxUserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TxUserError";
  }
}

function friendlyError(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "Transaction failed";
  const msg = raw.toLowerCase();
  if (msg.includes("reject") || msg.includes("denied") || msg.includes("cancel")) {
    return "Signature request was rejected in the wallet.";
  }
  if (msg.includes("insufficient") || msg.includes("no record of a prior credit")) {
    return "Not enough COOK to cover the fee. Bridge a little from Solana, then retry.";
  }
  if (msg.includes("blockhash") || msg.includes("expired") || msg.includes("not confirmed")) {
    return "The blockhash expired before confirmation. Try baking again.";
  }
  if (msg.includes("network") || msg.includes("failed to fetch") || msg.includes("429")) {
    return "Cookie Chain RPC is busy or unreachable. Wait a moment and retry.";
  }
  if (msg.includes("wallet not connected") || msg.includes("not connected")) {
    return "Connect Nightly (or another Cookie-network wallet) first.";
  }
  return raw.length > 180 ? `${raw.slice(0, 177)}…` : raw;
}

export async function bakeMemo(
  wallet: Pick<WalletContextState, "publicKey" | "signTransaction" | "connected">,
  memo: string,
  onPhase?: (phase: TxPhase, signature?: string) => void,
): Promise<TxResult> {
  const { publicKey, signTransaction, connected } = wallet;
  if (!connected || !publicKey || !signTransaction) {
    throw new TxUserError("Connect Nightly (or another Cookie-network wallet) first.");
  }
  if (!memo.trim()) {
    throw new TxUserError("Nothing to bake — write a crumb first.");
  }

  const connection = getConnection();
  const memoIx = new TransactionInstruction({
    keys: [{ pubkey: publicKey, isSigner: true, isWritable: false }],
    programId: new PublicKey(MEMO_PROGRAM_ID),
    data: Buffer.from(memo, "utf8"),
  });
  const transferIx = SystemProgram.transfer({
    fromPubkey: publicKey,
    toPubkey: publicKey,
    lamports: 1,
  });

  const send = async (withMemo: boolean) => {
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction();
    tx.feePayer = publicKey;
    tx.recentBlockhash = blockhash;
    tx.add(transferIx);
    if (withMemo) tx.add(memoIx);

    onPhase?.("signing");
    const signed = await signTransaction(tx);
    onPhase?.("sent");
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
      maxRetries: 3,
    });
    onPhase?.("confirming", signature);
    const confirmation = await connection.confirmTransaction(
      { signature, blockhash, lastValidBlockHeight },
      "confirmed",
    );
    if (confirmation.value.err) {
      throw new Error("On-chain program returned an error.");
    }
    onPhase?.("confirmed", signature);
    return signature;
  };

  try {
    const signature = await send(true);
    return { signature, status: "confirmed" };
  } catch (err) {
    const msg = err instanceof Error ? err.message.toLowerCase() : "";
    const userRejected = msg.includes("reject") || msg.includes("denied") || msg.includes("cancel");
    if (!userRejected) {
      try {
        const signature = await send(false);
        return { signature, status: "confirmed" };
      } catch (retryErr) {
        throw new TxUserError(friendlyError(retryErr));
      }
    }
    throw new TxUserError(friendlyError(err));
  }
}
