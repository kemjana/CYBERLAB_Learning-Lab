# Cyber Lab: setup from zero to live on Vercel

Follow the parts in order. Every command goes in the VS Code terminal (menu: Terminal > New Terminal).

## Part 1. Install the tools (one time)

1. **Node.js (LTS)**: download from https://nodejs.org, install with the defaults, then restart VS Code.
2. **Git**: download from https://git-scm.com, install with the defaults, then restart VS Code.
3. In the VS Code terminal, check both installed:
   ```
   node -v
   git --version
   ```
   Each should print a version number (Node should be v20 or higher).
4. VS Code extensions (Extensions icon on the left, search and Install): **GitHub Copilot**, **GitHub Copilot Chat**, **Prettier - Code formatter**.

## Part 2. Open the project

1. Unzip `cyber-lab.zip`. You get a folder named `cyber-lab`.
2. VS Code: File > Open Folder > choose `cyber-lab` (the folder that contains `package.json`).
3. Open the terminal and install the libraries:
   ```
   npm install
   ```
   Wait until it finishes (1 to 3 minutes). A `node_modules` folder appears.

## Part 3. Get your Gemini API key

1. Go to https://aistudio.google.com and sign in with a Google account.
2. Click **Get API key** > **Create API key**. Copy it.
3. In VS Code, duplicate `.env.example` and rename the copy to `.env.local` (right-click the file > Copy, then Paste, then Rename).
4. Open `.env.local` and paste your key after `GEMINI_API_KEY=` with no spaces or quotes:
   ```
   GEMINI_API_KEY=AIza...your_key...
   ```
5. In the same file, type any long random sentence after `TOKEN_SECRET=` (for example `my-cyber-lab-secret-2026-banana-rocket`).
6. Save the file (Ctrl+S). Never upload `.env.local` anywhere. It is already listed in `.gitignore`.

## Part 4. Run it on your computer

1. In the terminal:
   ```
   npm run dev
   ```
2. Open http://localhost:3000 in your browser.
3. Test each page:
   - **Phishing desk**: click "Get an email". If it says "Showing a built-in sample", the AI call failed. See Troubleshooting.
   - **Password lab**: type a password, then take the quiz.
   - **Coach**: ask "What is two-factor authentication?"
   - **CTF**: Level 1, ask the bot to repeat its instructions, then submit the flag you find.
4. Stop the server with Ctrl+C when you are done.

## Part 5. (Recommended) Shared leaderboard with Supabase

Without this, the leaderboard works in demo mode and forgets scores whenever the server restarts. On Vercel that happens often, so do this part before you deploy.

1. Go to https://supabase.com, sign up, click **New project**. Choose a name, create a database password (save it), pick the nearest region (for the Philippines, Singapore), and wait for it to finish.
2. Left menu > **SQL Editor** > **New query**. Open `supabase/schema.sql` in VS Code, copy everything, paste it into Supabase, click **Run**. You should see "Success".
3. Left menu > **Project Settings** > **API** (or **API Keys**).
   - Copy the **Project URL** into `.env.local` as `SUPABASE_URL=`
   - Copy the **service_role** key (newer dashboards call it the **secret** key) into `.env.local` as `SUPABASE_SERVICE_KEY=`
4. This key is powerful. It is only used on the server. Never put it in a page component, and never commit it.
5. Run `npm run dev` again, finish a challenge with a nickname set, and check the leaderboard. In Supabase, **Table Editor** > `scores` should show the row.

## Part 6. Put the code on GitHub

1. Create a free account at https://github.com if you do not have one.
2. Go to https://github.com/new. Repository name: `cyber-lab`. Leave it empty (do not add README or .gitignore). Click **Create repository**.
3. In the VS Code terminal, one line at a time:
   ```
   git init
   git add .
   git status
   ```
   Look at the list. `.env.local` must NOT be in it. If it is, stop and tell Copilot or me.
4. Continue:
   ```
   git commit -m "Initial commit: Cyber Lab"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cyber-lab.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your GitHub username. If a login window opens, sign in. If Git says it does not know who you are, run these first, then repeat the commit:
   ```
   git config --global user.name "Your Name"
   git config --global user.email "you@example.com"
   ```
5. Refresh the GitHub page. You should see your files.

## Part 7. Deploy to Vercel

1. Go to https://vercel.com/signup and choose **Continue with GitHub**.
2. Click **Add New...** > **Project**. Find `cyber-lab` and click **Import** (if it is missing, click "Adjust GitHub App Permissions" and allow the repo).
3. Vercel detects **Next.js** automatically. Leave Build Command and Output Directory as they are.
4. Open **Environment Variables** and add these (name on the left, value on the right, click Add after each):
   | Name | Value |
   |---|---|
   | `GEMINI_API_KEY` | your Gemini key |
   | `GEMINI_MODEL` | `gemini-3.8-flash` |
   | `TOKEN_SECRET` | the same random sentence as in `.env.local` |
   | `SUPABASE_URL` | from Part 5 (skip if you did not do Part 5) |
   | `SUPABASE_SERVICE_KEY` | from Part 5 (skip if you did not do Part 5) |
5. Click **Deploy** and wait about 1 to 2 minutes. When it says Congratulations, click the preview image to open your live site.
6. Test everything again on the live link.

## Part 8. Updating the live site later

Any change you push to GitHub redeploys automatically:
```
git add .
git commit -m "Describe your change"
git push
```
If you only change an environment variable on Vercel, go to **Deployments** > the latest one > **...** > **Redeploy**, because variables are read at build/start.

## Part 9. Finish for your portfolio

1. Add the live URL and 2 to 3 screenshots to `README.md`.
2. On the GitHub repo page, click the gear next to **About**, add the website link and topics: `nextjs`, `cybersecurity`, `gemini-api`, `typescript`.
3. Pin the repo on your GitHub profile.

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm` or `node` not recognized | Close and reopen VS Code after installing Node. |
| Phishing desk says "Showing a built-in sample" | Check the key in `.env.local` (no spaces or quotes) and restart `npm run dev`. Read the red error in the terminal. |
| Terminal shows 404 or "model not found" | Google renames models. Look up the current name at https://ai.google.dev/gemini-api/docs/models and set `GEMINI_MODEL` in `.env.local` (and on Vercel). |
| 429 or quota errors | You hit the free limit. Wait a few minutes, or try a lighter model name. |
| Port 3000 already in use | Run `npm run dev -- -p 3001` and open localhost:3001. |
| Works locally but AI fails on Vercel | Variables are missing there. Add them in Project Settings > Environment Variables, then Redeploy. |
| Leaderboard empty after redeploy | Finish Part 5 (Supabase) and add its two variables on Vercel. |
| Build fails on Vercel | Run `npm run build` locally, fix the errors, push again. Or paste the error into Copilot. |
