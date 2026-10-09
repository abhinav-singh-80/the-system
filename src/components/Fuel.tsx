import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import {
  Apple,
  Check,
  Droplets,
  Flame,
  Minus,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { FOOD_LIBRARY } from "../data/foods";
import type { Food } from "../data/foods";
import type { Meal, ModuleProps } from "../lib/types";
import Modal from "./Modal";

type Nutrient = "calories" | "protein" | "carbs" | "fat";
type FoodDraft = { [Key in keyof Food]: string };
type Dialog =
  | { kind: "create" }
  | { kind: "edit"; meal: Meal }
  | { kind: "delete"; meal: Meal }
  | null;
const NUTRIENTS: {
  key: Nutrient;
  label: string;
  unit: string;
  color: string;
}[] = [
  { key: "protein", label: "Protein", unit: "g", color: "#3b82f6" },
  { key: "carbs", label: "Carbs", unit: "g", color: "#7789ff" },
  { key: "fat", label: "Healthy fats", unit: "g", color: "#e8b86d" },
];
const emptyDraft: FoodDraft = {
  name: "",
  calories: "",
  protein: "",
  carbs: "",
  fat: "",
};
const round = (value: number) => Math.round(value * 10) / 10;

function FoodForm({
  food,
  onSave,
  onCancel,
  existingNames,
}: {
  food?: Food;
  onSave: (food: Food, savePreset: boolean) => void;
  onCancel: () => void;
  existingNames: string[];
}) {
  const [draft, setDraft] = useState<FoodDraft>(
    food
      ? {
          name: food.name,
          calories: String(food.calories),
          protein: String(food.protein),
          carbs: String(food.carbs),
          fat: String(food.fat),
        }
      : emptyDraft,
  );
  const [savePreset, setSavePreset] = useState(!food);
  const [error, setError] = useState("");
  const formId = useId();
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed: Food = {
      name: draft.name.trim(),
      calories: Number(draft.calories),
      protein: Number(draft.protein),
      carbs: Number(draft.carbs),
      fat: Number(draft.fat),
    };
    if (
      !parsed.name ||
      parsed.name.length > 80 ||
      (["calories", "protein", "carbs", "fat"] as const).some(
        (key) =>
          draft[key].trim() === "" ||
          !Number.isFinite(parsed[key]) ||
          parsed[key] < 0 ||
          parsed[key] > (key === "calories" ? 5000 : 500),
      )
    ) {
      setError(
        "Enter a name and valid nutrition amounts. Calories: 0–5,000; each macro: 0–500 g.",
      );
      return;
    }
    if (
      savePreset &&
      existingNames.some(
        (name) => name.toLowerCase() === parsed.name.toLowerCase(),
      )
    ) {
      setError(
        "That preset already exists. Use another name or turn off “Save as a quick-log preset”.",
      );
      return;
    }
    onSave(parsed, savePreset);
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="muted text-sm">
        Enter amounts for one serving. Use the nutrition label when available.
      </p>
      <label className="block text-sm" htmlFor={`${formId}-name`}>
        Food and serving
        <input
          className="field mt-2 w-full"
          id={`${formId}-name`}
          maxLength={80}
          required
          placeholder="e.g. Lentil bowl · 250 g"
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <div className="grid grid-cols-2 gap-4">
        {(["calories", "protein", "carbs", "fat"] as const).map((key) => (
          <label
            className="block text-sm capitalize"
            htmlFor={`${formId}-${key}`}
            key={key}
          >
            {key}{" "}
            <span className="muted normal-case">
              ({key === "calories" ? "kcal" : "g"})
            </span>
            <input
              id={`${formId}-${key}`}
              className="field mt-2 w-full"
              type="number"
              inputMode="decimal"
              min="0"
              max={key === "calories" ? 5000 : 500}
              step="0.1"
              required
              value={draft[key]}
              onChange={(event) =>
                setDraft({ ...draft, [key]: event.target.value })
              }
            />
          </label>
        ))}
      </div>
      {!food && (
        <label className="flex items-center gap-3 text-sm">
          <input
            className="size-4 accent-blue-400"
            type="checkbox"
            checked={savePreset}
            onChange={(event) => setSavePreset(event.target.checked)}
          />
          Save as a quick-log preset
        </label>
      )}
      {error && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" type="submit">
          {food ? "Save changes" : "Log food"}
        </button>
      </div>
    </form>
  );
}

export default function Fuel({
  state,
  update,
  compact = false,
}: ModuleProps & { compact?: boolean }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [announcement, setAnnouncement] = useState("");
  const [allMeals, setAllMeals] = useState(false);
  const todayMeals = state.meals.filter((meal) => meal.date === state.day);
  const visibleMeals = (allMeals ? state.meals : todayMeals).slice().reverse();
  const total = todayMeals.reduce(
    (sum, meal) => ({
      calories: sum.calories + meal.calories,
      protein: sum.protein + meal.protein,
      carbs: sum.carbs + meal.carbs,
      fat: sum.fat + meal.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
  const caloriePercent = Math.round(
    (total.calories / Math.max(1, state.targets.calories)) * 100,
  );
  const remainingCalories = Math.round(state.targets.calories - total.calories);
  const foods = [...FOOD_LIBRARY, ...state.customFoods];

  useEffect(() => {
    setDialog(null);
    setAnnouncement("");
  }, [state.day, state.username]);
  useEffect(() => {
    if (!announcement) return;
    const timeout = window.setTimeout(() => setAnnouncement(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [announcement]);

  function logFood(food: Food, savePreset = false) {
    update((current) => ({
      ...current,
      meals: [
        ...current.meals,
        { ...food, id: crypto.randomUUID(), date: current.day },
      ],
      customFoods: savePreset
        ? [...current.customFoods, food]
        : current.customFoods,
    }));
    setDialog(null);
    setAnnouncement(`${food.name} logged.`);
  }
  function changeWater(amount: number) {
    update((current) => ({
      ...current,
      water: Math.max(0, Math.min(10000, current.water + amount)),
    }));
  }

  return (
    <section
      className={compact ? "panel p-5 sm:p-6" : "space-y-6"}
      aria-label="Fuel and nutrition"
    >
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow flex items-center gap-2">
            <Flame size={14} aria-hidden="true" />
            {compact ? "Daily nutrition" : "Nutrition"}
          </p>
          <h2
            className={
              compact
                ? "mt-1 text-2xl font-semibold"
                : "mt-1 text-3xl font-semibold sm:text-4xl"
            }
          >
            {compact ? "Fuel reserves" : "Fuel & nutrition"}
          </h2>
          {!compact && (
            <p className="muted mt-2 text-sm">
              Build consistency, one meal at a time. Targets are estimates from
              your calibration.
            </p>
          )}
        </div>
        <button
          className="btn btn-ghost"
          onClick={() => setDialog({ kind: "create" })}
        >
          <Plus size={16} aria-hidden="true" />
          Log food
        </button>
      </header>

      <div className={compact ? "mt-5" : "panel p-5 sm:p-7"}>
        <div className="grid items-center gap-7 sm:grid-cols-[150px_1fr]">
          <div
            className="relative mx-auto flex size-36 items-center justify-center"
            role="progressbar"
            aria-label="Daily calories"
            aria-valuenow={Math.min(100, caloriePercent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`${Math.round(total.calories)} of ${state.targets.calories} calories, ${caloriePercent} percent`}
          >
            <svg
              className="absolute inset-0 size-full -rotate-90"
              viewBox="0 0 144 144"
              aria-hidden="true"
            >
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="currentColor"
                className="text-blue-950"
                strokeWidth="3"
              />
              <circle
                cx="72"
                cy="72"
                r="64"
                fill="none"
                stroke="currentColor"
                className="text-blue-300 transition-all duration-700 motion-reduce:transition-none"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={
                  2 * Math.PI * 64 * (1 - Math.min(100, caloriePercent) / 100)
                }
              />
            </svg>
            <div className="text-center">
              <Flame
                size={16}
                className="mx-auto mb-1 text-blue-300"
                aria-hidden="true"
              />
              <strong className="block text-3xl font-semibold tabular-nums">
                {Math.round(total.calories).toLocaleString()}
              </strong>
              <span className="muted text-xs tracking-widest">
                OF {state.targets.calories.toLocaleString()} KCAL
              </span>
            </div>
          </div>
          <div className="space-y-4">
            {NUTRIENTS.map(({ key, label, unit, color }) => {
              const consumed = round(total[key]);
              const target = state.targets[key];
              const percent = Math.round(
                (consumed / Math.max(1, target)) * 100,
              );
              return (
                <div key={key}>
                  <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-1.5"
                        style={{ backgroundColor: color }}
                      />
                      {label}
                    </span>
                    <span className="tabular-nums">
                      <strong className="font-medium">{consumed}</strong>
                      <span className="muted">
                        {" "}
                        / {target} {unit}
                      </span>
                    </span>
                  </div>
                  <div
                    className="h-1 bg-white/5"
                    role="progressbar"
                    aria-label={label}
                    aria-valuenow={Math.min(100, percent)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={`${consumed} of ${target} grams, ${percent} percent`}
                  >
                    <div
                      className="h-full transition-[width] duration-500 motion-reduce:transition-none"
                      style={{
                        width: `${Math.min(100, percent)}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}30`,
                      }}
                    />
                  </div>
                  {!compact && (
                    <div className="muted mt-1 flex justify-between text-xs tabular-nums">
                      <span>{percent}%</span>
                      <span>
                        {round(Math.abs(target - consumed))} g{" "}
                        {consumed > target ? "over target" : "remaining"}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/8 pt-4 text-xs">
          <span className="muted">
            {remainingCalories < 0
              ? "Above daily estimate"
              : "Daily budget remaining"}
          </span>
          <span className="tabular-nums text-blue-200">
            {Math.abs(remainingCalories).toLocaleString()} kcal{" "}
            <span className="muted">· {caloriePercent}%</span>
          </span>
        </div>
      </div>

      <div
        className={
          compact ? "mt-5 border-t border-white/8 pt-5" : "panel p-5 sm:p-6"
        }
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Droplets size={20} className="text-blue-300" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-medium">Hydration</h3>
              <p className="muted mt-1 text-xs tabular-nums">
                {(state.water / 1000).toFixed(2)} /{" "}
                {(state.targets.water / 1000).toFixed(2)} L
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost size-10 p-0!"
              aria-label="Remove 250 ml water"
              disabled={state.water <= 0}
              onClick={() => changeWater(-250)}
            >
              <Minus size={15} />
            </button>
            <button
              className="btn btn-ghost"
              disabled={state.water >= 10000}
              onClick={() => changeWater(250)}
            >
              <Plus size={15} aria-hidden="true" />
              250 ml
            </button>
          </div>
        </div>
        <div
          className="mt-4 flex gap-1"
          role="progressbar"
          aria-label="Hydration"
          aria-valuenow={Math.min(
            100,
            Math.round((state.water / Math.max(1, state.targets.water)) * 100),
          )}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={`${state.water} of ${state.targets.water} millilitres`}
        >
          {Array.from({ length: 20 }, (_, index) => (
            <span
              className={`h-1.5 flex-1 ${state.water / Math.max(1, state.targets.water) > index / 20 ? "bg-blue-400/80" : "bg-white/5"}`}
              key={index}
            />
          ))}
        </div>
      </div>

      <div
        className={
          compact ? "mt-5 border-t border-white/8 pt-5" : "panel p-5 sm:p-6"
        }
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <Apple size={16} className="text-blue-300" aria-hidden="true" />
            Quick log
          </h3>
          <span className="muted text-xs">ONE TAP · ONE SERVING</span>
        </div>
        <div
          className={`grid gap-2 ${compact ? "grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}
        >
          {(compact ? foods.slice(0, 4) : foods).map((food, index) => (
            <button
              type="button"
              key={`${food.name}-${index}`}
              onClick={() => logFood(food)}
              className="group flex min-h-18 items-center justify-between gap-2 border border-white/8 bg-white/[0.015] p-3 text-left transition-colors hover:border-blue-400/40 hover:bg-blue-400/5"
              aria-label={`Log ${food.name}, ${food.calories} calories`}
            >
              <span className="min-w-0">
                <span className="block text-xs leading-5 text-slate-200">
                  {food.name}
                </span>
                <span className="muted mt-1 block text-xs">
                  {food.calories} kcal · {food.protein} g protein
                </span>
              </span>
              <Plus
                size={15}
                className="shrink-0 text-blue-400/60 group-hover:text-blue-300"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
        {!compact && (
          <p className="muted mt-4 text-xs">
            Serving estimates vary by brand and preparation. Edit any logged
            meal to match your portion.
          </p>
        )}
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 flex min-h-4 items-center gap-2 text-xs ${announcement ? "text-blue-200" : "muted"}`}
        >
          {announcement && <Check size={13} aria-hidden="true" />}
          {announcement}
        </p>
      </div>

      {!compact && (
        <section className="panel overflow-hidden" aria-label="Today's meals">
          <header className="flex items-center justify-between gap-3 border-b border-white/8 p-5 sm:px-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <UtensilsCrossed
                size={17}
                className="text-blue-300"
                aria-hidden="true"
              />
              {allMeals ? "Meal history" : "Today’s food log"}
            </h3>
            <button
              className="btn btn-ghost"
              onClick={() => setAllMeals(!allMeals)}
            >
              {allMeals ? "Today only" : "All meals"}
            </button>
          </header>
          {visibleMeals.length === 0 ? (
            <div className="p-8 text-center">
              <UtensilsCrossed
                size={24}
                className="mx-auto mb-3 text-blue-700"
                aria-hidden="true"
              />
              <p className="text-sm">Your first meal starts here.</p>
              <p className="muted mt-2 text-xs">
                Choose a quick-log serving or add your own food.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/8">
              {visibleMeals.map((meal) => (
                <li
                  key={meal.id}
                  className="flex items-center justify-between gap-3 p-4 sm:px-6"
                >
                  <div className="min-w-0">
                    <h4 className="break-words text-sm">{meal.name}</h4>
                    {allMeals && (
                      <time className="text-xs muted" dateTime={meal.date}>
                        {meal.date}
                      </time>
                    )}
                    <p className="muted mt-1 text-[11px] tabular-nums">
                      {meal.calories} kcal{" "}
                      <span className="mx-1 text-slate-700">/</span> P{" "}
                      {meal.protein} · C {meal.carbs} · F {meal.fat} g
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      className="btn btn-ghost size-10 p-0!"
                      onClick={() => setDialog({ kind: "edit", meal })}
                      aria-label={`Edit ${meal.name}`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      className="btn btn-ghost size-10 p-0! hover:text-rose-300"
                      onClick={() => setDialog({ kind: "delete", meal })}
                      aria-label={`Delete ${meal.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {dialog?.kind === "create" && (
        <Modal title="Log a custom food" onClose={() => setDialog(null)}>
          <FoodForm
            existingNames={state.customFoods.map((food) => food.name)}
            onCancel={() => setDialog(null)}
            onSave={logFood}
          />
        </Modal>
      )}
      {dialog?.kind === "edit" && (
        <Modal title="Edit meal" onClose={() => setDialog(null)}>
          <FoodForm
            food={dialog.meal}
            existingNames={[]}
            onCancel={() => setDialog(null)}
            onSave={(food) => {
              update((current) => ({
                ...current,
                meals: current.meals.map((meal) =>
                  meal.id === dialog.meal.id ? { ...meal, ...food } : meal,
                ),
              }));
              setDialog(null);
              setAnnouncement("Meal updated.");
            }}
          />
        </Modal>
      )}
      {dialog?.kind === "delete" && (
        <Modal title="Delete this meal?" onClose={() => setDialog(null)}>
          <p className="muted text-sm">
            Remove{" "}
            <strong className="text-slate-200">{dialog.meal.name}</strong> from
            your log? Your daily totals will be recalculated.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setDialog(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                update((current) => ({
                  ...current,
                  meals: current.meals.filter(
                    (meal) => meal.id !== dialog.meal.id,
                  ),
                }));
                setDialog(null);
                setAnnouncement("Meal deleted.");
              }}
            >
              Delete meal
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
