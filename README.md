# InsightFlow AI

**Mobile autonomous content-to-action agent** — paste or upload a business report; five Gemini helpers analyze it; the app picks **one decision**, shows **do-nothing vs act**, then **simulates** Slack / email / CRM steps.

Built for hackathon demos: **Expo 55**, **React Native**, **Google Gemini**.

## What wins the demo (90 seconds)

1. **Upload** → Technology → **Try sample report** → **Step by step (5 helpers)**
2. **Analysis** — watch five agents run (Reader → Main Points → Problems → Next Steps → Results)
3. **Results** (top of scroll):
   - Leadership alert
   - **Autonomous decision** (one primary action)
   - **Consequence simulation** (two paths)
   - **Live action simulation** — approve → execute (demo)
   - **AI debate** (Growth / Risk / Finance → final decision)
4. **Share** or **Copy** full report · optional: voice brief, scorecard, workflow replay below

> **Honest label in-app:** analysis is real (Gemini); outbound actions are **simulated** for the hackathon.

## Core features

| Feature | Description |
|---------|-------------|
| **5-agent pipeline** | Sequential Gemini agents with live trace on Analysis |
| **Quick mode** | Single-call analysis (~20s) when you need speed |
| **Upload** | Paste text, `.txt`, or `.pdf` (PDF text via Gemini) |
| **Autonomous decision** | One AI-chosen action + reason + expected outcome |
| **Consequence simulation** | Do nothing vs act — Today / Day 7 / Day 30 |
| **Action commander** | Approve and run demo Slack, email, CRM steps |
| **AI debate mode** | Growth / Risk / Finance viewpoints → final decision |
| **History** | Last 20 reports on device |
| **Export** | Share sheet + copy full report |

## Setup

```bash
npm install
cp .env.example .env
# EXPO_PUBLIC_GEMINI_API_KEY from https://aistudio.google.com/apikey
npx expo start
```

Open **Expo Go** (scan QR). For live demo: turn off iPhone silent mode if using voice brief.

## Architecture (short)

```
Document → [Reader | Main Points | Problems | Next Steps | Results] → AnalysisResult
                ↓
Results: Alert → Decision → Consequences → Demo actions → (optional tools)
```

## Tech stack

- React Native + Expo 55 + Expo Router  
- Google Gemini API (`gemini-2.0-flash` with fallbacks)  
- AsyncStorage, expo-file-system, expo-clipboard, expo-speech  

## Security

Never commit `.env`. Rotate API keys if exposed.

## Demo tips

- Prefer **Step by step** for judges (shows multi-agent trace).  
- Settings → **Demo mode** for faster action animation.  
- Keep a **screen recording** backup if the API is busy (503).  
- Project on OneDrive: if Expo errors on `router.d.ts`, run `npx expo start -c` or move repo outside OneDrive.
