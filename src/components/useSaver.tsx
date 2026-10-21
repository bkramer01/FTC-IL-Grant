"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Saves edits in the background. `queue(key, save)` waits a moment so typing in a box
 * becomes one save, and only the latest save for each key runs (keys are per field, so
 * edits to different fields never cancel each other). `run(save)` saves right away.
 */
export function useSaver(delayMs = 600) {
  const [state, setState] = useState<SaveState>("idle");
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const pending = useRef(0);

  const run = useCallback(async <T,>(save: () => Promise<T>): Promise<T | undefined> => {
    pending.current++;
    setState("saving");
    try {
      const result = await save();
      pending.current--;
      if (pending.current === 0) setState("saved");
      return result;
    } catch (err) {
      pending.current--;
      console.error(err);
      setState("error");
      return undefined;
    }
  }, []);

  const queue = useCallback(
    (key: string, save: () => Promise<unknown>) => {
      const t = timers.current.get(key);
      if (t) clearTimeout(t);
      setState("saving");
      timers.current.set(
        key,
        setTimeout(() => {
          timers.current.delete(key);
          void run(save);
        }, delayMs),
      );
    },
    [delayMs, run],
  );

  // Warn before leaving the page while a save is still waiting or running.
  useEffect(() => {
    const onLeave = (e: BeforeUnloadEvent) => {
      if (timers.current.size > 0 || pending.current > 0) e.preventDefault();
    };
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, []);

  return { state, queue, run };
}

/** Small "Saving… / All changes saved / Couldn't save" note. */
export function SaveStatus({ state }: { state: SaveState }) {
  if (state === "idle") return null;
  const text = {
    saving: "Saving…",
    saved: "All changes saved",
    error: "Couldn't save the last change. Check your connection and try again.",
  }[state];
  const color = state === "error" ? "text-danger" : state === "saved" ? "text-success" : "text-muted";
  return (
    <span role="status" aria-live="polite" className={`text-sm ${color}`}>
      {text}
    </span>
  );
}
