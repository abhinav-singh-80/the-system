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
export interface Guide {
  motion: Motion;
  view: string;
  placement: string;
}
const demos: Record<Motion, Omit<Guide, "motion">> = {
  pushup: {
    view: "Side view",
    placement:
      "Hands just outside shoulder width; keep head, hips and heels in one line.",
  },
  incline: {
    view: "Side view · stable support",
    placement:
      "Hands on a stable counter, slightly wider than shoulders; keep a straight body line.",
  },
  squat: {
    view: "Side view",
    placement:
      "Feet around shoulder width; heels grounded and knees following the direction of your toes.",
  },
  chair: {
    view: "Side view · chair support",
    placement:
      "Use a sturdy chair. Reach hips back, keep feet grounded, and stand without bouncing.",
  },
  raise: {
    view: "Front view",
    placement:
      "Soft elbows, palms toward the floor; lift slightly forward of your torso without shrugging.",
  },
  pull: {
    view: "Face-down · overhead view",
    placement:
      "Lie face-down, gaze at the floor; draw elbows toward your waist without lifting the chest high.",
  },
  deadbug: {
    view: "Side view · alternating limbs",
    placement:
      "Lie on your back with knees above hips; extend one leg and the opposite arm only as far as your back stays comfortable.",
  },
  pelvic: {
    view: "Side view · small range",
    placement:
      "Lie with knees bent and feet grounded; exhale into a small pelvic tilt without lifting into a bridge.",
  },
  chin: {
    view: "Side view · small range",
    placement:
      "Keep your gaze level. Glide your head straight back a small distance, without tipping the chin down.",
  },
  angel: {
    view: "Front view · back to wall",
    placement:
      "Stand comfortably against a wall; keep ribs relaxed and move arms within a painless range.",
  },
  cleanse: {
    view: "Gentle care · illustrative",
    placement:
      "Use clean hands, gentle cleanser and comfortable water; use light pressure on intact skin.",
  },
  massage: {
    view: "Gentle care · illustrative",
    placement:
      "Use feather-light strokes along the cheeks and jaw. Avoid deep pressure on the neck or inflamed skin.",
  },
  skin: {
    view: "Gentle care · illustrative",
    placement:
      "Apply moisturizer and sunscreen as directed on the label; avoid rubbing around the eyes.",
  },
  water: {
    view: "Hydration habit · illustrative",
    placement:
      "Drink according to thirst and log your water in Fuel; follow any prescribed fluid restriction.",
  },
};
export function resolveGuide(quest: Pick<Quest, "id" | "name">): Guide | null {
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
    const hip = lerp([218, 154], [260, 216], t),
      shoulder = lerp([213, 76], [202, 149], t);
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
        [281, 226],
        [286, 222],
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

export const guideSteps: Record<
  Motion,
  {
    start: number;
    peak: number;
    startCue: string;
    peakCue: string;
    path: string;
  }
> = {
  pushup: {
    start: 1,
    peak: 0,
    startCue: "Chest lowered · elbows about 45°",
    peakCue: "Press away · keep your body aligned",
    path: "Press through your palms, then lower with control.",
  },
  incline: {
    start: 1,
    peak: 0,
    startCue: "Chest toward a stable support",
    peakCue: "Press away without shrugging",
    path: "Move your whole body as one line toward and away from the support.",
  },
  squat: {
    start: 1,
    peak: 0,
    startCue: "Hips back · heels grounded",
    peakCue: "Stand tall · no backward lean",
    path: "Drive through the whole foot. Return by sitting your hips back.",
  },
  chair: {
    start: 1,
    peak: 0,
    startCue: "Light chair contact · feet planted",
    peakCue: "Stand tall without bouncing",
    path: "Rise from the chair, then lower slowly until your hips lightly touch.",
  },
  raise: {
    start: 1,
    peak: 0,
    startCue: "Arms beside you · elbows soft",
    peakCue: "Hands at shoulder height",
    path: "Sweep arms out and slightly forward. Keep shoulders away from ears.",
  },
  pull: {
    start: 1,
    peak: 0,
    startCue: "Face down · arms reaching long",
    peakCue: "Draw elbows toward your ribs",
    path: "Pull elbows down in an arc, then reach forward without arching your back.",
  },
  deadbug: {
    start: 0,
    peak: 1,
    startCue: "Knees above hips · ribs relaxed",
    peakCue: "Opposite arm and leg extended",
    path: "Reach opposite limbs away. Return to start and switch sides.",
  },
  pelvic: {
    start: 0,
    peak: 1,
    startCue: "Knees bent · feet grounded",
    peakCue: "Exhale · gently tilt the pelvis",
    path: "Use a small pelvic rotation; keep your hips on the floor.",
  },
  chin: {
    start: 0,
    peak: 1,
    startCue: "Gaze level · shoulders relaxed",
    peakCue: "Slide head straight back gently",
    path: "Glide horizontally over your shoulders; avoid tipping your chin down.",
  },
  angel: {
    start: 1,
    peak: 0,
    startCue: "Back toward wall · elbows bent",
    peakCue: "Reach overhead within comfort",
    path: "Slide arms upward in an arc, keeping ribs relaxed, then return.",
  },
  cleanse: {
    start: 0,
    peak: 1,
    startCue: "Clean hands · gentle cleanser",
    peakCue: "Light strokes · rinse comfortably",
    path: "Use small, gentle circles. Avoid scrubbing or pulling the skin.",
  },
  massage: {
    start: 0,
    peak: 1,
    startCue: "Feather-light cheek contact",
    peakCue: "Glide gently outward",
    path: "Follow cheeks toward the jaw with light pressure; avoid the neck.",
  },
  skin: {
    start: 0,
    peak: 1,
    startCue: "Apply moisturizer or sunscreen",
    peakCue: "Spread a gentle, even layer",
    path: "Spread without pulling skin. Follow the product's directions.",
  },
  water: {
    start: 0,
    peak: 1,
    startCue: "Comfortable glass of water",
    peakCue: "Sip according to thirst",
    path: "Raise the glass, sip comfortably and log water in Fuel.",
  },
};
