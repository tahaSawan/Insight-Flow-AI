# InsightFlow AI

**From information overload to autonomous action.**

InsightFlow AI is a mobile-first **autonomous content-to-action agent** built for hackathons and executive demos. Paste or upload a business report, run multi-agent analysis powered by **Google Gemini**, and get a single prioritized decision—with consequence paths and simulated Slack, email, and CRM execution.

> **Honest scope:** AI analysis is real (Gemini). Outbound integrations (Slack, email, CRM) are **simulated** for demonstration—not sent to live systems.

---

## Why InsightFlow?

Leaders receive long reports but need **one clear decision** fast. InsightFlow:

1. **Reads** the document (paste, `.txt`, or `.pdf`)
2. **Analyzes** with five sequential AI helpers (or one fast pass)
3. **Decides** one primary action with reasoning
4. **Compares** do-nothing vs act-now outcomes
5. **Simulates** approved demo actions with channel previews

---

## Core features

| Feature | Description |
|--------|-------------|
| **5-agent pipeline** | Reader → Main Points → Problems → Next Steps → Results, with live trace on the Analysis screen |
| **Quick mode** | Single Gemini call (~20s)—same report structure, fewer API calls |
| **Document upload** | Paste text, pick `.txt`, or extract text from `.pdf` via Gemini |
| **Industry context** | General, Finance, Healthcare, Technology |
| **Use cases** | Board meeting, Crisis response, Weekly ops—steers AI framing |
| **Autonomous decision** | One primary action, reason, priority, expected outcome, confidence |
| **Leadership alert** | Urgency headline and quantified stake at risk |
| **Consequence paths** | Do-nothing vs act-now outlook and before/after metrics |
| **Action commander** | Approve and execute simulated Slack / email / CRM / dashboard steps |
| **AI debate mode** | Growth, Risk, and Finance advisors → final reconciled decision |
| **Decision scorecard** | Five 0–100 dimensions (confidence, urgency, financial impact, etc.) |
| **Executive voice brief** | AI-generated talking points with text-to-speech |
| **Workflow replay** | Replay the agent pipeline from stored trace |
| **History** | Last 20 analyses persisted on device (AsyncStorage) |
| **Share & copy** | Export full report text via native share sheet or clipboard |
| **Onboarding** | Three-step welcome modal on first launch |
| **Settings** | API health check, session reset, history clear |

---

## Tech stack

| Layer | Technologies |
|-------|----------------|
| **Framework** | [Expo](https://expo.dev) 55, [Expo Router](https://docs.expo.dev/router/introduction/) 55 (file-based routing) |
| **UI** | React 19, React Native 0.83, React Native Web |
| **Language** | TypeScript 5.9 (strict) |
| **AI** | Google Gemini API (`@google/generative-ai`) with model fallbacks |
| **Animation** | React Native Reanimated 4, Expo Linear Gradient |
| **Storage** | `@react-native-async-storage/async-storage` |
| **Icons** | Lucide React Native |
| **Haptics** | Expo Haptics (native) |

**Default model:** `gemini-flash-lite-latest` (auto-fallback across lite/flash models when quota or load varies).

---

## Quick start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)
- A **Google Gemini API key** from [Google AI Studio](https://aistudio.google.com/apikey)
- **Expo Go** on your phone (optional) or a modern browser for web

### Install & run

```bash
git clone <your-repo-url>
cd Insight-Flow-AI
npm install
cp .env.example .env
```

Edit `.env` and set your key:

```env
EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npx expo start
```

Then:

- Press **`w`** for web (`http://localhost:8081`)
- Scan the **QR code** with **Expo Go** (iOS/Android)

After changing `.env`, restart with a clean cache:

```bash
npx expo start -c
```

### Verify the API

Open **Settings** in the app. **Gemini API** should show **Connected** after the automatic probe. Use **Test API again** if you just rotated keys.

---

## 90-second demo path

1. **Home** → **Start Analysis**
2. **Upload** → **Technology** → **Board** or **Crisis** → **Step by step (5 helpers)** → **Try sample report**
3. **Analyze** → watch agents on **Analysis**
4. **Results** → leadership alert → autonomous decision → consequence paths → execute demo actions
5. **Share** or **Copy** the report

Full spoken script: see [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md).

---

## Project structure

```
Insight-Flow-AI/
├── src/
│   ├── app/                 # Expo Router screens
│   │   ├── (tabs)/          # Home, Upload, Analysis, Results, History
│   │   ├── settings.tsx     # Settings modal
│   │   └── _layout.tsx      # Root stack + theme
│   ├── components/          # UI (Button, Card, ActionCommander, …)
│   ├── constants/           # Design tokens, agents, copy, sample report
│   ├── context/             # AppContext (global state)
│   ├── hooks/               # Theme, press scale, color scheme
│   ├── services/            # Gemini, orchestrator, history, documents
│   ├── types/               # AnalysisResult, agents, history
│   └── utils/               # Report formatting, debate, scorecard, haptics
├── assets/                  # Icons, splash, favicon
├── scripts/                 # postinstall patch, reset-project
├── app.json                 # Expo config
├── .env.example             # Environment template
├── DEMO_SCRIPT.md           # Hackathon presenter script
├── DESIGN_SYSTEM.md         # Colors, typography, components
├── instructions.md          # Install, run, test (detailed)
└── walkthrough.md           # Developer architecture guide
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Yes | Gemini API key from AI Studio |
| `EXPO_PUBLIC_GEMINI_MODEL` | No | Override default model (see `src/services/gemini.ts`) |

Never commit `.env`. It is listed in `.gitignore`.

---

## Available scripts

| Command | Purpose |
|---------|---------|
| `npm start` / `npx expo start` | Start Metro bundler |
| `npx expo start -c` | Start with cache cleared (use after `.env` changes) |
| `npx expo start --web` | Open web directly |
| `npm run android` | Expo → Android |
| `npm run ios` | Expo → iOS |
| `npm run lint` | ESLint (Expo config) |

---

## Architecture (high level)

```
Document (paste / txt / pdf)
        │
        ▼
┌───────────────────────────────────────┐
│  Analysis mode                        │
│  • full → agentOrchestrator (5 calls) │
│  • fast → gemini.analyzeContentFast   │
└───────────────────────────────────────┘
        │
        ▼
   AnalysisResult  ──►  AppContext  ──►  Results UI
        │                      │
        └──────────────────────┴──►  History (AsyncStorage)
```

---

## Design system

Dark **AI operations dashboard** aesthetic: cyan primary (`#22D3EE`), emerald secondary (`#10B981`), deep navy surfaces.

- Tokens: `src/constants/designTokens.ts`
- Typography: `src/constants/typography.ts`
- Guide: [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)

---

## Hackathon — share a live link

**Judges need a normal `https://` URL?** Deploy the web app (recommended):

```bash
npx expo export -p web   # creates dist/
# Deploy dist/ to Vercel — set EXPO_PUBLIC_GEMINI_API_KEY in project env
```

Full guide: **[`HACKATHON_DEPLOY.md`](./HACKATHON_DEPLOY.md)** (Vercel vs Expo tunnel vs QR).

**Tunnel** (`npx expo start --tunnel`) is great for **live phone demos** with Expo Go, but your laptop must stay on—it is not a permanent submission link by itself.

---

## Documentation

| File | Audience | Contents |
|------|----------|----------|
| [`HACKATHON_DEPLOY.md`](./HACKATHON_DEPLOY.md) | Hackathon submit | Public URL, tunnel, QR |
| [`instructions.md`](./instructions.md) | Anyone running the app locally | Install, configure, run, test |
| [`walkthrough.md`](./walkthrough.md) | Developers | Code structure, data flow, features |
| [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) | Presenters | 90s / 3min live demo script |
| [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) | Designers / devs | Tokens and UI patterns |

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Analysis failed** | Settings → check Gemini API status. New key + `npx expo start -c`. Free-tier quota may be exhausted—try another Google account or enable billing. |
| **Invalid API key** | Confirm `.env` has `EXPO_PUBLIC_GEMINI_API_KEY` with no quotes/spaces. Restart Expo with `-c`. |
| **Stale env on web** | Always restart Metro after editing `.env`; hard-refresh the browser. |
| **Expo / Metro errors on OneDrive** | Sync folders can break file watchers—clone outside OneDrive or use `npx expo start -c`. |
| **PDF upload fails** | Ensure API key works; PDF text extraction uses Gemini multimodal. |
| **pointerEvents warning in terminal** | Harmless React Navigation + RN Web deprecation during SSR; patched via `postinstall` script. |

---

## Security

- Do **not** commit API keys or `.env`
- Rotate keys if exposed in chat, screenshots, or git history
- Simulated actions do not call external webhooks

---

## Contributing & license

Hackathon / portfolio project. Add a `LICENSE` file before open-sourcing if you publish to GitHub.

For AI-assisted development in this repo, see [`AGENTS.md`](./AGENTS.md) (Expo 55 docs reference).

---

<p align="center">
  <strong>InsightFlow AI</strong> — Built with Expo & Gemini<br>
  <sub>Content in → decision out → action simulated</sub>
</p>
