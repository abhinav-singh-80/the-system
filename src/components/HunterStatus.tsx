import { Shield, Flame, Plus, Swords, HeartPulse, Zap } from "lucide-react";
import type { ModuleProps, Attribute } from "../lib/types";
import { accounts } from "../lib/auth";
import {
  levelFor,
  rankFor,
  pointsAvailable,
  allocate,
  multiplier,
} from "../lib/engine";
export default function HunterStatus({ state, update }: ModuleProps) {
  const level = levelFor(state.totalXp),
    rank = rankFor(level),
    points = pointsAvailable(state);
  const stats: { key: Attribute; name: string; icon: typeof Swords }[] = [
    { key: "strength", name: "Strength", icon: Swords },
    { key: "vitality", name: "Vitality", icon: HeartPulse },
    { key: "agility", name: "Discipline", icon: Zap },
  ];
  return (
    <section className="panel beam hunter-status">
      <div className="monarch-aura" aria-hidden="true" />
      <header className="flex justify-between items-center mb-6">
        <span className="eyebrow">HUNTER STATUS</span>
        <span className="flex items-center gap-2 text-[11px] text-primary">
          <span className="status-dot" /> ACTIVE
        </span>
      </header>
      <div className="flex gap-5 items-center">
        <div className="rank-emblem" data-rank={rank}>
          <Shield size={82} strokeWidth={0.75} />
          <strong>{rank}</strong>
        </div>
        <div>
          <div className="eyebrow mb-1">{rank}-RANK HUNTER</div>
          <h2 className="font-display text-3xl font-semibold mb-0">
            {accounts[state.username].name}
          </h2>
          <span className="text-xs text-slate-500">
            The journey begins within.
          </span>
        </div>
      </div>
      <div className="flex justify-between items-end mt-7 mb-3">
        <div>
          <span className="eyebrow">LEVEL </span>
          <span className="font-display text-4xl font-semibold ml-2 text-white">
            {String(level).padStart(2, "0")}
          </span>
        </div>
        <div className="text-xs">
          <span className="text-primary">{state.totalXp % 300}</span>
          <span className="text-slate-500"> / 300 XP</span>
        </div>
      </div>
      <div
        role="progressbar"
        aria-label="Experience to next level"
        aria-valuenow={state.totalXp % 300}
        aria-valuemin={0}
        aria-valuemax={300}
        className="xp-track"
      >
        <div style={{ width: `${(state.totalXp % 300) / 3}%` }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[11px] muted">
          {300 - (state.totalXp % 300)} XP to level {level + 1}
        </span>
        <span className="text-[11px] text-primary">
          {multiplier(state).toFixed(1)}× MULTIPLIER
        </span>
      </div>
      <div className="border-t border-white/10 mt-6 pt-5">
        <div className="flex items-center justify-between mb-4">
          <span className="eyebrow">ATTRIBUTES</span>
          {points > 0 && (
            <span className="chip">{points} POINTS AVAILABLE</span>
          )}
        </div>
        {stats.map(({ key, name, icon: Icon }) => (
          <div key={key} className="attribute-row">
            <span className="flex gap-3 items-center">
              <Icon size={15} />
              {name}
            </span>
            <span className="flex items-center gap-3">
              <b className="text-white font-display text-xl">
                {state.attributes[key]}
              </b>
              <button
                className="attribute-add"
                disabled={!points}
                onClick={() => update((s) => allocate(s, key))}
                aria-label={`Increase ${name}`}
                title={
                  points
                    ? "Spend one attribute point"
                    : "Earn points by leveling up"
                }
              >
                <Plus size={12} />
              </button>
            </span>
          </div>
        ))}
      </div>
      <div className="streak-strip">
        <Flame size={18} />
        <div>
          <strong>{state.streak} DAY STREAK</strong>
          <span>
            {state.streak
              ? "Keep your momentum."
              : "A new day. A new opportunity."}
          </span>
        </div>
      </div>
    </section>
  );
}
