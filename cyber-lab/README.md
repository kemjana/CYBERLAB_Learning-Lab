# Cyber Lab

Hands-on security challenges with an AI coach, built with Next.js, TypeScript, and the Gemini API.

**Live demo:** _add your Vercel link here_

## Features
- **Phishing desk**: Gemini writes a fresh fictional email each round. Decide if it is a scam and tag the red flags. The answer key is encrypted on the server (AES-256-GCM) and never reaches the browser.
- **Password lab**: client-side strength meter with a crack-time estimate and a which-is-stronger quiz. Nothing is sent to a server.
- **Prompt-injection CTF**: three AI helpdesk bots guard secret flags with increasingly strong defenses, including a server-side output filter on level 3.
- **Security coach**: Gemini tutor restricted to defensive topics.
- **Leaderboard**: Supabase (or in-memory demo mode).

## Security design
- Gemini is only called from server routes. API keys stay in environment variables.
- Gemini JSON is validated before use, with a built-in fallback when the API fails.
- AI routes are rate limited (in-memory; use Redis such as Upstash for multi-instance production).
- Score submissions are capped per challenge on the server.

## Known limitations (good next steps)
- Scores are submitted by the browser, so a determined user could fake them. A next step is server-side sessions that award points.
- In-memory rate limiting resets per server instance.

## Run locally
See `SETUP-GUIDE.md`. Short version: `npm install`, copy `.env.example` to `.env.local`, add `GEMINI_API_KEY`, then `npm run dev`.

All emails, companies, and links in the app are fictional. For education only.
