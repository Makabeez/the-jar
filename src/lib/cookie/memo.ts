import { JAR_PREFIX, MAX_CRUMB_CHARS, MAX_FORTUNE_CHARS, MAX_QUESTION_CHARS } from "./constants";

export type JarKind = "fortune" | "crumb" | "pulse";

export type MemoKind =
  | JarKind
  | "burn"
  | "agent"
  | "arena"
  | "keno"
  | "swap"
  | "vault"
  | "oven"
  | "culture";

export type ClassifiedMemo = {
  kind: MemoKind;
  title: string;
  body: string;
  question?: string;
  fromJar: boolean;
};

function stripLenPrefix(memo: string) {
  return memo.replace(/^\[\d+\]\s*/, "").trim();
}

function clip(text: string, max: number) {
  const t = text.replace(/\|/g, "/").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, max - 1).trimEnd() + "…";
}

export function encodeJarMemo(kind: "pulse"): string;
export function encodeJarMemo(kind: "crumb", text: string): string;
export function encodeJarMemo(kind: "fortune", question: string, fortune: string): string;
export function encodeJarMemo(kind: JarKind, a?: string, b?: string): string {
  if (kind === "pulse") return `${JAR_PREFIX}|pulse|${Date.now()}`;
  if (kind === "crumb") return `${JAR_PREFIX}|crumb|${clip(a ?? "", MAX_CRUMB_CHARS)}`;
  return `${JAR_PREFIX}|fortune|${clip(a ?? "", MAX_QUESTION_CHARS)}|${clip(b ?? "", MAX_FORTUNE_CHARS)}`;
}

export function classifyMemo(raw: string | null | undefined): ClassifiedMemo {
  const text = stripLenPrefix(raw ?? "");
  if (!text) {
    return { kind: "culture", title: "Silent tx", body: "Memo left empty.", fromJar: false };
  }

  if (text.startsWith(`${JAR_PREFIX}|`)) {
    const parts = text.split("|");
    const kind = parts[1];
    if (kind === "fortune") {
      const question = parts[2] ?? "";
      const fortune = parts.slice(3).join("|") || text;
      return {
        kind: "fortune",
        title: "Fortune",
        body: fortune,
        question: question || undefined,
        fromJar: true,
      };
    }
    if (kind === "crumb") {
      return {
        kind: "crumb",
        title: "Crumb",
        body: parts.slice(2).join("|") || text,
        fromJar: true,
      };
    }
    if (kind === "pulse") {
      return { kind: "pulse", title: "Pulse", body: "A baker pinged the chain.", fromJar: true };
    }
    return { kind: "crumb", title: "The Jar", body: text, fromJar: true };
  }

  if (/cookie monster burn|deflation: burned/i.test(text)) {
    return { kind: "burn", title: "Burn", body: text, fromJar: false };
  }
  if (/cookieagent|telemetry sentinel/i.test(text)) {
    return { kind: "agent", title: "Agent", body: text, fromJar: false };
  }
  if (/cookiearena:/i.test(text)) {
    return { kind: "arena", title: "Arena", body: text, fromJar: false };
  }
  if (/keno:v1/i.test(text)) {
    return { kind: "keno", title: "Keno", body: text, fromJar: false };
  }
  if (/cookieswap/i.test(text)) {
    return { kind: "swap", title: "Swap", body: text, fromJar: false };
  }
  if (/hyperarb vault|vault (deposit|withdraw)/i.test(text)) {
    return { kind: "vault", title: "Vault", body: text, fromJar: false };
  }
  if (/ovenpit|oven:/i.test(text)) {
    return { kind: "oven", title: "Oven", body: text, fromJar: false };
  }

  const title = text.split(/[:|\-–]/)[0]?.trim().slice(0, 28) || "Memo";
  return { kind: "culture", title, body: text, fromJar: false };
}

export function pickLocalFortune(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
