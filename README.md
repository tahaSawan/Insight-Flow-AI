# InsightFlow AI

Mobile app that turns reports and business text into **AI insights** and **actionable recommendations** using Google Gemini.

Built with **Expo 55**, **React Native**, and **Expo Router**.

## Features

- Paste long-form content for analysis
- Gemini-powered structured output (risks, findings, actions, impact metrics)
- Insight-to-Action results view (simulated execution logs and outcomes)
- Dark, mobile-first UI

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment template and add your API key from [Google AI Studio](https://aistudio.google.com/apikey):

   ```bash
   cp .env.example .env
   ```

   Set in `.env`:

   ```
   EXPO_PUBLIC_GEMINI_API_KEY=your_key_here
   ```

3. Start the app:

   ```bash
   npx expo start
   ```

4. Open on your phone with **Expo Go** (scan QR) or press `a` / `i` for emulator.

## Demo flow (hackathon)

1. Open **Upload** → tap **Load sample report**
2. Tap **Start AI Analysis**
3. Watch **Analysis** process with Gemini
4. Review **Results** (insights, risks, actions, projected impact)

## Tech stack

| Technology | Purpose |
|------------|---------|
| React Native + Expo | Cross-platform mobile |
| Expo Router | File-based navigation |
| Gemini API | AI analysis |
| TypeScript | App logic |

## Security

Never commit `.env`. The API key is loaded via `EXPO_PUBLIC_GEMINI_API_KEY` at build time. Rotate your key if it was ever exposed in git history.
