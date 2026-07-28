import { ACT_FIVE_START } from "./frames";

export const ACT_FIVE_PHASES = {
  expandEnd: 0.14,
  holdEnd: 0.34,
  dissolveEnd: 0.58,
  settleEnd: 0.78,
} as const;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const easeOutCubic = (value: number) => 1 - (1 - value) ** 3;

export interface ActFiveState {
  active: boolean;
  q: number;
  circleProgress: number;
  fieldAlpha: number;
  nameUsesVoid: boolean;
  showActFour: boolean;
  easedDotProgress: number;
  videoOpacity: number;
  subtitleOpacity: number;
  releaseProgress: number;
}

export function actFiveState(progress: number): ActFiveState {
  const active = progress >= ACT_FIVE_START;
  const q = range(progress, ACT_FIVE_START, 1);
  const expand = range(q, 0, ACT_FIVE_PHASES.expandEnd);
  const fieldAlpha = !active ? 0
    : q < ACT_FIVE_PHASES.holdEnd ? 1
    : q < ACT_FIVE_PHASES.dissolveEnd ? 1 - range(q, ACT_FIVE_PHASES.holdEnd, ACT_FIVE_PHASES.dissolveEnd)
    : 0;
  const dotProgress = range(q, ACT_FIVE_PHASES.holdEnd, ACT_FIVE_PHASES.dissolveEnd);

  return {
    active,
    q,
    circleProgress: active ? easeOutCubic(expand) : 0,
    fieldAlpha,
    nameUsesVoid: active && (q < ACT_FIVE_PHASES.holdEnd || fieldAlpha > 0.49),
    showActFour: !active || q < ACT_FIVE_PHASES.expandEnd,
    easedDotProgress: easeOutCubic(dotProgress),
    videoOpacity: range(q, ACT_FIVE_PHASES.dissolveEnd, ACT_FIVE_PHASES.settleEnd) * 0.18,
    subtitleOpacity: range(q, ACT_FIVE_PHASES.dissolveEnd, ACT_FIVE_PHASES.settleEnd),
    releaseProgress: range(q, ACT_FIVE_PHASES.settleEnd, 1),
  };
}
