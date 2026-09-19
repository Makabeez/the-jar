import type { JarKind } from "./memo";

export type LocalBake = {
  kind: JarKind;
  memo: string;
  signature: string;
  slot: number;
  at: number;
  address: string;
};

const KEY = "the-jar:bakes";

export function loadBakes(): LocalBake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalBake[];
    return Array.isArray(parsed) ? parsed.slice(0, 40) : [];
  } catch {
    return [];
  }
}

export function rememberBake(bake: LocalBake) {
  if (typeof window === "undefined") return;
  const next = [bake, ...loadBakes().filter((b) => b.signature !== bake.signature)].slice(0, 40);
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("jar:bakes"));
}
