type Sound = "tap" | "complete" | "level" | "warning";
let context: AudioContext | null = null;
export function playSound(kind: Sound, enabled = true) {
  if (!enabled) return;
  try {
    context ??= new AudioContext();
    if (context.state === "suspended") void context.resume();
    const now = context.currentTime;
    const tone = (
      hz: number,
      offset: number,
      duration: number,
      volume = 0.08,
      end?: number,
    ) => {
      const osc = context!.createOscillator(),
        gain = context!.createGain();
      osc.type = kind === "level" ? "sine" : "triangle";
      osc.frequency.setValueAtTime(hz, now + offset);
      if (end)
        osc.frequency.exponentialRampToValueAtTime(
          end,
          now + offset + duration,
        );
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + duration);
      osc.connect(gain);
      gain.connect(context!.destination);
      osc.start(now + offset);
      osc.stop(now + offset + duration + 0.01);
    };
    if (kind === "tap") tone(1200, 0, 0.015, 0.035);
    if (kind === "complete") {
      tone(880, 0, 0.22);
      tone(1760, 0.13, 0.4, 0.06);
    }
    if (kind === "level") {
      tone(60, 0, 0.8, 0.15, 30);
      [220, 330, 440, 660, 880].forEach((hz, i) =>
        tone(hz, 0.08 + i * 0.1, 0.5, 0.055),
      );
    }
    if (kind === "warning") {
      tone(110, 0, 0.2, 0.07);
      tone(110, 0.32, 0.22, 0.06);
    }
  } catch {
    /* Audio is optional on browsers without Web Audio support. */
  }
}
