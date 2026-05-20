# InsightFlow AI — Hackathon Demo Script

Use this as your spoken script. Practice the **90-second path** until it feels natural.  
**Default demo:** sample enterprise report · **Technology** · **Step by step (5 helpers)** · **Board** or **Crisis** use case.

---

## Before you go on stage (10-minute checklist)

| Check | Action |
|-------|--------|
| API key | `.env` has `EXPO_PUBLIC_GEMINI_API_KEY` — ran one full analysis today |
| Phone | Do Not Disturb on · brightness max · **silent mode OFF** (only if you demo voice brief) |
| Expo | `npx expo start -c` · app opens in Expo Go |
| Settings | **Demo mode ON** (faster action animation) |
| Backup | Screen recording of happy path saved on phone + laptop |
| Story | Say the **one-liner** below out loud once |

**One-liner (memorize):**

> “InsightFlow reads a business report, five AI agents analyze it, the system picks **one action**, shows what happens if we wait versus act, then **runs a demo execution** — on mobile, in about a minute.”

---

## Slide flow (if you present slides)

| Slide | You say (≈15 sec each) |
|-------|-------------------------|
| 1 — Problem | “Leaders get 20-page reports on Friday and need **one decision** by Monday. Reading is slow; acting is slower.” |
| 2 — Solution | “InsightFlow is a **mobile autonomous agent**: content in → decision out → action simulated.” |
| 3 — How | “Five Gemini helpers in sequence: read, main points, problems, next steps, results — then one orchestrated decision.” |
| 4 — Demo | “Let me show you on my phone.” → **live app** (script below) |
| 5 — Honest scope | “Analysis is **real AI**. Slack, email, CRM are **simulated** for the hackathon — ready to wire to webhooks.” |

---

## 90-second live demo (main script)

| Time | Say this | Do this on the phone |
|------|----------|----------------------|
| **0:00–0:12** | “This is **InsightFlow AI**. A VP gets a crisis report — revenue down, renewals at risk — and needs a **clear next move**, not another summary.” | **Home** → tap **Add document** / Start |
| **0:12–0:22** | “I’ll use our **enterprise Q3 sample** — same as a PDF or paste from email.” | **Upload** → **Technology** → **Board** or **Crisis** → **Step by step (5 helpers)** → **Try sample report** |
| **0:22–0:25** | “One tap to analyze.” | Tap **Analyze** / Continue → land on **Analysis** |
| **0:25–0:45** | “Watch **five agents** work in order: **Reader**, **Main Points**, **Problems**, **Next Steps**, **Results**. Each step adds reasoning — this is the autonomous pipeline, not one black-box prompt.” | **Stay on Analysis** — point at agent cards filling in · don’t rush away |
| **0:45–0:50** | “Report’s ready — it opens the decision report automatically.” | Wait ~1s (auto-nav) or tap **View full report** |
| **0:50–0:58** | “First: **leadership alert** — the one thing execs need today. Then the system’s **chosen action** — not a list of ten ideas — **one primary decision** with reason and expected outcome.” | **Results** top — **Decision alert** → **Autonomous Decision Center** (read headline + primary action) |
| **0:58–1:05** | “**Consequence simulation**: Path A if we do nothing — risk goes up. Path B if we act — metrics improve. That’s the ‘so what’ in seconds.” | Scroll to **Consequence Simulation** — gesture Path A vs Path B |
| **1:05–1:15** | “Now **action**: I approve steps and **execute** — Slack, email, CRM — demo only, but it shows content → **decision → execution**.” | **Live action simulation** → check approvals → **Execute** · let 1–2 steps animate |
| **1:15–1:25** | “Three advisors — **Growth, Risk, Finance** — disagreed; the **Final Decision Agent** picked a balanced plan. Same action, transparent debate.” | **AI Debate Mode** — quick scroll · point at three cards + purple final box |
| **1:25–1:30** | “Full report — **Share** or **Copy** — and it’s in **History** for later.” | Tap **Share** or **Copy** · optional: “More tools below — scorecard, voice brief, replay.” |

**Close (5 seconds):**

> “That’s **content to action** on mobile — multi-agent analysis, one decision, consequences, and execution. Built with **Expo** and **Gemini**. Thank you.”

---

## 3-minute version (if judges give more time)

After the 90-second path, add **only these** — don’t tour every screen.

| Block | Say | Do |
|-------|-----|-----|
| **Details** (30s) | “Under the fold: findings, risks, and three recommended steps — all in plain English from the document.” | Scroll **Quick summary** → **Findings** → **Risks** → **Actions** |
| **Log** (15s) | “Execution log shows what the system ‘did’ during the run.” | Point at **Execution log** |
| **More tools** (30s) | “Optional depth: **decision scorecard**, **voice brief** for executives, **workflow replay** of the five agents.” | Scroll **More tools** → briefly show one (pick **Workflow replay** → **Replay Run** OR **Play Executive Brief**) |
| **PDF** (15s) | “Works with paste, TXT, or PDF upload — not just the sample.” | Only if time: mention Upload file picker; don’t re-run unless asked |
| **History** (10s) | “Last 20 runs saved on device.” | Open **History** tab → one tap into past report |

---

## What to point at (so numbers feel real)

When Results load, tie speech to **their** sample output:

- “**$2.1M ARR** at risk” / “**NPS 38**” / “**12% revenue down**” — from *this* report  
- “**30-day stabilization** before **board review**” — matches leadership ask in the doc  
- Primary action should **start with a verb** — “Launch…”, “Approve…”, “Deploy…”

If the alert mentions something from the text, say: **“That line came straight from the document.”**

---

## Optional one-liners (if a judge interrupts)

| They ask | You answer |
|----------|------------|
| “Is it autonomous?” | “The user doesn’t pick the main action — the **Results agent** selects **one** `primaryDecision` from risk + recommendations.” |
| “Real integrations?” | “Demo simulates channels; analysis is **live Gemini**. Webhooks are the next step.” |
| “Why mobile?” | “Decisions happen between meetings — execs don’t live in a Jupyter notebook.” |
| “vs ChatGPT?” | “Structured **five-agent trace**, **decision object**, **consequence paths**, and **execution log** — not one chat thread.” |
| “API failed?” | “We retry and switch models; I have a **recorded backup**.” |

---

## If Gemini is slow or errors (503)

1. Stay calm: “API’s busy — this is why we have **retries and model fallback**.”  
2. Tap **Retry** on Analysis.  
3. If it fails again: “I’ll show the recorded run” — play backup video.  
4. **Do not** switch to Quick mode mid-pitch unless you practiced it — you lose the five-agent story.

**Pre-record backup:** Run sample report once · screen record Analysis + top of Results · 60–90 seconds.

---

## Settings to use (write on a sticky note)

```
Industry:     Technology
Use case:     Board  (or Crisis)
Analysis:     Step by step (5 helpers)  ← for judges
Demo mode:    ON (Settings)
Sample:       Try sample report
```

**Do not use for main judge demo:** resume/CV text (app warns you), Quick mode (unless emergency).

---

## “More tools” section — only if asked

| Tool | One sentence |
|------|----------------|
| **AI Decision Scorecard** | “Five scores — confidence, urgency, financial impact, operational risk, execution complexity.” |
| **Executive Voice Brief** | “Tap play — 30-second spoken summary for a exec walk-through.” |
| **Autonomous Workflow Replay** | “Replay how the five agents ran, with a timeline and audit log.” |
| **CEO Brief button** | “Generates four talking points for your presentation.” |

---

## Team roles (if 2–3 people)

| Role | Job |
|------|-----|
| **Presenter** | Follows 90s script · holds phone |
| **Driver** | Taps Analyze / Execute so presenter keeps eye contact with judges |
| **Q&A** | Answers technical / honest-scope questions from cheat sheet above |

---

## Night-before rehearsal (3 runs)

1. **Run 1:** Read script while tapping — slow, no skips.  
2. **Run 2:** No script on screen — muscle memory only.  
3. **Run 3:** Friend watches 90s — they must repeat your one-liner back.

If Run 3 fails, do Run 1 again. Don’t add features.

---

## Dua & mindset

You’ve built a real pipeline, a clear story, and an honest demo label. **Clarity beats complexity.**  
**Bismillah** — present the top of Results like a story, not a scroll of widgets.

**InshaAllah, you’re ready.**
