import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Bell,
  ChevronRight,
  Crosshair,
  Database,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Swords,
  Utensils,
  Volume2,
  VolumeX,
  X,
  Clock3,
} from "lucide-react";
import type { Username, View } from "../lib/types";
import { accounts } from "../lib/auth";
import { useHunter } from "../lib/useHunter";
import {
  levelFor,
  toggleQuest,
  rankFor,
  localDate,
  multiplier,
} from "../lib/engine";
import { playSound } from "../lib/sound";
import Awakening from "./Awakening";
import Overview from "./Overview";
import QuestBoard from "./QuestBoard";
import Fuel from "./Fuel";
import PenaltyZone from "./PenaltyZone";
import DataVault from "./DataVault";
import HunterStatus from "./HunterStatus";
import Modal from "./Modal";
const links: {
  id: View;
  label: string;
  icon: typeof Activity;
  number: string;
}[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, number: "01" },
  { id: "quests", label: "Daily quests", icon: Swords, number: "02" },
  { id: "fuel", label: "Fuel & nutrition", icon: Utensils, number: "03" },
  {
    id: "recovery",
    label: "Aesthetics & recovery",
    icon: Activity,
    number: "04",
  },
  { id: "archive", label: "System archive", icon: Database, number: "05" },
];
function resetTime() {
  const now = new Date(),
    midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight.getTime() - now.getTime();
  return `${String(Math.floor(diff / 3600000)).padStart(2, "0")}:${String(Math.floor(diff / 60000) % 60).padStart(2, "0")}:${String(Math.floor(diff / 1000) % 60).padStart(2, "0")}`;
}
export default function SystemShell({
  username,
  onLogout,
}: {
  username: Username;
  onLogout: () => void;
}) {
  const { state, update, error } = useHunter(username);
  const [view, setView] = useState<View>("overview");
  const [menu, setMenu] = useState(false);
  const [notice, setNotice] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [toast, setToast] = useState("");
  const [countdown, setCountdown] = useState(resetTime);
  const lastLevel = useRef(levelFor(state.totalXp));
  const warned = useRef<string | null>(null);
  const locked = Boolean(state.penalty && !state.penalty.cleared);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [Boolean(state.profile)]);
  useEffect(() => {
    const t = setInterval(() => setCountdown(resetTime()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    const level = levelFor(state.totalXp);
    if (level > lastLevel.current) {
      playSound("level", state.soundEnabled);
      setToast(`LEVEL ${level} ACHIEVED · 3 attribute points earned`);
    }
    lastLevel.current = level;
  }, [state.totalXp, state.soundEnabled]);
  useEffect(() => {
    if (locked && state.penalty && warned.current !== state.penalty.fromDate) {
      playSound("warning", state.soundEnabled);
      warned.current = state.penalty.fromDate;
    }
  }, [locked, state.penalty, state.soundEnabled]);
  function navigate(next: View) {
    setView(next);
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function complete(id: string) {
    const q = state.quests.find((q) => q.id === id);
    if (!q || locked) return;
    update((s) =>
      s.quests.find((item) => item.id === id)?.completed === q.completed
        ? toggleQuest(s, id)
        : s,
    );
    if (!q.completed) {
      playSound("complete", state.soundEnabled);
      setToast(
        `${q.name} completed · +${Math.round(q.xp * multiplier(state))} XP`,
      );
    }
  }
  if (!state.profile)
    return (
      <div className="awakening-root">
        <header className="gateway-header">
          <div className="wordmark">
            <Crosshair />
            <span>THE SYSTEM</span>
          </div>
          <button className="btn btn-ghost" onClick={onLogout}>
            <LogOut size={14} />
            Log out
          </button>
        </header>
        {error && (
          <div role="alert" className="error-banner">
            {error}
          </div>
        )}
        <Awakening
          displayName={accounts[username].name}
          onComplete={(profile, quests, targets) =>
            update((s) => ({
              ...s,
              profile,
              quests,
              targets,
              day: localDate(),
            }))
          }
        />
      </div>
    );
  return (
    <div
      className={`app-shell ${locked ? "penalty-active" : ""}`}
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("button"))
          playSound("tap", state.soundEnabled);
      }}
    >
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      {menu && (
        <button
          aria-label="Close navigation"
          className="sidebar-scrim"
          onClick={() => setMenu(false)}
        />
      )}
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="wordmark">
            <Crosshair />
            <span>THE SYSTEM</span>
          </div>
          <span className="eyebrow">YOUR EVOLUTION. YOUR RULES.</span>
          <button
            className="icon-btn close-nav"
            aria-label="Close navigation"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="sidebar-section eyebrow">COMMAND CENTER</div>
        <nav aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.id}
              className={`nav-link ${view === link.id ? "active" : ""}`}
              onClick={() => navigate(link.id)}
              aria-current={view === link.id ? "page" : undefined}
            >
              <link.icon size={17} strokeWidth={1.5} />
              <span>{link.label}</span>
              <small>{link.number}</small>
            </button>
          ))}
        </nav>
        <div className="sidebar-challenge">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck size={15} />
            <span className="eyebrow text-primary">HUNTER PROTOCOL</span>
          </div>
          <p>
            Consistency
            <br />
            over perfection.
          </p>
          <span className="text-xs text-slate-500 leading-relaxed">
            Small actions.
            <br />
            Extraordinary evolution.
          </span>
          <div className="sidebar-rule" />
        </div>
        <div className="sidebar-bottom">
          <div className="flex gap-3 items-center">
            <div className="avatar-small">
              {accounts[username].name.charAt(0)}
            </div>
            <div>
              <strong className="font-display text-lg">
                {accounts[username].name}
              </strong>
              <div className="text-[11px] muted">
                LEVEL {levelFor(state.totalXp)} ·{" "}
                {rankFor(levelFor(state.totalXp))}-RANK
              </div>
            </div>
          </div>
          <button
            className="icon-btn"
            aria-label="Log out"
            title="Log out"
            onClick={() => setLogoutConfirm(true)}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
      <div className="app-body">
        <header className="topbar sticky top-0 z-40 w-full bg-[#040711]/85 backdrop-blur-md border-b border-blue-500/15">
          <div className="flex items-center gap-4">
            <button
              className="icon-btn mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span>THE SYSTEM</span>
              <ChevronRight size={12} />
              <span className="text-slate-300">
                {links.find((l) => l.id === view)?.label}
              </span>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-5 items-center">
            <div className="system-online">
              <span className="status-dot" /> SYSTEM ONLINE
            </div>
            <button
              aria-label={state.soundEnabled ? "Mute sound" : "Enable sound"}
              title={state.soundEnabled ? "Mute sound" : "Enable sound"}
              className="icon-btn"
              onClick={() =>
                update((s) => ({ ...s, soundEnabled: !s.soundEnabled }))
              }
            >
              {state.soundEnabled ? (
                <Volume2 size={17} />
              ) : (
                <VolumeX size={17} />
              )}
            </button>
            <button
              aria-label="Notifications"
              title="Notifications"
              className="icon-btn relative"
              onClick={() => setNotice(true)}
            >
              <Bell size={17} />
              {(state.evolution.length > 0 || locked) && (
                <span className="notification-dot" />
              )}
            </button>
            <div className="top-avatar">
              {accounts[username].name.charAt(0)}
            </div>
          </div>
        </header>
        <main key={view} id="main-content" className="main-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow mb-2">
                {new Date(`${state.day}T12:00:00`).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <h2>
                {view === "overview"
                  ? "Welcome back, "
                  : view === "quests"
                    ? "Your daily mission"
                    : view === "fuel"
                      ? "Fuel your evolution"
                      : view === "recovery"
                        ? "Recover. Refine. Repeat."
                        : "Your system, preserved."}
                {view === "overview" && (
                  <span className="text-primary">
                    {accounts[username].name}.
                  </span>
                )}
              </h2>
              <p className="text-[11px] muted">
                {view === "overview"
                  ? "Another day to surpass your limits. Let’s get to work."
                  : view === "quests"
                    ? "Intentional movement. Measurable progress."
                    : view === "fuel"
                      ? "Build the foundation for your next level."
                      : view === "recovery"
                        ? "Strong posture and simple care, built into your day."
                        : "A record of the work. A backup for what comes next."}
              </p>
            </div>
            <div className="reset-clock">
              <Clock3 size={15} />
              <div>
                <span className="eyebrow">DAILY RESET IN</span>
                <strong>{countdown}</strong>
              </div>
            </div>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              {error}
            </div>
          )}
          {state.evolution.length > 0 && (
            <div className="evolution-banner">
              <div>
                <span className="eyebrow text-primary">QUEST EVOLUTION</span>
                <p>{state.evolution.join(" ")}</p>
              </div>
              <button
                className="icon-btn"
                aria-label="Dismiss evolution notice"
                onClick={() => update((s) => ({ ...s, evolution: [] }))}
              >
                <X size={16} />
              </button>
            </div>
          )}
          <PenaltyZone state={state} update={update} />
          {view === "overview" ? (
            <Overview
              state={state}
              update={update}
              onComplete={complete}
              onNavigate={navigate}
            />
          ) : view === "quests" ? (
            <div className="detail-grid">
              <QuestBoard state={state} update={update} onComplete={complete} />
              <HunterStatus state={state} update={update} />
            </div>
          ) : view === "fuel" ? (
            <Fuel state={state} update={update} />
          ) : view === "recovery" ? (
            <>
              <div className="recovery-intro panel p-6 mb-6 flex gap-4 items-start">
                <Activity size={24} className="text-primary" />
                <div>
                  <h3 className="section-title mb-2">
                    The other side of strength.
                  </h3>
                  <p className="muted text-xs leading-relaxed max-w-2xl">
                    Gentle posture drills and skin care support comfort and
                    healthy habits. These routines do not change facial bone
                    structure or treat medical conditions. Keep touch gentle and
                    stop if there’s pain.
                  </p>
                </div>
              </div>
              <QuestBoard
                state={state}
                update={update}
                category="recovery"
                onComplete={complete}
              />
            </>
          ) : (
            <DataVault state={state} update={update} />
          )}
          <footer className="app-footer">
            <span className="eyebrow">
              THE SYSTEM <span className="text-primary">/</span> YOU ARE YOUR
              ONLY LIMIT.
            </span>
            <span className="text-[11px] text-slate-600 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-emerald-400" />
              Saved on this device <ArrowUpRight size={11} />
            </span>
          </footer>
        </main>
      </div>
      {toast && (
        <div role="status" className="toast">
          <Crosshair size={20} />
          <div>
            <span className="system-badge">[ SYSTEM NOTIFICATION ]</span>
            <p className="mb-0 mt-2">{toast}</p>
          </div>
        </div>
      )}
      {notice && (
        <Modal title="System notifications" onClose={() => setNotice(false)}>
          <div className="space-y-4">
            {locked && (
              <div className="border border-rose-500/30 bg-rose-950/20 p-4">
                <h3 className="text-rose-400">Penalty zone active</h3>
                <p className="muted text-xs mt-2">
                  Clear one consequence to unlock today’s quests.
                </p>
              </div>
            )}
            {state.evolution.map((n, i) => (
              <p className="border border-blue-400/20 p-4 text-sm" key={i}>
                {n}
              </p>
            ))}
            <p className="muted text-sm leading-relaxed">
              Your daily quests reset at midnight in this device’s local
              timezone. Complete mandatory training to build your streak. Every
              level earns three attribute points.
            </p>
          </div>
        </Modal>
      )}
      {logoutConfirm && (
        <Modal
          title="Log out of The System?"
          onClose={() => setLogoutConfirm(false)}
        >
          <p className="muted text-sm mb-6">
            Your progress will stay on this device. You’ll need your Hunter ID
            and password to return.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              className="btn btn-ghost"
              onClick={() => setLogoutConfirm(false)}
            >
              Cancel
            </button>
            <button className="btn btn-primary" onClick={onLogout}>
              Log out
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
