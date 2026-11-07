"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { usePlayer } from "./PlayerProvider";

const LINKS = [
  { href: "/password", label: "Password lab" },
  { href: "/phishing", label: "Phishing desk" },
  { href: "/ctf", label: "Prompt-injection CTF" },
  { href: "/coach", label: "Coach" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Header() {
  const path = usePathname();
  const { ready, name, total, setName } = usePlayer();
  const [draft, setDraft] = useState("");

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link href="/" className="brand">
          Cyber Lab
        </Link>
        <nav aria-label="Main">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? "page" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="player">
          {ready && name ? (
            <>
              <span className="player-name">{name}</span>
              <span className="pill">{total} pts</span>
              <button className="link-btn" onClick={() => setName("")}>
                Change name
              </button>
            </>
          ) : (
            ready && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setName(draft);
                  setDraft("");
                }}
              >
                <label className="sr-only" htmlFor="nick">
                  Nickname for the leaderboard
                </label>
                <input id="nick" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Pick a nickname" maxLength={20} />
                <button type="submit" disabled={!draft.trim()}>
                  Save
                </button>
              </form>
            )
          )}
        </div>
      </div>
    </header>
  );
}
