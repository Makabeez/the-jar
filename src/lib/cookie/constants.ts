export const COOKIE_RPC = "https://rpc.cookiescan.io";
export const COOKIE_WS = "wss://rpc.cookiescan.io";
export const COOKIE_DAS = "https://api.cookiescan.io";

export const GENESIS_HASH = "9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2";
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
export const WRAPPED_COOK_MINT = "So11111111111111111111111111111111111111112";

export const LAMPORTS_PER_COOK = 1_000_000_000;
export const AVG_FEE_COOK = 0.000005;

export const JAR_PREFIX = "jar:v1";
export const MAX_CRUMB_CHARS = 240;
export const MAX_QUESTION_CHARS = 160;
export const MAX_FORTUNE_CHARS = 200;

export const LINKS = {
  nightly: "https://nightly.app/download",
  nightlyDocs: "https://nightly.app/docs/solana/solana/detection",
  bridge: "https://hyperlane.cookiescan.io",
  bridgeAlt: "https://bridge.cookiechain.wtf",
  onboard: "https://onboard.cookiechain.wtf",
  docs: "https://docs.cookiechain.wtf",
  gettingStarted: "https://docs.cookiechain.wtf/getting-started",
  explorer: "https://cookiescan.io",
  homepage: "https://www.cookiechain.wtf",
  swap: "https://cookieswap.io",
  cookiebox: "https://cookiebox.app",
  das: "https://api.cookiescan.io",
  telegram: "https://t.me/TheCookieNetChain",
  discord: "https://discord.gg/XqnStmWgNu",
  x: "https://x.com/TheCookieChain",
} as const;

export function explorerTx(signature: string) {
  return `https://cookiescan.io/tx/${signature}`;
}

export function explorerAccount(address: string) {
  return `https://cookiescan.io/account/${address}`;
}

export const LOCAL_FORTUNES = [
  "The oven is already hot. You arrived in time for the second batch, not the first.",
  "A wallet that waits for permission never tastes the crumb.",
  "Sub-second finality is a temperament. Act like it.",
  "The jar keeps what you throw. Throw something you can live with.",
  "Cheap fees are not an excuse for empty memos.",
  "Tonight the slot is generous. Tomorrow it will not remember your hesitation.",
  "You are not late. You are under-baked.",
  "Community chains reward the ones who sign, not the ones who spectate.",
  "A pulse is a promise that you were here. Make it count.",
  "The crumb you withhold will be baked by someone louder.",
  "If the bridge feels like a leap, that is because it is. Leap.",
  "Validators do not applaud. They attest. Be worth attesting.",
  "Your next transaction is the smallest brave thing you can do today.",
  "Fortune favors the wallet that can pay a five-micro COOK fee.",
  "The chain is a kitchen. Stop eating and start cooking.",
  "Silence on-chain is still a choice. A worse one.",
  "What you inscribe outlives the tab you close.",
  "The jar does not judge. It only stores heat.",
  "A memo is a whisper with a signature. Whisper carefully.",
  "Let him cook — then take a number and cook anyway.",
] as const;
