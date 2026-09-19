import { PublicKey, type ConfirmedSignatureInfo } from "@solana/web3.js";
import { getConnection, dasRpc } from "./connection";
import { MEMO_PROGRAM_ID } from "./constants";
import { classifyMemo, type ClassifiedMemo } from "./memo";

export type TpsSample = {
  slot: number;
  tps: number;
  nonVoteTps: number;
  period: number;
};

export type NetworkSnapshot = {
  slot: number;
  blockHeight: number;
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  transactionCount: number;
  epochProgress: number;
  tps: number;
  nonVoteTps: number;
  samples: TpsSample[];
  validatorCount: number;
  delinquentCount: number;
  latencyMs: number;
  fetchedAt: number;
};

export type CultureItem = {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: boolean;
  memo: string;
  classified: ClassifiedMemo;
};

export type Holding = {
  mint: string;
  name: string;
  symbol: string;
  amount: number;
  decimals: number;
  uiAmount: number;
};

export async function fetchNetworkSnapshot(): Promise<NetworkSnapshot> {
  const connection = getConnection();
  const started = performance.now();
  const [epoch, samples, votes] = await Promise.all([
    connection.getEpochInfo(),
    connection.getRecentPerformanceSamples(24),
    connection.getVoteAccounts(),
  ]);
  const latencyMs = Math.round(performance.now() - started);

  const mapped: TpsSample[] = [...samples]
    .reverse()
    .map((s) => {
      const extra = s as typeof s & { numNonVoteTransactions?: number };
      const period = extra.samplePeriodSecs || 60;
      return {
        slot: extra.slot,
        period,
        tps: (extra.numTransactions || 0) / period,
        nonVoteTps: (extra.numNonVoteTransactions || 0) / period,
      };
    });

  const last = mapped.slice(-8);
  const tps =
    last.reduce((sum, s) => sum + s.tps, 0) / Math.max(1, last.length);
  const nonVoteTps =
    last.reduce((sum, s) => sum + s.nonVoteTps, 0) / Math.max(1, last.length);

  return {
    slot: epoch.absoluteSlot,
    blockHeight: epoch.blockHeight ?? epoch.absoluteSlot,
    epoch: epoch.epoch,
    slotIndex: epoch.slotIndex,
    slotsInEpoch: epoch.slotsInEpoch,
    transactionCount: epoch.transactionCount ?? 0,
    epochProgress: epoch.slotsInEpoch ? epoch.slotIndex / epoch.slotsInEpoch : 0,
    tps,
    nonVoteTps,
    samples: mapped,
    validatorCount: votes.current.length,
    delinquentCount: votes.delinquent.length,
    latencyMs,
    fetchedAt: Date.now(),
  };
}

export async function fetchCulture(limit = 18): Promise<CultureItem[]> {
  const connection = getConnection();
  const sigs = await connection.getSignaturesForAddress(
    new PublicKey(MEMO_PROGRAM_ID),
    { limit },
  );
  return sigs.map(toCultureItem);
}

function toCultureItem(info: ConfirmedSignatureInfo): CultureItem {
  const memo = info.memo ?? "";
  return {
    signature: info.signature,
    slot: info.slot,
    blockTime: info.blockTime ?? null,
    err: Boolean(info.err),
    memo,
    classified: classifyMemo(memo),
  };
}

type DasAsset = {
  id: string;
  interface?: string;
  content?: { metadata?: { name?: string; symbol?: string } };
  token_info?: {
    balance?: number;
    decimals?: number;
    symbol?: string;
    supply?: number;
  };
};

export async function fetchHoldings(owner: string): Promise<Holding[]> {
  const result = await dasRpc<{ items?: DasAsset[] }>("getAssetsByOwner", {
    ownerAddress: owner,
    page: 1,
    limit: 40,
    displayOptions: { showFungible: true, showZeroBalance: false },
  });
  const items = result.items ?? [];
  return items
    .map((asset) => {
      const decimals = asset.token_info?.decimals ?? 0;
      const raw = asset.token_info?.balance ?? 0;
      const uiAmount = decimals > 0 ? raw / 10 ** decimals : raw;
      return {
        mint: asset.id,
        name: asset.content?.metadata?.name || "Unknown",
        symbol: asset.token_info?.symbol || asset.content?.metadata?.symbol || "???",
        amount: raw,
        decimals,
        uiAmount,
      };
    })
    .filter((h) => h.uiAmount > 0)
    .sort((a, b) => b.uiAmount - a.uiAmount);
}

export async function fetchBalance(address: string) {
  const connection = getConnection();
  const res = await connection.getBalance(new PublicKey(address), "confirmed");
  return res;
}

export async function fetchRecentWalletTxs(address: string, limit = 8) {
  const connection = getConnection();
  const sigs = await connection.getSignaturesForAddress(new PublicKey(address), {
    limit,
  });
  return sigs.map(toCultureItem);
}
