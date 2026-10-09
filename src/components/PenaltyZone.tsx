import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  HeartPulse,
  LockKeyhole,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import type { ModuleProps } from "../lib/types";
import "./penalty.css";

export default function PenaltyZone({ state, update }: ModuleProps) {
  const penalty = state.penalty;
  const updateRef = useRef(update);
  const [confirmRecovery, setConfirmRecovery] = useState(false);
  useEffect(() => {
    updateRef.current = update;
  }, [update]);

  const penaltyKey =
    penalty && !penalty.cleared
      ? `${state.username}:${penalty.fromDate}:${penalty.kind}`
      : null;
  useEffect(() => {
    if (!penaltyKey) return;
    // A saved timestamp never proves that a hold continued while the app was closed.
    const pause = () =>
      updateRef.current((s) =>
        s.penalty?.startedAt
          ? { ...s, penalty: { ...s.penalty, startedAt: null } }
          : s,
      );
    pause();
    const onVisibility = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", pause);
      pause();
    };
  }, [penaltyKey]);

  const running = Boolean(
    penalty && !penalty.cleared && penalty.kind === "hold" && penalty.startedAt,
  );
  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(
      () =>
        updateRef.current((s) => {
          const p = s.penalty;
          if (!p || p.cleared || p.kind !== "hold" || !p.startedAt) return s;
          if (document.hidden)
            return { ...s, penalty: { ...p, startedAt: null } };
          if (Date.now() - p.startedAt < 950) return s;
          // Count at most one second per visible tick; browser suspension earns no time.
          const remaining = Math.max(0, p.remaining - 1);
          return {
            ...s,
            penalty: {
              ...p,
              remaining,
              startedAt: remaining > 0 ? Date.now() : null,
            },
          };
        }),
      1_000,
    );
    return () => window.clearInterval(interval);
  }, [running]);

  if (!penalty || penalty.cleared) return null;

  const finish = (deductXp = false) => {
    update((s) => {
      if (
        !s.penalty ||
        s.penalty.cleared ||
        (!deductXp && s.penalty.remaining > 0)
      )
        return s;
      return {
        ...s,
        totalXp: deductXp ? Math.max(0, s.totalXp - 50) : s.totalXp,
        penalty: { ...s.penalty, cleared: true, startedAt: null },
      };
    });
    setConfirmRecovery(false);
  };
  const logReps = (amount: number) =>
    update((s) =>
      s.penalty?.kind === "volume" && !s.penalty.cleared
        ? {
            ...s,
            penalty: {
              ...s.penalty,
              remaining: Math.max(0, s.penalty.remaining - amount),
            },
          }
        : s,
    );
  const toggleTimer = () =>
    update((s) =>
      s.penalty?.kind === "hold" &&
      !s.penalty.cleared &&
      s.penalty.remaining > 0
        ? {
            ...s,
            penalty: {
              ...s.penalty,
              startedAt: s.penalty.startedAt ? null : Date.now(),
            },
          }
        : s,
    );
  const resetTimer = () =>
    update((s) =>
      s.penalty?.kind === "hold" && !s.penalty.cleared
        ? {
            ...s,
            penalty: {
              ...s.penalty,
              remaining: s.penalty.target,
              startedAt: null,
            },
          }
        : s,
    );
  const progress =
    penalty.target > 0
      ? Math.min(
          100,
          Math.max(0, (1 - penalty.remaining / penalty.target) * 100),
        )
      : 100;
  const date = new Date(`${penalty.fromDate}T12:00:00`).toLocaleDateString(
    undefined,
    { month: "short", day: "numeric" },
  );

  return (
    <section className="penalty-zone" aria-labelledby="penalty-heading">
      <div className="penalty-stripe" aria-hidden="true" />
      <div className="penalty-layout">
        <div className="penalty-intro">
          <div className="penalty-label">
            <AlertTriangle size={16} aria-hidden="true" /> Mandatory quests
            missed
          </div>
          <h2 id="penalty-heading" className="penalty-heading">
            PENALTY ZONE
          </h2>
          <p>
            Quests from {date} were left incomplete. Clear one consequence to
            unlock today’s training.
          </p>
          <div className="penalty-lock" aria-label="Today's quests are locked">
            <svg viewBox="0 0 300 60" fill="none" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <rect
                  key={i}
                  x={i * 31 - 9}
                  y={21}
                  width={41}
                  height={19}
                  rx={9}
                  stroke="currentColor"
                  strokeWidth={5}
                  transform={`rotate(${i % 2 ? -18 : 18} ${i * 31 + 11} 30)`}
                />
              ))}
            </svg>
            <span>
              <LockKeyhole size={26} aria-hidden="true" />
            </span>
          </div>
          <div className="penalty-locked-label">Daily quests locked</div>
        </div>

        <div className="penalty-task">
          <div className="penalty-task-heading">
            <HeartPulse size={20} aria-hidden="true" />
            <h3>{penalty.title}</h3>
          </div>
          {penalty.kind === "xp" ? (
            <>
              <div className="penalty-amount">
                <strong>50</strong>
                <span>XP consequence</span>
              </div>
              <p>
                Accept up to 50 XP deducted from your current total. Your
                balance cannot fall below zero. The missed day does not advance
                your streak.
              </p>
              <button
                className="penalty-button penalty-button-primary"
                onClick={() => finish(true)}
              >
                <ShieldCheck size={17} aria-hidden="true" />
                Accept consequence & unlock
              </button>
            </>
          ) : (
            <>
              <div className="penalty-amount">
                <strong
                  role={penalty.kind === "hold" ? "timer" : undefined}
                  aria-label={`${penalty.remaining} ${penalty.kind === "hold" ? "seconds" : "repetitions"} remaining`}
                >
                  {penalty.kind === "hold"
                    ? `${Math.floor(penalty.remaining / 60)
                        .toString()
                        .padStart(
                          2,
                          "0",
                        )}:${(penalty.remaining % 60).toString().padStart(2, "0")}`
                    : penalty.remaining}
                </strong>
                <span>
                  {penalty.kind === "hold"
                    ? "remaining · seconds"
                    : `reps remaining · ${penalty.target} total`}
                </span>
              </div>
              <div
                className="penalty-progress"
                role="progressbar"
                aria-label="Penalty completion"
                aria-valuemin={0}
                aria-valuemax={penalty.target}
                aria-valuenow={penalty.target - penalty.remaining}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              {penalty.kind === "hold" ? (
                <>
                  <p>
                    Use a comfortable wall sit or plank. Breathe normally. The
                    timer pauses when you leave this tab; resume when ready.
                  </p>
                  <div className="penalty-actions">
                    <button
                      className="penalty-button penalty-button-primary"
                      disabled={penalty.remaining === 0}
                      onClick={toggleTimer}
                    >
                      {running ? (
                        <Pause size={17} aria-hidden="true" />
                      ) : (
                        <Play size={17} aria-hidden="true" />
                      )}
                      {running
                        ? "Pause"
                        : penalty.remaining === penalty.target
                          ? "Start hold"
                          : "Resume hold"}
                    </button>
                    <button className="penalty-button" onClick={resetTimer}>
                      <RotateCcw size={16} aria-hidden="true" />
                      Reset
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>
                    Log only repetitions you have completed. Split the volume
                    into comfortable sets and rest between them.
                  </p>
                  <div className="penalty-actions">
                    <button
                      className="penalty-button penalty-button-primary"
                      disabled={penalty.remaining === 0}
                      onClick={() => logReps(5)}
                    >
                      Log {Math.min(5, penalty.remaining)} reps
                    </button>
                    <button
                      className="penalty-button"
                      disabled={penalty.remaining === 0}
                      onClick={() => logReps(1)}
                    >
                      Log 1 rep
                    </button>
                  </div>
                </>
              )}
              {penalty.remaining === 0 && (
                <button
                  className="penalty-button penalty-button-primary penalty-finish"
                  onClick={() => finish()}
                >
                  <Check size={18} aria-hidden="true" />
                  Confirm completed & unlock
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="penalty-recovery">
        <div>
          <ShieldCheck size={19} aria-hidden="true" />
          <p>
            Recovery is part of training. Stop if you feel pain or dizziness.
          </p>
        </div>
        {penalty.kind !== "xp" && !confirmRecovery && (
          <button
            className="penalty-recovery-link"
            onClick={() => {
              update((s) =>
                s.penalty
                  ? { ...s, penalty: { ...s.penalty, startedAt: null } }
                  : s,
              );
              setConfirmRecovery(true);
            }}
          >
            Use XP recovery instead
          </button>
        )}
        {confirmRecovery && (
          <div
            className="penalty-confirm"
            role="group"
            aria-label="Confirm XP recovery"
          >
            <p>Deduct up to 50 XP and unlock your quests without exercise?</p>
            <div className="penalty-actions">
              <button
                className="penalty-button penalty-button-primary"
                onClick={() => finish(true)}
              >
                Confirm XP recovery
              </button>
              <button
                className="penalty-button"
                onClick={() => setConfirmRecovery(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
