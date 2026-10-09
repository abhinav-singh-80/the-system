import { useState } from "react";
import { Check, CircleAlert, RotateCcw, Timer, Zap } from "lucide-react";
import type { Quest } from "../lib/types";
import Anatomy from "./Anatomy";
import Modal from "./Modal";

export default function ExerciseModal({
  quest,
  onClose,
}: {
  quest: Quest;
  onClose: () => void;
}) {
  const [back, setBack] = useState(quest.muscle === "back");
  const training = quest.category === "training";
  return (
    <Modal title={quest.name} onClose={onClose}>
      <div className="grid gap-6 sm:grid-cols-[.8fr_1fr]">
        <div>
          <div className="exercise-anatomy">
            <span className="absolute top-4 left-4 eyebrow text-[10px]">
              {back ? "Posterior" : "Anterior"} view
            </span>
            <Anatomy
              muscles={quest.category === "grooming" ? [] : [quest.muscle]}
              back={back}
            />
            <button
              className="btn btn-ghost absolute bottom-3 right-3 z-10 text-xs"
              onClick={() => setBack(!back)}
            >
              <RotateCcw size={13} />
              {back ? "Show front" : "Show back"}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-orange-500" />
            {quest.category === "grooming"
              ? "Skin & recovery routine"
              : `Target: ${quest.muscle}`}
          </div>
        </div>
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-300">
            {quest.description}
          </p>
          <div className="grid grid-cols-3 gap-2 border-y border-white/10 py-4 text-center">
            <div>
              <p className="text-2xl font-display text-white">{quest.sets}</p>
              <p className="eyebrow text-[9px]">Sets</p>
            </div>
            <div>
              <p className="text-2xl font-display text-white">{quest.reps}</p>
              <p className="eyebrow text-[9px]">{quest.unit}</p>
            </div>
            <div>
              <p className="flex items-center justify-center gap-1 text-2xl font-display text-cyan-300">
                <Zap size={15} />
                {quest.xp}
              </p>
              <p className="eyebrow text-[9px]">Base XP</p>
            </div>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Check size={15} />
              WHAT TO DO
            </p>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
              {quest.cues.map((cue, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-emerald-500" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {cue}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-rose-400">
              <CircleAlert size={15} />
              COMMON MISTAKES
            </p>
            <ul className="space-y-2 text-xs leading-relaxed text-slate-400">
              {quest.mistakes.map((cue, index) => (
                <li key={index}>{cue}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {training && quest.unit === "reps" && (
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <Timer size={14} />
              Controlled movement
            </span>
            <span className="text-slate-500">
              3 sec lower · brief pause · 1 sec return
            </span>
          </div>
          <div className="tempo-track" aria-hidden="true" />
          <p className="text-xs text-slate-500">
            Follow a comfortable range. Rest between sets; stop if movement
            causes pain.
          </p>
        </div>
      )}
    </Modal>
  );
}
