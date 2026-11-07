"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/components/PlayerProvider";

type Row = { player: string; points: number };

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [shared, setShared] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [syncing, setSyncing] = useState(false);
  const { name, points, syncAll } = usePlayer();
  const hasPoints = Object.values(points).some((p) => p > 0);

  async function load() {
    try {
      const d = await fetch("/api/score").then((r) => r.json());
      if (d.error) throw new Error([d.error, d.detail].filter(Boolean).join(" "));
      setRows(d.players);
      setShared(d.shared);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the leaderboard.");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function sync() {
    setSyncing(true);
    setMsg("");
    const err = await syncAll();
    setMsg(err ? `Sync failed: ${err}` : "Synced. Your saved points are now on the leaderboard.");
    setSyncing(false);
    await load();
  }

  return (
    <div className="page">
      <h1>Leaderboard</h1>
      <p className="lede">Top players by total points across every challenge.</p>
      {!shared && <p className="hint">Demo mode: scores are kept in server memory and reset when the server restarts. Connect Supabase to keep them permanently.</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {name && hasPoints && (
        <div className="row">
          <button onClick={sync} disabled={syncing}>
            {syncing ? "Syncing..." : "Sync my points"}
          </button>
          <span className="muted small">Sends the points saved in this browser to the leaderboard. Safe to click more than once.</span>
        </div>
      )}
      {msg && <p role="status">{msg}</p>}
      {rows && rows.length === 0 && <p className="muted">No scores yet. Finish a challenge and set a nickname to be the first.</p>}
      {rows && rows.length > 0 && (
        <table className="board">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">Player</th>
              <th scope="col">Points</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.player} className={r.player === name ? "me" : ""}>
                <td>{i + 1}</td>
                <td>{r.player}</td>
                <td>{r.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
