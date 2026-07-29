# AgroVision AI

Intelligent farming assistant: crop disease/pest diagnosis from photos, a natural-language
farming assistant (text + voice), and on-device farm history — built with Next.js and Gemma.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Connecting a Gemma model

Copy `.env.local.example` to `.env.local` and fill in the values:

- **Cloud (default, `GEMMA_PROVIDER=cloud`)** — set `HF_API_KEY` to a Hugging Face token with
  access to a Gemma model (text) and a vision-language model such as PaliGemma (image diagnosis).
- **Local/offline (`GEMMA_PROVIDER=local`)** — install [Ollama](https://ollama.com), pull a Gemma
  model (e.g. `ollama pull gemma3:2b`), and the app will call `http://localhost:11434` instead,
  with zero internet required.

Without either configured, `/diagnose` and `/chat` respond in a clearly-labeled demo mode so the
UI is still explorable.

## Project structure

- `src/app/(pages)` — landing, `/diagnose`, `/chat`, `/history`
- `src/app/api/{diagnose,chat}` — route handlers that call the Gemma client
- `src/lib/gemma.ts` — single abstraction over cloud vs. local inference
- `src/lib/storage.ts` — localStorage-backed farm history
