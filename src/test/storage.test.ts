import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { initialState } from "../lib/engine";
import {
  configureCloudSync,
  exportBackup,
  importBackup,
  loadState,
  parseState,
  pullCloudState,
  pushCloudState,
  saveState,
  stateKey,
} from "../lib/storage";
import type { HunterState, Quest } from "../lib/types";

function quest(id = "pushup"): Quest {
  return {
    id,
    name: "Push-ups",
    category: "training",
    muscle: "chest",
    sets: 3,
    reps: 12,
    unit: "reps",
    xp: 40,
    mandatory: true,
    description: "",
    cues: [],
    mistakes: [],
    completed: false,
    completionStreak: 0,
    lastCompleted: null,
  };
}

function envelope(state: unknown, version = 1): string {
  return JSON.stringify({
    format: "the-system-backup",
    version,
    exportedAt: "2026-10-09T12:00:00.000Z",
    state,
  });
}

beforeEach(() => {
  const records = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
    removeItem: (key: string) => {
      records.delete(key);
    },
    clear: () => records.clear(),
  });
});

afterEach(() => {
  configureCloudSync(null);
  vi.unstubAllGlobals();
});

describe("account-scoped persistence and backup", () => {
  it("stores separate records for all three hunters without leaking progress", () => {
    const abhinav = { ...initialState("abhinav"), totalXp: 340 };
    const second = { ...initialState("hunter_02"), water: 750 };
    saveState(abhinav);
    saveState(second);
    expect(stateKey("abhinav")).toBe("the_system_user_abhinav_state");
    expect(loadState("abhinav").totalXp).toBe(340);
    expect(loadState("abhinav").water).toBe(0);
    expect(loadState("hunter_02").totalXp).toBe(0);
    expect(loadState("hunter_02").water).toBe(750);
    expect(loadState("hunter_03").username).toBe("hunter_03");
    expect(loadState("hunter_03").profile).toBeNull();
  });

  it("round-trips a valid backup without changing progress or writing to storage", () => {
    const state = {
      ...initialState("abhinav"),
      totalXp: 640,
      quests: [quest()],
      water: 1250,
    };
    const backup = exportBackup(state);
    expect(JSON.parse(backup)).toMatchObject({
      format: "the-system-backup",
      version: 1,
      state: { username: "abhinav" },
    });
    expect(importBackup(backup, "abhinav")).toEqual(state);
    expect(localStorage.getItem(stateKey("abhinav"))).toBeNull();
  });

  it("rejects a foreign hunter in either a backup or a tampered storage record", () => {
    const other = initialState("hunter_02");
    expect(() => importBackup(exportBackup(other), "abhinav")).toThrow(
      /different hunter/i,
    );
    localStorage.setItem(stateKey("abhinav"), JSON.stringify(other));
    expect(() => loadState("abhinav")).toThrow(/different hunter/i);
  });

  it.each(["", "{broken", "null", "{}", "[]"])(
    "rejects corrupt or malformed backup %j",
    (raw) => {
      expect(() => importBackup(raw, "abhinav")).toThrow();
    },
  );

  it("rejects unknown envelope versions, state versions, and oversized files", () => {
    const state = initialState("abhinav");
    expect(() => importBackup(envelope(state, 2), "abhinav")).toThrow(
      /version/i,
    );
    expect(() =>
      importBackup(envelope({ ...state, version: 2 }), "abhinav"),
    ).toThrow();
    expect(() => importBackup(" ".repeat(8_000_001), "abhinav")).toThrow(
      /too large/i,
    );
  });

  it("surfaces malformed stored JSON without overwriting the recoverable raw record", () => {
    const key = stateKey("abhinav");
    localStorage.setItem(key, "{broken");
    expect(() => loadState("abhinav")).toThrow();
    expect(localStorage.getItem(key)).toBe("{broken");
  });

  it("rejects invalid saves before replacing a valid stored record", () => {
    const valid = initialState("abhinav");
    saveState(valid);
    const before = localStorage.getItem(stateKey("abhinav"));
    expect(() => saveState({ ...valid, totalXp: NaN })).toThrow();
    expect(localStorage.getItem(stateKey("abhinav"))).toBe(before);
  });
});

describe("validation at the state boundary", () => {
  it.each([NaN, Infinity, -Infinity, -1, 10_000_001])(
    "rejects invalid XP value %s",
    (totalXp) => {
      expect(() =>
        parseState({ ...initialState("abhinav"), totalXp }, "abhinav"),
      ).toThrow();
    },
  );

  it.each(["2026-02-30", "2026-13-01", "2026-00-01", "not-a-date"])(
    "rejects impossible calendar date %s",
    (day) => {
      expect(() =>
        parseState({ ...initialState("abhinav"), day }, "abhinav"),
      ).toThrow();
    },
  );

  it("rejects duplicate quest and meal IDs", () => {
    const state = initialState("abhinav");
    expect(() =>
      parseState({ ...state, quests: [quest(), quest()] }, "abhinav"),
    ).toThrow(/duplicate/i);
    const meal = {
      id: "meal",
      name: "Oats",
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 3,
      date: state.day,
    };
    expect(() =>
      parseState({ ...state, meals: [meal, meal] }, "abhinav"),
    ).toThrow(/duplicate/i);
  });

  it("rejects unbalanced attribute points and normalizes points above the earned budget", () => {
    const state = initialState("abhinav");
    expect(() => parseState({ ...state, spentPoints: 3 }, "abhinav")).toThrow(
      /balance/i,
    );
    const corrected = parseState(
      {
        ...state,
        spentPoints: 3,
        attributes: { strength: 11, vitality: 11, agility: 11 },
      },
      "abhinav",
    );
    expect(corrected.spentPoints).toBe(0);
    expect(corrected.attributes).toEqual({
      strength: 10,
      vitality: 10,
      agility: 10,
    });
  });

  it("rejects unrealistic exercise and macro values", () => {
    const state = initialState("abhinav");
    expect(() =>
      parseState({ ...state, quests: [{ ...quest(), sets: 0 }] }, "abhinav"),
    ).toThrow();
    expect(() =>
      parseState({ ...state, quests: [{ ...quest(), reps: 1.5 }] }, "abhinav"),
    ).toThrow();
    expect(() =>
      parseState(
        { ...state, targets: { ...state.targets, calories: Infinity } },
        "abhinav",
      ),
    ).toThrow();
  });

  it.each([
    ["quests", 101],
    ["meals", 30001],
    ["customFoods", 301],
    ["history", 366],
    ["evolution", 101],
  ] as const)("caps the size of %s at the storage boundary", (key, length) => {
    const state = initialState("abhinav");
    const records = Array.from({ length }, (_, index) => {
      if (key === "quests") return quest(`q-${index}`);
      if (key === "history")
        return {
          date: state.day,
          completed: 0,
          total: 1,
          allComplete: false,
          xp: 0,
        };
      if (key === "evolution") return "Push-ups: new target";
      return {
        id: `meal-${index}`,
        date: state.day,
        name: "Oats",
        calories: 150,
        protein: 5,
        carbs: 27,
        fat: 3,
      };
    });
    expect(() => parseState({ ...state, [key]: records }, "abhinav")).toThrow();
  });
});

describe("optional cloud adapter boundary", () => {
  it("works without a cloud adapter", async () => {
    expect(await pullCloudState("abhinav")).toBeNull();
    await expect(
      pushCloudState(initialState("abhinav")),
    ).resolves.toBeUndefined();
  });

  it("passes an explicit account namespace and validates both load and save", async () => {
    const state = initialState("abhinav");
    const save = vi.fn(async (_username: string, _state: HunterState) => {});
    configureCloudSync({ save, load: async () => state });
    await pushCloudState(state);
    expect(save).toHaveBeenCalledWith("abhinav", state);
    expect(await pullCloudState("abhinav")).toEqual(state);
    await expect(pullCloudState("hunter_02")).rejects.toThrow(
      /different hunter/i,
    );
    await expect(
      pushCloudState({ ...state, totalXp: Infinity }),
    ).rejects.toThrow();
    expect(save).toHaveBeenCalledTimes(1);
  });
});
