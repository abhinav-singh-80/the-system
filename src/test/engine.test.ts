import { describe, expect, it } from "vitest";
import {
  allocate,
  initialState,
  levelFor,
  localDate,
  mandatoryComplete,
  multiplier,
  normalizePoints,
  pointsAvailable,
  previousDay,
  rankFor,
  rollover,
  toggleQuest,
} from "../lib/engine";
import type { HunterState, Quest } from "../lib/types";

function quest(overrides: Partial<Quest> = {}): Quest {
  return {
    id: "pushup",
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
    ...overrides,
  };
}

function hunter(overrides: Partial<HunterState> = {}): HunterState {
  return {
    ...initialState("abhinav"),
    day: "2026-10-08",
    quests: [quest()],
    profile: {
      age: 25,
      gender: "male",
      heightCm: 175,
      weightKg: 70,
      physique: "Lean",
      experience: "Beginner",
      diagnostics: [],
      target: "Aesthetic lean muscle",
    },
    ...overrides,
  };
}

describe("calendar rollover and consequences", () => {
  it("uses local calendar dates across month, year, and leap-day boundaries", () => {
    expect(localDate(new Date(2026, 9, 9, 0, 5))).toBe("2026-10-09");
    expect(previousDay("2026-01-01")).toBe("2025-12-31");
    expect(previousDay("2024-03-01")).toBe("2024-02-29");
  });

  it.each(["2026-10-08", "2026-10-07"])(
    "leaves the exact state unchanged on same/past date %s",
    (date) => {
      const state = hunter();
      expect(
        rollover(state, date, () => {
          throw Error("Randomness must not be consumed");
        }),
      ).toBe(state);
    },
  );

  it.each([
    { random: 0, kind: "volume", target: 18 },
    { random: 0.5, kind: "hold", target: 60 },
    { random: 0.999, kind: "xp", target: 50 },
  ])(
    "creates the $kind consequence for incomplete mandatory quests",
    ({ random, kind, target }) => {
      const state = hunter({ water: 2000, streak: 5 });
      const next = rollover(state, "2026-10-09", () => random);
      expect(next.penalty).toMatchObject({
        kind,
        target,
        remaining: target,
        fromDate: "2026-10-08",
        cleared: false,
        startedAt: null,
      });
      expect(next.day).toBe("2026-10-09");
      expect(next.water).toBe(0);
      expect(next.streak).toBe(0);
      expect(next.history).toEqual([
        {
          date: "2026-10-08",
          completed: 0,
          total: 1,
          allComplete: false,
          xp: 0,
        },
      ]);
      expect(state.day).toBe("2026-10-08");
      expect(state.penalty).toBeNull();
    },
  );

  it("preserves an unresolved consequence across reloads and missed days", () => {
    const next = rollover(hunter(), "2026-10-09", () => 0.5);
    expect(rollover(next, "2026-10-09")).toBe(next);
    const later = rollover(next, "2026-10-12", () => {
      throw Error("Existing penalty must be preserved");
    });
    expect(later.penalty).toBe(next.penalty);
    expect(later.penalty?.fromDate).toBe("2026-10-08");
  });

  it("allows a new missed day to receive a consequence after an earlier one was cleared", () => {
    const state = rollover(hunter(), "2026-10-09", () => 0.5);
    state.penalty!.cleared = true;
    const next = rollover(state, "2026-10-10", () => 0.99);
    expect(next.penalty).toMatchObject({
      fromDate: "2026-10-09",
      kind: "xp",
      cleared: false,
    });
  });

  it("does not penalize an uncalibrated hunter or a day with no mandatory quests", () => {
    expect(
      rollover(hunter({ profile: null }), "2026-10-09").penalty,
    ).toBeNull();
    expect(
      rollover(hunter({ quests: [quest({ mandatory: false })] }), "2026-10-09")
        .penalty,
    ).toBeNull();
    expect(mandatoryComplete(hunter({ quests: [] }))).toBe(false);
  });

  it("archives actual earned XP and resets daily completion after a successful day", () => {
    const state = hunter({
      streak: 3,
      totalXp: 44,
      quests: [
        quest({ completed: true, earnedXp: 44 }),
        quest({ id: "optional", mandatory: false }),
      ],
    });
    const next = rollover(state, "2026-10-09");
    expect(next.history).toEqual([
      { date: "2026-10-08", completed: 1, total: 2, allComplete: true, xp: 44 },
    ]);
    expect(next.streak).toBe(4);
    expect(next.totalXp).toBe(44);
    expect(next.penalty).toBeNull();
    expect(next.quests[0]).toMatchObject({
      completed: false,
      earnedXp: 0,
      lastCompleted: "2026-10-08",
      completionStreak: 1,
    });
  });

  it("does not credit skipped days toward a streak and keeps only 365 daily records", () => {
    const history = Array.from({ length: 365 }, () => ({
      date: "2025-10-09",
      completed: 1,
      total: 1,
      allComplete: true,
      xp: 40,
    }));
    const next = rollover(
      hunter({ history, streak: 8, quests: [quest({ completed: true })] }),
      "2026-10-12",
    );
    expect(next.streak).toBe(0);
    expect(next.history).toHaveLength(365);
    expect(next.history.at(-1)?.date).toBe("2026-10-08");
  });
});

describe("progressive overload", () => {
  it("evolves a repetition target after seven consecutive completed days and only once", () => {
    let state = hunter({ day: "2026-10-01" });
    for (let day = 1; day <= 7; day++) {
      state = {
        ...state,
        quests: state.quests.map((q) => ({
          ...q,
          completed: true,
          earnedXp: 40,
        })),
      };
      state = rollover(state, `2026-10-${String(day + 1).padStart(2, "0")}`);
      expect(state.quests[0].reps).toBe(day === 7 ? 14 : 12);
      expect(state.evolution).toHaveLength(day === 7 ? 1 : 0);
    }
    expect(state.quests[0].completionStreak).toBe(0);
    expect(rollover(state, state.day)).toBe(state);
  });

  it("restarts the exercise streak after an incomplete or nonadjacent day", () => {
    const incomplete = rollover(
      hunter({
        quests: [quest({ completionStreak: 6, lastCompleted: "2026-10-07" })],
      }),
      "2026-10-09",
    );
    expect(incomplete.quests[0]).toMatchObject({
      completionStreak: 0,
      reps: 12,
    });
    const gap = rollover(
      hunter({
        quests: [
          quest({
            completed: true,
            completionStreak: 6,
            lastCompleted: "2026-10-05",
          }),
        ],
      }),
      "2026-10-09",
    );
    expect(gap.quests[0]).toMatchObject({ completionStreak: 1, reps: 12 });
  });

  it("does not escalate grooming or timed holds", () => {
    const quests = [
      quest({
        completed: true,
        completionStreak: 6,
        lastCompleted: "2026-10-07",
        unit: "seconds",
      }),
      quest({
        id: "groom",
        category: "grooming",
        completed: true,
        completionStreak: 6,
        lastCompleted: "2026-10-07",
      }),
    ];
    const next = rollover(hunter({ quests }), "2026-10-09");
    expect(next.evolution).toEqual([]);
    expect(next.quests.map((q) => q.reps)).toEqual([12, 12]);
  });
});

describe("XP and attribute accounting", () => {
  it("awards, reverses, and re-awards exactly one quest reward without farming XP", () => {
    let state = hunter({ streak: 3 });
    for (let cycle = 0; cycle < 3; cycle++) {
      state = toggleQuest(state, "pushup");
      expect(state.totalXp).toBe(44);
      expect(state.quests[0]).toMatchObject({ completed: true, earnedXp: 44 });
      state = toggleQuest(state, "pushup");
      expect(state.totalXp).toBe(0);
    }
  });

  it("awards XP again after daily completion flags reset at midnight", () => {
    let state = toggleQuest(hunter(), "pushup");
    state = rollover(state, "2026-10-09");
    state = toggleQuest(state, "pushup");
    expect(state.totalXp).toBe(80);
  });

  it("reverses the recorded reward even if the multiplier has since changed", () => {
    const state = toggleQuest(hunter(), "pushup");
    expect(toggleQuest({ ...state, streak: 30 }, "pushup").totalXp).toBe(0);
    expect(multiplier(hunter({ streak: 999 }))).toBe(2);
  });

  it("keeps locked and unknown quest operations inert", () => {
    const state = hunter();
    expect(toggleQuest(state, "missing")).toBe(state);
    const penalized = rollover(state, "2026-10-09", () => 0.5);
    expect(toggleQuest(penalized, "pushup")).toBe(penalized);
  });

  it("grants three attribute points per level and prevents overspending", () => {
    let state = hunter({ totalXp: 300 });
    expect(pointsAvailable(state)).toBe(3);
    for (let i = 0; i < 3; i++) state = allocate(state, "strength");
    expect(state.attributes.strength).toBe(13);
    expect(state.spentPoints).toBe(3);
    expect(pointsAvailable(state)).toBe(0);
    expect(allocate(state, "agility")).toBe(state);
  });

  it("revokes allocated points when reversing a reward lowers the earned level", () => {
    let state = toggleQuest(hunter({ totalXp: 280 }), "pushup");
    state = allocate(
      allocate(allocate(state, "strength"), "vitality"),
      "agility",
    );
    expect(levelFor(state.totalXp)).toBe(2);
    state = toggleQuest(state, "pushup");
    expect(state.totalXp).toBe(280);
    expect(state.spentPoints).toBe(0);
    expect(state.attributes).toEqual({
      strength: 10,
      vitality: 10,
      agility: 10,
    });
    expect(normalizePoints(state)).toEqual(state);
  });

  it.each([
    [1, "E"],
    [5, "D"],
    [10, "C"],
    [20, "B"],
    [30, "A"],
    [50, "S"],
  ])("maps level %i to rank %s", (level, rank) => {
    expect(rankFor(Number(level))).toBe(rank);
  });
});

describe("recovery and custom volume boundaries", () => {
  it("preserves a planned rest-day streak without a penalty or XP", () => {
    const next = rollover(
      hunter({ restDay: true, streak: 4, totalXp: 120 }),
      "2026-10-09",
    );
    expect(next.penalty).toBeNull();
    expect(next.streak).toBe(4);
    expect(next.totalXp).toBe(120);
    expect(next.restDay).toBe(false);
    expect(next.history.at(-1)?.restDay).toBe(true);
  });
  it("does not reduce a large custom target during evolution", () => {
    const next = rollover(
      hunter({
        quests: [
          quest({
            reps: 150,
            completed: true,
            completionStreak: 6,
            lastCompleted: "2026-10-07",
          }),
        ],
      }),
      "2026-10-09",
    );
    expect(next.quests[0].reps).toBe(150);
    expect(next.evolution).toHaveLength(0);
  });
});
