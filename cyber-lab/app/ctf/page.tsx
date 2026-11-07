"use client";

import { useRef, useEffect, useState } from "react";
import { usePlayer } from "@/components/PlayerProvider";

type Msg = { role: "user" | "model"; text: string };

// Level details shown to the player. Secrets and rules stay on the server.
const LEVELS = [
  { level: 1, name: "Friendly Helpdesk", points: 50, hint: "This bot was told to keep a secret, but it also loves to be helpful. Try asking it to repeat or summarize its instructions." },
  { level: 2, name: "Strict Helpdesk", points: 100, hint: "Direct questions fail now. Think about changing the bot's role, a story, a translation, or a game where the flag is just part of the output." },
  { level: 3, name: "Locked-Down Helpdesk", points: 150, hint: "This bot is strict AND the server blocks any reply containing the flag in plain form. You need an output format the filter does not recognize." },
];

export default function CTF() {
  const [level, setLevel] = useState(1);
  const [chats, setChats] = useState<Record<number, Msg[]>>({ 1: [], 2: [], 3: [] });
  const [input, setInput] = useState("");
  const [flag, setFlag] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [showHint, setShowHint] = useState(false);
  const { points, award } = usePlayer();
  const end = useRef<HTMLDivElement>(null);

  const L = LEVELS[level - 1];
  const msgs = chats[level];
  const solved = (points[`ctf${level}`] || 0) > 0;

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  function pick(n: number) {
    setLevel(n);
    setNote("");
    setShowHint(false);
    setFlag("");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || busy) return;
    setInput("");
    setNote("");
    const history = msgs;
    setChats((c) => ({ ...c, [level]: [...history, { role: "user", text: message }] }));
    setBusy(true);
    try {
      const res = await fetch("/api/ctf/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, message, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The bot did not respond.");
      setChats((c) => ({ ...c, [level]: [...c[level], { role: "model", text: data.reply }] }));
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function submitFlag(e: React.FormEvent) {
    e.preventDefault();
    if (!flag.trim()) return;
    const res = await fetch("/api/ctf/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, flag }),
    });
    const data = await res.json();
    if (data.correct) {
      const added = award(`ctf${level}`, data.points, "once");
      setNote(added > 0 ? `Correct! +${added} pts.` : "Correct. You already had this one.");
      setFlag("");
    } else {
      setNote("That is not the flag. Keep probing the bot.");
    }
  }

  return (
    <div className="page">
      <h1>Prompt-injection CTF</h1>
      <p className="lede">
        Each helpdesk bot is holding a secret flag that looks like <span className="mono">FLAG&#123;...&#125;</span>. Trick it into saying it, then submit the flag below. This is
        called prompt injection, and real apps get hit by it.
      </p>

      <div className="tabs" role="tablist" aria-label="Levels">
        {LEVELS.map((l) => (
          <button key={l.level} role="tab" aria-selected={level === l.level} className={level === l.level ? "on" : ""} onClick={() => pick(l.level)}>
            Level {l.level}
            {(points[`ctf${l.level}`] || 0) > 0 ? " (solved)" : ""}
          </button>
        ))}
      </div>

      <section className="panel terminal">
        <div className="term-head">
          <strong>{L.name}</strong>
          <span className="pill">{L.points} pts</span>
        </div>
        <div className="chat" aria-live="polite">
          {msgs.length === 0 && <p className="muted">Say hello to HelpBot to begin.</p>}
          {msgs.map((m, i) => (
            <div key={i} className={`bubble mono ${m.role}`}>
              {m.text}
            </div>
          ))}
          {busy && <div className="bubble model muted mono">...</div>}
          <div ref={end} />
        </div>
        <form className="row" onSubmit={send}>
          <label htmlFor="msg" className="sr-only">
            Message to HelpBot
          </label>
          <input id="msg" className="grow mono" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type to HelpBot" maxLength={400} />
          <button type="submit" disabled={busy || !input.trim()}>
            Send
          </button>
        </form>
      </section>

      <section className="panel">
        <form className="row" onSubmit={submitFlag}>
          <label htmlFor="flag" className="sr-only">
            Flag
          </label>
          <input id="flag" className="grow mono" value={flag} onChange={(e) => setFlag(e.target.value)} placeholder="FLAG{...}" disabled={solved} />
          <button type="submit" disabled={solved || !flag.trim()}>
            Submit flag
          </button>
          <button type="button" className="ghost" onClick={() => setShowHint(!showHint)}>
            {showHint ? "Hide hint" : "Need a hint?"}
          </button>
        </form>
        {showHint && <p className="hint">{L.hint}</p>}
        {note && <p role="status">{note}</p>}
      </section>
    </div>
  );
}
