# The Jar

An on-chain fortune jar for **Cookie Chain** — a community-run SVM.

Ask an oracle, inscribe the answer as an SPL memo, drop crumbs, send a pulse, and watch live chain culture stream in from the memo program. Wallet signatures happen in **Nightly** (Wallet Standard). Reads hit `rpc.cookiescan.io` and the Cookie DAS at `api.cookiescan.io`.

- **Source:** [github.com/Makabeez/the-jar](https://github.com/Makabeez/the-jar)
- **Live app:** [the-jar-rho.vercel.app](https://the-jar-rho.vercel.app)

## What it does

- **Connect a wallet** — Nightly is detected via the Solana Wallet Standard. The connected address and COOK balance are shown in the header.
- **Bake a fortune** — Ask a question. The oracle writes a short fortune. You sign a Cookie Chain transaction (1-lamport self-transfer + SPL memo) and get a Cookiescan receipt.
- **Drop a crumb / send a pulse** — Freeform inscriptions or a one-click “I was here” ping.
- **Culture radar** — Live memos from the chain: Cookie Monster burns, CookieAgent telemetry, arenas, swaps, and this jar’s `jar:v1|…` inscriptions.
- **Chain pulse** — Slot, block height, epoch, TPS chart, validator count, RPC latency.
- **Holdings** — Cookie DAS `getAssetsByOwner` for the connected wallet.
- **Transaction lifecycle** — Sign → broadcast → confirm → final, with errors mapped to plain language (reject, empty balance, expired blockhash).

Nothing auto-signs. Reads are free. Writes are user-initiated.

## Cookie Chain endpoints

| | |
|---|---|
| RPC | `https://rpc.cookiescan.io` |
| WebSocket | `wss://rpc.cookiescan.io` |
| DAS | `https://api.cookiescan.io` |
| Explorer | [cookiescan.io](https://cookiescan.io) |
| Genesis | `9wDaBRDgArEUpvhHxGguNkwozsZh4UpGZB9o2EoEcBB2` |
| Memo program | `MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr` |
| Native asset | COOK (9 decimals; wrapped mint `So11111111111111111111111111111111111111112`) |
| SPL COOK (Solana, for the bridge) | `36ZrtQoab5MhhySaP1YSTwUahSk6GRVUTtZ6cuVfm9e1` |
| Cookie Jar treasury | `568tU9FMksJDxjkLBjWisSA4J4C5uPH87NCCkyREwrxe` |

Bridge COOK from Solana: [hyperlane.cookiescan.io](https://hyperlane.cookiescan.io) or [onboard.cookiechain.wtf](https://onboard.cookiechain.wtf).

## Setup

1. Install [Nightly](https://nightly.app/download).
2. In Nightly, switch the SVM network to **Cookie**.
3. Bridge a little COOK for fees (~0.000005 COOK per signature).
4. Open this app, connect the wallet, ask the oracle, bake.

## Local development

```bash
npm install
npm run dev
```

```bash
npm run build
npm run typecheck
```

Environment: `XAI_API_KEY` is read only on the server for the oracle. If it is absent, The Jar draws from a local fortune table so baking still works.

## Memo format

Inscriptions from this app use:

```
jar:v1|fortune|<question>|<fortune>
jar:v1|crumb|<text>
jar:v1|pulse|<unix-ms>
```

They are readable on Cookiescan and in the culture radar without a custom program.

## Stack

React 19, TanStack Start, Tailwind v4, `@solana/web3.js`, Solana Wallet Adapter (Wallet Standard / Nightly), Cookie DAS, Recharts.

## Links

- [Cookie Chain](https://www.cookiechain.wtf)
- [Docs](https://docs.cookiechain.wtf)
- [Cookieswap](https://cookieswap.io)
- [Cookiebox](https://cookiebox.app)
- [Telegram](https://t.me/TheCookieNetChain)

## Live on Cookie Chain

All three inscription types, signed in Nightly on mainnet:

| Type | Transaction |
| --- | --- |
| Fortune | [2mWvkMBY…MTdk7d](https://cookiescan.io/tx/2mWvkMBYDyxXfST2fvfJ19SXmmCMKCgLm5KaBhsYSSEuZaJFFCoAWRateHZQuMS1oeJW9P86thAmxwg682MTdk7d) |
| Crumb | [4M8qMwU3…1qFA4k](https://cookiescan.io/tx/4M8qMwU33z4iLoJpVyhvsTga4Q4nxbZyp3Q8GeqJqevnBtU8bdfKTFxWrQh5UzwXQ4N3D3R9e3bsW5nKCS1qFA4k) |
| Pulse | [VyMLrePy…kyis6](https://cookiescan.io/tx/VyMLrePywLZ5JQmM69riJm4NgKRYVcNpzJeNc6uAocdFoAu3fhaP5htVq4Vzk73tnvnY3sK3SGYZrRsKBHkyis6) |

Each is a 1-lamport self-transfer plus an SPL memo with a `jar:v1|` payload, readable on Cookiescan and in the app's culture radar.
