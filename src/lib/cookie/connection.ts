import "@/polyfills";
import { Connection } from "@solana/web3.js";
import { COOKIE_RPC, COOKIE_DAS } from "./constants";

let connection: Connection | null = null;

export function getConnection() {
  if (!connection) {
    connection = new Connection(COOKIE_RPC, {
      commitment: "confirmed",
      disableRetryOnRateLimit: false,
    });
  }
  return connection;
}

export async function dasRpc<T>(method: string, params: unknown): Promise<T> {
  const res = await fetch(COOKIE_DAS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "jar", method, params }),
  });
  if (!res.ok) throw new Error(`DAS ${res.status}`);
  const body = (await res.json()) as { result?: T; error?: { message: string } };
  if (body.error) throw new Error(body.error.message);
  if (body.result === undefined) throw new Error("DAS returned no result");
  return body.result;
}
