import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { Quest, Muscle } from "../lib/types";
import { lerp, motionPhase, poseFor, resolveDemo } from "../lib/exerciseMotion";
import type { Point } from "../lib/exerciseMotion";
import Anatomy from "./Anatomy";
import "./exercise-demo.css";
const path = (points: Point[]) =>
  `M${points.map((p) => p.join(",")).join("L")}Z`;
export default function ExerciseDemo({ quest }: { quest: Quest }) {
  const demo = resolveDemo(quest);
  const id = useId().replace(/:/g, "");
  const [paused, setPaused] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [seconds, setSeconds] = useState(0);
  const elapsed = useRef(0);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (query.matches) setPaused(true);
    };
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);
  useEffect(() => {
    if (paused || !demo) return;
    let frame = 0,
      last = 0,
      paint = 0;
    const tick = (now: number) => {
      if (last && !document.hidden)
        elapsed.current += Math.min(now - last, 80) / 1000;
      last = now;
      if (now - paint > 32) {
        setSeconds(elapsed.current);
        paint = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused, demo?.motion]);
  const phase = motionPhase(seconds);
  const pose = demo ? poseFor(demo.motion, phase.t, phase.alternate) : null;
  const [back, setBack] = useState(quest.muscle === "back");
  if (!demo || !pose)
    return (
      <div className="exercise-demo">
        <div className="demo-label">TARGET ANATOMY</div>
        <div className="custom-anatomy">
          <Anatomy muscles={[quest.muscle]} back={back} />
        </div>
        <button className="btn btn-ghost" onClick={() => setBack(!back)}>
          <RotateCcw size={14} />
          {back ? "Show front" : "Show back"}
        </button>
        <p className="muted text-xs mt-4 mb-0">
          No verified movement animation is available for this custom routine.
          This view shows its target area; follow your own qualified form
          guidance.
        </p>
      </div>
    );
  const supine = demo.motion === "deadbug" || demo.motion === "pelvic";
  const ground = supine ? 239 : 279;
  const neck = lerp(pose.shoulders[0], pose.shoulders[1], 0.5);
  const pelvic = lerp(pose.hips[0], pose.hips[1], 0.5);
  // Give the side-view torso depth without moving the articulated joints.
  const sideView = [
    "pushup",
    "incline",
    "squat",
    "chair",
    "deadbug",
    "pelvic",
    "chin",
  ].includes(demo.motion);
  const torso = { shoulders: pose.shoulders, hips: pose.hips };
  if (sideView) {
    const dx = pelvic[0] - neck[0],
      dy = pelvic[1] - neck[1];
    const length = Math.hypot(dx, dy) || 1;
    const offset = (center: Point, amount: number): Point => [
      center[0] - (dy / length) * amount,
      center[1] + (dx / length) * amount,
    ];
    torso.shoulders = [offset(neck, 12), offset(neck, -12)];
    torso.hips = [offset(pelvic, 9), offset(pelvic, -9)];
  }
  const heat = 0.45 + Math.sin((phase.t * Math.PI) / 2) * 0.55;
  const care = ["cleanse", "massage", "skin", "water"].includes(demo.motion);
  const active = (muscle: Muscle | null) =>
    !care &&
    (quest.muscle === muscle ||
      (demo.motion === "angel" && muscle === "shoulders"));
  const fill = (muscle: Muscle) =>
    active(muscle) ? `url(#${id}-heat)` : `url(#${id}-tissue)`;
  const glow = (muscle: Muscle | null) =>
    active(muscle)
      ? {
          filter: `drop-shadow(0 0 ${2 + heat * 4}px #ff450080)`,
          opacity: 0.65 + heat * 0.35,
        }
      : {};
  const limb = (a: Point, b: Point, muscle: Muscle | null, key: string) => (
    <g key={key}>
      <path
        d={`M${a}L${b}`}
        stroke="#304868"
        strokeWidth="15"
        strokeLinecap="round"
      />
      <path
        d={`M${a}L${b}`}
        stroke="#111d30"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d={`M${lerp(a, b, 0.2)}L${lerp(a, b, 0.75)}`}
        stroke={active(muscle) ? "#ff4500" : "#1c304c"}
        strokeWidth="9"
        strokeLinecap="round"
        style={glow(muscle)}
      />
    </g>
  );
  return (
    <div
      className="exercise-demo"
      data-motion={demo.motion}
      data-running={!paused}
    >
      <div className="demo-toolbar">
        <span className="demo-label">{demo.view}</span>
        <span className="demo-live">
          <span />
          {paused ? "PAUSED" : "LIVE DEMO"}
        </span>
      </div>
      <svg
        viewBox={care ? "95 12 210 210" : "0 0 400 300"}
        role="img"
        aria-label={`${quest.name} animated anatomical demonstration`}
        className="exercise-motion"
        data-phase={phase.stage}
      >
        <defs>
          <linearGradient id={`${id}-tissue`}>
            <stop stopColor="#172e4e" />
            <stop offset=".5" stopColor="#203c60" />
            <stop offset="1" stopColor="#0c1728" />
          </linearGradient>
          <linearGradient id={`${id}-heat`}>
            <stop stopColor="#ff783d" />
            <stop offset="1" stopColor="#ff4500" />
          </linearGradient>
          <pattern
            id={`${id}-grid`}
            width="25"
            height="25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M25 0H0V25"
              fill="none"
              stroke="#3b82f6"
              strokeOpacity=".07"
            />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#${id}-grid)`} />
        {demo.motion === "angel" && (
          <rect
            x="113"
            y="14"
            width="174"
            height="265"
            rx="3"
            fill="#2563eb06"
            stroke="#3b82f62b"
          />
        )}
        {demo.motion === "incline" && (
          <path
            d="M105 210H161M109 210V278M157 210V278"
            stroke="#526e94"
            strokeWidth="4"
            fill="none"
          />
        )}
        {demo.motion === "chair" && (
          <path
            d="M249 229H299V166M256 229V278M295 229V278"
            stroke="#526e94"
            strokeWidth="4"
            fill="none"
          />
        )}
        {!care && (
          <>
            <ellipse cx="208" cy={ground} rx="142" ry="6" fill="#2563eb0d" />
            <path d={`M48 ${ground}H357`} stroke="#3b82f636" strokeWidth="1" />
          </>
        )}
        {[1, 0].map((side) => (
          <g
            key={side}
            opacity={
              side === 1 &&
              [
                "pushup",
                "incline",
                "squat",
                "chair",
                "deadbug",
                "pelvic",
                "chin",
              ].includes(demo.motion)
                ? 0.6
                : 1
            }
          >
            {limb(pose.hips[side], pose.knees[side], "legs", `thigh-${side}`)}
            {limb(pose.knees[side], pose.feet[side], "legs", `calf-${side}`)}
            <circle
              cx={pose.knees[side][0]}
              cy={pose.knees[side][1]}
              r="4"
              fill="#243955"
              stroke="#4b6585"
            />
            <path
              d={`M${pose.feet[side]}l${side === 0 ? -12 : 12},3`}
              stroke="#263c59"
              strokeWidth="9"
              strokeLinecap="round"
            />
          </g>
        ))}
        <path
          d={path([...torso.shoulders, torso.hips[1], torso.hips[0]])}
          fill={`url(#${id}-tissue)`}
          stroke="#486387"
          strokeWidth="1.2"
        />
        <path
          d={path([
            lerp(torso.shoulders[0], torso.shoulders[1], 0.08),
            lerp(torso.shoulders[0], torso.shoulders[1], 0.48),
            lerp(neck, pelvic, 0.39),
            lerp(torso.shoulders[0], torso.hips[0], 0.34),
          ])}
          fill={fill(demo.motion === "pull" ? "back" : "chest")}
          style={glow(demo.motion === "pull" ? "back" : "chest")}
          stroke="#59729544"
          strokeWidth=".7"
        />
        <path
          d={path([
            lerp(torso.shoulders[1], torso.shoulders[0], 0.08),
            lerp(torso.shoulders[1], torso.shoulders[0], 0.48),
            lerp(neck, pelvic, 0.39),
            lerp(torso.shoulders[1], torso.hips[1], 0.34),
          ])}
          fill={fill(demo.motion === "pull" ? "back" : "chest")}
          style={glow(demo.motion === "pull" ? "back" : "chest")}
          stroke="#59729544"
          strokeWidth=".7"
        />
        {[0, 1, 2].map((row) => (
          <path
            key={row}
            d={path([
              lerp(torso.shoulders[0], torso.hips[0], 0.44 + row * 0.16),
              lerp(torso.shoulders[1], torso.hips[1], 0.44 + row * 0.16),
              lerp(torso.shoulders[1], torso.hips[1], 0.57 + row * 0.16),
              lerp(torso.shoulders[0], torso.hips[0], 0.57 + row * 0.16),
            ])}
            fill={fill(
              demo.motion === "pelvic"
                ? "posture"
                : demo.motion === "pull"
                  ? "back"
                  : "core",
            )}
            style={glow(
              demo.motion === "pelvic"
                ? "posture"
                : demo.motion === "pull"
                  ? "back"
                  : "core",
            )}
            stroke="#42608666"
            strokeWidth=".6"
          />
        ))}
        <path
          d={`M${neck}L${pose.head}`}
          stroke={demo.motion === "chin" ? "#ff4500" : "#30486a"}
          strokeWidth="12"
          style={glow("posture")}
        />
        <ellipse
          cx={pose.head[0]}
          cy={pose.head[1]}
          rx="12"
          ry="16"
          fill={`url(#${id}-tissue)`}
          stroke="#506f97"
        />
        {demo.motion !== "pull" && (
          <path
            d={`M${pose.head[0] - 6},${pose.head[1] - 2}h3m7,0h3m-8,9h4`}
            fill="none"
            stroke="#7e9bbf"
            strokeWidth="1"
          />
        )}
        {[1, 0].map((side) => (
          <g key={side}>
            {limb(
              pose.shoulders[side],
              pose.elbows[side],
              "shoulders",
              `arm-${side}`,
            )}
            {limb(pose.elbows[side], pose.hands[side], null, `forearm-${side}`)}
            <circle
              cx={pose.shoulders[side][0]}
              cy={pose.shoulders[side][1]}
              r="8"
              fill={fill("shoulders")}
              style={glow("shoulders")}
              stroke="#45618b"
              strokeWidth=".8"
            />
            <circle
              cx={pose.elbows[side][0]}
              cy={pose.elbows[side][1]}
              r="3"
              fill="#344d6e"
            />
            <ellipse
              cx={pose.hands[side][0]}
              cy={pose.hands[side][1]}
              rx="5"
              ry="7"
              fill="#304968"
              stroke="#5d789e"
              strokeWidth=".7"
            />
          </g>
        ))}
        {demo.motion === "water" && (
          <path
            d={`M${pose.hands[1][0] - 4},${pose.hands[1][1] - 14}h13l-2,19h-9Z`}
            fill="#3b82f644"
            stroke="#93b8ff"
          />
        )}
      </svg>
      <div className="demo-controls">
        <div>
          <span className="demo-phase">{demo.phases[phase.stage]}</span>
          <span className="demo-duration font-mono">
            {phase.stage === 0 ? "3" : "1"} SEC
          </span>
        </div>
        <button
          className="icon-btn"
          aria-label={paused ? "Play demonstration" : "Pause demonstration"}
          onClick={() => setPaused(!paused)}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>
      <div className="demo-progress" aria-hidden="true">
        <span style={{ width: `${phase.progress * 100}%` }} />
      </div>
      <p className="demo-caption">{demo.placement}</p>
      <span className="demo-heat-key">
        <span />
        {care ? "Gentle care illustration" : `Target muscles · ${quest.muscle}`}
      </span>
    </div>
  );
}
