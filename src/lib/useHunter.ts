import { useState, useEffect, useCallback } from "react";
import type { HunterState, UpdateState, Username } from "./types";
import { loadState, saveState, stateKey, pushCloudState } from "./storage";
import { normalizePoints, rollover } from "./engine";
export function useHunter(username: Username) {
  const [state, setState] = useState(() => loadState(username));
  const [error, setError] = useState("");
  const update: UpdateState = useCallback(
    (recipe) => {
      const commit = () => {
        try {
          const latest = loadState(username);
          const next = normalizePoints({
            ...recipe(latest),
            updatedAt: Date.now(),
          });
          saveState(next);
          setState(next);
          setError("");
          void pushCloudState(next).catch(() =>
            setError("Saved locally. Cloud sync failed; retry when connected."),
          );
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Your change could not be saved.",
          );
        }
      };
      if (navigator.locks)
        void navigator.locks.request(`the-system-${username}`, commit);
      else commit();
    },
    [username],
  );
  useEffect(() => {
    const refresh = () => {
      try {
        const next = loadState(username);
        setState(next);
      } catch {
        setError(
          "Saved data could not be read. Export a backup before changing storage.",
        );
      }
    };
    const storage = (e: StorageEvent) => {
      if (e.key === stateKey(username) || e.key === null) refresh();
    };
    const visible = () => {
      if (!document.hidden) update((s) => rollover(s));
    };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", visible);
    document.addEventListener("visibilitychange", visible);
    const timer = window.setInterval(visible, 30000);
    update((s) => rollover(s));
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", visible);
      document.removeEventListener("visibilitychange", visible);
      clearInterval(timer);
    };
    // Subscribe once per account. Mutations always read the latest persisted snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, update]);
  const replace = useCallback(
    (next: HunterState) => update(() => next),
    [update],
  );
  return { state, update, replace, error };
}
