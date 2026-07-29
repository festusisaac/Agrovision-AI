# AgroVision AI

A farm expert in every pocket — even offline. AgroVision AI diagnoses crop disease and pests
from a photo, answers farming questions by voice in Hausa, Yorùbá, Igbo or English, tracks a
farm's history, and crowdsources a real early-warning outbreak map ("Village Watch") between
nearby farms — all powered by **Gemma 4**.

Built for **Build with Gemma: AI for Africa** (Minna 2026) — Social Impact / Multimodal /
Edge AI / Local Language tracks.

---

## What to actually test

If you only have a few minutes, this is the path that shows the most:

1. **Onboarding** (`/onboarding`) — fill in a quick farm profile (crop, stage, location).
2. **Scan** (`/app/scan`) → take/upload a leaf photo → **Clarify** — Gemma asks two real
   clarifying questions before diagnosing, and runs a genuine photo-quality check first (it will
   refuse to guess if the photo is too unclear — try a blurry photo to see this).
3. **Diagnosis** — a full report: label, confidence, severity, treatment, all generated live by
   Gemma from your actual photo + farm context.
4. **Village Watch** (`/app/watch`) — a real, privacy-preserving outbreak map. It only shows
   real crowdsourced data once ≥3 nearby opted-in farms have scanned recently; otherwise it
   falls back to a **clearly labeled demo dataset** so the map is never empty during a demo. The
   "Send live alert" button broadcasts to every open tab of the app in real time.
5. **Assistant** (`/app/assistant`) — free-form chat, with voice input/output (see the browser
   note below — voice input needs `https://` or `localhost`).
6. Switch the language dropdown (top of the sidebar) to Hausa/Yorùbá/Igbo — the whole UI and
   Gemma's own responses re-render in that language.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** + **Tailwind CSS v4**
- **Gemma 4** — swappable inference backend: Google (Gemini API), Hugging Face, or fully local
  via **Ollama** (same code path, one env var switches all three)
- **Neon (Postgres)** — the one piece of real shared/cross-device state (Village Watch)
- **YarnGPT** — text-to-speech in Nigerian languages, with the browser's Web Speech API as a
  built-in fallback
- **MediaRecorder / Web Speech API** — camera capture and voice input

---

## Quick start

### Prerequisites

- Node.js **20+** and npm
- A free [Google AI Studio](https://aistudio.google.com/apikey) API key (for real Gemma
  responses — the app also runs without one, see below)
- (Optional)A free [Neon](https://neon.tech) Postgres database (only required for Village Watch's real
  crowdsourced data — everything else works without it)

### 1. Clone and install

```bash
git clone https://github.com/festusisaac/Agrovision-AI.git
cd Agrovision-AI
npm install
```

### 2. Set up environment variables

Copy the example file and fill it in:

```bash
cp .env.local.example .env.local
```

| Variable | Required? | What it does |
|---|---|---|
| `GEMMA_PROVIDER` | No (defaults to `google`) | `google`, `huggingface`, or `local` — picks which backend serves Gemma 4 |
| `GOOGLE_API_KEY` | **Yes, for real AI responses** | Free key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) — no card required |
| `GOOGLE_MODEL` | No | Defaults to `gemma-4-26b-a4b-it` |
| `HF_API_KEY` / `HF_PROVIDER` / `HF_MODEL` | Only if `GEMMA_PROVIDER=huggingface` | Alternative cloud backend |
| `OLLAMA_BASE_URL` / `OLLAMA_TEXT_MODEL` / `OLLAMA_VISION_MODEL` | Only if `GEMMA_PROVIDER=local` | Fully offline inference — run `ollama pull gemma3:2b` and `gemma3:4b` first |
| `DATABASE_URL` | Only for Village Watch's real data | A Neon/Postgres connection string — see below |
| `YARNGPT_API_KEY` + `YARNGPT_VOICE_*` | No | Voice output; without it, the app falls back to the browser's built-in Web Speech API automatically |

**Without any keys at all**, the app still runs and every screen is explorable — Gemma-powered
routes (diagnosis, chat, daily report) return a clearly labeled demo response instead of
erroring. **For a real demo, at minimum set `GOOGLE_API_KEY`.**

### 3. (Optional) Set up the database (Village Watch)

Village Watch is the one feature backed by real shared/cross-device state, so it needs an actual
Postgres database — everything else in the app works without this step.

1. Create a free database at [neon.tech](https://neon.tech) (or, if deploying to Vercel: your
   project → **Storage** → **Create Database** → Postgres, which provisions the same thing).
2. Copy its connection string into `.env.local` as `DATABASE_URL`.
3. That's it — the app creates its own tables automatically on first request (no migration step
   to run).

If `DATABASE_URL` isn't set, every other page still works; only `/app/watch` and its API routes
will error until it's configured.

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project structure

```
src/app/                    # marketing landing page (/)
src/app/onboarding/         # farm profile setup wizard
src/app/app/                # the main product shell (sidebar nav)
  ├─ dashboard/              # daily overview, weather, Gemma-generated report
  ├─ scan/                   # photo capture → clarifying questions → diagnosis
  ├─ diagnosis/              # full diagnosis report + printable version
  ├─ watch/                  # Village Watch outbreak map + live alerts
  ├─ assistant/              # free-form chat (text + voice)
  └─ history/                # past scans, saved locally
src/app/api/                # route handlers (diagnose, chat, outbreaks, alerts, tts, weather...)
src/lib/                    # Gemma client, i18n, geo/privacy math, device-local storage
```

## Architecture notes worth knowing when reviewing the code

- **Real vs. demo data is always explicit.** Nothing pretends to be real when it isn't — Village
  Watch's API response includes a `demo: boolean` field, and the UI visibly discloses which mode
  it's in rather than silently faking data.
- **Privacy-by-design on Village Watch.** Farmer GPS is rounded to ~500 m before it's ever
  written to the database, and any cluster of fewer than 3 nearby farms is suppressed entirely
  (real distance-based k-anonymity, not a naive grid) so no single farm is ever identifiable.
- **Cloud today, on-device tomorrow.** Swapping `GEMMA_PROVIDER` between `google`/`huggingface`/
  `local` changes only the route handler's inference call — the client, prompts, and UI are
  identical either way.
- **Everything except Village Watch is device-local.** Farm profile, diagnosis history, and
  preferences live in the browser's `localStorage`, never sent anywhere unless you explicitly
  opt in to sharing a scan with Village Watch.

## Known browser limitations (not bugs)

- **Voice input requires a secure context.** Browsers only allow microphone access over `https://`
  or `localhost` — it will not work if you open the app via a plain `http://<LAN-IP>` address on
  another device. The app detects this and shows a message instead of failing silently.
- **iOS Safari doesn't support the Web Speech API's `SpeechRecognition`** at all (any origin) —
  voice *input* only works on Chrome/Android and desktop browsers. Voice *output* (TTS) works
  everywhere.

## Deployment

The app is designed to deploy on **Vercel** as-is — `npm run build` succeeds with zero
environment variables configured (Village Watch's database client only connects lazily, on
first real request, so a missing `DATABASE_URL` never breaks the build). Connect the repo in
the Vercel dashboard, add the same environment variables listed above under **Settings →
Environment Variables**, and provision a Postgres database under the **Storage** tab.
