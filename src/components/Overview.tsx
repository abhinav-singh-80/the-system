import { useState } from "react";
import {
  ArrowUpRight,
  Crosshair,
  Check,
  Flame,
  Target,
  Activity,
  ChevronRight,
  RotateCw,
  Sparkles,
} from "lucide-react";
import type { ModuleProps, Muscle, View } from "../lib/types";
import Anatomy from "./Anatomy";
import HunterStatus from "./HunterStatus";
import QuestBoard from "./QuestBoard";
import Fuel from "./Fuel";
import { mandatoryComplete } from "../lib/engine";
const muscles: { id: Muscle; name: string }[] = [
  { id: "chest", name: "Chest" },
  { id: "back", name: "Back" },
  { id: "shoulders", name: "Shoulders" },
  { id: "core", name: "Core" },
  { id: "legs", name: "Legs" },
];
export default function Overview({
  state,
  update,
  onComplete,
  onNavigate,
}: {
  onComplete: (id: string) => void;
  onNavigate: (view: View) => void;
} & ModuleProps) {
  const [muscle, setMuscle] = useState<Muscle>("chest");
  const [back, setBack] = useState(false);
  const complete = state.quests.filter((q) => q.completed).length;
  const mandatory = state.quests.filter((q) => q.mandatory);
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
            className="btn btn-primary mt-6"
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
                <stop stopColor="#00e5ff" />
                <stop offset="1" stopColor="#0070f3" />
              </linearGradient>
            </defs>
            <path
              d="M140 20 220 68 208 146 140 208 72 146 60 68Z"
              fill="#009dff08"
              stroke="url(#sigil)"
            />
            <path
              d="m140 38 62 38-10 63-52 48-52-48-10-63Z"
              fill="none"
              stroke="#00e5ff44"
            />
            <path
              d="m121 58 18 19 20-19-8 39 19 11-20 7-4 41 16 15-22 14-21-14 16-15-4-41-21-7 20-11Z"
              fill="url(#sigil)"
            />
            <path
              d="m48 112-20 9 20 9m184-18 20 9-20 9M140 4v13m0 192v13"
              stroke="#00e5ff88"
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
            <div className="text-[9px] text-slate-500 mt-1">{item.detail}</div>
          </div>
        ))}
      </div>
      <div className="status-grid">
        <HunterStatus state={state} update={update} />
        <section className="panel anatomy-panel">
          <header className="flex justify-between items-start">
            <div>
              <span className="eyebrow">PHYSICAL DEVELOPMENT</span>
              <h2 className="section-title mt-2">Build a balanced physique.</h2>
            </div>
            <Crosshair size={20} className="text-primary" strokeWidth={1} />
          </header>
          <div className="anatomy-stage">
            <div className="anatomy-grid" />
            <div className="anatomy-left">
              <span className="eyebrow">TARGET GROUPS</span>
              {muscles.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMuscle(m.id);
                    setBack(m.id === "back");
                  }}
                  className={`muscle-selector ${muscle === m.id ? "selected" : ""}`}
                >
                  <span className="muscle-marker" />
                  {m.name}
                  <ChevronRight size={12} />
                </button>
              ))}
            </div>
            <div className="anatomy-model">
              <Anatomy
                muscles={[muscle]}
                back={back}
                className="hud-anatomy"
                onSelect={setMuscle}
                interactive
              />
              <div className="anatomy-floor" />
            </div>
            <div className="anatomy-readout">
              <span className="eyebrow">FOCUS</span>
              <strong>
                {muscles.find((m) => m.id === muscle)?.name ?? "Posture"}
              </strong>
              <span className="text-[9px] muted">
                {state.quests.filter((q) => q.muscle === muscle).length}{" "}
                assigned routines
              </span>
              <div className="anatomy-line" />
              <span className="text-orange-400 text-[8px] flex items-center gap-1">
                <span className="w-1 h-1 bg-orange-500 rounded-full" /> ACTIVE
                MUSCLE
              </span>
            </div>
          </div>
          <footer className="flex justify-between items-center text-[9px] border-t border-white/10 pt-3">
            <span className="muted flex gap-2 items-center">
              <Activity size={12} />
              {mandatory.length} mandatory training quests
            </span>
            <button
              className="text-primary flex items-center gap-2 min-h-9"
              onClick={() => setBack(!back)}
            >
              <RotateCw size={12} />
              {back ? "Front view" : "Back view"}
            </button>
          </footer>
        </section>
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
