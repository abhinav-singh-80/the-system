import { ArrowUpRight, Check, Flame, Target, Sparkles } from "lucide-react";
import type { ModuleProps, View } from "../lib/types";
import HunterStatus from "./HunterStatus";
import QuestBoard from "./QuestBoard";
import Fuel from "./Fuel";
import { mandatoryComplete } from "../lib/engine";
export default function Overview({
  state,
  update,
  onComplete,
  onNavigate,
}: {
  onComplete: (id: string) => void;
  onNavigate: (view: View) => void;
} & ModuleProps) {
  const complete = state.quests.filter((q) => q.completed).length;
  const meals = state.meals.filter((m) => m.date === state.day);
  const calories = meals.reduce((s, m) => s + m.calories, 0);
  return (
    <div className="space-y-6">
      <section className="mission-banner">
        <div className="mission-copy">
          <span className="eyebrow text-primary flex items-center gap-2">
            <span className="status-dot" /> DAILY MISSION
          </span>
          <h1>
            BECOME
            <br />
            <span className="text-primary">UNSTOPPABLE.</span>
          </h1>
          <p>
            Your only competition is who you were yesterday.
            <br className="hidden sm:block" /> Complete your quests. Build your
            next level.
          </p>
          <button
            className="btn btn-primary mt-4"
            onClick={() => onNavigate("quests")}
          >
            {mandatoryComplete(state)
              ? "Review completed quests"
              : "Begin daily quests"}
            <ArrowUpRight size={17} />
          </button>
        </div>
        <div className="mission-art" aria-hidden="true">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <div className="orbital orbital-three" />
          <svg viewBox="0 0 280 230" className="mission-sigil">
            <defs>
              <linearGradient id="sigil" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1e60ff" />
              </linearGradient>
            </defs>
            <path
              d="M140 20 220 68 208 146 140 208 72 146 60 68Z"
              fill="#2563eb08"
              stroke="url(#sigil)"
            />
            <path
              d="m140 38 62 38-10 63-52 48-52-48-10-63Z"
              fill="none"
              stroke="#3b82f644"
            />
            <path
              d="m121 58 18 19 20-19-8 39 19 11-20 7-4 41 16 15-22 14-21-14 16-15-4-41-21-7 20-11Z"
              fill="url(#sigil)"
            />
            <path
              d="m48 112-20 9 20 9m184-18 20 9-20 9M140 4v13m0 192v13"
              stroke="#3b82f688"
              fill="none"
            />
          </svg>
          <span className="sigil-label">DISCIPLINE IS YOUR POWER</span>
        </div>
        <div className="mission-corner" />
      </section>
      <div className="metric-grid">
        {[
          {
            label: "QUESTS COMPLETE",
            value: `${String(complete).padStart(2, "0")}`,
            suffix: `/ ${state.quests.length}`,
            icon: Check,
            detail: "Daily progress",
          },
          {
            label: "TOTAL EXPERIENCE",
            value: state.totalXp.toLocaleString(),
            suffix: "XP",
            icon: Sparkles,
            detail: "Every effort counts",
          },
          {
            label: "DAILY FUEL",
            value: calories.toLocaleString(),
            suffix: "KCAL",
            icon: Flame,
            detail: `${state.targets.calories.toLocaleString()} kcal target`,
          },
          {
            label: "CONSISTENCY",
            value: String(state.streak).padStart(2, "0"),
            suffix: "DAYS",
            icon: Target,
            detail: "Completed day streak",
          },
        ].map((item) => (
          <div className="metric" key={item.label}>
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">{item.label}</span>
              <item.icon size={15} className="text-primary opacity-65" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <strong className="font-display text-4xl font-semibold tracking-tight">
                {item.value}
              </strong>
              <span className="eyebrow">{item.suffix}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">{item.detail}</div>
          </div>
        ))}
      </div>
      <div className="overview-status">
        <HunterStatus state={state} update={update} />
      </div>
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <span className="eyebrow">SHOW UP. PUT IN THE WORK.</span>
          <h2 className="font-display text-3xl font-semibold mt-1 mb-0">
            TODAY’S OBJECTIVES
          </h2>
        </div>
        <button className="btn btn-ghost" onClick={() => onNavigate("quests")}>
          All quests
          <ArrowUpRight size={14} />
        </button>
      </div>
      <QuestBoard
        state={state}
        update={update}
        compact
        onComplete={onComplete}
      />
      <div className="flex items-center justify-between gap-3 pt-2">
        <div>
          <span className="eyebrow">RECOVERY STARTS WITH FUEL</span>
          <h2 className="font-display text-3xl font-semibold mt-1 mb-0">
            NOURISH THE MISSION
          </h2>
        </div>
        <button className="btn btn-ghost" onClick={() => onNavigate("fuel")}>
          Fuel engine
          <ArrowUpRight size={14} />
        </button>
      </div>
      <Fuel state={state} update={update} compact />
    </div>
  );
}
