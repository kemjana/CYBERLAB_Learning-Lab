# Cyber Lab

An interactive cybersecurity training lab with an AI coach, phishing exercises,
a password-strength lab, and a prompt-injection CTF. The app is built with
Next.js, TypeScript, React, and CSS, and uses Gemini for its AI features.

## Project files

The application and its detailed documentation are in [`cyber-lab/`](./cyber-lab/):

- [Project README](./cyber-lab/README.md)
- [Setup guide](./cyber-lab/SETUP-GUIDE.md)

## Run locally

From the repository root:

```powershell
cd cyber-lab
npm install
Copy-Item .env.example .env.local
```

Add your Gemini API key to `cyber-lab/.env.local`, then start the app:

```powershell
npm run dev
```

Open http://localhost:3000. See the [setup guide](./cyber-lab/SETUP-GUIDE.md)
for environment variables, Supabase setup, and deployment instructions.

Never commit `.env.local` or share API keys. The app uses fictional scenarios
for education only.
