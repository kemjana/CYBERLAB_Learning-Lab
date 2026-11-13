# Cyber Lab

**Interactive cybersecurity training with an AI coach.** Practice spotting phishing emails, testing password strength, and attacking an AI chatbot in a capture-the-flag game.

**Live demo:** cyberlab-learning-lab.vercel.app
**Source code:** https://github.com/kemjana/CYBERLAB_Learning-Lab
<img width="1917" height="927" alt="image" src="https://github.com/user-attachments/assets/55878df7-1ebe-44cc-a812-3ded6344f6e8" />
<img width="1917" height="926" alt="image" src="https://github.com/user-attachments/assets/54df14db-5838-48c4-ae1d-365750fea036" />

## Purpose

Most security awareness training is passive: slides and reading. Cyber Lab lets people practice instead. Because the challenges are powered by the Gemini API, the phishing desk never runs out of new examples, and the AI explains what you missed. The CTF also teaches prompt injection, a real weakness in AI-powered apps.

## Features

- **Phishing Desk:** Gemini writes a new fictional email each round at easy, medium, or hard difficulty. Decide whether it is a scam, tag the red flags you can find, and get a score (up to 100 per email) with a beginner-friendly explanation. A set of built-in sample emails is used if the AI is unavailable.
- **Password Lab:** a strength meter with a crack-time estimate and specific tips, plus a "which is stronger?" quiz. Each round picks 5 random questions from a bank of 15, in random order.
- **Prompt-Injection CTF:** three AI helpdesk bots guard secret flags. Level 1 is easy to trick, level 2 has strict rules, and level 3 adds a server-side output filter. Each level has a hint and awards 50, 100, or 150 points.
- **Security Coach:** an AI tutor for questions about staying safe online. It is limited to defensive topics and refuses requests to attack real systems or people.
- **Leaderboard:** total points across all challenges, stored in Supabase, with a "Sync my points" button to send the points saved in your browser.

## Security design

- **Server-only secrets.** Gemini is called only from server routes. API keys and the database key stay in environment variables and never reach the browser.
- **Hidden answer keys.** The phishing answer key travels to the browser encrypted (AES-256-GCM) and is graded on the server, so players cannot read the answers from the page.
- **CTF flags stay on the server.** Flags are checked by the server and are never sent to the browser.
- **Validated AI output.** Gemini responses are validated before use, with a fallback if they are malformed.
- **Abuse limits.** AI and score routes are rate limited, and message lengths are capped.
- **Locked database.** The Supabase table has row-level security enabled, so only the server (using the secret key) can read or write it.
- **Capped scores.** The server enforces a maximum score for each challenge.
- **Safe content.** Generated emails use only fictional companies and fake `.example` domains.
- **Private by design.** The password lab runs entirely in the browser, and what you type is never sent anywhere.

## Limitations

- **Scores can be faked.** Points are sent from the browser, so a determined user could submit false scores. A fix would be user accounts and server-side sessions that award points.
- **Nicknames are not unique.** Two people using the same name would share one leaderboard row.
- **In-memory rate limiting.** It resets per server instance. A shared store such as Redis would be more reliable.
- **Progress is stored per browser,** so switching devices starts a new local history.
- **CTF flags have defaults in the source code.** On a public repo, someone could read them. Set `CTF_FLAG_1`, `CTF_FLAG_2`, and `CTF_FLAG_3` as environment variables to use your own.
- **AI output can be imperfect.** Generated emails may occasionally be unclear, and the free Gemini tier has usage limits.
- **Demo mode without a database.** If Supabase is not configured, leaderboard scores are kept in server memory and reset when the server restarts.

## Tech stack

Next.js (App Router), React, TypeScript, Node.js, plain CSS, Google Gemini API (`@google/genai`), Supabase (PostgreSQL), Vercel, Git and GitHub.

## Run locally

**Requirements:** [Node.js](https://nodejs.org) 20 or higher and [Git](https://git-scm.com).

1. **Clone the repository and install the libraries:**
   ```bash
   git clone https://github.com/kemjana/CYBERLAB_Learning-Lab.git
   cd CYBERLAB_Learning-Lab
   npm install
   ```

2. **Create your environment file.** Copy `.env.example` to a new file named `.env.local`:
   ```bash
   # Windows
   copy .env.example .env.local
   # Mac / Linux
   cp .env.example .env.local
   ```

3. **Fill in `.env.local`.** Use no spaces around `=` and no quotes around values.

   | Variable | Required | Purpose |
   |---|---|---|
   | `GEMINI_API_KEY` | Yes | Free key from [Google AI Studio](https://aistudio.google.com) |
   | `TOKEN_SECRET` | Yes | Any long random sentence. Used to encrypt the phishing answer keys |
   | `GEMINI_MODEL` | Optional | Gemini model name. Model names change, so check Google's docs if you get a "model not found" error |
   | `SUPABASE_URL` | Optional | Your project URL, like `https://PROJECT-ID.supabase.co` (no extra path) |
   | `SUPABASE_SERVICE_KEY` | Optional | Your Supabase **secret** (or service_role) key. Server only, never share it |
   | `CTF_FLAG_1`, `CTF_FLAG_2`, `CTF_FLAG_3` | Optional | Custom CTF flags |

4. **(Optional) Set up the leaderboard database.** Create a free project at [Supabase](https://supabase.com), open **SQL Editor**, paste the contents of `supabase/schema.sql`, and click **Run**.

5. **Start the app:**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000. If you edit `.env.local` later, stop the server (Ctrl+C) and start it again.

## Deploy to Vercel

1. Push the project to GitHub (never commit `.env.local`).
2. In [Vercel](https://vercel.com), choose **Add New > Project** and import the repository.
3. Add the same environment variables from the table above in **Environment Variables**.
4. Click **Deploy**. After changing a variable later, use **Redeploy**.

## Project structure

```
app/          pages (password, phishing, coach, ctf, leaderboard) and API routes
components/   header and player/score tracking
lib/          Gemini calls, phishing logic, CTF levels, password scoring,
              score storage, encryption, rate limiting
supabase/     database schema
```

## Disclaimer

For education only. All emails, companies, and links in the app are fictional. Never type a real password into any practice tool.

Built with the help of AI assistants (Claude and GitHub Copilot).
