"use client";

import { useEffect, useRef, useState } from "react";
import { buildRound, evaluate, type Question } from "@/lib/password";
import { usePlayer } from "@/components/PlayerProvider";

const ROUND_SIZE = 5;

export default function PasswordLab() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const s = evaluate(pw);

  // The questions are created after the page loads (not during the first render),
  // because random choices during the first render cause a mismatch error in Next.js.
  const [round, setRound] = useState<Question[] | null>(null);
  const lastKeys = useRef<string[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const { award } = usePlayer();

  function newRound() {
    const r = buildRound(ROUND_SIZE, lastKeys.current);
    lastKeys.current = r.keys;
    setRound(r.questions);
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  useEffect(() => {
    newRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = round ? round[i] : null;

  function choose(c: string) {
    if (picked || !q) return;
    setPicked(c);
    if (c === q.answer) setScore((x) => x + 20);
  }
  function next() {
    if (!round) return;
    if (i + 1 >= round.length) {
      award("password", score, "best");
      setDone(true);
    } else {
      setI(i + 1);
      setPicked(null);
    }
  }

  return (
    <div className="page">
      <h1>Password lab</h1>
      <p className="lede">Your typing stays in this browser. Nothing here is sent anywhere. Still, use made-up passwords.</p>

      <section className="panel" aria-labelledby="meter-h">
        <h2 id="meter-h">Strength meter</h2>
        <div className="row">
          <label htmlFor="pw" className="sr-only">
            Practice password
          </label>
          <input id="pw" className="grow mono" type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Type a practice password" autoComplete="off" />
          <button className="ghost" onClick={() => setShow(!show)} aria-pressed={show}>
            {show ? "Hide" : "Show"}
          </button>
        </div>
        <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={s.score} aria-label="Password strength">
          <span style={{ width: `${s.score}%` }} data-level={s.label} />
        </div>
        <p className="meter-read">
          <strong>{s.label}</strong>. A fast offline attack could crack it in {s.crackTime}.
        </p>
        <ul className="tips">
          {s.tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      <section className="panel" aria-labelledby="quiz-h">
        <h2 id="quiz-h">Which is stronger?</h2>
        {!round || !q ? (
          <p className="muted">Loading questions...</p>
        ) : done ? (
          <div>
            <p className="big">You scored {score} out of 100.</p>
            <p>Your best score is saved to the leaderboard if you have set a nickname.</p>
            <button onClick={newRound}>Play again with new questions</button>
          </div>
        ) : (
          <>
            <p className="muted">
              Question {i + 1} of {round.length}
            </p>
            <div className="duel">
              {(["a", "b"] as const).map((k) => {
                const state = picked ? (k === q.answer ? "right" : picked === k ? "wrong" : "") : "";
                return (
                  <button key={k} className={`choice mono ${state}`} onClick={() => choose(k)} disabled={Boolean(picked)}>
                    {q[k]}
                  </button>
                );
              })}
            </div>
            {picked && (
              <div className="feedback" role="status">
                <p>
                  <strong>{picked === q.answer ? "Correct." : "Not quite."}</strong> {q.why}
                </p>
                <button onClick={next}>{i + 1 >= round.length ? "Finish" : "Next question"}</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
