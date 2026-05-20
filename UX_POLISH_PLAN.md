# InsightFlow AI — UI/UX Polish Plan

**Goal:** Feel like one calm, executive mobile product — not fifteen glowing widgets.  
**Constraint:** Hackathon deadline — do **Phase 1 → 2 → 3** first; rest if time allows.  
**Principle:** Less scroll, clearer steps, one visual language.

---

## What feels “not good” today (honest audit)

| Issue | Where | Impact |
|-------|--------|--------|
| **No shared design system** | Colors/spacing hard-coded in every file | Inconsistent, “hacky” |
| **Results is still a novel** | Long scroll, similar cards | Judges get lost |
| **Too many glow borders** | Purple/pink/indigo on every block | Visual noise, cheap “AI slop” |
| **Upload is crowded** | Mode + use case + industry + file + paste in one card | Cognitive overload |
| **Tabs hide themselves** | Analysis/Results disappear until data exists | Confusing first visit |
| **Typography fights layout** | `h1` has built-in margins; screens override sizes | Uneven spacing |
| **Duplicate story** | Decision + Debate + Scorecard + summary metrics | Same info, 4 styles |
| **Weak hierarchy** | Everything shouts equally | No clear “read this first” |
| **No progress breadcrumb** | Home → Upload → Analysis → Results | Users don’t know step |
| **README/theme unused** | `theme.ts` exists but screens ignore it | Missed consistency win |

---

## Target experience (after polish)

```
Home          →  one CTA, calm stats
Upload        →  3 clear steps: Document → Options → Analyze
Analysis      →  focus on 5 agents; auto-open Results when done
Results       →  sticky “Demo path” chips + 5 hero sections + collapsed “More”
```

**Visual tone:** Dark background `#0A0A0F`, surfaces `#12121A`, **one accent** indigo `#6366F1`, success/warning/danger only for meaning.

---

## Phase 1 — Design foundation (do first · ~4–6 hours)

**Outcome:** Every new change uses the same tokens and wrappers.

### 1.1 Create `src/constants/designTokens.ts`

- `colors`: background, surface, surfaceElevated, border, textPrimary, textSecondary, accent, success, warning, danger
- `spacing`: xs(4), sm(8), md(16), lg(24), xl(32)
- `radius`: sm(8), md(12), lg(16)
- `fontSize`: title, heading, body, caption

### 1.2 Update shared components

| File | Change |
|------|--------|
| `Card.tsx` | Variants: `default`, `elevated`, `accent` (only one accent style) |
| `Button.tsx` | Clear disabled (opacity + no shadow), min height 48px, `primary` / `outline` / `ghost` |
| `Typography.tsx` | Remove default margins from variants; add `label` (uppercase small) |
| **New** `ScreenHeader.tsx` | Title + subtitle + optional badge (used on every tab) |
| **New** `SectionHeader.tsx` | Title + one-line hint (replaces repeated h3 + caption) |

### 1.3 Kill random per-component hex

- Replace top 20 hard-coded purples in Results with tokens  
- Rule: **only Decision + Final Debate** get accent border; rest use `border.default`

**Done when:** Home + Upload use `ScreenHeader` + tokens only (no new `#C084FC` in those files).

---

## Phase 2 — Navigation & flow (highest UX ROI · ~4–5 hours)

**Outcome:** Users always know where they are and what’s next.

### 2.1 Step indicator (top of Upload, Analysis, Results)

Add `DemoStepBar` — 4 steps:

1. **Document** (Upload)  
2. **Analyze** (Analysis)  
3. **Decide** (Results top)  
4. **Act** (Action Commander — scroll or chip jump)

Active step highlighted; completed steps checkmarked.

### 2.2 Results: sticky jump chips (P0 for hackathon)

Below header, horizontal `ScrollView`:

`Alert` · `Decision` · `Consequences` · `Actions` · `Debate` · `Details` · `More`

Tap → `scrollTo` section (use `ref` on each block).  
**This alone fixes “endless scroll” for judges.**

### 2.3 Analysis → Results auto-navigate

When analysis succeeds:

- Optional 1.5s “Report ready” toast on Analysis  
- Auto `router.push('/results')` **or** big pulsing **“View decision report”** (user setting)

Recommend: **auto-navigate** for demo; manual button for dev.

### 2.4 Tab bar labels

- Always show 5 tabs but **disabled state** with tooltip text: “Upload a document first”  
- Or keep hidden tabs but add **floating progress pill** on Upload: “Step 1 of 4”

Pick one approach — don’t leave tabs disappearing with no explanation.

**Done when:** You can reach Action Commander in 2 taps from Results jump chips.

---

## Phase 3 — Screen-by-screen polish (~8–10 hours)

### 3.1 Home

| Change | Why |
|--------|-----|
| Shrink title slightly (32px); more padding under subtitle | Less poster, more app |
| Single primary CTA card; move feature cards below or remove one | Clear entry |
| “Last run” as one tappable row, not three stat cards + history | Simpler |
| Add “How it works” 3 icons: Upload → Analyze → Decide | First-time clarity |

### 3.2 Upload

| Change | Why |
|--------|-----|
| Split into **2 cards**: (A) Document (B) Options + Analyze | Less wall of controls |
| Collapse **Use case** + **Industry** behind “Advanced” default closed | Faster demo path |
| Pin **Analyze** button sticky at bottom of screen | Always visible |
| Sample report = filled textarea + green check “Sample loaded” | Feedback |
| Larger paste area min-height 120px | Easier to read |

### 3.3 Analysis

| Change | Why |
|--------|-----|
| Full-width progress bar at top | Obvious activity |
| Agent pipeline = vertical timeline (already close) — **larger agent names** | Demo legibility |
| Hide preview clutter until 100% — then one **hero preview card** (alert + risk + 1 action) | Less duplicate of Results |
| Error state: full card with Retry, not small red text | Trust |
| Loading: use `AnalysisLoadingPanel` consistently | Calm wait |

### 3.4 Results (winner path)

| Change | Why |
|--------|-----|
| Shorter page title: **“Decision report”** not “Your AI report” | Executive tone |
| Demo disclaimer = slim info strip, not full card | Less noise |
| **Hero stack** (no extra Card wrapper on each component): Alert → Decision → Consequence → Actions | Visual group |
| **Collapsible “More tools”** — Scorecard, Voice, Replay, CEO brief default **collapsed** | Judges stay on path |
| **Collapsible “Full details”** — Summary + findings + risks + actions | Optional depth |
| Unify section titles via `SectionHeader` | Rhythm |
| Bottom: sticky bar **Share · Copy · New report** | Always available |
| Remove duplicate metric bars in summary if Scorecard visible in More | One source of truth |

**Done when:** First screenful = Alert + Decision + start of Consequence (no scroll on iPhone 14-ish).

---

## Phase 4 — Feature components tone-down (~5–6 hours)

Polish without removing features.

| Component | Polish |
|-----------|--------|
| `AutonomousDecisionCenter` | Slightly smaller; one accent border; less purple fill |
| `ConsequenceSimulation` | Clearer Path A/B labels; bigger % text |
| `ActionCommander` | Bigger approve toggles; channel icons + labels |
| `AIDebateMode` | Tighter cards; remove “RECONCILIATION LOG” badge noise |
| `AIDecisionScorecard` | Move inside collapsed More only |
| `ExecutiveVoiceBriefing` | Move inside collapsed More only |
| `AutonomousWorkflowReplay` | Move inside collapsed More; shorter default height |

**Rule:** Max **2** “special effect” cards on screen at once (Decision + Consequence).

---

## Phase 5 — Micro-interactions & quality (~3–4 hours)

- Haptic on Execute (already partial) — consistent on primary actions  
- `Pressable` opacity 0.85 on all chips  
- Skeleton placeholders on Results while rehydrating from history  
- Empty states illustration text on History  
- `keyboardShouldPersistTaps` on Upload (already) — add `KeyboardAvoidingView` on iOS  
- Safe area on bottom sticky bars  

---

## Phase 6 — Hackathon presentation layer (~2 hours)

- **Settings:** “Demo mode” toggle visible with subtitle  
- **First launch onboarding:** 3 slides max, match step bar  
- Optional: **“Judge demo”** button on Home → sets Technology + Board + Sample + navigates Upload  

Align with `DEMO_SCRIPT.md`.

---

## Priority order (what to implement in code)

| Order | Phase | Task | Priority |
|-------|-------|------|----------|
| 1 | 2.2 | Results jump chips + scroll refs | **P0** |
| 2 | 2.1 | Step bar Upload / Analysis / Results | **P0** |
| 3 | 1.1–1.3 | designTokens + Card/Button/Typography + SectionHeader | **P0** |
| 4 | 3.4 | Results collapsible More + Full details | **P0** |
| 5 | 3.2 | Upload split cards + sticky Analyze | **P1** |
| 6 | 2.3 | Auto navigate to Results | **P1** |
| 7 | 3.1 | Home simplify | **P1** |
| 8 | 3.3 | Analysis hero preview | **P1** |
| 9 | 4 | Component tone-down | **P2** |
| 10 | 5–6 | Micro-interactions + judge shortcut | **P2** |

---

## What NOT to do (saves time)

- ❌ Rebuild in NativeWind / Tamagui mid-hackathon  
- ❌ Add new features (charts, chat, strategy simulator)  
- ❌ Custom fonts unless 30 min Google Font hookup  
- ❌ Light mode (dark-only is fine for demo)  
- ❌ Perfect pixel parity on web (mobile demo first)

---

## Success checklist (you’ll feel it when done)

- [ ] New user can explain path: Upload → Analyze → Results in 10 seconds  
- [ ] Results: first viewport shows **alert + decision** without scrolling  
- [ ] Jump chips reach **Actions** in one tap  
- [ ] No more than **2** heavy glow borders visible at once  
- [ ] Upload: Analyze button always visible without scroll  
- [ ] Friend test: “where do I tap next?” — never hesitates  

---

## Suggested work sessions

| Session | Focus | Hours |
|---------|--------|-------|
| **A** | Phase 1 tokens + SectionHeader + Card variants | 4h |
| **B** | Phase 2 step bar + Results jump chips | 4h |
| **C** | Phase 3.4 Results collapse + sticky bottom bar | 4h |
| **D** | Phase 3.2 Upload + 3.3 Analysis | 4h |
| **E** | Phase 4 component pass + friend test | 3h |

**Minimum viable polish before demo:** Sessions **A + B + C** (~12h).

---

## Next step

Tell the agent which phase to **implement first**:

- `"Start Phase 1"` — design tokens + shared components  
- `"Start Phase 2"` — step bar + Results jump chips (fastest judge impact)  
- `"Start P0 only"` — Phase 2.2 + 3.4 collapsible sections only  

Recommended: **`"Start Phase 2"`** then Phase 1 in parallel if two people.
