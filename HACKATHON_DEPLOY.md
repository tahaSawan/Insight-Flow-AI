# Hackathon — Share a working app link

Judges usually want a **link they can open in a browser** without installing anything. Here are your options, ranked for hackathons.

---

## Which option should you use?

| Option | Link type | Best for | Keeps working when your laptop is off? |
|--------|-----------|----------|----------------------------------------|
| **A — Deploy web (recommended)** | `https://your-app.vercel.app` | “Submit a project URL” | Yes |
| **B — Expo tunnel** | `https://….exp.direct` or QR | Live demo while you present | No (PC must run Expo) |
| **C — Expo Go + QR only** | `exp://…` (not a normal link) | In-person booth only | No |

**Submit Option A** if the form asks for a **project URL** or **live demo link**.

Use **Option B** as backup during your presentation (phone + laptop).

---

## Option A — Deploy the web app (recommended)

Your app already supports **static web export** (`app.json` → `"web": { "output": "static" }`). Anyone can open the link in Chrome/Safari—no Expo Go required.

### Step 1 — Export locally (test)

```bash
# Stop any running Expo server first (Ctrl+C)
npm install
npx expo export -p web
```

This creates a `dist/` folder. Optional quick test:

```bash
npx serve dist
```

Open the URL shown (usually `http://localhost:3000`).

### Step 2 — Deploy to Vercel (free, ~5 minutes)

1. Push your project to **GitHub** (do **not** commit `.env`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Vercel settings:
   - **Framework Preset:** Other
   - **Build Command:** `npx expo export -p web`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
4. **Environment Variables** (required for AI to work):

   | Name | Value |
   |------|--------|
   | `EXPO_PUBLIC_GEMINI_API_KEY` | Your Gemini key from [AI Studio](https://aistudio.google.com/apikey) |

5. Click **Deploy**.

You get a permanent link like:

```text
https://insightflow-ai.vercel.app
```

Put **that** in the hackathon submission form.

### Alternative hosts

Same `dist/` folder works on **Netlify**, **Cloudflare Pages**, or **GitHub Pages**—set build to `npx expo export -p web` and publish `dist/`.

### Security note

The web build embeds `EXPO_PUBLIC_*` variables in the client bundle. Use a **hackathon-only API key** with quota limits, not your personal production key.

---

## Option B — Expo tunnel (what you asked about)

**Yes, this is real and valid**—but understand what it gives you.

### Run tunnel mode

```bash
npx expo start --tunnel
```

Wait until Metro finishes. The terminal shows:

- A **QR code** (for phones)
- A tunnel URL, often like `exp://u.expo.dev/...` or `https://xxxx.exp.direct`

### How judges use it

| Platform | What they do |
|----------|----------------|
| **Phone** | Install **Expo Go** → scan QR → app opens |
| **Web (sometimes)** | Open the `https://….exp.direct` link if Expo prints one; or press `w` in the terminal and use the tunneled web URL |

### Pros

- No deploy setup
- Good for **live** demos at your desk
- Works with your local `.env` API key

### Cons

- Your laptop must stay on with `expo start --tunnel` running
- Tunnel can be slow or drop
- `exp://` links **do not open in a normal browser**—judges need Expo Go
- Not ideal as the **only** submission link unless organizers accept it

**Hackathon tip:** Submit the **Vercel HTTPS link** (Option A) and mention in README: “Mobile: scan QR during live demo.”

---

## Option C — LAN only (not for remote judges)

```bash
npx expo start
```

QR uses `exp://192.168.x.x:8081` — only works on the **same Wi‑Fi**. Do **not** submit this as your project link.

---

## What to put in the submission form

Copy-paste template:

```text
Live app (web): https://YOUR-PROJECT.vercel.app

How to test:
1. Open the link in Chrome or Safari
2. Tap Start Analysis → Try sample report → Analyze
3. View Results (leadership alert, decision, demo actions)

Note: AI analysis uses Google Gemini. Slack/email/CRM actions are simulated for demo.

Backup (mobile, live demo): Expo Go + tunnel QR — see README.
```

---

## Troubleshooting deployed web

| Problem | Fix |
|---------|-----|
| Site loads but analysis fails | Add `EXPO_PUBLIC_GEMINI_API_KEY` in Vercel → **Settings → Environment Variables** → **Redeploy** |
| 404 on refresh / deep links | Enable SPA fallback on host (Vercel usually handles `dist` from Expo) |
| Blank page after deploy | Check Vercel build logs; run `npx expo export -p web` locally first |
| Works locally, not on Vercel | Redeploy after adding env vars; keys are baked in at **build** time |

---

## Quick decision

- **Form says “Project URL” / “Live demo”** → **Option A (Vercel web)**
- **You’re presenting in person right now** → **Option B (tunnel)** + phone on Expo Go
- **Option 2 tunnel description you found** → **Correct for mobile**, but **not a full replacement** for a public HTTPS web link

---

## Related docs

- Local setup: [`instructions.md`](./instructions.md)
- Demo script: [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)
