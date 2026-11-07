"use client";

import { useState } from "react";
import { FLAG_OPTIONS } from "@/lib/phishing";
import { usePlayer } from "@/components/PlayerProvider";

type Email = { from: string; subject: string; body: string; links: { text: string; url: string }[]; attachment?: string };
type Result = { correctVerdict: boolean; isPhishing: boolean; correctFlags: string[]; explanation: string; points: number };

export default function PhishingDesk() {
  const [difficulty, setDifficulty] = useState("medium");
  const [email, setEmail] = useState<Email | null>(null);
  const [token, setToken] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verdict, setVerdict] = useState<"phishing" | "legit" | "">("");
  const [flags, setFlags] = useState<string[]>([]);
  const [showUrls, setShowUrls] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const { award } = usePlayer();

  async function load() {
    setLoading(true);
    setError("");
    setResult(null);
    setVerdict("");
    setFlags([]);
    setShowUrls(false);
    try {
      const res = await fetch(`/api/phishing?difficulty=${difficulty}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not load an email.");
      setEmail(data.email);
      setToken(data.token);
      setSource(data.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!verdict) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/phishing/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verdict, flags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not grade your answer.");
      setResult(data);
      award("phishing", data.points, "add");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const toggle = (id: string) => setFlags((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const locked = Boolean(result);

  return (
    <div className="page">
      <h1>Phishing desk</h1>
      <p className="lede">Read the email. Decide if it is a scam. Tag the red flags you can find. Each email is written fresh by Gemini.</p>

      <div className="row">
        <label htmlFor="diff">Difficulty</label>
        <select id="diff" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={load} disabled={loading}>
          {loading && !email ? "Writing an email..." : email ? "Next email" : "Get an email"}
        </button>
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {email && (
        <div className="split">
          <article className="mail big-mail" aria-label="Email to review">
            <div className="mail-head">
              <div>
                <strong>From:</strong> {email.from}
              </div>
              <div>
                <strong>Subject:</strong> {email.subject}
              </div>
              {email.attachment && (
                <div>
                  <strong>Attachment:</strong> {email.attachment}
                </div>
              )}
            </div>
            <p className="mail-body">{email.body}</p>
            {email.links.map((l) => (
              <p key={l.url} className="fake" title={l.url}>
                {l.text}
                {showUrls && <span className="url mono">{l.url}</span>}
              </p>
            ))}
            {email.links.length > 0 && (
              <button className="link-btn" onClick={() => setShowUrls(!showUrls)}>
                {showUrls ? "Hide link addresses" : "Inspect link addresses"}
              </button>
            )}
            {source === "sample" && <p className="muted small">Showing a built-in sample (the AI was unavailable).</p>}
          </article>

          <div className="panel">
            <h2>Your call</h2>
            <div className="duel">
              <button className={`choice ${verdict === "phishing" ? "picked" : ""}`} onClick={() => setVerdict("phishing")} disabled={locked} aria-pressed={verdict === "phishing"}>
                Phishing
              </button>
              <button className={`choice ${verdict === "legit" ? "picked" : ""}`} onClick={() => setVerdict("legit")} disabled={locked} aria-pressed={verdict === "legit"}>
                Legitimate
              </button>
            </div>
            <fieldset disabled={locked}>
              <legend>Red flags you can see</legend>
              {FLAG_OPTIONS.map((f) => {
                const mark = result ? (result.correctFlags.includes(f.id) ? "was-flag" : flags.includes(f.id) ? "was-wrong" : "") : "";
                return (
                  <label key={f.id} className={`check ${mark}`}>
                    <input type="checkbox" checked={flags.includes(f.id)} onChange={() => toggle(f.id)} />
                    {f.label}
                  </label>
                );
              })}
            </fieldset>
            {!result && (
              <button onClick={submit} disabled={!verdict || loading}>
                Check my answer
              </button>
            )}
            {result && (
              <div className="feedback" role="status">
                <p className="big">
                  {result.correctVerdict ? "Right call." : "Not this time."} It was {result.isPhishing ? "phishing" : "legitimate"}. +{result.points} pts
                </p>
                <p>{result.explanation}</p>
                <p className="muted small">Highlighted boxes mark the real red flags. Red-outlined ones were tags that did not apply.</p>
                <button onClick={load} disabled={loading}>
                  Next email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
