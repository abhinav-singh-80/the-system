import { Component, useState } from "react";
import type { ErrorInfo, ReactNode } from "react";
import type { Username } from "../lib/types";
import { importBackup, saveState, stateKey } from "../lib/storage";
function Recovery({
  username,
  onLogout,
}: {
  username: Username | null;
  onLogout: () => void;
}) {
  const [error, setError] = useState("");
  return (
    <main className="max-w-xl mx-auto p-8 pt-24">
      <p className="eyebrow text-primary">SYSTEM RECOVERY</p>
      <h1 className="font-display text-4xl mt-4">
        Your saved data needs attention.
      </h1>
      <p className="muted leading-relaxed">
        Your progress has not been deleted. Download the stored data before
        making changes, or restore a valid backup for this hunter.
      </p>
      <div className="flex gap-3 flex-wrap mt-6">
        <button className="btn btn-primary" onClick={() => location.reload()}>
          Reload
        </button>
        <button className="btn btn-ghost" onClick={onLogout}>
          Log out
        </button>
        {username && (
          <button
            className="btn btn-ghost"
            onClick={() => {
              try {
                const blob = new Blob(
                    [localStorage.getItem(stateKey(username)) ?? ""],
                    { type: "text/plain" },
                  ),
                  url = URL.createObjectURL(blob),
                  a = document.createElement("a");
                a.href = url;
                a.download = `System_Recovery_${username}.txt`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 1000);
              } catch {
                setError(
                  "Browser storage is unavailable. Check browser privacy settings.",
                );
              }
            }}
          >
            Download stored data
          </button>
        )}
      </div>
      {username && (
        <label className="block mt-8 text-xs muted">
          Restore an intact backup (replaces this hunter’s data)
          <input
            className="field block mt-3 w-full"
            type="file"
            accept=".json,application/json"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 8_000_000)
                  throw Error("Select a backup smaller than 8 MB.");
                const next = importBackup(await file.text(), username);
                if (
                  !window.confirm(
                    "Replace this hunter’s stored data with the validated backup?",
                  )
                )
                  return;
                saveState(next);
                location.reload();
              } catch {
                setError(
                  "Restore failed. Use an intact backup for this hunter, and check that browser storage is available.",
                );
              }
            }}
          />
        </label>
      )}
      {error && (
        <p role="alert" className="text-red-300 mt-5 text-sm">
          {error}
        </p>
      )}
    </main>
  );
}
export default class ErrorBoundary extends Component<
  { children: ReactNode; username: Username | null; onLogout: () => void },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(
      "The System could not load",
      error.message,
      info.componentStack,
    );
  }
  render() {
    if (this.state.error)
      return (
        <Recovery
          username={this.props.username}
          onLogout={this.props.onLogout}
        />
      );
    return this.props.children;
  }
}
