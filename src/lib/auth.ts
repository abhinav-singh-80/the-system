import type { Username } from "./types";
export const accounts: Record<Username, { name: string; digest: string }> = {
  abhinav: {
    name: "Abhinav",
    digest: "182feedb8dd3c6092bbce523be966d2e60c39f03002c516e3a54d4bedd3c1351",
  },
  hunter_02: {
    name: "Ashutosh",
    digest: "f7ff47a1286cf4a99cdbdc9d61b28b615422d1b1e2e2e26a0075c3b5dece4558",
  },
  hunter_03: {
    name: "Hunter 03",
    digest: "8ea1ef7f2eb09e486c754be2f078603722b61985af6ff24ef1955c5d8b88ec4a",
  },
};
export const SESSION_KEY = "the_system_session";
export function currentSession(): Username | null {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null");
    return s &&
      typeof s.username === "string" &&
      Object.hasOwn(accounts, s.username) &&
      typeof s.token === "string" &&
      s.token.length === 36
      ? s.username
      : null;
  } catch {
    return null;
  }
}
export async function login(
  username: string,
  password: string,
): Promise<Username> {
  const user = username.trim().toLowerCase();
  const bytes = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(password),
  );
  const digest = Array.from(new Uint8Array(bytes))
    .map((n) => n.toString(16).padStart(2, "0"))
    .join("");
  if (
    !Object.hasOwn(accounts, user) ||
    accounts[user as Username].digest !== digest
  )
    throw Error("Hunter ID or password is incorrect.");
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ username: user, token: crypto.randomUUID() }),
  );
  return user as Username;
}
export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
