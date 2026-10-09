import type { Macros, Profile, Quest } from "../lib/types";

type Routine = Pick<
  Quest,
  | "id"
  | "name"
  | "category"
  | "muscle"
  | "sets"
  | "reps"
  | "unit"
  | "description"
  | "cues"
  | "mistakes"
>;

function quest(routine: Routine): Quest {
  return {
    ...routine,
    xp: routine.category === "training" ? 40 : 20,
    mandatory: routine.category === "training",
    completed: false,
    completionStreak: 0,
    lastCompleted: null,
  };
}

export function generateRegimen(profile: Profile): {
  quests: Quest[];
  targets: Macros;
} {
  if (
    ![profile.age, profile.heightCm, profile.weightKg].every(Number.isFinite) ||
    profile.age < 16 ||
    profile.age > 100 ||
    profile.heightCm < 100 ||
    profile.heightCm > 250 ||
    profile.weightKg < 30 ||
    profile.weightKg > 300
  ) {
    throw new Error(
      "Enter an age of 16–100, height of 100–250 cm, and weight of 30–300 kg.",
    );
  }

  const beginner = profile.experience === "Beginner";
  const sets = beginner ? 2 : profile.experience === "Intermediate" ? 3 : 4;
  const reps = beginner ? 8 : profile.experience === "Intermediate" ? 12 : 15;
  const quests: Quest[] = [
    quest({
      id: "push-ups",
      name: beginner ? "Incline push-ups" : "Push-ups",
      category: "training",
      muscle: "chest",
      sets,
      reps,
      unit: "reps",
      description:
        "Build pressing strength. Use a stable wall or counter to adjust difficulty; leave 2–3 good reps in reserve.",
      cues: [
        "Keep ribs stacked over your pelvis.",
        "Lower slowly with elbows about 45° from your sides.",
        "Exhale as you press away.",
      ],
      mistakes: [
        "Letting the lower back sag.",
        "Shrugging shoulders toward your ears.",
        "Continuing through shoulder or wrist pain.",
      ],
    }),
    quest({
      id: "back-pulls",
      name: "Prone lat pull-downs",
      category: "training",
      muscle: "back",
      sets,
      reps,
      unit: "reps",
      description:
        "Lie face-down and draw your elbows toward your ribs. A controlled bodyweight back drill; no hanging equipment needed.",
      cues: [
        "Keep your neck neutral and gaze down.",
        "Reach long, then pull elbows toward your waist.",
        "Squeeze gently without lifting your chest high.",
      ],
      mistakes: [
        "Arching the lower back.",
        "Rushing the return.",
        "Holding your breath.",
      ],
    }),
    quest({
      id: "lateral-raises",
      name: "Lateral raises",
      category: "training",
      muscle: "shoulders",
      sets,
      reps,
      unit: "reps",
      description:
        "Use light bottles or no load. Raise arms in a comfortable arc slightly forward of your body.",
      cues: [
        "Keep a soft bend in your elbows.",
        "Stop around shoulder height.",
        "Lower for three seconds.",
      ],
      mistakes: [
        "Swinging your torso to lift the load.",
        "Shrugging or raising through a painful range.",
        "Starting with weights you cannot control.",
      ],
    }),
    quest({
      id: "dead-bugs",
      name: "Dead bugs",
      category: "training",
      muscle: "core",
      sets,
      reps: beginner ? 6 : 10,
      unit: "reps",
      description:
        "Repetitions are per side. Alternate opposite arm and leg extensions to develop controlled trunk stability.",
      cues: [
        "Breathe out and gently brace.",
        "Move only as far as you can keep your back comfortable.",
        "Return slowly, then alternate sides.",
      ],
      mistakes: [
        "Overarching your lower back.",
        "Moving both sides too quickly.",
        "Tensing your neck.",
      ],
    }),
    quest({
      id: "squats",
      name: beginner ? "Chair squats" : "Bodyweight squats",
      category: "training",
      muscle: "legs",
      sets,
      reps: reps + 2,
      unit: "reps",
      description:
        "Use a sturdy chair as a depth guide if needed. Choose a comfortable stance and range.",
      cues: [
        "Keep your whole foot grounded.",
        "Let knees track with your toes.",
        "Stand tall with a controlled exhale.",
      ],
      mistakes: [
        "Dropping into the bottom position.",
        "Letting heels lift.",
        "Forcing a painful depth.",
      ],
    }),
    quest({
      id: "pelvic-alignment",
      name: "Pelvic alignment reset",
      category: "posture",
      muscle: "posture",
      sets: 1,
      reps: 8,
      unit: "reps",
      description:
        "Gentle supine pelvic tilts to explore a comfortable neutral position. Posture is variable, not a position to hold rigidly all day.",
      cues: [
        "Lie on your back with bent knees.",
        "Exhale and gently tip your pelvis.",
        "Release without forcing your back flat.",
      ],
      mistakes: [
        "Squeezing hard or holding breath.",
        "Forcing a rigid posture.",
        "Continuing through back pain.",
      ],
    }),
    quest({
      id: "skin-cleanse",
      name: "Gentle face cleanse",
      category: "grooming",
      muscle: "posture",
      sets: 1,
      reps: 1,
      unit: "minutes",
      description:
        "Use lukewarm or comfortably cool water and a gentle cleanser. A cool rinse is optional; avoid ice directly on skin.",
      cues: [
        "Use clean hands and light pressure.",
        "Pat dry, then moisturize.",
        "Use broad-spectrum SPF 30+ when outdoors.",
      ],
      mistakes: [
        "Scrubbing or using freezing water.",
        "Adding several new active products at once.",
        "Expecting a rinse to change facial bone structure.",
      ],
    }),
    quest({
      id: "hydration-check",
      name: "Hydration checkpoint",
      category: "grooming",
      muscle: "posture",
      sets: 1,
      reps: 1,
      unit: "minutes",
      description:
        "Check thirst and log a glass of water in Fuel. Fluid needs vary with activity, climate and health.",
      cues: [
        "Drink regularly according to thirst.",
        "Account for water already logged.",
        "Follow any prescribed fluid restriction.",
      ],
      mistakes: [
        "Forcing large volumes quickly.",
        "Treating hydration as a way to reshape your face.",
      ],
    }),
  ];

  if (profile.diagnostics.includes("Forward Head"))
    quests.push(
      quest({
        id: "chin-tucks",
        name: "Chin tucks",
        category: "posture",
        muscle: "posture",
        sets: 2,
        reps: 8,
        unit: "reps",
        description:
          "A gentle neck-control drill. Pause for two seconds each repetition without forcing your chin backward.",
        cues: [
          "Look straight ahead.",
          "Slide your head back a small amount.",
          "Keep your jaw and shoulders relaxed.",
        ],
        mistakes: [
          "Tipping your head downward.",
          "Pressing into pain or dizziness.",
          "Clenching your jaw.",
        ],
      }),
    );
  if (profile.diagnostics.includes("Rounded Shoulders"))
    quests.push(
      quest({
        id: "wall-angels",
        name: "Wall angels",
        category: "posture",
        muscle: "posture",
        sets: 2,
        reps: 8,
        unit: "reps",
        description:
          "Move arms slowly up and down against a wall, using only your comfortable shoulder range.",
        cues: [
          "Keep ribs relaxed.",
          "Let shoulder blades move naturally.",
          "Use a small range if the wall feels restrictive.",
        ],
        mistakes: [
          "Forcing wrists or elbows into the wall.",
          "Arching to gain extra reach.",
          "Ignoring a pinching sensation.",
        ],
      }),
    );
  if (
    profile.diagnostics.some((item) =>
      ["Skin Dullness", "Uneven Tone"].includes(item),
    )
  )
    quests.push(
      quest({
        id: "skin-protection",
        name: "Moisturize + SPF",
        category: "grooming",
        muscle: "posture",
        sets: 1,
        reps: 2,
        unit: "minutes",
        description:
          "A simple skin barrier and sun-protection habit. Persistent changes or irritation are worth discussing with a dermatologist.",
        cues: [
          "Use a moisturizer suitable for your skin.",
          "Apply broad-spectrum SPF 30+ before outdoor exposure.",
          "Reapply sunscreen as its label directs.",
        ],
        mistakes: [
          "Using harsh scrubs on irritated skin.",
          "Expecting immediate changes to pigmentation.",
          "Treating this checklist as a skin diagnosis.",
        ],
      }),
    );

  quests.push(
    quest({
      id: "face-relaxation",
      name: "Gentle facial relaxation",
      category: "grooming",
      muscle: "posture",
      sets: 1,
      reps: 1,
      unit: "minutes",
      description:
        "Optional light facial massage for relaxation, sometimes called lymphatic drainage. It does not reduce facial fat or change bone structure.",
      cues: [
        "Wash your hands.",
        "Use feather-light strokes on intact skin.",
        "Stop if the skin becomes irritated.",
      ],
      mistakes: [
        "Pressing deeply around the neck or eyes.",
        "Massaging inflamed or infected skin.",
        "Expecting permanent jawline changes.",
      ],
    }),
  );

  const sexTerm =
    profile.gender === "male" ? 5 : profile.gender === "female" ? -161 : -78;
  const resting =
    10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + sexTerm;
  const activity = beginner ? 1.4 : 1.55;
  const surplus =
    profile.age < 18
      ? 0
      : ["Skinny", "Lean"].includes(profile.physique)
        ? 200
        : profile.physique === "Average"
          ? 100
          : 0;
  // Adolescent energy needs vary: this is a maintenance estimate, never a deficit prescription.
  const calories =
    Math.round(
      Math.max(
        profile.age < 18 ? 2000 : 1600,
        Math.min(4500, resting * activity + surplus),
      ) / 50,
    ) * 50;
  const protein = Math.round(profile.weightKg * (profile.age < 18 ? 1.2 : 1.6));
  const fat = Math.round((calories * 0.28) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  const water =
    Math.round(Math.min(3500, Math.max(1500, profile.weightKg * 30)) / 250) *
    250;
  return { quests, targets: { calories, protein, carbs, fat, water } };
}
