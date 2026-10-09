import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import {
  Archive,
  CalendarDays,
  Check,
  CheckCheck,
  Download,
  FileJson,
  HardDrive,
  LoaderCircle,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";
import type { DayLog, HunterState, ModuleProps } from "../lib/types";
import { exportBackup, importBackup } from "../lib/storage";
import { localDate, mandatoryComplete } from "../lib/engine";
import Modal from "./Modal";

const MAX_FILE_SIZE = 8_000_000;
interface BackupPreview {
  state: HunterState;
  filename: string;
  exportedAt: string | null;
}
function displayDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function errorMessage(error: unknown): string {
  if (error instanceof SyntaxError)
    return "This file is not valid JSON. Select a System backup downloaded from this app.";
  if (error instanceof Error) {
    if (error.name === "ZodError")
      return "This backup contains missing or invalid data. Nothing has changed. Choose an intact System backup.";
    return error.message;
  }
  return "The file could not be read. Nothing has changed; try selecting the backup again.";
}

export default function DataVault({ state, update }: ModuleProps) {
  const input = useRef<HTMLInputElement>(null);
  const readVersion = useRef(0);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const today: DayLog = {
    date: state.day,
    restDay: state.restDay,
    completed: state.quests.filter((quest) => quest.completed).length,
    total: state.quests.length,
    allComplete: mandatoryComplete(state),
    xp: state.quests.reduce(
      (sum, quest) =>
        sum + (quest.completed ? (quest.earnedXp ?? quest.xp) : 0),
      0,
    ),
  };
  const logs = [
    ...state.history.filter((log) => log.date !== state.day),
    today,
  ].sort((a, b) => b.date.localeCompare(a.date));
  const historyByDay = new Map(logs.map((log) => [log.date, log]));
  const visibleLogs = showAll ? logs : logs.slice(0, 10);
  const completedDays =
    state.history.filter((log) => log.allComplete).length +
    Number(today.allComplete);
  const recentDays = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(`${state.day}T12:00:00`);
    date.setDate(date.getDate() - 27 + index);
    return localDate(date);
  });

  useEffect(
    () => () => {
      readVersion.current += 1;
    },
    [],
  );
  useEffect(() => {
    readVersion.current += 1;
    setPreview(null);
    setError("");
    setNotice("");
    setReading(false);
  }, [state.username]);

  async function readBackup(file: File) {
    const version = ++readVersion.current;
    setError("");
    setNotice("");
    setPreview(null);
    setReading(true);
    setDragging(false);
    try {
      if (file.size > MAX_FILE_SIZE)
        throw new Error(
          "The backup is larger than 8 MB. Select a smaller System backup.",
        );
      if (file.size === 0)
        throw new Error(
          "This file is empty. Select a System backup containing your data.",
        );
      const text = await file.text();
      const parsed = importBackup(text, state.username);
      const envelope: { exportedAt?: unknown } = JSON.parse(text);
      const exportedAt =
        typeof envelope.exportedAt === "string" &&
        Number.isFinite(Date.parse(envelope.exportedAt))
          ? envelope.exportedAt
          : null;
      if (version === readVersion.current)
        setPreview({ state: parsed, filename: file.name, exportedAt });
    } catch (caught) {
      if (version === readVersion.current) setError(errorMessage(caught));
    } finally {
      if (version === readVersion.current) setReading(false);
    }
  }
  function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void readBackup(file);
    event.target.value = "";
  }
  function dropFile(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length !== 1) {
      setError("Choose one JSON backup at a time.");
      return;
    }
    void readBackup(event.dataTransfer.files[0]);
  }
  function download() {
    setError("");
    setNotice("");
    try {
      const blob = new Blob([exportBackup(state)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `System_Backup_${state.day}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("Backup download started. Keep this file somewhere private.");
    } catch (caught) {
      setError(errorMessage(caught));
    }
  }

  return (
    <section className="space-y-6" aria-label="Activity archive and backups">
      <header>
        <p className="eyebrow flex items-center gap-2">
          <Archive size={14} aria-hidden="true" />
          Your records
        </p>
        <h2 className="mt-1 font-display text-4xl font-semibold uppercase tracking-wide">
          Activity & backups
        </h2>
        <p className="muted mt-2 text-sm">
          Your progress belongs to you. Review your history and keep a copy.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="panel p-5">
          <p className="eyebrow">Completed days</p>
          <p className="mb-1 mt-3 font-display text-4xl font-semibold text-cyan-200 tabular-nums">
            {completedDays.toString().padStart(2, "0")}
          </p>
          <p className="muted mb-0 text-xs">All mandatory quests complete</p>
        </div>
        <div className="panel p-5">
          <p className="eyebrow">Recorded meals</p>
          <p className="mb-1 mt-3 font-display text-4xl font-semibold tabular-nums">
            {state.meals.length.toString().padStart(2, "0")}
          </p>
          <p className="muted mb-0 text-xs">Across your saved activity</p>
        </div>
        <div className="panel p-5">
          <p className="eyebrow">Total experience</p>
          <p className="mb-1 mt-3 font-display text-4xl font-semibold tabular-nums">
            {state.totalXp.toLocaleString()}{" "}
            <span className="text-lg text-cyan-400">XP</span>
          </p>
          <p className="muted mb-0 text-xs">
            Current hunter · {state.username}
          </p>
        </div>
      </div>

      <section className="panel p-5 sm:p-6" aria-label="Recent activity">
        <header className="mb-5 flex items-center justify-between gap-3">
          <h3 className="section-title flex items-center gap-2">
            <CalendarDays
              size={18}
              className="text-cyan-300"
              aria-hidden="true"
            />
            Consistency record
          </h3>
          <span className="muted text-[10px]">PAST 28 DAYS</span>
        </header>
        <div className="grid grid-cols-7 gap-2 sm:grid-cols-14">
          {recentDays.map((day) => {
            const log = historyByDay.get(day);
            const status = log?.allComplete
              ? "All mandatory quests complete"
              : log && log.completed > 0
                ? "Some quests complete"
                : log
                  ? "No quests complete"
                  : "No record";
            const label = `${displayDate(day)}: ${status}${log ? `, ${log.completed} of ${log.total} quests` : ""}`;
            return (
              <div
                key={day}
                title={label}
                aria-label={label}
                className={`flex aspect-square min-h-8 items-center justify-center border text-[10px] tabular-nums ${day === state.day ? "outline outline-offset-2 outline-cyan-500/50" : ""} ${log?.allComplete ? "border-cyan-400/60 bg-cyan-400/20 text-cyan-100" : log && log.completed > 0 ? "border-amber-300/30 bg-amber-300/10 text-amber-100" : log ? "border-slate-600/60 bg-slate-500/10 text-slate-400" : "border-white/5 text-slate-600"}`}
              >
                {Number(day.slice(-2))}
              </div>
            );
          })}
        </div>
        <div className="muted mt-4 flex flex-wrap justify-between gap-3 text-[10px]">
          <span>
            {displayDate(recentDays[0])} — {displayDate(state.day)}
          </span>
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-2 bg-cyan-400/60" />
              Complete
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 bg-amber-300/50" />
              Partial
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 border border-white/10" />
              No record
            </span>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <section className="panel overflow-hidden" aria-label="Daily history">
          <header className="flex items-center justify-between gap-2 border-b border-white/8 p-5">
            <h3 className="section-title mb-0">Daily history</h3>
            <span className="muted text-xs">
              {logs.length} {logs.length === 1 ? "day" : "days"}
            </span>
          </header>
          <ul className="divide-y divide-white/8">
            {visibleLogs.map((log) => (
              <li
                className="flex items-center justify-between gap-3 px-5 py-4"
                key={log.date}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex size-8 items-center justify-center border ${log.allComplete ? "border-cyan-400/20 bg-cyan-400/5 text-cyan-300" : "border-white/10 text-slate-500"}`}
                  >
                    {log.allComplete ? (
                      <CheckCheck size={15} aria-hidden="true" />
                    ) : (
                      <CalendarDays size={15} aria-hidden="true" />
                    )}
                  </span>
                  <div>
                    <time dateTime={log.date} className="text-xs">
                      {log.date === state.day ? "Today" : displayDate(log.date)}
                    </time>
                    <p className="muted mb-0 mt-1 text-[10px]">
                      {log.completed} / {log.total} quests
                      {log.date === state.day
                        ? " · In progress"
                        : log.allComplete
                          ? " · Complete"
                          : " · Incomplete"}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-cyan-200 tabular-nums">
                  +{log.xp} XP
                </span>
              </li>
            ))}
          </ul>
          {logs.length > 10 && (
            <div className="border-t border-white/8 p-4 text-center">
              <button
                className="btn btn-ghost"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show recent days" : `Show all ${logs.length} days`}
              </button>
            </div>
          )}
          {state.history.length === 0 && (
            <p className="muted m-5 text-xs leading-relaxed">
              Your first day is in progress. Completed days will appear here
              after midnight.
            </p>
          )}
        </section>

        <div className="space-y-5">
          <section className="panel p-5 sm:p-6" aria-label="Export backup">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex size-10 items-center justify-center border border-cyan-400/20 bg-cyan-400/5 text-cyan-300">
                <Download size={19} aria-hidden="true" />
              </span>
              <div>
                <h3 className="section-title mb-1">Export your data</h3>
                <p className="muted mb-0 text-[11px]">
                  Profile, quests, nutrition and history
                </p>
              </div>
            </div>
            <p className="muted mb-5 text-xs leading-relaxed">
              Download a JSON backup for{" "}
              <strong className="text-slate-200">{state.username}</strong>. This
              file can restore this hunter on another browser or device.
            </p>
            <button className="btn btn-primary w-full" onClick={download}>
              <Download size={15} aria-hidden="true" />
              Download backup
            </button>
          </section>
          <section className="panel p-5 sm:p-6" aria-label="Restore backup">
            <h3 className="section-title mb-2">Restore a backup</h3>
            <p className="muted text-xs leading-relaxed">
              Restore this hunter’s saved data. You can review the file before
              replacing anything.
            </p>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  setDragging(false);
              }}
              onDrop={dropFile}
              className={`mt-4 border border-dashed p-6 text-center transition-colors ${dragging ? "border-cyan-300 bg-cyan-400/10" : "border-slate-600/70 bg-black/10"}`}
            >
              {reading ? (
                <LoaderCircle
                  size={25}
                  className="mx-auto mb-3 animate-spin text-cyan-300 motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Upload
                  size={25}
                  className="mx-auto mb-3 text-cyan-400/70"
                  aria-hidden="true"
                />
              )}
              <p className="mb-2 text-xs">
                {reading ? "Validating backup…" : "Drop your JSON backup here"}
              </p>
              <p className="muted mb-4 text-[10px]">One file · up to 8 MB</p>
              <button
                className="btn btn-ghost"
                disabled={reading}
                onClick={() => input.current?.click()}
              >
                <FileJson size={14} aria-hidden="true" />
                Choose file
              </button>
              <input
                ref={input}
                className="hidden"
                type="file"
                accept="application/json,.json"
                onChange={chooseFile}
                aria-label="Select JSON backup"
              />
            </div>
            <p className="muted mb-0 mt-4 text-[10px] leading-relaxed">
              Only backups belonging to {state.username} can be restored here.
              Other hunter accounts stay unchanged.
            </p>
          </section>
        </div>
      </div>

      {error && (
        <div
          className="flex items-start gap-3 border border-rose-400/30 bg-rose-500/5 p-4 text-sm text-rose-200"
          role="alert"
        >
          <X size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p className="mb-0">{error}</p>
        </div>
      )}
      {notice && (
        <div
          className="flex items-start gap-3 border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs text-cyan-100"
          role="status"
        >
          <Check size={17} className="shrink-0" aria-hidden="true" />
          <p className="mb-0">{notice}</p>
        </div>
      )}

      <div className="flex flex-wrap items-start gap-5 border-t border-white/8 pt-5 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <HardDrive size={16} className="text-cyan-400" aria-hidden="true" />
          Saved on this browser
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <ShieldCheck
            size={16}
            className="text-slate-500"
            aria-hidden="true"
          />
          Cloud sync not connected
        </div>
        <p className="muted max-w-2xl text-[11px] leading-relaxed">
          Clearing browser storage removes local progress. Backups contain your
          profile and activity in plain text; keep a private copy before
          changing devices or browsers.
        </p>
      </div>

      {preview && (
        <Modal title="Review backup" onClose={() => setPreview(null)}>
          <div className="mb-5 flex items-center gap-3">
            <FileJson size={24} className="text-cyan-300" aria-hidden="true" />
            <div className="min-w-0">
              <p className="mb-1 break-all text-sm">{preview.filename}</p>
              <p className="muted mb-0 text-[11px]">
                {preview.exportedAt
                  ? `Exported ${new Date(preview.exportedAt).toLocaleString()}`
                  : "Export date unavailable"}
              </p>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 border border-white/10 bg-black/20 p-4 text-sm">
            <div>
              <dt className="muted text-[10px]">Hunter</dt>
              <dd className="ml-0 mt-1">{preview.state.username}</dd>
            </div>
            <div>
              <dt className="muted text-[10px]">Experience</dt>
              <dd className="ml-0 mt-1">
                {preview.state.totalXp.toLocaleString()} XP
              </dd>
            </div>
            <div>
              <dt className="muted text-[10px]">Quests / meals</dt>
              <dd className="ml-0 mt-1">
                {preview.state.quests.length} / {preview.state.meals.length}
              </dd>
            </div>
            <div>
              <dt className="muted text-[10px]">History</dt>
              <dd className="ml-0 mt-1">{preview.state.history.length} days</dd>
            </div>
          </dl>
          <p className="mt-5 text-sm leading-relaxed">
            This will replace the current profile, quests, meals and progress
            for <strong className="text-cyan-200">{state.username}</strong>.
            Export your current data first if you want to keep it.
          </p>
          <p className="muted text-xs leading-relaxed">
            Daily quests are advanced to today when an older backup is restored.
            Any applicable missed-day consequence still applies.
          </p>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button className="btn btn-ghost" onClick={() => setPreview(null)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                update(() => preview.state);
                setPreview(null);
                setNotice(
                  "Restore requested. Your activity will refresh when the backup is saved.",
                );
              }}
            >
              <Upload size={15} aria-hidden="true" />
              Replace this hunter’s data
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}
