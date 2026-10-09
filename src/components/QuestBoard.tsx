import { useState } from "react";
import type { FormEvent } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  Dumbbell,
  Flame,
  LockKeyhole,
  Pencil,
  BookOpen,
  Plus,
  ScanFace,
  Shield,
  Sparkles,
  Trash2,
  TrendingUp,
} from "lucide-react";
import type { Category, ModuleProps, Muscle, Quest } from "../lib/types";
import {
  mandatoryComplete,
  previousDay,
  toggleQuest,
  toggleRecoveryDay,
} from "../lib/engine";
import { guideImageUrlSchema } from "../lib/storage";
import ExerciseModal from "./ExerciseModal";
import Modal from "./Modal";
import "./quests.css";
import "./exercise-guide.css";

type Props = ModuleProps & {
  category?: "training" | "recovery";
  compact?: boolean;
  onComplete: (id: string) => void;
};

function QuestEditor({
  quest,
  defaultCategory,
  onSave,
  onClose,
}: {
  quest: Quest | null;
  defaultCategory: Category;
  onSave: (quest: Quest) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(quest?.name ?? "");
  const [category, setCategory] = useState<Category>(
    quest?.category ?? defaultCategory,
  );
  const [muscle, setMuscle] = useState<Muscle>(
    quest?.muscle ?? (defaultCategory === "training" ? "chest" : "posture"),
  );
  const [sets, setSets] = useState(quest?.sets ?? 2);
  const [reps, setReps] = useState(quest?.reps ?? 10);
  const [unit, setUnit] = useState<Quest["unit"]>(quest?.unit ?? "reps");
  const [mandatory, setMandatory] = useState(quest?.mandatory ?? false);
  const [description, setDescription] = useState(quest?.description ?? "");
  const [guideImageUrl, setGuideImageUrl] = useState(
    quest?.guideImageUrl ?? "",
  );
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !name.trim() ||
      !Number.isInteger(sets) ||
      !Number.isInteger(reps) ||
      sets < 1 ||
      sets > 20 ||
      reps < 1 ||
      reps > 3600
    ) {
      setError("Enter a name, 1–20 sets, and a target from 1–3,600.");
      return;
    }
    if (
      guideImageUrl.trim() &&
      !guideImageUrlSchema.safeParse(guideImageUrl.trim()).success
    ) {
      setError(
        "Enter a valid HTTP or HTTPS image URL (up to 2,048 characters, without credentials).",
      );
      return;
    }
    onSave({
      ...(quest ?? {
        id: crypto.randomUUID(),
        completed: false,
        completionStreak: 0,
        lastCompleted: null,
        xp: category === "training" ? 40 : 20,
        cues: [
          "Choose a comfortable movement range.",
          "Use slow, controlled movement and breathe normally.",
        ],
        mistakes: [
          "Continuing through pain.",
          "Rushing to complete the target.",
        ],
      }),
      guideImageUrl: guideImageUrl.trim() || undefined,
      name: name.trim(),
      category,
      muscle,
      sets,
      reps,
      unit,
      mandatory,
      description:
        description.trim() || "A custom routine from your personal plan.",
    });
  }
  return (
    <Modal title={quest ? "Edit routine" : "Add routine"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <label className="block text-xs text-slate-300">
          Routine name
          <input
            autoFocus
            required
            maxLength={80}
            className="field mt-2 w-full"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Evening mobility"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="block text-xs text-slate-300">
            Category
            <select
              className="field mt-2 w-full"
              value={category}
              onChange={(event) => setCategory(event.target.value as Category)}
            >
              <option value="training">Training</option>
              <option value="posture">Posture</option>
              <option value="grooming">Grooming & skin</option>
            </select>
          </label>
          <label className="block text-xs text-slate-300">
            Target area
            <select
              className="field mt-2 w-full"
              value={muscle}
              onChange={(event) => setMuscle(event.target.value as Muscle)}
            >
              <option value="chest">Chest</option>
              <option value="back">Lats / back</option>
              <option value="shoulders">Shoulders</option>
              <option value="core">Core</option>
              <option value="legs">Legs</option>
              <option value="posture">Posture</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-xs text-slate-300">
            Sets
            <input
              className="field mt-2 w-full"
              type="number"
              min={1}
              max={20}
              required
              value={sets}
              onChange={(event) => setSets(Number(event.target.value))}
            />
          </label>
          <label className="block text-xs text-slate-300">
            Target
            <input
              className="field mt-2 w-full"
              type="number"
              min={1}
              max={3600}
              required
              value={reps}
              onChange={(event) => setReps(Number(event.target.value))}
            />
          </label>
          <label className="block text-xs text-slate-300">
            Unit
            <select
              className="field mt-2 w-full"
              value={unit}
              onChange={(event) => setUnit(event.target.value as Quest["unit"])}
            >
              <option value="reps">Reps</option>
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
            </select>
          </label>
        </div>
        <label className="block text-xs text-slate-300">
          Notes
          <textarea
            className="field mt-2 min-h-20 w-full resize-y"
            maxLength={600}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Equipment, form cues, or a reminder"
          />
        </label>
        <label className="block text-xs text-slate-300">
          Guide Image URL (optional)
          <input
            type="url"
            maxLength={2048}
            className="field mt-2 w-full"
            value={guideImageUrl}
            onChange={(event) => setGuideImageUrl(event.target.value)}
            placeholder="https://example.com/movement-guide.png"
            aria-describedby="guide-image-help"
          />
          <span
            id="guide-image-help"
            className="block text-xs text-slate-500 mt-2"
          >
            Link directly to a form diagram. Leave blank to use the built-in
            guide or target anatomy.
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={mandatory}
            onChange={(event) => setMandatory(event.target.checked)}
            className="mt-1 accent-blue-400"
          />
          <span>
            Required daily quest
            <span className="mt-1 block text-xs text-slate-500">
              Unfinished required quests trigger the Penalty Zone after
              midnight.
            </span>
          </span>
        </label>
        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit">
            {quest ? "Save changes" : "Add routine"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function QuestBoard({
  state,
  update,
  category = "training",
  compact = false,
  onComplete,
}: Props) {
  const [selected, setSelected] = useState<Quest | null>(null);
  const [editing, setEditing] = useState<Quest | "new" | null>(null);
  const [deleting, setDeleting] = useState<Quest | null>(null);
  const [undo, setUndo] = useState<Quest | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [restNotice, setRestNotice] = useState("");
  const recovery = category === "recovery";
  const quests = state.quests.filter((quest) =>
    recovery ? quest.category !== "training" : quest.category === "training",
  );
  const done = quests.filter((quest) => quest.completed).length;
  const locked = Boolean(state.penalty && !state.penalty.cleared);
  const visible = compact && !expanded ? quests.slice(0, 3) : quests;
  const allDone = mandatoryComplete(state);
  const firstIncomplete = quests.find((quest) => !quest.completed)?.id;
  function save(quest: Quest) {
    update((current) => {
      if (current.penalty && !current.penalty.cleared) return current;
      const {
        name,
        category,
        muscle,
        sets,
        reps,
        unit,
        mandatory,
        description,
        guideImageUrl,
      } = quest;
      const details = {
        name,
        category,
        muscle,
        sets,
        reps,
        unit,
        mandatory,
        description,
        guideImageUrl,
      };
      return {
        ...current,
        quests: current.quests.some((item) => item.id === quest.id)
          ? current.quests.map((item) =>
              item.id === quest.id ? { ...item, ...details } : item,
            )
          : [...current.quests, quest],
      };
    });
    setEditing(null);
  }
  function remove() {
    if (!deleting) return;
    update((current) => {
      if (current.penalty && !current.penalty.cleared) return current;
      const next = current.quests.find((q) => q.id === deleting.id)?.completed
        ? toggleQuest(current, deleting.id)
        : current;
      return {
        ...next,
        quests: next.quests.filter((q) => q.id !== deleting.id),
      };
    });
    setDeleting(null);
  }
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow mb-1">
            {recovery ? "Recovery protocol" : "Your daily objective"}
          </p>
          <h2 className="font-display text-2xl font-semibold uppercase tracking-wide">
            {recovery ? "Posture & recovery" : "Daily quests"}
            <span className="ml-3 align-middle font-mono text-xs font-normal text-slate-500">
              {String(done).padStart(2, "0")} /{" "}
              {String(quests.length).padStart(2, "0")}
            </span>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {!recovery && !compact && (
            <button
              className="btn btn-ghost"
              disabled={locked}
              aria-pressed={Boolean(state.restDay)}
              onClick={() => {
                update(toggleRecoveryDay);
                setRestNotice(
                  state.restDay
                    ? "Recovery cancelled. Today is an active training day again."
                    : "Recovery day planned. Your current streak will be preserved at midnight.",
                );
              }}
            >
              {state.restDay ? "Recovery day planned" : "Recovery day"}
            </button>
          )}
          <button
            className="btn btn-ghost text-xs"
            onClick={() => setEditing("new")}
            disabled={locked}
          >
            <Plus size={14} />
            Add routine
          </button>
        </div>
      </div>
      {restNotice && (
        <p role="status" className="text-sm text-blue-200 mb-4">
          {restNotice}
        </p>
      )}
      {state.restDay && !recovery && (
        <p className="border border-blue-500/20 bg-blue-500/5 p-4 mb-4 text-xs leading-relaxed text-blue-100">
          Recovery day planned. Training is optional today; your streak is
          preserved at midnight without earning a new day. Your full plan
          returns tomorrow.
        </p>
      )}
      {locked && (
        <div className="quest-lock">
          <LockKeyhole size={24} />
          <div>
            <p className="text-sm font-semibold">Quests are locked</p>
            <p className="mt-1 text-xs text-rose-300/70">
              Clear the Penalty Zone to resume your daily plan.
            </p>
          </div>
        </div>
      )}
      {state.evolution.length > 0 && !recovery && (
        <div className="mb-4 flex gap-3 border border-blue-500/20 bg-blue-950/20 p-3">
          <TrendingUp size={17} className="mt-1 shrink-0 text-blue-300" />
          <div>
            <p className="mb-1 text-xs font-semibold text-blue-300">
              QUEST EVOLVED
            </p>
            {state.evolution.map((item, index) => (
              <p key={index} className="text-xs leading-relaxed text-slate-400">
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
      {!quests.length && (
        <div className="border border-dashed border-white/10 p-8 text-center">
          <Sparkles size={25} className="mx-auto mb-3 text-slate-500" />
          <p className="text-sm text-slate-300">
            Build your {recovery ? "recovery" : "training"} routine.
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Add your first quest to start tracking progress.
          </p>
        </div>
      )}
      <div className="quest-list">
        {visible.map((quest) => {
          const Icon =
            quest.category === "grooming"
              ? ScanFace
              : quest.category === "posture"
                ? Shield
                : Dumbbell;
          return (
            <div
              key={quest.id}
              className={`quest-row ${quest.completed ? "is-complete" : quest.id === firstIncomplete && !locked ? "is-next" : ""}`}
            >
              <button
                className="quest-check"
                disabled={locked}
                aria-label={`${quest.completed ? "Undo" : "Complete"} ${quest.name}`}
                aria-pressed={quest.completed}
                onClick={() =>
                  quest.completed ? setUndo(quest) : onComplete(quest.id)
                }
              >
                {quest.completed ? (
                  <Check size={17} strokeWidth={2.5} />
                ) : locked ? (
                  <LockKeyhole size={13} />
                ) : (
                  <span className="h-1 w-1 rounded-full bg-current" />
                )}
              </button>
              <span className="quest-icon">
                <Icon size={18} strokeWidth={1.5} />
              </span>
              <button
                className="quest-main"
                onClick={() => setSelected(quest)}
                aria-label={`View ${quest.name} form guide`}
              >
                <p className="quest-name">{quest.name}</p>
                <div className="quest-meta">
                  <span>
                    {quest.sets} sets × {quest.reps} {quest.unit}
                  </span>
                  <span className="capitalize">
                    {recovery ? quest.category : quest.muscle}
                  </span>
                  {quest.mandatory && (
                    <span className="text-amber-300/75">Required</span>
                  )}
                </div>
                {!compact && quest.completionStreak > 0 && (
                  <p className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                    <Flame size={11} />
                    {quest.completionStreak} consecutive{" "}
                    {quest.completionStreak === 1 ? "day" : "days"}
                  </p>
                )}
              </button>
              <button
                className="guide-button"
                aria-label={`Guide for ${quest.name}`}
                onClick={() => setSelected(quest)}
              >
                <BookOpen size={12} />
                Guide
              </button>
              <span className="quest-xp">
                {quest.completed ? (
                  <CircleCheck size={17} className="text-blue-300" />
                ) : (
                  `+${quest.xp} XP`
                )}
              </span>
              {!compact && (
                <div className="quest-edit">
                  <button
                    className="quest-icon-button"
                    aria-label={`Edit ${quest.name}`}
                    onClick={() => setEditing(quest)}
                    disabled={locked}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    className="quest-icon-button"
                    aria-label={`Delete ${quest.name}`}
                    onClick={() => setDeleting(quest)}
                    disabled={locked}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {compact && quests.length > 3 && (
        <button
          className="mt-4 flex w-full items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400 hover:text-blue-300"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show fewer quests" : `View all ${quests.length} quests`}
          <ArrowRight size={14} />
        </button>
      )}
      {!compact && !recovery && (
        <div className="mt-6 border-t border-white/10 pt-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles size={15} className="text-blue-300" />
            <h3 className="eyebrow text-xs">Tomorrow’s intel</h3>
            {!allDone && <LockKeyhole size={12} className="text-slate-500" />}
          </div>
          {allDone ? (
            <>
              <p className="mb-3 text-xs leading-relaxed text-slate-400">
                Daily objectives complete. Your current plan continues tomorrow;
                listen to your recovery needs and adjust volume when needed.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {quests.map((quest) => {
                  const evolves =
                    quest.completed &&
                    quest.lastCompleted === previousDay(state.day) &&
                    quest.completionStreak >= 6 &&
                    quest.unit === "reps" &&
                    quest.reps < 100;
                  const reps = evolves
                    ? Math.min(
                        100,
                        quest.reps + Math.max(1, Math.round(quest.reps * 0.2)),
                      )
                    : quest.reps;
                  return (
                    <div
                      key={quest.id}
                      className="flex items-center justify-between gap-3 border border-white/5 bg-white/[.02] px-3 py-2"
                    >
                      <span className="text-xs text-slate-300">
                        {quest.name}
                      </span>
                      <span
                        className={`whitespace-nowrap font-mono text-xs ${evolves ? "text-blue-300" : "text-slate-500"}`}
                      >
                        {quest.sets} × {reps} {quest.unit}
                        {evolves ? " · evolved" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-xs text-slate-500">
              Complete today’s required quests to reveal tomorrow’s plan.
            </p>
          )}
        </div>
      )}
      {selected && (
        <ExerciseModal quest={selected} onClose={() => setSelected(null)} />
      )}
      {editing && (
        <QuestEditor
          quest={editing === "new" ? null : editing}
          defaultCategory={recovery ? "posture" : "training"}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <Modal title="Delete routine?" onClose={() => setDeleting(null)}>
          <p className="text-sm leading-relaxed text-slate-300">
            Remove “{deleting.name}” from your plan?{" "}
            {deleting.completed
              ? "The XP earned from this quest today will also be removed."
              : "Previous daily history stays in your archive."}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setDeleting(null)}>
              Cancel
            </button>
            <button
              className="btn border border-rose-500/40 bg-rose-500/10 text-rose-300"
              onClick={remove}
            >
              Delete routine
            </button>
          </div>
        </Modal>
      )}
      {undo && (
        <Modal title="Undo completion?" onClose={() => setUndo(null)}>
          <p className="text-sm leading-relaxed text-slate-300">
            Mark “{undo.name}” as incomplete and remove its earned XP for today?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setUndo(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                onComplete(undo.id);
                setUndo(null);
              }}
            >
              Undo completion
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
