import { useId } from "react";
import type { Quest, Muscle } from "../lib/types";
import { guideSteps, lerp, poseFor, resolveGuide } from "../lib/exerciseGuide";
import type { Motion, Point } from "../lib/exerciseGuide";

const polygon = (points: Point[]) =>
  `M${points.map((p) => p.join(",")).join("L")}Z`;
// Filled, tapered muscle contours replace the old articulated stick rendering.
function contour(a: Point, b: Point, width: number, endWidth = width * 0.6) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = Math.hypot(dx, dy) || 1;
  const edge = (p: Point, w: number): Point => [
    p[0] - (dy / length) * w,
    p[1] + (dx / length) * w,
  ];
  const mid = lerp(a, b, 0.4);
  return `M${edge(a, width * 0.65)} Q${edge(mid, width * 1.3)} ${edge(b, endWidth)} Q${b} ${edge(b, -endWidth)} Q${edge(mid, -width * 1.3)} ${edge(a, -width * 0.65)} Q${a} ${edge(a, width * 0.65)}Z`;
}
function Figure({
  motion,
  muscle,
  amount,
  peak,
}: {
  motion: Motion;
  muscle: Muscle;
  amount: number;
  peak: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const pose = poseFor(motion, amount);
  const care = ["cleanse", "massage", "skin", "water"].includes(motion);
  const side = [
    "pushup",
    "incline",
    "squat",
    "chair",
    "deadbug",
    "pelvic",
    "chin",
  ].includes(motion);
  const supine = motion === "deadbug" || motion === "pelvic";
  const neck = lerp(...pose.shoulders, 0.5),
    hip = lerp(...pose.hips, 0.5);
  const torso = { shoulders: pose.shoulders, hips: pose.hips };
  if (side) {
    const dx = hip[0] - neck[0],
      dy = hip[1] - neck[1],
      length = Math.hypot(dx, dy) || 1;
    const edge = (p: Point, n: number): Point => [
      p[0] - (dy / length) * n,
      p[1] + (dx / length) * n,
    ];
    torso.shoulders = [edge(neck, 15), edge(neck, -15)];
    torso.hips = [edge(hip, 11), edge(hip, -11)];
  }
  const active = (part: Muscle) =>
    !care && (part === muscle || (motion === "angel" && part === "shoulders"));
  const tissue = (part?: Muscle) =>
    part && active(part) ? `url(#${id}-heat)` : `url(#${id}-skin)`;
  const heat = (part: Muscle) =>
    active(part)
      ? { filter: `drop-shadow(0 0 ${peak ? 4 : 2}px #ff450066)` }
      : {};
  const segment = (a: Point, b: Point, width: number, part?: Muscle) => (
    <g>
      <path
        d={contour(a, b, width)}
        fill={`url(#${id}-skin)`}
        stroke="#8198b0"
        strokeWidth=".65"
      />
      {part && (
        <path
          d={contour(lerp(a, b, 0.12), lerp(a, b, 0.77), width * 0.65)}
          fill={tissue(part)}
          style={heat(part)}
          stroke="#c5d3df40"
          strokeWidth=".6"
        />
      )}
      <path
        d={`M${lerp(a, b, 0.15)}Q${lerp(a, b, 0.45)} ${lerp(a, b, 0.88)}`}
        fill="none"
        stroke="#d5e4f329"
        strokeWidth=".65"
      />
    </g>
  );
  const step = guideSteps[motion];
  const from = poseFor(motion, step.start),
    to = poseFor(motion, step.peak);
  const tracked = (p: typeof pose): Point =>
    ["pushup", "incline"].includes(motion)
      ? p.shoulders[0]
      : ["squat", "chair", "pelvic"].includes(motion)
        ? p.hips[0]
        : motion === "chin"
          ? p.head
          : motion === "deadbug"
            ? p.feet[0]
            : p.hands[1];
  const a = tracked(from),
    b = tracked(to);
  const offset: Point = ["pushup", "incline"].includes(motion)
    ? [-60, 12]
    : ["squat", "chair"].includes(motion)
      ? [52, -12]
      : motion === "pelvic"
        ? [0, -48]
        : motion === "chin"
          ? [-8, -24]
          : supine
            ? [0, -24]
            : [20, 0];
  const arrowA: Point = [a[0] + offset[0], a[1] + offset[1]];
  const arrowB: Point = [b[0] + offset[0], b[1] + offset[1]];
  const frame = care
    ? "100 15 205 200"
    : motion === "incline"
      ? "45 90 315 200"
      : motion === "pushup"
        ? "45 140 315 150"
        : motion === "deadbug"
          ? "15 100 345 150"
          : motion === "pelvic"
            ? "45 155 285 95"
            : "45 0 315 300";
  return (
    <svg
      className="movement-figure"
      viewBox={frame}
      role="img"
      aria-label={`${peak ? "Peak" : "Start"} position anatomy`}
    >
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#b1bdc9" />
          <stop offset=".4" stopColor="#6f8499" />
          <stop offset="1" stopColor="#263a50" />
        </linearGradient>
        <linearGradient id={`${id}-heat`}>
          <stop stopColor="#ff915d" />
          <stop offset=".5" stopColor="#ff4500" />
          <stop offset="1" stopColor="#bc280c" />
        </linearGradient>
        <marker
          id={`${id}-arrow`}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path
            d="M0 0L6 3L0 6"
            fill="none"
            stroke="#91b8ff"
            strokeWidth="1.2"
          />
        </marker>
      </defs>
      {!care && (
        <path
          d={`M35 ${supine ? 239 : 282}H363`}
          stroke="#48617e"
          strokeWidth="1"
        />
      )}
      {motion === "incline" && (
        <path
          d="M105 211H162M108 211V280M159 211V280"
          fill="none"
          stroke="#6982a2"
          strokeWidth="4"
        />
      )}
      {motion === "chair" && (
        <path
          d="M245 229H304V164M252 229V280M300 229V280"
          fill="none"
          stroke="#6982a2"
          strokeWidth="4"
        />
      )}
      {motion === "angel" && (
        <rect
          x="110"
          y="10"
          width="180"
          height="271"
          rx="4"
          fill="#2563eb08"
          stroke="#48617e"
          strokeDasharray="4 4"
        />
      )}
      {[1, 0].map((i) => (
        <g key={i} opacity={side && i === 1 ? 0.5 : 1}>
          {segment(pose.hips[i], pose.knees[i], 14, "legs")}
          {segment(pose.knees[i], pose.feet[i], 10, "legs")}
          <path
            d={`M${pose.feet[i][0] - 7},${pose.feet[i][1] - 3}q-5,4 -13,9q-2,5 7,5h18q5,-7 -2,-14Z`}
            fill={`url(#${id}-skin)`}
            stroke="#8198b0"
            strokeWidth=".65"
          />
        </g>
      ))}
      <path
        d={`M${torso.shoulders[0]} Q${neck[0]},${neck[1] - 8} ${torso.shoulders[1]} Q${lerp(torso.shoulders[1], torso.hips[1], 0.65)} ${torso.hips[1]} Q${hip[0]},${hip[1] + 12} ${torso.hips[0]} Q${lerp(torso.shoulders[0], torso.hips[0], 0.65)} ${torso.shoulders[0]}Z`}
        fill={`url(#${id}-skin)`}
        stroke="#94a8be"
        strokeWidth=".8"
      />
      {[0, 1].map((i) => {
        const j = 1 - i;
        const part = motion === "pull" || motion === "angel" ? "back" : "chest";
        return (
          <path
            key={i}
            d={polygon([
              lerp(torso.shoulders[i], torso.shoulders[j], 0.08),
              lerp(torso.shoulders[i], torso.shoulders[j], 0.47),
              lerp(neck, hip, 0.42),
              lerp(torso.shoulders[i], torso.hips[i], 0.38),
            ])}
            fill={tissue(part)}
            style={heat(part)}
            stroke="#1c2d41"
            strokeWidth=".8"
          />
        );
      })}
      {side ? (
        <path
          d={contour(lerp(neck, hip, 0.46), lerp(neck, hip, 0.91), 10)}
          fill={tissue(motion === "pelvic" ? "posture" : "core")}
          style={heat(motion === "pelvic" ? "posture" : "core")}
          stroke="#24364a"
          strokeWidth=".6"
        />
      ) : (
        <>
          {[0, 1, 2].map((row) => (
            <path
              key={row}
              d={polygon([
                lerp(torso.shoulders[0], torso.hips[0], 0.47 + row * 0.15),
                lerp(torso.shoulders[1], torso.hips[1], 0.47 + row * 0.15),
                lerp(torso.shoulders[1], torso.hips[1], 0.59 + row * 0.15),
                lerp(torso.shoulders[0], torso.hips[0], 0.59 + row * 0.15),
              ])}
              fill={tissue(
                motion === "pelvic"
                  ? "posture"
                  : motion === "pull" || motion === "angel"
                    ? "back"
                    : "core",
              )}
              style={heat(motion === "pelvic" ? "posture" : "core")}
              stroke="#22364c"
              strokeWidth=".65"
            />
          ))}
        </>
      )}
      {segment(neck, pose.head, 8, motion === "chin" ? "posture" : undefined)}
      <ellipse
        cx={pose.head[0]}
        cy={pose.head[1]}
        rx="12"
        ry="16"
        fill={`url(#${id}-skin)`}
        stroke="#a5b5c6"
        strokeWidth=".7"
      />
      {motion !== "pull" && (
        <path
          d={`M${pose.head[0] - 6},${pose.head[1] - 2}h3m6,0h3m-7,2v4l2,1m-4,3h5`}
          fill="none"
          stroke="#354b63"
          strokeWidth=".9"
        />
      )}
      {[1, 0].map((i) => (
        <g key={i} opacity={side && i === 1 ? 0.55 : 1}>
          {segment(pose.shoulders[i], pose.elbows[i], 10)}
          {segment(pose.elbows[i], pose.hands[i], 7)}
          <path
            d={contour(
              pose.shoulders[i],
              lerp(pose.shoulders[i], pose.elbows[i], 0.42),
              9,
            )}
            fill={tissue("shoulders")}
            style={heat("shoulders")}
            stroke="#b5c7d544"
            strokeWidth=".7"
          />
          <ellipse
            cx={pose.hands[i][0]}
            cy={pose.hands[i][1]}
            rx="5"
            ry="7"
            fill={`url(#${id}-skin)`}
          />
        </g>
      ))}
      {motion === "water" && (
        <path
          d={`M${pose.hands[1][0] - 4},${pose.hands[1][1] - 14}h13l-2,19h-9Z`}
          fill="#3b82f644"
          stroke="#c6dcff"
        />
      )}
      {peak && (
        <path
          className="range-arrow"
          d={`M${arrowA}Q${(arrowA[0] + arrowB[0]) / 2 + 12},${(arrowA[1] + arrowB[1]) / 2 - 8} ${arrowB}`}
          fill="none"
          stroke="#91b8ff"
          strokeWidth="2"
          strokeDasharray="4 3"
          markerEnd={`url(#${id}-arrow)`}
        />
      )}
    </svg>
  );
}
export default function MovementDiagram({ quest }: { quest: Quest }) {
  const guide = resolveGuide(quest);
  if (!guide) return null;
  const step = guideSteps[guide.motion];
  const care = quest.category === "grooming";
  return (
    <div className="movement-diagram" data-movement={guide.motion}>
      <div className="diagram-positions">
        {([false, true] as const).map((peak) => (
          <figure className="position-plate" key={String(peak)}>
            <figcaption>
              <span>{peak ? "02" : "01"}</span>
              <strong>
                {peak
                  ? care
                    ? "Finish position"
                    : "Peak contraction"
                  : "Start position"}
              </strong>
            </figcaption>
            <Figure
              motion={guide.motion}
              muscle={quest.muscle}
              amount={peak ? step.peak : step.start}
              peak={peak}
            />
            <p>{peak ? step.peakCue : step.startCue}</p>
          </figure>
        ))}
      </div>
      <div className="range-caption">
        <span className="range-key" aria-hidden="true" />
        <div>
          <strong>Range of motion path</strong>
          <p>{step.path}</p>
        </div>
      </div>
      <footer className="diagram-legend">
        <span>{guide.view}</span>
        <span className={care ? "" : "heat-legend"}>
          {care
            ? "Gentle care illustration"
            : `Target muscles · ${quest.muscle}`}
        </span>
      </footer>
    </div>
  );
}
