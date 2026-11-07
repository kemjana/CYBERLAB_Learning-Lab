# Copilot prompt (paste into GitHub Copilot Chat in VS Code)

Tip: open Copilot Chat (Ctrl+Alt+I), switch the mode to **Agent** (or Edit), then paste everything inside the box below.
Replace the line `MY REQUEST:` with what you want changed. Change one thing at a time.

```
You are helping me modify "Cyber Lab", a Next.js (App Router) + TypeScript cybersecurity learning site that uses the Gemini API through @google/genai.

PROJECT MAP (read these files before changing anything):
- app/page.tsx, app/layout.tsx, app/globals.css: home page, layout, all styling (plain CSS, no Tailwind)
- app/password, app/phishing, app/coach, app/ctf, app/leaderboard: one client page per feature
- app/api/phishing (GET creates an AI email), app/api/phishing/grade (POST grades), app/api/coach, app/api/ctf/chat, app/api/ctf/submit, app/api/score: server routes
- lib/gemini.ts (the only place that calls Gemini), lib/phishing.ts, lib/ctf.ts (secret flags and bot rules, server only), lib/password.ts, lib/scores.ts (Supabase REST or in-memory), lib/crypto.ts (encrypts the phishing answer key), lib/rateLimit.ts
- components/PlayerProvider.tsx (nickname and points in localStorage), components/Header.tsx

RULES YOU MUST FOLLOW:
1. Never call Gemini from client components. Gemini calls stay in app/api routes through lib/gemini.ts.
2. Never expose GEMINI_API_KEY, SUPABASE_SERVICE_KEY, TOKEN_SECRET, CTF flags, or phishing answer keys to the browser.
3. Keep the Gemini model name configurable through the GEMINI_MODEL environment variable.
4. Validate any JSON returned by Gemini before using it, and keep the built-in fallback behavior when Gemini fails.
5. Keep TypeScript strict. No new dependencies unless I approve them first; tell me the exact npm install command if one is needed.
6. Keep the existing visual style (CSS variables at the top of app/globals.css) and keep it accessible: labels on inputs, visible focus, works on mobile.
7. Make the smallest change that does the job. Do not rewrite unrelated files or rename files.
8. When you finish, run `npm run build`, fix any errors, then give me: (a) a list of files you changed, (b) what I should test in the browser, (c) any new environment variable I must add in .env.local and in Vercel.

MY REQUEST:
[Describe the change here. Example: "Add a 'Hard mode' timer of 30 seconds to the phishing desk that gives half points if time runs out."]
```

## Ready-made requests you can paste in place of MY REQUEST

- Add a daily streak counter in the header that increases when I earn points on a new day (store it in localStorage).
- Add a 4th CTF level where the bot is told to only speak in questions, with its own flag set through CTF_FLAG_4 and 200 points. Update lib/ctf.ts, lib/scores.ts MAX_POINTS, and the level list in app/ctf/page.tsx.
- Add a "Why did I miss this?" button on the phishing result that asks Gemini for a 2-sentence personalized tip using the flags I missed, through a new API route.
- Add dark mode with a toggle in the header, using the existing CSS variables.
- Add a 'Share my score' button that copies "I scored N points on Cyber Lab" to the clipboard.
