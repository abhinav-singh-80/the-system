import { describe, expect, it } from "vitest";
import { generateRegimen } from "../data/regimen";
import type { Profile } from "../lib/types";

const profile: Profile = {
  age: 24,
  gender: "male",
  heightCm: 175,
  weightKg: 70,
  physique: "Average",
  experience: "Beginner",
  diagnostics: [],
  target: "Aesthetic lean muscle gain",
};

describe("regimen generation", () => {
  it("covers each training area and starts with independent, incomplete routines", () => {
    const first = generateRegimen(profile);
    const second = generateRegimen(profile);
    expect(
      first.quests
        .filter((q) => q.category === "training")
        .map((q) => q.muscle)
        .sort(),
    ).toEqual(["back", "chest", "core", "legs", "shoulders"]);
    expect(new Set(first.quests.map((q) => q.id)).size).toBe(
      first.quests.length,
    );
    expect(
      first.quests.every(
        (q) =>
          !q.completed && q.lastCompleted === null && q.sets > 0 && q.reps > 0,
      ),
    ).toBe(true);
    first.quests[0].completed = true;
    expect(second.quests[0].completed).toBe(false);
  });

  it("scales training experience and adds selected diagnostic routines", () => {
    const basic = generateRegimen(profile);
    const advanced = generateRegimen({
      ...profile,
      experience: "Advanced",
      diagnostics: [
        "Forward Head",
        "Rounded Shoulders",
        "Skin Dullness",
        "Uneven Tone",
      ],
    });
    expect(advanced.quests[0].sets).toBeGreaterThan(basic.quests[0].sets);
    expect(advanced.quests[0].reps).toBeGreaterThan(basic.quests[0].reps);
    expect(advanced.quests.map((q) => q.id)).toEqual(
      expect.arrayContaining(["chin-tucks", "wall-angels", "skin-protection"]),
    );
    expect(
      advanced.quests.filter((q) => q.id === "skin-protection"),
    ).toHaveLength(1);
    expect(basic.quests.find((q) => q.id === "chin-tucks")).toBeUndefined();
  });

  it("keeps adolescent calories at maintenance regardless of physique", () => {
    const skinny = generateRegimen({
      ...profile,
      age: 17,
      physique: "Skinny",
    }).targets;
    const overweight = generateRegimen({
      ...profile,
      age: 17,
      physique: "Overweight",
    }).targets;
    expect(skinny.calories).toBe(overweight.calories);
    expect(skinny.calories).toBeGreaterThanOrEqual(2000);
    const adultMaintenance = generateRegimen({
      ...profile,
      physique: "Overweight",
    }).targets;
    const adultGain = generateRegimen({
      ...profile,
      physique: "Skinny",
    }).targets;
    expect(adultGain.calories - adultMaintenance.calories).toBe(200);
  });

  it("returns coherent macro energy and hydration in millilitres", () => {
    const { targets } = generateRegimen(profile);
    expect(
      Math.abs(
        targets.calories -
          (targets.protein * 4 + targets.carbs * 4 + targets.fat * 9),
      ),
    ).toBeLessThanOrEqual(4);
    expect(targets.water).toBeGreaterThanOrEqual(1500);
    expect(targets.water).toBeLessThanOrEqual(3500);
    expect(targets.water % 250).toBe(0);
  });

  it.each([
    { age: 15 },
    { age: 101 },
    { heightCm: Number.NaN },
    { heightCm: 90 },
    { weightKg: 0 },
    { weightKg: Infinity },
  ])("rejects invalid biometrics: %o", (invalid) => {
    expect(() => generateRegimen({ ...profile, ...invalid })).toThrow(
      "Enter an age",
    );
  });
});
