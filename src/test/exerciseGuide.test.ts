import { describe, it, expect } from "vitest";
import { generateRegimen } from "../data/regimen";
import { guideSteps, poseFor, resolveGuide } from "../lib/exerciseGuide";
import type { Motion } from "../lib/exerciseGuide";
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
describe("exercise guide diagrams", () => {
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
        expect(resolveGuide(quest), quest.name).not.toBeNull();
    }
    expect(
      resolveGuide({ id: "push-ups", name: "A different custom exercise" }),
    ).toBeNull();
  });
  it("defines distinct labeled start and contraction positions for every guide", () => {
    for (const motion of motions) {
      const step = guideSteps[motion];
      expect(step.start).not.toBe(step.peak);
      expect(step.startCue.length).toBeGreaterThan(8);
      expect(step.peakCue.length).toBeGreaterThan(8);
      expect(step.path.length).toBeGreaterThan(12);
    }
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
    for (const motion of ["squat", "chair"] as const) {
      expect(poseFor(motion, 0).feet).toEqual(poseFor(motion, 1).feet);
      const standing = poseFor(motion, guideSteps[motion].peak);
      expect(Math.abs(standing.knees[0][0] - standing.feet[0][0])).toBeLessThan(
        3,
      );
    }
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
