# InsightFlow AI — Design System

Single source of truth: **`src/constants/designTokens.ts`**  
Barrel export: **`src/constants/theme.ts`**

## Palette (AI operations dashboard)

| Token | Value | Use |
|-------|--------|-----|
| `colors.bg` | `#050A12` | App background |
| `colors.surface` | `#0B1220` | Cards |
| `colors.surfaceElevated` | `#111827` | Raised cards, tab bar, footers |
| `colors.accent` | `#22D3EE` | Primary — CTAs, links, active states |
| `colors.accentSecondary` | `#10B981` | Secondary — success, growth, “act” |
| `colors.warning` | `#F59E0B` | Caution, risk paths |
| `colors.danger` | `#EF4444` | Errors, critical alert |
| `colors.text` | `#F8FAFC` | Primary text |
| `colors.textMuted` | `#94A3B8` | Captions, hints |
| `colors.border` | `rgba(148,163,184,0.18)` | Default borders |

Extended semantic shades (timelines, depth): `dangerLight`, `dangerDeep`, `successLight`, `successDeep`, `surfaceInactive`.

## Usage

```tsx
import { colors, spacing, radius, shadows } from '@/constants/designTokens';
// or
import { theme } from '@/constants/theme';
```

## Components

- **Buttons:** gradient `accent` → `accentSecondary`
- **Cards:** `default` | `elevated` | `accent` | `outline`
- **Screens:** wrap with `<AppScreen>` for background atmosphere

## Rules

1. No new hex in screens — add a token if needed.
2. Max two elevated/accent shadows visible at once on Results.
3. Semantic colors only for meaning (risk = warning/danger, not decoration).
