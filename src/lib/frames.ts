export type Aspect = "portrait" | "landscape";

export type ActId = "a1" | "a2" | "a2b" | "a3" | "a4";

export interface ActBoundary {
  id: ActId;
  label: string;
  start: number;
  end: number;
  frameStart: number;
  frameEnd: number;
}

export interface FrameSet {
  aspect: Aspect;
  width: number;
  height: number;
  frameCount: number;
  framePath: (index: number) => string;
}

export const SCRUB_ASSETS = {
  ballPath: "/ball-path.json",
  celebration: "/celebration.mp4",
  poster: "/poster.jpg",
} as const;

export const CHOREOGRAPHY = {
  actFiveStart: 0.8,
  laterActsLoadAt: 0.02,
  strikeAt: 0.65,
  strikeWidth: 0.055,
  trailFadeStart: 0.76,
  videoStart: 0.8,
  transitionWidth: 0.009,
} as const;

const ACTS: Array<{ id: ActId; label: string; count: number; share: number }> = [
  { id: "a1", label: "Approach", count: 12, share: 0.12 },
  { id: "a2", label: "The spin", count: 40, share: 0.3 },
  { id: "a2b", label: "Snap", count: 5, share: 0.05 },
  { id: "a3", label: "The strike", count: 24, share: 0.2 },
  { id: "a4", label: "The ball", count: 15, share: 0.13 },
];

export const SCRUB_FRAME_COUNT = ACTS.reduce((total, act) => total + act.count, 0);
export const ACT_FIVE_START = CHOREOGRAPHY.actFiveStart;

let progress = 0;
let frame = 0;
export const ACT_BOUNDARIES: ActBoundary[] = ACTS.map((act) => {
  const boundary = {
    id: act.id,
    label: act.label,
    start: progress,
    end: progress + act.share,
    frameStart: frame,
    frameEnd: frame + act.count - 1,
  };
  progress += act.share;
  frame += act.count;
  return boundary;
});

export const ACT_TRANSITIONS = ACT_BOUNDARIES.slice(0, -1).map((act) => act.end);

export function frameIndexForProgress(progress: number): number {
  if (progress >= ACT_FIVE_START) return SCRUB_FRAME_COUNT - 1;
  const act = ACT_BOUNDARIES.find((boundary) => progress < boundary.end) ?? ACT_BOUNDARIES.at(-1)!;
  const localProgress = Math.max(0, Math.min(1, (progress - act.start) / (act.end - act.start)));
  const pacedProgress = act.id === "a4" ? localProgress ** 2 : localProgress;
  return act.frameStart + Math.round(pacedProgress * (act.frameEnd - act.frameStart));
}

function frameName(index: number): string {
  const act = ACT_BOUNDARIES.find((boundary) => index <= boundary.frameEnd) ?? ACT_BOUNDARIES.at(-1)!;
  const withinAct = index - act.frameStart + 1;
  return `${act.id}_${String(withinAct).padStart(3, "0")}.webp`;
}

function createSet(aspect: Aspect, width: number, height: number): FrameSet {
  return {
    aspect,
    width,
    height,
    frameCount: SCRUB_FRAME_COUNT,
    framePath: (index) => `/frames/${aspect}/${frameName(Math.max(0, Math.min(index, SCRUB_FRAME_COUNT - 1)))}`,
  };
}

export const LANDSCAPE_SET = createSet("landscape", 1280, 720);
export const PORTRAIT_SET = createSet("portrait", 720, 1280);
