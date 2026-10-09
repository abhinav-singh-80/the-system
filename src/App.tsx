import { useEffect, useState } from "react";
import Gateway from "./components/Gateway";
import SystemShell from "./components/SystemShell";
import ErrorBoundary from "./components/ErrorBoundary";
import { currentSession, logout, SESSION_KEY } from "./lib/auth";
export default function App() {
  const [user, setUser] = useState(currentSession);
  useEffect(() => {
    const sync = (e: StorageEvent) => {
      if (e.key === SESSION_KEY || e.key === null) setUser(currentSession());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  return (
    <ErrorBoundary
      key={user ?? "gateway"}
      username={user}
      onLogout={() => {
        logout();
        setUser(null);
      }}
    >
      {user ? (
        <SystemShell
          key={user}
          username={user}
          onLogout={() => {
            logout();
            setUser(null);
          }}
        />
      ) : (
        <Gateway onLogin={setUser} />
      )}
    </ErrorBoundary>
  );
}
