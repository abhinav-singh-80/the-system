import type { Quest } from "./types";
export type Point = [number, number];
export type Motion =
  | "pushup"
  | "incline"
  | "squat"
  | "chair"
  | "raise"
  | "pull"
  | "deadbug"
  | "pelvic"
  | "chin"
  | "angel"
  | "cleanse"
  | "massage"
  | "skin"
  | "water";
export interface Pose {
  head: Point;
  shoulders: [Point, Point];
  elbows: [Point, Point];
  hands: [Point, Point];
  hips: [Point, Point];
  knees: [Point, Point];
  feet: [Point, Point];
}
export interface Demo {
  motion: Motion;
  view: string;
  phases: [string, string, string];
  placement: string;
}
const demos: Record<Motion, Omit<Demo, "motion">> = {
  pushup: {
    view: "Side view",
    phases: ["Lower slowly", "Pause", "Press up"],
    placement:
      "Hands just outside shoulder width; keep head, hips and heels in one line.",
  },
  incline: {
    view: "Side view · stable support",
    phases: ["Lower slowly", "Pause", "Press away"],
    placement:
      "Hands on a stable counter, slightly wider than shoulders; keep a straight body line.",
  },
  squat: {
    view: "Side view",
    phases: ["Sit back and lower", "Pause", "Stand tall"],
    placement:
      "Feet around shoulder width; heels grounded and knees following the direction of your toes.",
  },
  chair: {
    view: "Side view · chair support",
    phases: ["Lower toward chair", "Lightly touch", "Stand tall"],
    placement:
      "Use a sturdy chair. Reach hips back, keep feet grounded, and stand without bouncing.",
  },
  raise: {
    view: "Front view",
    phases: ["Lower slowly", "Pause", "Raise to shoulder height"],
    placement:
      "Soft elbows, palms toward the floor; lift slightly forward of your torso without shrugging.",
  },
  pull: {
    view: "Face-down · overhead view",
    phases: ["Reach arms long", "Pause", "Draw elbows to ribs"],
    placement:
      "Lie face-down, gaze at the floor; draw elbows toward your waist without lifting the chest high.",
  },
  deadbug: {
    view: "Side view · alternating limbs",
    phases: ["Extend opposite limbs", "Hold your brace", "Return to start"],
    placement:
      "Lie on your back with knees above hips; extend one leg and the opposite arm only as far as your back stays comfortable.",
  },
  pelvic: {
    view: "Side view · small range",
    phases: ["Tilt gently", "Pause", "Release"],
    placement:
      "Lie with knees bent and feet grounded; exhale into a small pelvic tilt without lifting into a bridge.",
  },
  chin: {
    view: "Side view · small range",
    phases: ["Slide head back", "Pause", "Release"],
    placement:
      "Keep your gaze level. Glide your head straight back a small distance, without tipping the chin down.",
  },
  angel: {
    view: "Front view · back to wall",
    phases: ["Slide arms down", "Pause", "Reach overhead"],
    placement:
      "Stand comfortably against a wall; keep ribs relaxed and move arms within a painless range.",
  },
  cleanse: {
    view: "Gentle care · illustrative",
    phases: ["Light circular strokes", "Pause", "Release"],
    placement:
      "Use clean hands, gentle cleanser and comfortable water; use light pressure on intact skin.",
  },
  massage: {
    view: "Gentle care · illustrative",
    phases: ["Glide gently outward", "Pause", "Release"],
    placement:
      "Use feather-light strokes along the cheeks and jaw. Avoid deep pressure on the neck or inflamed skin.",
  },
  skin: {
    view: "Gentle care · illustrative",
    phases: ["Spread gently", "Pause", "Release"],
    placement:
      "Apply moisturizer and sunscreen as directed on the label; avoid rubbing around the eyes.",
  },
  water: {
    view: "Hydration habit · illustrative",
    phases: ["Raise glass", "Sip comfortably", "Lower glass"],
    placement:
      "Drink according to thirst and log your water in Fuel; follow any prescribed fluid restriction.",
  },
};
export function resolveDemo(quest: Pick<Quest, "id" | "name">): Demo | null {
  const name = quest.name.trim().toLowerCase();
  const rules: [RegExp, Motion][] = [
    [/^incline push[ -]?ups?$/, "incline"],
    [/^push[ -]?ups?$/, "pushup"],
    [/^chair squats?$/, "chair"],
    [/^(bodyweight )?squats?$/, "squat"],
    [/^lateral raises?$/, "raise"],
    [/^prone lat pull[ -]?downs?$/, "pull"],
    [/^dead bugs?$/, "deadbug"],
    [/^pelvic alignment reset$/, "pelvic"],
    [/^chin tucks?$/, "chin"],
    [/^wall angels?$/, "angel"],
    [/^gentle face cleanse$/, "cleanse"],
    [/^gentle facial relaxation$/, "massage"],
    [/^moisturize \+ spf$/, "skin"],
    [/^hydration checkpoint$/, "water"],
  ];
  const motion = rules.find(([pattern]) => pattern.test(name))?.[1];
  return motion ? { motion, ...demos[motion] } : null;
}
export const lerp = (a: Point, b: Point, t: number): Point => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];
function joint(a: Point, b: Point, length: number, side = 1): Point {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    distance = Math.hypot(dx, dy) || 1;
  const height = Math.sqrt(
    Math.max(0, length * length - (distance * distance) / 4),
  );
  return [
    (a[0] + b[0]) / 2 - (dy / distance) * height * side,
    (a[1] + b[1]) / 2 + (dx / distance) * height * side,
  ];
}
export function motionPhase(seconds: number) {
  const cycle = ((seconds % 5) + 5) % 5;
  const stage = cycle < 3 ? 0 : cycle < 4 ? 1 : 2;
  const raw = stage === 0 ? cycle / 3 : stage === 1 ? 1 : 1 - (cycle - 4);
  return {
    stage,
    t: (1 - Math.cos(raw * Math.PI)) / 2,
    progress: cycle / 5,
    alternate: Math.floor(seconds / 5) % 2 === 1,
  };
}
export function poseFor(motion: Motion, t: number, alternate = false): Pose {
  const pose: Pose = {
    head: [200, 48],
    shoulders: [
      [181, 86],
      [219, 86],
    ],
    elbows: [
      [168, 129],
      [232, 129],
    ],
    hands: [
      [165, 172],
      [235, 172],
    ],
    hips: [
      [188, 158],
      [212, 158],
    ],
    knees: [
      [185, 208],
      [215, 208],
    ],
    feet: [
      [180, 266],
      [220, 266],
    ],
  };
  if (motion === "pushup" || motion === "incline") {
    const incline = motion === "incline";
    const hand: Point = incline ? [131, 208] : [131, 266];
    const shoulder = lerp(
      incline ? [141, 133] : [143, 190],
      incline ? [163, 175] : [165, 233],
      t,
    );
    const toe: Point = [335, 266];
    const hip = lerp(shoulder, toe, 0.52);
    pose.head = [shoulder[0] - 24, shoulder[1] - 15];
    pose.shoulders = [shoulder, [shoulder[0] + 4, shoulder[1] - 5]];
    pose.hips = [hip, [hip[0] + 3, hip[1] - 5]];
    pose.hands = [hand, [hand[0] + 8, hand[1] - 3]];
    pose.feet = [toe, [toe[0] + 4, toe[1] - 4]];
    pose.elbows = [
      joint(pose.shoulders[0], pose.hands[0], 40, -1),
      joint(pose.shoulders[1], pose.hands[1], 40, -1),
    ];
    pose.knees = [lerp(hip, toe, 0.53), lerp(pose.hips[1], pose.feet[1], 0.53)];
    return pose;
  }
  if (motion === "squat" || motion === "chair") {
    const hip = lerp([223, 163], [260, 216], t),
      shoulder = lerp([215, 85], [202, 149], t);
    pose.head = [shoulder[0] - 9, shoulder[1] - 29];
    pose.shoulders = [shoulder, [shoulder[0] + 6, shoulder[1] + 2]];
    pose.hips = [hip, [hip[0] + 6, hip[1] + 2]];
    pose.feet = [
      [216, 266],
      [225, 266],
    ];
    pose.knees = [
      joint(hip, pose.feet[0], 56, 1),
      joint(pose.hips[1], pose.feet[1], 56, 1),
    ];
    pose.hands = [
      lerp([179, 164], [137, 145], t),
      lerp([185, 166], [143, 148], t),
    ];
    pose.elbows = [
      joint(shoulder, pose.hands[0], 43, 1),
      joint(pose.shoulders[1], pose.hands[1], 43, 1),
    ];
    return pose;
  }
  if (motion === "deadbug" || motion === "pelvic") {
    pose.head = [82, 221];
    pose.shoulders = [
      [110, 224],
      [114, 216],
    ];
    pose.hips = [
      [211, 223],
      [215, 215],
    ];
    if (motion === "pelvic") {
      pose.hips = [
        [210 - t * 3, 223 - t * 4],
        [214 - t * 3, 215 - t * 4],
      ];
      pose.feet = [
        [281, 235],
        [286, 231],
      ];
      pose.knees = [
        [258, 188],
        [263, 184],
      ];
      pose.hands = [
        [177, 230],
        [181, 223],
      ];
      pose.elbows = [
        [143, 230],
        [147, 223],
      ];
    } else {
      const side = alternate ? 1 : 0,
        other = 1 - side;
      pose.knees = [
        [213, 169],
        [218, 161],
      ];
      pose.feet = [
        [271, 171],
        [276, 163],
      ];
      pose.elbows = [
        [115, 181],
        [119, 173],
      ];
      pose.hands = [
        [120, 134],
        [124, 126],
      ];
      pose.feet[side] = lerp(pose.feet[side], [324, 226], t);
      pose.knees[side] = joint(pose.hips[side], pose.feet[side], 59, -1);
      pose.hands[other] = lerp(pose.hands[other], [37, 205], t);
      pose.elbows[other] = joint(
        pose.shoulders[other],
        pose.hands[other],
        46,
        1,
      );
    }
    return pose;
  }
  if (motion === "raise") {
    pose.hands = [
      lerp([91, 87], [164, 174], t),
      lerp([309, 87], [236, 174], t),
    ];
    pose.elbows = [
      joint(pose.shoulders[0], pose.hands[0], 46, -1),
      joint(pose.shoulders[1], pose.hands[1], 46, 1),
    ];
  } else if (motion === "pull") {
    pose.head = [200, 103];
    pose.shoulders = [
      [180, 132],
      [220, 132],
    ];
    pose.hips = [
      [188, 208],
      [212, 208],
    ];
    pose.knees = [
      [188, 243],
      [212, 243],
    ];
    pose.feet = [
      [188, 281],
      [212, 281],
    ];
    pose.hands = [
      lerp([143, 135], [167, 40], t),
      lerp([257, 135], [233, 40], t),
    ];
    pose.elbows = [
      joint(pose.shoulders[0], pose.hands[0], 47, -1),
      joint(pose.shoulders[1], pose.hands[1], 47, 1),
    ];
  } else if (motion === "angel") {
    pose.hands = [lerp([181, 17], [136, 62], t), lerp([219, 17], [264, 62], t)];
    pose.elbows = [
      joint(pose.shoulders[0], pose.hands[0], 42, -1),
      joint(pose.shoulders[1], pose.hands[1], 42, 1),
    ];
  } else if (motion === "chin") {
    pose.head = [190 + t * 8, 48];
    pose.shoulders = [
      [203, 85],
      [213, 88],
    ];
    pose.hips = [
      [205, 158],
      [215, 161],
    ];
    pose.elbows = [
      [205, 126],
      [217, 129],
    ];
    pose.hands = [
      [205, 170],
      [217, 173],
    ];
  } else if (["cleanse", "massage", "skin"].includes(motion)) {
    const angle = t * Math.PI * 2;
    const offset = motion === "cleanse" ? Math.sin(angle) * 3 : t * 8;
    pose.hands = [
      [186 - offset, 57 + t * 9],
      [214 + offset, 57 + t * 9],
    ];
    pose.elbows = [
      [149, 108],
      [251, 108],
    ];
  } else if (motion === "water") {
    pose.hands[1] = lerp([247, 155], [219, 62], t);
    pose.elbows[1] = joint(pose.shoulders[1], pose.hands[1], 43, -1);
  }
  return pose;
}
