import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  Crosshair,
  Dumbbell,
  Fingerprint,
  Info,
  Plus,
  ScanLine,
  Shield,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { Macros, Muscle, Profile, Quest } from "../lib/types";
import { generateRegimen } from "../data/regimen";
import Modal from "./Modal";

const steps = [
  "Biometrics",
  "Your foundation",
  "Daily care",
  "Review your plan",
];
const physiqueChoices: { name: Profile["physique"]; detail: string }[] = [
  { name: "Skinny", detail: "A smaller frame, building a base" },
  { name: "Lean", detail: "A lean base, adding muscle" },
  { name: "Skinny-Fat", detail: "Building strength and composition" },
  { name: "Average", detail: "Developing balanced strength" },
  { name: "Overweight", detail: "Comfortable movement, steady progress" },
];
const diagnostics = [
  { name: "Forward Head", detail: "Gentle chin tucks and neck control" },
  { name: "Rounded Shoulders", detail: "Wall angels and shoulder mobility" },
  {
    name: "Skin Dullness",
    detail: "A simple cleanse, moisturize and SPF habit",
  },
  { name: "Uneven Tone", detail: "Consistent sun protection and gentle care" },
];

export default function Awakening({
  displayName,
  onComplete,
}: {
  displayName: string;
  onComplete: (profile: Profile, quests: Quest[], targets: Macros) => void;
}) {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("24");
  const [gender, setGender] = useState<Profile["gender"]>("male");
  const [height, setHeight] = useState("175");
  const [weight, setWeight] = useState("70");
  const [heightUnit, setHeightUnit] = useState<"cm" | "in">("cm");
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [physique, setPhysique] = useState<Profile["physique"]>("Average");
  const [experience, setExperience] =
    useState<Profile["experience"]>("Beginner");
  const [selectedDiagnostics, setSelectedDiagnostics] = useState<string[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [targets, setTargets] = useState<Macros | null>(null);
  const [error, setError] = useState("");
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");
  const [customMuscle, setCustomMuscle] = useState<Muscle>("chest");
  const [showCustom, setShowCustom] = useState(false);
  const lastProfile = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [step]);

  function profile(): Profile {
    return {
      age: Number(age),
      gender,
      heightCm:
        Math.round(Number(height) * (heightUnit === "in" ? 2.54 : 1) * 100) /
        100,
      weightKg:
        Math.round(
          Number(weight) * (weightUnit === "lbs" ? 0.45359237 : 1) * 100,
        ) / 100,
      physique,
      experience,
      diagnostics: selectedDiagnostics,
      target: "Aesthetic lean muscle gain",
    };
  }
  function next() {
    setError("");
    try {
      const current = profile();
      const generated = generateRegimen(current);
      if (!Number.isInteger(current.age))
        throw new Error("Enter your age in whole years.");
      if (step === 2) {
        const signature = JSON.stringify(current);
        if (signature !== lastProfile.current) {
          setQuests(generated.quests);
          setTargets(generated.targets);
          lastProfile.current = signature;
        }
      }
      if (step === 3) {
        if (!quests.length)
          throw new Error("Keep at least one routine in your plan.");
        if (
          quests.some(
            (q) =>
              !q.name.trim() ||
              !Number.isInteger(q.sets) ||
              q.sets < 1 ||
              q.sets > 20 ||
              !Number.isInteger(q.reps) ||
              q.reps < 1 ||
              q.reps > 600,
          )
        ) {
          throw new Error(
            "Every routine needs a name, 1–20 sets and 1–600 repetitions or time units.",
          );
        }
        onComplete(
          current,
          quests.map((q) => ({ ...q, name: q.name.trim() })),
          targets ?? generated.targets,
        );
      } else setStep((value) => value + 1);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Check your details and try again.",
      );
    }
  }
  function editQuest(id: string, change: Partial<Quest>) {
    setQuests((list) =>
      list.map((q) => (q.id === id ? { ...q, ...change } : q)),
    );
  }
  function addCustom() {
    if (!customName.trim()) {
      setError("Give your custom routine a name.");
      return;
    }
    setQuests((list) => [
      ...list,
      {
        id: `custom-${crypto.randomUUID()}`,
        name: customName.trim(),
        category: customMuscle === "posture" ? "posture" : "training",
        muscle: customMuscle,
        sets: 2,
        reps: 10,
        unit: "reps",
        xp: 30,
        mandatory: false,
        description:
          "Your custom routine. Use a comfortable range and leave a few repetitions in reserve.",
        cues: [
          "Move with control and breathe steadily.",
          "Choose a comfortable range of motion.",
        ],
        mistakes: [
          "Continuing through sharp pain.",
          "Using a load you cannot control.",
        ],
        completed: false,
        completionStreak: 0,
        lastCompleted: null,
      },
    ]);
    setCustomName("");
    setShowCustom(false);
    setError("");
  }

  return (
    <main className="awakening min-h-screen px-4 py-6 sm:px-8 sm:py-10">
      <header className="mx-auto mb-10 flex max-w-6xl items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <Crosshair className="text-blue-300" size={29} />
          <span className="font-display text-2xl font-bold tracking-[.18em]">
            THE SYSTEM
          </span>
        </div>
        <span className="muted text-xs">{displayName}</span>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[260px_1fr] lg:gap-14">
        <aside>
          <p className="eyebrow mb-3">First-time setup</p>
          <h1 className="font-display text-5xl leading-none font-semibold uppercase sm:text-6xl">
            The
            <br />
            <span className="text-blue-300">Awakening.</span>
          </h1>
          <p className="muted mt-5 max-w-xs text-sm leading-6">
            Build your starting plan. Every rep, meal and small habit starts
            here.
          </p>
          <ol
            className="mt-8 grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-3"
            aria-label="Setup progress"
          >
            {steps.map((label, index) => (
              <li
                key={label}
                aria-current={index === step ? "step" : undefined}
                className={`flex gap-3 border p-3 text-xs lg:items-center ${index === step ? "border-blue-400/50 bg-blue-400/5 text-blue-200" : index < step ? "border-white/10 text-white/80" : "border-white/5 text-white/40"}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center font-mono">
                  {index < step ? <Check size={16} /> : `0${index + 1}`}
                </span>
                <span className="hidden sm:inline self-center">{label}</span>
              </li>
            ))}
          </ol>
          <div className="mt-8 hidden items-start gap-3 border-t border-white/10 pt-5 lg:flex">
            <Shield size={18} className="shrink-0 text-blue-300" />
            <p className="muted text-xs leading-5">
              Your plan stays in this browser, scoped to your hunter account.
              You can export it from System archive.
            </p>
          </div>
        </aside>
        <section className="panel overflow-hidden">
          <div className="border-b border-white/10 p-5 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="eyebrow">Calibration {step + 1} / 4</span>
              <ScanLine className="text-blue-300" size={22} />
            </div>
            <h2
              ref={heading}
              tabIndex={-1}
              className="font-display text-3xl font-semibold uppercase outline-none sm:text-4xl"
            >
              {steps[step]}
            </h2>
            <p className="muted mt-2 text-sm leading-6">
              {
                [
                  "A starting point for your training and estimated nutrition needs.",
                  "Choose the closest starting point. These are self-descriptions, not assessments.",
                  "Select the areas you want to work on. You can leave these unselected.",
                  "Adjust your routines before you begin. You can edit this plan again later.",
                ][step]
              }
            </p>
          </div>
          <div className="p-5 sm:p-8">
            {step === 0 && (
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="grid gap-2 text-sm">
                  Age
                  <input
                    className="field"
                    type="number"
                    inputMode="numeric"
                    min={16}
                    max={100}
                    step={1}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                  <span className="muted text-xs">
                    This app is for ages 16 and above.
                  </span>
                </label>
                <label className="grid content-start gap-2 text-sm">
                  Gender
                  <select
                    className="field"
                    value={gender}
                    onChange={(e) =>
                      setGender(e.target.value as Profile["gender"])
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / prefer not to say</option>
                  </select>
                  <span className="muted text-xs">
                    Used only for a rough energy estimate.
                  </span>
                </label>
                <div>
                  <label className="mb-2 block text-sm" htmlFor="height">
                    Height
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="height"
                      className="field min-w-0 flex-1"
                      type="number"
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      step="0.1"
                    />
                    <select
                      aria-label="Height unit"
                      className="field w-24"
                      value={heightUnit}
                      onChange={(e) => {
                        const unit = e.target.value as "cm" | "in";
                        if (height)
                          setHeight(
                            (
                              Number(height) * (unit === "in" ? 1 / 2.54 : 2.54)
                            ).toFixed(2),
                          );
                        setHeightUnit(unit);
                      }}
                    >
                      <option value="cm">cm</option>
                      <option value="in">inches</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm" htmlFor="weight">
                    Current weight
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="weight"
                      className="field min-w-0 flex-1"
                      type="number"
                      inputMode="decimal"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      step="0.1"
                    />
                    <select
                      aria-label="Weight unit"
                      className="field w-24"
                      value={weightUnit}
                      onChange={(e) => {
                        const unit = e.target.value as "kg" | "lbs";
                        if (weight)
                          setWeight(
                            (
                              Number(weight) *
                              (unit === "lbs" ? 1 / 0.45359237 : 0.45359237)
                            ).toFixed(2),
                          );
                        setWeightUnit(unit);
                      }}
                    >
                      <option value="kg">kg</option>
                      <option value="lbs">lbs</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-start gap-3 border border-blue-400/20 bg-blue-400/5 p-4 sm:col-span-2">
                  <Info size={18} className="mt-0.5 shrink-0 text-blue-300" />
                  <p className="muted text-xs leading-6">
                    {Number(age) < 18
                      ? "For ages 16–17, nutrition estimates support maintenance, never a calorie deficit. Growth needs vary; review your targets with a qualified clinician or dietitian."
                      : "Your numbers create an initial estimate, not a medical prescription. Adapt exercise to your ability and use professional guidance for injuries or health conditions."}
                  </p>
                </div>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-7">
                <fieldset>
                  <legend className="mb-3 text-sm">Current physique</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {physiqueChoices.map((choice) => (
                      <button
                        key={choice.name}
                        type="button"
                        aria-pressed={physique === choice.name}
                        onClick={() => setPhysique(choice.name)}
                        className={`min-h-20 border p-4 text-left transition-colors ${physique === choice.name ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 hover:border-white/30"}`}
                      >
                        <span className="flex items-center justify-between text-sm">
                          {choice.name}
                          {physique === choice.name && (
                            <Check size={16} className="text-blue-300" />
                          )}
                        </span>
                        <span className="muted mt-2 block text-xs leading-5">
                          {choice.detail}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 text-sm">Training experience</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {(["Beginner", "Intermediate", "Advanced"] as const).map(
                      (name, i) => (
                        <button
                          key={name}
                          type="button"
                          aria-pressed={experience === name}
                          onClick={() => setExperience(name)}
                          className={`border p-4 text-left transition-colors ${experience === name ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 hover:border-white/30"}`}
                        >
                          <Dumbbell
                            size={18}
                            className={
                              experience === name ? "text-blue-300" : "muted"
                            }
                          />
                          <span className="mt-3 block text-sm">{name}</span>
                          <span className="muted mt-1 block text-xs">
                            {
                              [
                                "0–6 months",
                                "Consistent training",
                                "Long-term training",
                              ][i]
                            }
                          </span>
                        </button>
                      ),
                    )}
                  </div>
                </fieldset>
                <div className="flex gap-4 border-l-2 border-blue-400 bg-blue-400/5 p-5">
                  <Crosshair className="shrink-0 text-blue-300" size={24} />
                  <div>
                    <p className="text-sm">Aesthetic lean muscle gain</p>
                    <p className="muted mt-2 text-xs leading-6">
                      A balanced foundation for shoulders, back, chest, core and
                      legs, with daily posture and skin-care habits. Progress is
                      individual; no guaranteed body or facial shape.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  {diagnostics.map((item) => {
                    const selected = selectedDiagnostics.includes(item.name);
                    return (
                      <button
                        key={item.name}
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setSelectedDiagnostics((list) =>
                            selected
                              ? list.filter((name) => name !== item.name)
                              : [...list, item.name],
                          )
                        }
                        className={`min-h-32 border p-5 text-left transition-colors ${selected ? "border-blue-400/60 bg-blue-400/10" : "border-white/10 hover:border-white/30"}`}
                      >
                        <span className="mb-4 flex items-center justify-between">
                          <Fingerprint size={21} className="text-blue-300" />
                          <span
                            className={`flex h-5 w-5 items-center justify-center border ${selected ? "border-blue-300 bg-blue-300 text-black" : "border-white/30"}`}
                          >
                            {selected && <Check size={14} />}
                          </span>
                        </span>
                        <span className="block text-sm">{item.name}</span>
                        <span className="muted mt-2 block text-xs leading-5">
                          {item.detail}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="muted text-xs leading-6">
                  These are self-reported concerns, not diagnoses. Posture
                  drills should feel comfortable. Massage and skin care support
                  comfort and skin health; they do not change facial bone
                  structure.
                </p>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-px overflow-hidden border border-blue-400/20 bg-white/10 sm:grid-cols-4">
                  {targets &&
                    [
                      { value: targets.calories, label: "kcal / day" },
                      { value: targets.protein, label: "protein / g" },
                      { value: targets.carbs, label: "carbs / g" },
                      { value: targets.fat, label: "fat / g" },
                    ].map((item) => (
                      <div key={item.label} className="bg-[#090f19] p-4">
                        <p className="font-display text-3xl font-semibold text-blue-200">
                          {item.value.toLocaleString()}
                        </p>
                        <p className="muted mt-1 text-xs">{item.label}</p>
                      </div>
                    ))}
                </div>
                <p className="muted text-xs leading-6">
                  Estimated starting targets
                  {Number(age) < 18
                    ? " for maintenance; review adolescent nutrition needs with a qualified clinician"
                    : "; adjust for your needs, energy and recovery"}
                  . Train on 2–3 nonconsecutive days to start. Use Recovery day
                  in Daily Quests on other days. Stop for pain or dizziness.
                </p>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold uppercase">
                    Your routines{" "}
                    <span className="muted">({quests.length})</span>
                  </h3>
                  <button
                    type="button"
                    className="btn btn-ghost text-xs"
                    onClick={() => {
                      setError("");
                      setShowCustom(true);
                    }}
                  >
                    <Plus size={15} /> Add routine
                  </button>
                </div>
                <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
                  {quests.map((q) => (
                    <article key={q.id} className="border border-white/10 p-4">
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <span className="eyebrow mb-2 block text-xs">
                            {q.category} · {q.muscle}
                          </span>
                          <input
                            aria-label={`Name for ${q.name}`}
                            className="field w-full text-sm"
                            value={q.name}
                            maxLength={80}
                            onChange={(e) =>
                              editQuest(q.id, { name: e.target.value })
                            }
                          />
                        </div>
                        <button
                          type="button"
                          className="icon-btn mt-6 shrink-0"
                          aria-label={`Remove ${q.name}`}
                          onClick={() => setRemoveId(q.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="grid gap-1 text-xs muted">
                          Sets
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={20}
                            className="field w-16"
                            value={q.sets || ""}
                            onChange={(e) =>
                              editQuest(q.id, { sets: Number(e.target.value) })
                            }
                          />
                        </label>
                        <label className="grid gap-1 text-xs muted">
                          Target
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={600}
                            className="field w-20"
                            value={q.reps || ""}
                            onChange={(e) =>
                              editQuest(q.id, { reps: Number(e.target.value) })
                            }
                          />
                        </label>
                        <label className="grid gap-1 text-xs muted">
                          Unit
                          <select
                            className="field w-28"
                            value={q.unit}
                            onChange={(e) =>
                              editQuest(q.id, {
                                unit: e.target.value as Quest["unit"],
                              })
                            }
                          >
                            <option value="reps">reps</option>
                            <option value="seconds">seconds</option>
                            <option value="minutes">minutes</option>
                          </select>
                        </label>
                        <label className="flex min-h-11 items-center gap-2 text-xs muted">
                          <input
                            className="accent-blue-300"
                            type="checkbox"
                            checked={q.mandatory}
                            onChange={(e) =>
                              editQuest(q.id, { mandatory: e.target.checked })
                            }
                          />{" "}
                          Required
                        </label>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="flex items-start gap-3 border border-white/10 p-4">
                  <Info size={17} className="mt-0.5 shrink-0 text-blue-300" />
                  <p className="muted text-xs leading-5">
                    Required quests affect your daily streak. Missing them at
                    midnight opens the Penalty Zone; a non-exercise option is
                    always available. Adjust your plan to your capacity.
                  </p>
                </div>
              </div>
            )}
            {error && (
              <p
                role="alert"
                className="mt-5 border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-300"
              >
                {error}
              </p>
            )}
          </div>
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-5 sm:px-8">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={step === 0}
              onClick={() => {
                setError("");
                setStep((value) => value - 1);
              }}
            >
              <ArrowLeft size={17} /> Back
            </button>
            <button type="button" className="btn btn-primary" onClick={next}>
              {step === 3 ? (
                <>
                  <CheckCheck size={18} /> Begin my plan
                </>
              ) : (
                <>
                  Continue <ArrowRight size={17} />
                </>
              )}
            </button>
          </footer>
        </section>
      </div>
      {removeId && (
        <Modal title="Remove routine?" onClose={() => setRemoveId(null)}>
          <p className="muted leading-6">
            Remove {quests.find((q) => q.id === removeId)?.name} from your
            starting plan?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setRemoveId(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                setQuests((list) => list.filter((q) => q.id !== removeId));
                setRemoveId(null);
              }}
            >
              Remove
            </button>
          </div>
        </Modal>
      )}
      {showCustom && (
        <Modal
          title="Add a routine"
          onClose={() => {
            setShowCustom(false);
            setError("");
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addCustom();
            }}
            className="space-y-5"
          >
            <label className="grid gap-2 text-sm">
              Routine name
              <input
                className="field"
                required
                maxLength={80}
                autoFocus
                placeholder="e.g. Standing calf raises"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </label>
            <label className="grid gap-2 text-sm">
              Target area
              <select
                className="field"
                value={customMuscle}
                onChange={(e) => setCustomMuscle(e.target.value as Muscle)}
              >
                {(
                  [
                    "chest",
                    "back",
                    "shoulders",
                    "core",
                    "legs",
                    "posture",
                  ] as const
                ).map((muscle) => (
                  <option key={muscle} value={muscle}>
                    {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <p className="muted text-xs">
              Starts at 2 sets of 10 reps. Edit the target in your review.
            </p>
            {error && (
              <p role="alert" className="text-sm text-red-300">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowCustom(false);
                  setError("");
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Sparkles size={16} /> Add routine
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
