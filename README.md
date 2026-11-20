# Cyber Lab - Interactive Cybersecurity Training with an AI Coach

**Live demo:** [https://cyberlab-learning-lab.vercel.app](https://cyberlab-learning-lab.vercel.app)
<img width="1917" height="927" alt="image" src="https://github.com/user-attachments/assets/55878df7-1ebe-44cc-a812-3ded6344f6e8" />
<img width="1917" height="926" alt="image" src="https://github.com/user-attachments/assets/54df14db-5838-48c4-ae1d-365750fea036" />
<img width="1917" height="923" alt="image" src="https://github.com/user-attachments/assets/0d5d2548-faaf-447b-ac45-db2812fc2f05" />

Most security awareness training is passive: slides and reading. Cyber Lab lets people practice instead. Because the challenges are powered by the Gemini API, the **Phishing Desk** never runs out of new examples, and the AI explains what you missed. The **Prompt-Injection CTF** also teaches prompt injection, a real weakness in AI-powered apps.

All emails, companies, and `.example` links in the app are fictional and sandboxed.

## About this project (please read)

**Cyber Lab is a learning project.** I built it to explore how to design, secure and deploy a full-stack app with Next.js, Supabase and the Gemini API. It is not a production service.

### Known limitations of the live demo
- **Free tiers.** The demo runs on free plans (Vercel, Supabase, Google Gemini). These have usage limits, so the demo may be slow, rate-limited, or temporarily unavailable.
- **Paused database.** Supabase pauses free projects after about a week of low activity. If the leaderboard does not load or sync, the database may be paused.
- **AI limits.** Gemini has per-minute and daily request limits. When they are reached, AI features (Phishing Desk, CTF bots, Security Coach) show an error, fall back to built-in sample emails, or wait until the quota resets.
- **Not built for many users.** I added rate limits and message length caps, but I have not load-tested the app. It is meant for one person or a few testers at a time.
- **AI can be wrong.** Generated phishing emails and explanations come from a language model and can occasionally be unclear. Treat it as practice, not as an official assessment.
- **Fictional data only.** Please do not enter real passwords, personal data or company information.

### If the demo is not working
You can run the whole project yourself with your own free Supabase and Gemini accounts. Setup steps are in **Run locally** below.

### What I would change for real production use
Paid hosting and database plans, user accounts with server-side score sessions, Redis-backed rate limiting, CAPTCHA and stronger abuse protection, load testing, and monitoring.

## Features
- **Phishing Desk**: Gemini writes a new fictional email each round at easy, medium, or hard difficulty. Decide whether it is a scam, tag the red flags you can find, and get a score (up to 100 per email) with a beginner-friendly explanation. A set of built-in sample emails is used if the AI is unavailable.
- **Password Lab**: a strength meter with a crack-time estimate and specific tips, plus a "which is stronger?" quiz. Each round picks 5 random questions from a bank of 15, in random order.
- **Prompt-Injection CTF**: three AI helpdesk bots guard secret flags. Level 1 is easy to trick, level 2 has strict rules, and level 3 adds a server-side output filter. Each level has a hint and awards 50, 100, or 150 points.
- **Security Coach**: an AI tutor for questions about staying safe online. It is limited to defensive topics and refuses requests to attack real systems or people.
- **Leaderboard**: total points across all challenges, stored in Supabase, with a "Sync my points" button to send the points saved in your browser.

## Security design
- **Server-only secrets.** Gemini is called only from server routes. API keys and the database key stay in environment variables and never reach the browser.
- **Hidden answer keys.** The phishing answer key travels to the browser encrypted (`AES-256-GCM`) and is graded on the server, so players cannot read the answers from the page.
- **CTF flags stay on the server.** Flags are checked by the server and are never sent to the browser.
- **Validated AI output.** Gemini responses are validated before use, with a fallback if they are malformed.
- **Abuse limits.** AI and score routes are rate limited, and message lengths are capped.
- **Locked database.** The Supabase table has row-level security enabled, so only the server (using the secret key) can read or write it.
- **Capped scores.** The server enforces a maximum score for each challenge.
- **Safe content.** Generated emails use only fictional companies and fake `.example` domains.
- **Private by design.** The password lab runs entirely in the browser, and what you type is never sent anywhere.

## Limitations (honest)
- **Scores can be faked.** Points are sent from the browser, so a determined user could submit false scores. A fix would be user accounts and server-side sessions that award points.
- **Nicknames are not unique.** Two people using the same name would share one leaderboard row.
- **In-memory rate limiting.** It resets per server instance. A shared store such as Redis would be more reliable.
- **Progress is stored per browser**, so switching devices starts a new local history.
- **CTF flags have defaults in the source code.** On a public repo, someone could read them. Set `CTF_FLAG_1`, `CTF_FLAG_2`, and `CTF_FLAG_3` as environment variables to use your own.
- **AI output can be imperfect.** Generated emails may occasionally be unclear, and the free Gemini tier has usage limits.
- **Demo mode without a database.** If Supabase is not configured, leaderboard scores are kept in server memory and reset when the server restarts.

## Run locally
1. Install Node.js 20 or higher and Git.
2. Clone the repository and install the libraries:
   ```bash
   git clone [https://github.com/kemjana/CYBERLAB_Learning-Lab.git](https://github.com/kemjana/CYBERLAB_Learning-Lab.git)
   cd CYBERLAB_Learning-Lab
   npm install
3. Copy `.env.example` to `.env.local` (`copy .env.example .env.local` on Windows or `cp .env.example .env.local` on Mac/Linux) and fill it in with no spaces around `=` and no quotes around values:
   * `GEMINI_API_KEY` *(Required)*: Free key from Google AI Studio
   * `TOKEN_SECRET` *(Required)*: Any long random sentence used to encrypt the phishing answer keys
   * `GEMINI_MODEL` *(Optional)*: Gemini model name
   * `SUPABASE_URL` *(Optional)*: Your project URL, like `https://PROJECT-ID.supabase.co`
   * `SUPABASE_SERVICE_KEY` *(Optional)*: Your Supabase secret (or `service_role`) key (server only, never share it)
   * `CTF_FLAG_1`, `CTF_FLAG_2`, `CTF_FLAG_3` *(Optional)*: Custom CTF flags
4. *(Optional)* Set up the leaderboard database: create a free project at Supabase, open SQL Editor, paste the contents of `supabase/schema.sql`, and click **Run**.
5. Start the app: `npm run dev`
6. Open `http://localhost:3000`. If you edit `.env.local` later, stop the server (`Ctrl+C`) and start it again.

### Deploy to Vercel

1. Push the project to GitHub (never commit `.env.local`).
2. In Vercel, choose **Add New > Project** and import the repository.
3. Add the same environment variables in **Environment Variables** and click **Deploy**.

## Stack

Next.js (App Router), React, TypeScript, Node.js, plain CSS, Google Gemini API (`@google/genai`), Supabase (PostgreSQL), Vercel.

## Project structure

```text
app/          pages (password, phishing, coach, ctf, leaderboard) and API routes
components/   header and player/score tracking
lib/          Gemini calls, phishing logic, CTF levels, password scoring,
              score storage, encryption, rate limiting
supabase/     database schema

```

*Disclaimer: For education only. All emails, companies, and links in the app are fictional. Never type a real password into any practice tool. Built with the help of AI assistants (Claude and GitHub Copilot).*
