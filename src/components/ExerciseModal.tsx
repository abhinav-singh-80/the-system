import { Check, CircleAlert, Timer } from "lucide-react";
import type { Quest } from "../lib/types";
import Modal from "./Modal";
import ExerciseGuide from "./ExerciseGuide";
export default function ExerciseModal({
  quest,
  onClose,
}: {
  quest: Quest;
  onClose: () => void;
}) {
  return (
    <Modal title={quest.name} badge="DAILY QUEST" onClose={onClose}>
      <ExerciseGuide
        key={`${quest.id}:${quest.guideImageUrl ?? ""}`}
        quest={quest}
      />
      <div className="mt-6">
        <div className="guide-facts">
          <div>
            <strong>{quest.sets}</strong>
            <span>Sets</span>
          </div>
          <div>
            <strong>{quest.reps}</strong>
            <span>{quest.unit}</span>
          </div>
          <div>
            <strong>{quest.xp}</strong>
            <span>Base XP</span>
          </div>
        </div>
        <p className="guide-copy mb-5">{quest.description}</p>
        <div className="guide-layout">
          <div className="mb-5">
            <h3 className="form-badge form-good">
              <Check size={13} />
              PROPER FORM
            </h3>
            <ul className="space-y-2 mt-3 guide-copy">
              {quest.cues.map((cue, i) => (
                <li key={i} className="flex gap-2">
                  <Check size={13} className="text-green-400 mt-1.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="form-badge form-bad">
              <CircleAlert size={13} />
              MISTAKES TO AVOID
            </h3>
            <ul className="space-y-2 mt-3 guide-copy">
              {quest.mistakes.map((cue, i) => (
                <li key={i} className="flex gap-2">
                  <CircleAlert size={13} className="text-red-400 mt-1.5" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <footer className="flex items-start gap-2 border-t border-white/10 mt-6 pt-4 text-xs text-slate-400">
        <Timer size={14} className="mt-0.5" />
        <p className="mb-0 leading-relaxed">
          Illustrative positions; use a comfortable range of motion. Breathe
          normally, rest between sets, and stop for pain. Expand the diagram for
          detail.
        </p>
      </footer>
    </Modal>
  );
}
