"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Store = { name: string; points: Record<string, number>; synced: boolean };
type Mode = "best" | "once" | "add";

type Ctx = {
  ready: boolean;
  name: string;
  total: number;
  points: Record<string, number>;
  setName: (n: string) => void;
  /** Add points for a challenge. Returns the points actually added. */
  award: (challenge: string, pts: number, mode: Mode) => number;
  /** Re-send all saved points to the leaderboard. Safe to run many times. Returns "" or an error message. */
  syncAll: () => Promise<string>;
};

const KEY = "cyberlab:v1";
const PlayerCtx = createContext<Ctx | null>(null);

function post(player: string, challenge: string, points: number) {
  if (!player || points <= 0) return;
  fetch("/api/score", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player, challenge, points }),
  }).catch(() => {});
}

async function postSync(player: string, challenge: string, points: number): Promise<string> {
  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, challenge, points, sync: true }),
    });
    if (res.ok) return "";
    const d = await res.json().catch(() => ({}));
    return [d.error, d.detail].filter(Boolean).join(" ") || `Server error ${res.status}`;
  } catch {
    return "Could not reach the server.";
  }
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>({ name: "", points: {}, synced: false });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setStore(JSON.parse(raw));
    } catch {}
    setReady(true);
  }, []);

  const save = useCallback((next: Store) => {
    setStore(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const setName = useCallback(
    (n: string) => {
      const name = n.replace(/[<>]/g, "").trim().slice(0, 20);
      let synced = store.synced;
      // First time a name is set: send any points earned before the name existed.
      if (name && !store.synced) {
        Object.entries(store.points).forEach(([c, p]) => post(name, c, p));
        synced = true;
      }
      save({ ...store, name, synced });
    },
    [store, save],
  );

  const award = useCallback(
    (challenge: string, pts: number, mode: Mode) => {
      const current = store.points[challenge] || 0;
      let next = current;
      if (mode === "best") next = Math.max(current, pts);
      if (mode === "once") next = current > 0 ? current : pts;
      if (mode === "add") next = current + pts;
      const delta = next - current;
      save({ ...store, points: { ...store.points, [challenge]: next } });
      if (store.name && store.synced) post(store.name, challenge, delta);
      return delta;
    },
    [store, save],
  );

  const syncAll = useCallback(async () => {
    if (!store.name) return "Set a nickname first.";
    for (const [c, p] of Object.entries(store.points)) {
      if (p <= 0) continue;
      const err = await postSync(store.name, c, p);
      if (err) return err;
    }
    save({ ...store, synced: true });
    return "";
  }, [store, save]);

  const total = Object.values(store.points).reduce((a, b) => a + b, 0);

  return (
    <PlayerCtx.Provider value={{ ready, name: store.name, total, points: store.points, setName, award, syncAll }}>
      {children}
    </PlayerCtx.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerCtx);
  if (!ctx) throw new Error("usePlayer must be used inside PlayerProvider");
  return ctx;
}