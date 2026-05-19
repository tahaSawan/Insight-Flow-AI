# InsightFlow AI

**Mobile AI decision-support app** — transform reports, PDFs, and business text into executive insights, automated actions, and projected impact.

Built for hackathon demos with **Expo 55**, **React Native**, and **Google Gemini 2.5**.

## Core features

| Feature | Description |
|---------|-------------|
| **Upload** | Paste text, upload `.txt` or `.pdf` (PDF extracted via Gemini) |
| **Industry modes** | General, Finance, Healthcare, Technology |
| **AI Analysis** | Progress bar, live orchestrator, insight preview before results |
| **Decision Report** | Executive summary, risks, findings, actions, impact metrics |
| **Insight-to-Action** | AI-generated simulated actions + animated execution logs |
| **Tap to explain** | Tap any finding, risk, or action for AI explanation |
| **Follow-up Q&A** | Ask questions grounded in your document |
| **CEO Brief** | 4-bullet presentation talking points |
| **History** | Last 20 analyses saved on device |
| **Export** | Share sheet + copy to clipboard |

## Setup

```bash
npm install
cp .env.example .env
# Add EXPO_PUBLIC_GEMINI_API_KEY from https://aistudio.google.com/apikey
npx expo start
```

Open in **Expo Go** on your phone (scan QR).

## Demo flow (2 minutes)

1. **Home** → Start Analysis  
2. **Upload** → Technology → Load sample **or** upload PDF  
3. **Analysis** → watch progress → **View Full Decision Report**  
4. **Results** → scroll → tap a finding to explain → **Generate CEO Brief**  
5. Ask: *"What should we do in the next 48 hours?"*  
6. **Share Report** → show History tab  

## Tech stack

- React Native + Expo 55 + Expo Router  
- Google Gemini API (`gemini-2.5-flash`)  
- AsyncStorage (history), expo-file-system (documents), expo-clipboard  

## Security

Never commit `.env`. Rotate API keys if exposed.
