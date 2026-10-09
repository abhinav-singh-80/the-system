import { describe, it, expect } from "vitest";
import { generateRegimen } from "../data/regimen";
import { motionPhase, poseFor, resolveDemo } from "../lib/exerciseMotion";
import type { Motion } from "../lib/exerciseMotion";
import { FOOD_LIBRARY } from "../data/foods";
const motions: Motion[] = [
  "pushup",
  "incline",
  "squat",
  "chair",
  "raise",
  "pull",
  "deadbug",
  "pelvic",
  "chin",
  "angel",
  "cleanse",
  "massage",
  "skin",
  "water",
];
describe("exercise guide motion", () => {
  it("resolves every generated routine while leaving unknown custom movements unclaimed", () => {
    for (const experience of [
      "Beginner",
      "Intermediate",
      "Advanced",
    ] as const) {
      const { quests } = generateRegimen({
        age: 24,
        gender: "male",
        heightCm: 175,
        weightKg: 70,
        physique: "Average",
        experience,
        diagnostics: ["Forward Head", "Rounded Shoulders", "Skin Dullness"],
        target: "Muscle gain",
      });
      for (const quest of quests)
        expect(resolveDemo(quest), quest.name).not.toBeNull();
    }
    expect(
      resolveDemo({ id: "push-ups", name: "A different custom exercise" }),
    ).toBeNull();
  });
  it("uses three seconds of controlled movement, a one-second hold, and a one-second return", () => {
    expect(motionPhase(0)).toMatchObject({ stage: 0, t: 0 });
    expect(motionPhase(3)).toMatchObject({ stage: 1, t: 1 });
    expect(motionPhase(4)).toMatchObject({ stage: 2, t: 1 });
    expect(motionPhase(5)).toMatchObject({ stage: 0, t: 0, alternate: true });
  });
  it.each(motions)(
    "%s stays finite and within its viewport throughout the motion",
    (motion) => {
      for (let n = 0; n <= 100; n++)
        for (const alternate of [false, true]) {
          const pose = poseFor(motion, n / 100, alternate);
          const points = [
            pose.head,
            ...pose.shoulders,
            ...pose.elbows,
            ...pose.hands,
            ...pose.hips,
            ...pose.knees,
            ...pose.feet,
          ];
          expect(
            points.every(
              ([x, y]) =>
                Number.isFinite(x) &&
                Number.isFinite(y) &&
                x >= 0 &&
                x <= 400 &&
                y >= 0 &&
                y <= 300,
            ),
          ).toBe(true);
        }
      expect(poseFor(motion, 0)).not.toEqual(poseFor(motion, 1));
    },
  );
  it("anchors hands and toes during pressing and feet during squatting", () => {
    for (const motion of ["pushup", "incline"] as const) {
      expect(poseFor(motion, 0).hands).toEqual(poseFor(motion, 1).hands);
      expect(poseFor(motion, 0).feet).toEqual(poseFor(motion, 1).feet);
    }
    for (const motion of ["squat", "chair"] as const)
      expect(poseFor(motion, 0).feet).toEqual(poseFor(motion, 1).feet);
  });
});
describe("vegetarian quick-log defaults", () => {
  it("preserves all eight requested servings, calorie and protein values", () => {
    expect(FOOD_LIBRARY.map((f) => [f.name, f.protein, f.calories])).toEqual([
      ["Soya Chunks (50g)", 26, 170],
      ["Paneer (100g)", 18, 265],
      ["Roasted Chana (50g)", 11, 185],
      ["Oats with Milk/Water (50g)", 7, 190],
      ["Dal & Cooked Rice (1 serving)", 12, 320],
      ["Peanut Butter (32g / 2 tbsp)", 8, 190],
      ["Whey Protein (1 scoop)", 24, 120],
      ["Banana (1 medium)", 1, 105],
    ]);
  });
});
