"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "model"; text: string };
const STARTERS = ["What is two-factor authentication?", "How do I spot a fake login page?", "Why are password managers safe?", "What is SQL injection, simply?"];

function formatCoachReply(text: string) {
  return text.split(/(\*\*[\s\S]+?\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function Coach() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [msgs, busy]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    setError("");
    setInput("");
    const history = msgs;
    setMsgs([...history, { role: "user", text: message }]);
    setBusy(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "The coach could not answer.");
      setMsgs((m) => [...m, { role: "model", text: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <h1>Security coach</h1>
      <p className="lede">Ask about phishing, passwords, privacy, or how attacks work. The coach only teaches defense.</p>

      <div className="chat" aria-live="polite">
        {msgs.length === 0 && (
          <div className="starters">
            {STARTERS.map((s) => (
              <button key={s} className="ghost" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`bubble ${m.role}`}>
            {m.role === "model" ? formatCoachReply(m.text) : m.text}
          </div>
        ))}
        {busy && <div className="bubble model muted">Thinking...</div>}
        <div ref={end} />
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="q" className="sr-only">
          Your question
        </label>
        <input id="q" className="grow" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the coach a question" maxLength={500} />
        <button type="submit" disabled={busy || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
