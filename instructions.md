# InsightFlow AI — Local setup & testing instructions

Step-by-step guide to install, configure, run, and verify **InsightFlow AI** on your machine. No prior Expo experience required.

---

## 1. What you need installed

| Tool | Minimum version | Check with |
|------|-----------------|------------|
| **Node.js** | 18.x or 20.x LTS | `node -v` |
| **npm** | 9+ (bundled with Node) | `npm -v` |
| **Git** | Any recent | `git --version` |

**Optional (mobile testing):**

- **Expo Go** on iOS ([App Store](https://apps.apple.com/app/expo-go/id982107779)) or Android ([Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Phone and computer on the **same Wi‑Fi** network

**Optional (web only):**

- Chrome, Edge, or Firefox

---

## 2. Get the project

```bash
git clone <your-repository-url>
cd Insight-Flow-AI
```

If you downloaded a ZIP, extract it and open a terminal in that folder.

---

## 3. Install dependencies

```bash
npm install
```

This installs Expo, React Native, Gemini SDK, and all app dependencies. A `postinstall` script also patches a React Navigation web deprecation (safe to ignore if it prints nothing).

**Expected:** `node_modules/` folder created, no fatal errors.

---

## 4. Configure the Gemini API key

### 4.1 Create a key

1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey)
2. Create an API key (use a Google account with available free quota, or billing enabled)
3. Copy the key (starts with `AIza…`)

### 4.2 Add it to the project

```bash
cp .env.example .env
```

Edit `.env` in the project root:

```env
EXPO_PUBLIC_GEMINI_API_KEY=AIzaSy_your_actual_key_here
```

**Rules:**

- No quotes around the value
- No trailing spaces
- Variable name must be exactly `EXPO_PUBLIC_GEMINI_API_KEY` (Expo only exposes `EXPO_PUBLIC_*` to the client)

### 4.3 Optional model override

```env
EXPO_PUBLIC_GEMINI_MODEL=gemini-flash-lite-latest
```

Leave unset to use the app default (`gemini-flash-lite-latest` with automatic fallbacks).

---

## 5. Start the development server

```bash
npx expo start
```

You should see:

- A **QR code** in the terminal
- URLs for **Metro** and **Web**
- Keyboard shortcuts (`w` = web, `a` = Android, `i` = iOS)

### After any `.env` change

Metro caches environment variables. Always restart with cache clear:

```bash
npx expo start -c
```

---

## 6. Run on each platform

### Web (fastest for development)

1. With Expo running, press **`w`**
2. Or run: `npx expo start --web`
3. Browser opens at **`http://localhost:8081`**

### Physical phone (Expo Go)

1. Install **Expo Go**
2. Run `npx expo start`
3. Scan the **QR code** (Android: in Expo Go; iOS: Camera app → open in Expo Go)
4. Ensure phone and PC share the same network

### Android emulator

1. Install Android Studio + an AVD
2. Start the emulator
3. With Expo running, press **`a`**

### iOS simulator (macOS only)

1. Install Xcode
2. With Expo running, press **`i`**

---

## 7. First-run walkthrough (smoke test)

Use this checklist to confirm the app works end-to-end.

### Step A — Launch

- [ ] App opens to **Home** with hero “From information overload to autonomous action”
- [ ] Onboarding modal may appear (tap through or **Skip intro**)

### Step B — API configuration

- [ ] Tap **Settings** (gear on Home)
- [ ] **Gemini API** row shows **Connected** (may say “Checking…” briefly)
- [ ] If **Not working**, fix `.env` and run `npx expo start -c`, then **Test API again**

### Step C — Upload document

- [ ] **Home** → **Start Analysis**
- [ ] **Upload** screen opens
- [ ] Tap **Try sample report** (loads enterprise Q3 sample)
- [ ] Select **Industry:** Technology
- [ ] Select **Use case:** Board meeting or Crisis response
- [ ] Choose analysis mode:
  - **Quick mode** — default, ~20 seconds, 1 API call
  - **Step by step (5 helpers)** — ~1 minute, 5 API calls, best for demos

### Step D — Run analysis

- [ ] Tap **Analyze** / continue to **Analysis**
- [ ] Progress bar and agent cards update
- [ ] No red **Analysis failed** card
- [ ] App auto-navigates to **Results** after ~1 second

### Step E — Verify results

- [ ] **Leadership alert** visible at top
- [ ] **Autonomous decision** shows one primary action
- [ ] **Consequence** / path comparison section loads
- [ ] **Live action simulation** — approve steps → **Execute**
- [ ] Expand **More tools** — debate, scorecard, voice brief, replay

### Step F — Export & history

- [ ] **Share report** or **Copy report** in bottom bar works
- [ ] **History** tab shows the saved run (up to 20 entries)

---

## 8. Testing specific features

### PDF upload

1. **Upload** → pick a `.pdf` file
2. Wait for extraction (uses Gemini multimodal)
3. Run analysis as above

Requires a working API key with generate permission.

### Quick vs step-by-step mode

| Mode | API calls | Best for |
|------|-----------|----------|
| Quick mode | 1 | Daily use, tight quota |
| Step by step | 5 | Hackathon judges, agent trace demo |

Switch on **Upload** before analyzing.

### History persistence

1. Complete one analysis
2. Open **History** tab → entry listed
3. Tap entry → results reload
4. **Settings** → **Clear Analysis History** removes all

### Voice executive brief

1. On **Results**, open **More tools**
2. **Executive voice briefing** → generate bullets → play (native TTS)
3. On iOS, disable silent mode if you hear nothing

---

## 9. Linting (optional)

```bash
npm run lint
```

Fixes any reported issues before submitting a PR.

---

## 10. Common problems & fixes

### “Analysis failed” / Gemini errors

| Symptom | Fix |
|---------|-----|
| Invalid API key | Re-copy key into `.env`, `npx expo start -c` |
| Quota exceeded | New key from different Google account, or enable billing in AI Studio |
| Access denied (403) | Create key in AI Studio (not only Cloud Console without Generative Language API) |
| Busy / 503 | Tap **Retry** on Analysis; app tries alternate models |

### App still uses old API key

1. Save `.env`
2. Stop Expo (`Ctrl+C`)
3. Run `npx expo start -c`
4. Hard-refresh browser (`Ctrl+Shift+R`)

### Cannot connect Expo Go

- Same Wi‑Fi for phone and PC
- Disable VPN
- Try **Tunnel** mode in Expo dev tools if LAN is blocked

### Web blank or bundle errors

```bash
npx expo start -c
```

If the project lives in **OneDrive**, move it to a local folder (e.g. `C:\dev\Insight-Flow-AI`) to avoid sync conflicts.

### Terminal warning: `props.pointerEvents is deprecated`

Cosmetic warning from React Navigation during web SSR. Does not block the app. Ignorable for demos.

---

## 11. Stopping the server

In the terminal where Expo runs:

```
Ctrl + C
```

---

## 12. Next steps

- **Present a demo:** [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md)
- **Understand the codebase:** [`walkthrough.md`](./walkthrough.md)
- **GitHub overview:** [`README.md`](./README.md)
