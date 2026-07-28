import { ACT_BOUNDARIES, SCRUB_FRAME_COUNT, type Aspect } from "../src/lib/frames";

// Requires ImageMagick 7 (`magick`). Run with `bun run assets:placeholders`.
const magick = Bun.which("magick");
if (!magick) throw new Error("ImageMagick 7 is required to generate placeholder frames (missing `magick`).");

interface BallPoint {
  frame: number;
  x: number;
  y: number;
}

interface BallPath {
  paths: Record<Aspect, { points: BallPoint[] }>;
}

const palette = {
  high: "#F3F7F5",
  mid: "#A9BBB4",
  turf: "#4FD9A6",
  volt: "#5CFFC0",
};

const path = await Bun.file("public/ball-path.json").json() as BallPath;

function ballAt(aspect: Aspect, frame: number): BallPoint {
  const points = path.paths[aspect].points;
  const nextIndex = points.findIndex((point) => point.frame >= frame);
  if (nextIndex === -1) return points.at(-1)!;
  if (nextIndex === 0) return points[0];
  const before = points[nextIndex - 1];
  const after = points[nextIndex];
  const progress = (frame - before.frame) / (after.frame - before.frame);
  return {
    frame,
    x: before.x + (after.x - before.x) * progress,
    y: before.y + (after.y - before.y) * progress,
  };
}

function person(x: number, ground: number, size: number, opacity: number, rotation: number, kicking = false): string {
  const head = size * 0.105;
  const shoulder = ground - size * 0.68;
  const hip = ground - size * 0.34;
  const armLift = kicking ? size * 0.2 : 0;
  const kick = kicking ? size * 0.34 : size * 0.08;
  return `<g opacity="${opacity.toFixed(3)}" transform="rotate(${rotation.toFixed(2)} ${x.toFixed(1)} ${ground.toFixed(1)})" stroke="${palette.high}" stroke-width="${(size * 0.075).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <circle cx="${x.toFixed(1)}" cy="${(shoulder - size * 0.17).toFixed(1)}" r="${head.toFixed(1)}" fill="${palette.high}" stroke="none" />
    <path d="M ${x.toFixed(1)} ${shoulder.toFixed(1)} L ${x.toFixed(1)} ${hip.toFixed(1)}" />
    <path d="M ${x.toFixed(1)} ${(shoulder + size * 0.05).toFixed(1)} L ${(x - size * 0.22).toFixed(1)} ${(shoulder + size * 0.18 - armLift).toFixed(1)} M ${x.toFixed(1)} ${(shoulder + size * 0.05).toFixed(1)} L ${(x + size * 0.22).toFixed(1)} ${(shoulder + size * 0.15 + armLift).toFixed(1)}" />
    <path d="M ${x.toFixed(1)} ${hip.toFixed(1)} L ${(x - size * 0.16).toFixed(1)} ${ground.toFixed(1)} M ${x.toFixed(1)} ${hip.toFixed(1)} L ${(x + kick).toFixed(1)} ${(ground - (kicking ? size * 0.22 : 0)).toFixed(1)}" />
  </g>`;
}

function net(width: number, height: number): string {
  const lines: string[] = [];
  for (let x = 0; x <= width; x += width / 12) lines.push(`<path d="M ${x} 0 L ${x + width * 0.12} ${height}" />`);
  for (let y = 0; y <= height; y += height / 10) lines.push(`<path d="M 0 ${y} L ${width} ${y + height * 0.08}" />`);
  return `<g opacity="0.13" stroke="${palette.turf}" stroke-width="1.5">${lines.join("")}</g>`;
}

function svgFor(aspect: Aspect, frame: number, width: number, height: number): string {
  const act = ACT_BOUNDARIES.find((candidate) => frame <= candidate.frameEnd)!;
  const local = (frame - act.frameStart) / Math.max(1, act.frameEnd - act.frameStart);
  const unit = Math.min(width, height);
  const ground = height * 0.78;
  const ball = ballAt(aspect, frame);
  let jacobX = width * 0.22;
  let jacobScale = unit * 0.52;
  let rotation = -5;
  let defender = "";
  let underlay = "";
  let overlay = "";
  let kicking = false;

  if (act.id === "a1") {
    jacobX = width * (0.18 + local * 0.14);
    defender = person(width * (0.52 + local * 0.04), ground, unit * 0.47, 0.62, 6);
  } else if (act.id === "a2") {
    jacobX = width * (0.34 + local * 0.2);
    jacobScale = unit * 0.61;
    rotation = -18 + local * 36;
    defender = person(width * (0.58 + local * 0.2), ground, unit * 0.54, 0.68 * (1 - local), 10 + local * 16);
  } else if (act.id === "a2b") {
    jacobX = width * (0.54 + local * 0.04);
    jacobScale = unit * 0.58;
    rotation = 8 - local * 10;
    defender = person(width * 0.81, ground, unit * 0.5, 0.1 * (1 - local), 24);
  } else if (act.id === "a3") {
    jacobX = width * (0.56 + local * 0.1);
    jacobScale = unit * 0.62;
    rotation = -4 + local * 8;
    kicking = local > 0.35;
    underlay = `<ellipse cx="${jacobX.toFixed(1)}" cy="${(ground + unit * 0.025).toFixed(1)}" rx="${(unit * 0.2).toFixed(1)}" ry="${(unit * 0.035).toFixed(1)}" fill="${palette.volt}" opacity="${(0.05 + local * 0.08).toFixed(3)}" />`;
  } else {
    jacobX = width * 0.34;
    jacobScale = unit * 0.34;
    rotation = 5;
    overlay = net(width, height);
  }

  const actFourFade = act.id === "a4" ? 1 - local : 1;
  const ballRadius = act.id === "a4" ? unit * (0.025 + local * local * 0.19) : unit * 0.026;
  const ballGlow = ballRadius * 1.8;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    ${underlay}
    ${defender.replaceAll(palette.high, palette.mid)}
    ${person(jacobX, ground, jacobScale, actFourFade, rotation, kicking)}
    <circle cx="${(ball.x * width).toFixed(1)}" cy="${(ball.y * height).toFixed(1)}" r="${ballGlow.toFixed(1)}" fill="${palette.volt}" opacity="0.09" />
    <circle cx="${(ball.x * width).toFixed(1)}" cy="${(ball.y * height).toFixed(1)}" r="${ballRadius.toFixed(1)}" fill="${palette.volt}" />
    ${overlay}
  </svg>`;
}

function frameName(frame: number): string {
  const act = ACT_BOUNDARIES.find((candidate) => frame <= candidate.frameEnd)!;
  return `${act.id}_${String(frame - act.frameStart + 1).padStart(3, "0")}.webp`;
}

for (const [aspect, width, height] of [["landscape", 1280, 720], ["portrait", 720, 1280]] as const) {
  for (let frame = 0; frame < SCRUB_FRAME_COUNT; frame += 1) {
    const svg = svgFor(aspect, frame, width, height);
    const result = Bun.spawnSync([
      magick,
      "-background",
      "none",
      `inline:data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      "-quality",
      "82",
      `webp:public/frames/${aspect}/${frameName(frame)}`,
    ]);
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
  }
}

console.log(`Generated ${SCRUB_FRAME_COUNT * 2} placeholder frames.`);
