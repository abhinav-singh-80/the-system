import { useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  Shield,
  Crosshair,
  LockKeyhole,
} from "lucide-react";
import { login } from "../lib/auth";
import type { Username } from "../lib/types";
export default function Gateway({
  onLogin,
}: {
  onLogin: (user: Username) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="gateway min-h-screen flex flex-col">
      <header className="gateway-header">
        <a className="wordmark" href="/" aria-label="The System home">
          <Crosshair />
          <span>THE SYSTEM</span>
        </a>
        <span className="eyebrow hidden sm:block">PERSONAL EVOLUTION OS</span>
      </header>
      <main className="gateway-main">
        <section className="gateway-story">
          <div className="eyebrow text-primary mb-6 flex items-center gap-3">
            <span className="status-dot" /> YOUR NEXT LEVEL IS WAITING
          </div>
          <h1>
            YOU HAVE
            <br />
            BEEN <span className="text-primary glow-text">CHOSEN.</span>
          </h1>
          <p className="text-slate-400 max-w-md mt-6 leading-relaxed">
            Strength is built, not granted. Turn your training, nutrition, and
            daily discipline into a system that evolves with you.
          </p>
          <div className="gateway-seal" aria-hidden="true">
            <div className="seal-orbit" />
            <div className="seal-orbit second" />
            <Shield size={116} strokeWidth={0.65} />
            <span>E</span>
          </div>
          <div className="grid grid-cols-3 gap-5 border-t border-white/10 pt-6 mt-8 max-w-md">
            <div>
              <div className="eyebrow text-slate-200">TRAIN</div>
              <p className="text-xs text-slate-500 mt-2">With intention</p>
            </div>
            <div>
              <div className="eyebrow text-slate-200">FUEL</div>
              <p className="text-xs text-slate-500 mt-2">For the mission</p>
            </div>
            <div>
              <div className="eyebrow text-slate-200">EVOLVE</div>
              <p className="text-xs text-slate-500 mt-2">Every single day</p>
            </div>
          </div>
        </section>
        <section className="panel beam gateway-form">
          <div className="flex justify-between items-center mb-9">
            <Fingerprint size={34} className="text-primary" strokeWidth={1} />
            <span className="eyebrow">HUNTER GATEWAY</span>
          </div>
          <h2 className="text-4xl font-display font-semibold uppercase">
            Welcome, Hunter.
          </h2>
          <p className="muted text-sm mt-2 mb-8">
            Log in to access your personal system.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                onLogin(await login(username, password));
              } catch (e) {
                setError(e instanceof Error ? e.message : "Unable to sign in.");
              } finally {
                setBusy(false);
              }
            }}
            className="space-y-5"
          >
            <label className="block">
              <span className="eyebrow block mb-2">HUNTER ID</span>
              <input
                className="field w-full"
                autoComplete="username"
                placeholder="Enter your hunter ID"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={60}
              />
            </label>
            <label className="block">
              <span className="eyebrow block mb-2">PASSWORD / PIN</span>
              <div className="relative">
                <input
                  className="field w-full pr-12"
                  autoComplete="current-password"
                  type={show ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={200}
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 icon-btn"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {error && (
              <p role="alert" className="text-red-400 text-sm">
                {error}
              </p>
            )}
            <div className="text-xs muted flex gap-2 items-center">
              <LockKeyhole size={13} /> Your session stays active until you log
              out.
            </div>
            <button
              disabled={busy}
              className="btn btn-primary w-full justify-between mt-3"
            >
              {busy ? "Connecting…" : "Log in"}
              <ArrowRight size={17} />
            </button>
          </form>
          <div className="border-t border-white/10 mt-8 pt-5 text-[11px] text-slate-500 leading-relaxed">
            Local profile access · Stored on this device
            <br />
            Use a private device for your personal health information.
          </div>
        </section>
      </main>
      <footer className="gateway-footer eyebrow">
        THE SYSTEM <span className="text-slate-600">/</span> BECOME YOUR
        STRONGEST SELF.
      </footer>
    </div>
  );
}
