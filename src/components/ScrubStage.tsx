import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type CSSProperties } from "react";
import { ACT_FIVE_PHASES, actFiveState } from "../lib/actFive";
import {
  ACT_BOUNDARIES,
  ACT_FIVE_START,
  ACT_TRANSITIONS,
  CHOREOGRAPHY,
  LANDSCAPE_SET,
  PORTRAIT_SET,
  SCRUB_ASSETS,
  frameIndexForProgress,
  type Aspect,
  type FrameSet,
} from "../lib/frames";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface BallPoint { frame: number; x: number; y: number }

function readBallPoints(value: unknown, frameCount: number): BallPoint[] {
  const points = Array.isArray(value)
    ? value
    : value && typeof value === "object" && "points" in value && Array.isArray(value.points)
      ? value.points
      : [];

  return points.filter((point): point is BallPoint =>
    typeof point === "object" && point !== null &&
    Number.isInteger((point as BallPoint).frame) && (point as BallPoint).frame >= 0 && (point as BallPoint).frame < frameCount &&
    Number.isFinite((point as BallPoint).x) && (point as BallPoint).x >= 0 && (point as BallPoint).x <= 1 &&
    Number.isFinite((point as BallPoint).y) && (point as BallPoint).y >= 0 && (point as BallPoint).y <= 1,
  ).sort((left, right) => left.frame - right.frame);
}

function ballPointsForAspect(data: unknown, aspect: Aspect, frameCount: number): BallPoint[] {
  if (!data || typeof data !== "object") return [];
  if (!("coordinateSpace" in data) || data.coordinateSpace !== "normalized") return [];
  if ("version" in data && data.version === 2) {
    if (!("paths" in data) || !data.paths || typeof data.paths !== "object" || !(aspect in data.paths)) return [];
    return readBallPoints((data.paths as Record<string, unknown>)[aspect], frameCount);
  }
  if (!("version" in data) || data.version === 1) {
    return "points" in data ? readBallPoints(data.points, frameCount) : [];
  }
  return [];
}

interface ScrubStageProps {
  scrollLength?: string;
}

const WINDOW_RADIUS = 10;
const MAX_BITMAPS = 28;
const STRIKE_FRAME = frameIndexForProgress(CHOREOGRAPHY.strikeAt);

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const range = (value: number, start: number, end: number) => clamp((value - start) / (end - start));
const bell = (value: number, center: number, width: number) => clamp(1 - Math.abs(value - center) / width);

export default function ScrubStage({ scrollLength = "550svh" }: ScrubStageProps) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const status = useRef<HTMLParagraphElement>(null);
  const title = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const rootElement = root.current;
    const canvasElement = canvas.current;
    const stageElement = stage.current;
    const titleElement = title.current;
    if (!rootElement || !canvasElement || !stageElement || !titleElement) return;
    const vitalsElement = document.getElementById("vitals");

    const context = canvasElement.getContext("2d");
    if (!context) return;

    let active = true;
    let raf = 0;
    let currentProgress = 0;
    let requestedFrame = -1;
    let paintedFrame = -1;
    let paintedSourceFrame = -1;
    let paintedEffect = "";
    let set: FrameSet | null = null;
    let path: BallPoint[] = [];
    let images: HTMLImageElement[] = [];
    let laterActsActivated = false;
    const bitmaps = new Map<number, ImageBitmap>();
    const pending = new Set<number>();
    const failed = new Set<number>();
    const initialDecoded = new Set<number>();
    const lastUsed = new Map<number, number>();
    let pathController: AbortController | undefined;
    let useCounter = 0;
    let inFlightDecodes = 0;
    let resizeObserver: ResizeObserver | undefined;
    let idleId: number | undefined;
    let loadVersion = 0;
    let warnedMissingPath = false;

    const loadPath = () => {
      if (!set) return;
      const version = loadVersion;
      const aspect = set.aspect;
      const frameCount = set.frameCount;
      pathController = new AbortController();
      fetch(SCRUB_ASSETS.ballPath, { signal: pathController.signal })
        .then((response) => response.ok ? response.json() as Promise<unknown> : Promise.reject())
        .then((data) => {
          if (!active || version !== loadVersion) return;
          path = ballPointsForAspect(data, aspect, frameCount);
          if (path.length === 0 && !warnedMissingPath) {
            warnedMissingPath = true;
            console.warn(`Ball path missing for ${aspect}; using the viewport center.`);
          }
          paintedEffect = "";
          queuePaint();
        }).catch((error: unknown) => {
          if (!active || version !== loadVersion || error instanceof DOMException && error.name === "AbortError") return;
          if (!warnedMissingPath) {
            warnedMissingPath = true;
            console.warn("Ball path could not be loaded; using the viewport center.");
          }
        });
    };

    const applyVisualState = (p: number, actFive: ReturnType<typeof actFiveState>) => {
      stageElement.style.setProperty("--approach-darkness", String(0.38 * clamp(p / 0.6)));
      stageElement.style.setProperty("--strike-bloom", String(bell(p, CHOREOGRAPHY.strikeAt, CHOREOGRAPHY.strikeWidth)));
      stageElement.style.setProperty("--title-opacity", actFive.active ? "1" : "0");
      stageElement.style.setProperty("--video-opacity", String(actFive.videoOpacity));
      titleElement.style.setProperty("--name-fill", actFive.nameUsesVoid ? "var(--bg-void)" : "var(--text-hi)");
      titleElement.style.setProperty("--subtitle-opacity", String(actFive.subtitleOpacity));
      vitalsElement?.style.setProperty("--vitals-release", String(actFive.releaseProgress));
      const transitionFade = Math.max(...ACT_TRANSITIONS.map((point) => bell(p, point, CHOREOGRAPHY.transitionWidth)), 0);
      stageElement.style.setProperty("--canvas-opacity", String(1 - transitionFade));
      if (video.current) {
        if (p >= CHOREOGRAPHY.videoStart) void video.current.play().catch(() => undefined);
        else video.current.pause();
      }
      if (status.current) status.current.textContent = `${actFor(p)} · ${Math.round(p * 100)}%`;
    };

    const actFor = (p: number) => p >= ACT_FIVE_START ? "Together" : ACT_BOUNDARIES.find((act) => p < act.end)?.label ?? "The ball";

    const evict = () => {
      while (bitmaps.size >= MAX_BITMAPS) {
        const candidate = [...bitmaps.keys()].sort((a, b) => (lastUsed.get(a) ?? 0) - (lastUsed.get(b) ?? 0))[0];
        if (candidate === undefined) return;
        bitmaps.get(candidate)?.close();
        bitmaps.delete(candidate);
        lastUsed.delete(candidate);
      }
    };

    const shouldKeepBitmap = (index: number, center: number) => {
      const inCurrentWindow = Math.abs(index - center) <= WINDOW_RADIUS;
      const inStrikeWindow = center < STRIKE_FRAME && Math.abs(index - STRIKE_FRAME) <= 3;
      return inCurrentWindow || inStrikeWindow;
    };

    const pruneDecodedWindow = (center: number) => {
      bitmaps.forEach((bitmap, index) => {
        if (shouldKeepBitmap(index, center)) return;
        bitmap.close();
        bitmaps.delete(index);
        lastUsed.delete(index);
      });
    };

    const decode = (index: number) => {
      if (!active || !set || index < 0 || index >= set.frameCount || bitmaps.has(index) || pending.has(index) || failed.has(index)) return;
      evict();
      if (bitmaps.size + inFlightDecodes >= MAX_BITMAPS) return;
      const image = images[index];
      if (!image?.complete || !image.naturalWidth) return;
      const version = loadVersion;
      pending.add(index);
      inFlightDecodes += 1;
      createImageBitmap(image).then((bitmap) => {
        inFlightDecodes -= 1;
        if (!active || version !== loadVersion) {
          bitmap.close();
          if (active) warm(requestedFrame);
          return;
        }
        pending.delete(index);
        if (!shouldKeepBitmap(index, requestedFrame)) {
          bitmap.close();
          warm(requestedFrame);
          return;
        }
        evict();
        bitmaps.set(index, bitmap);
        lastUsed.set(index, ++useCounter);
        if (index <= WINDOW_RADIUS) {
          initialDecoded.add(index);
          if (initialDecoded.size >= 8) rootElement.dataset.ready = "true";
        }
        const improvesFallback = !bitmaps.has(requestedFrame) &&
          (paintedSourceFrame < 0 || Math.abs(index - requestedFrame) < Math.abs(paintedSourceFrame - requestedFrame));
        if (index === requestedFrame || improvesFallback) queuePaint();
        warm(requestedFrame);
      }).catch(() => {
        inFlightDecodes -= 1;
        if (!active || version !== loadVersion) {
          if (active) warm(requestedFrame);
          return;
        }
        pending.delete(index);
        failed.add(index);
        queuePaint();
        warm(requestedFrame);
      });
    };

    const warm = (center: number, radius = WINDOW_RADIUS, prune = true) => {
      if (prune) pruneDecodedWindow(center);
      decode(center);
      for (let distance = 1; distance <= radius; distance += 1) {
        decode(center + distance);
        decode(center - distance);
      }
    };

    const fit = () => {
      const rect = stageElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvasElement.width !== width || canvasElement.height !== height) {
        canvasElement.width = width;
        canvasElement.height = height;
        canvasElement.style.width = `${rect.width}px`;
        canvasElement.style.height = `${rect.height}px`;
        paintedFrame = -1;
      }
    };

    const draw = () => {
      raf = 0;
      if (!active || !set) return;
      fit();
      const p = currentProgress;
      const actFive = actFiveState(p);
      const trailAlpha = (0.18 + 0.42 * clamp((p - 0.1) / 0.55)) *
        (1 - range(p, CHOREOGRAPHY.trailFadeStart, ACT_FIVE_START));
      const canvasPhase = !actFive.active ? `frames:${trailAlpha}`
        : actFive.q < ACT_FIVE_PHASES.expandEnd ? `expand:${actFive.circleProgress}`
        : actFive.q < ACT_FIVE_PHASES.holdEnd ? "hold"
        : actFive.q < ACT_FIVE_PHASES.dissolveEnd ? `dissolve:${actFive.fieldAlpha}:${actFive.easedDotProgress}`
        : "settled";
      const effectKey = `${canvasPhase}:${canvasElement.width}x${canvasElement.height}`;
      const sourceFrame = bitmaps.has(requestedFrame)
        ? requestedFrame
        : [...bitmaps.keys()].sort((a, b) => Math.abs(a - requestedFrame) - Math.abs(b - requestedFrame))[0];
      const bitmap = sourceFrame === undefined ? undefined : bitmaps.get(sourceFrame);
      const canvasSourceFrame = actFive.showActFour ? sourceFrame : -1;
      const canvasDirty = paintedFrame !== requestedFrame || paintedSourceFrame !== canvasSourceFrame || paintedEffect !== effectKey;
      if (canvasDirty && actFive.showActFour && (!bitmap || sourceFrame === undefined)) return;
      if (!canvasDirty) {
        applyVisualState(p, actFive);
        return;
      }

      context.clearRect(0, 0, canvasElement.width, canvasElement.height);
      const scale = Math.min(canvasElement.width / set.width, canvasElement.height / set.height);
      const width = set.width * scale;
      const height = set.height * scale;
      const left = (canvasElement.width - width) / 2;
      const top = (canvasElement.height - height) / 2;
      const visiblePath = path.filter((point) => point.frame <= requestedFrame);
      const pathStart = visiblePath.at(-1);
      const pathEnd = path.find((point) => point.frame > requestedFrame);
      if (pathStart && pathEnd && pathStart.frame < requestedFrame) {
        const interpolation = (requestedFrame - pathStart.frame) / (pathEnd.frame - pathStart.frame);
        visiblePath.push({
          frame: requestedFrame,
          x: pathStart.x + (pathEnd.x - pathStart.x) * interpolation,
          y: pathStart.y + (pathEnd.y - pathStart.y) * interpolation,
        });
      }
      if (visiblePath.length > 1 && p < ACT_FIVE_START) {
        context.save();
        context.strokeStyle = getComputedStyle(stageElement).getPropertyValue("--volt").trim();
        context.globalAlpha = trailAlpha;
        context.lineWidth = Math.max(2, Math.min(canvasElement.width, canvasElement.height) * 0.006);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        const canvasPath = visiblePath.map((point) => ({ x: left + point.x * width, y: top + point.y * height }));
        context.moveTo(canvasPath[0].x, canvasPath[0].y);
        for (let index = 1; index < canvasPath.length - 1; index += 1) {
          const point = canvasPath[index];
          const next = canvasPath[index + 1];
          context.quadraticCurveTo(point.x, point.y, (point.x + next.x) / 2, (point.y + next.y) / 2);
        }
        context.lineTo(canvasPath.at(-1)!.x, canvasPath.at(-1)!.y);
        context.stroke();
        context.restore();
      }

      if (actFive.showActFour && bitmap && sourceFrame !== undefined) {
        context.save();
        context.drawImage(bitmap, left, top, width, height);
        context.restore();
        lastUsed.set(sourceFrame, ++useCounter);
      }

      const lastPoint = path.at(-1) ?? { x: 0.5, y: 0.5 };
      const originX = left + lastPoint.x * width;
      const originY = top + lastPoint.y * height;
      const volt = getComputedStyle(stageElement).getPropertyValue("--volt").trim();
      if (actFive.active && actFive.fieldAlpha > 0) {
        const fullRadius = Math.max(
          Math.hypot(originX, originY),
          Math.hypot(canvasElement.width - originX, originY),
          Math.hypot(originX, canvasElement.height - originY),
          Math.hypot(canvasElement.width - originX, canvasElement.height - originY),
        );
        context.save();
        context.fillStyle = volt;
        context.globalAlpha = actFive.fieldAlpha;
        context.beginPath();
        context.arc(originX, originY, fullRadius * actFive.circleProgress, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }

      if (actFive.active && actFive.q >= ACT_FIVE_PHASES.holdEnd) {
        const dpr = canvasElement.width / Math.max(1, stageElement.getBoundingClientRect().width);
        const startRadius = Math.min(canvasElement.width, canvasElement.height) * 0.06;
        const endRadius = 7 * dpr;
        const dotRadius = startRadius + (endRadius - startRadius) * actFive.easedDotProgress;
        context.save();
        context.fillStyle = volt;
        context.beginPath();
        context.arc(originX, originY, dotRadius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      applyVisualState(p, actFive);
      paintedFrame = requestedFrame;
      paintedSourceFrame = canvasSourceFrame ?? -1;
      paintedEffect = effectKey;
      canvasElement.dataset.paintedFrame = String(sourceFrame);
    };

    const queuePaint = () => { if (!raf) raf = requestAnimationFrame(draw); };

    const disposeFrameSet = () => {
      loadVersion += 1;
      if (idleId !== undefined) {
        const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
        cancelIdle(idleId);
        idleId = undefined;
      }
      images.forEach((image) => { image.onload = null; image.onerror = null; image.src = ""; });
      images = [];
      video.current?.pause();
      video.current?.removeAttribute("src");
      video.current?.load();
      pathController?.abort();
      pathController = undefined;
      path = [];
      bitmaps.forEach((bitmap) => bitmap.close());
      bitmaps.clear();
      pending.clear();
      failed.clear();
      initialDecoded.clear();
      lastUsed.clear();
      laterActsActivated = false;
      warnedMissingPath = false;
      delete rootElement.dataset.ready;
      set = null;
      paintedFrame = -1;
      paintedSourceFrame = -1;
    };

    const activateFrames = (start: number, end: number) => {
      if (!set) return;
      for (let index = start; index <= Math.min(end, set.frameCount - 1); index += 1) {
        const image = images[index];
        if (image && !image.src) image.src = set.framePath(index);
      }
    };

    const activateLaterActs = () => {
      if (!set || laterActsActivated) return;
      laterActsActivated = true;
      const firstLaterFrame = ACT_BOUNDARIES.find((act) => act.id === "a3")!.frameStart;
      activateFrames(firstLaterFrame, set.frameCount - 1);
      const idle = window.requestIdleCallback ?? ((callback: IdleRequestCallback) => window.setTimeout(callback, 300));
      idleId = idle(() => warm(STRIKE_FRAME, 3, false));
    };

    const loadSet = (nextSet: FrameSet) => {
      disposeFrameSet();
      set = nextSet;
      loadPath();
      if (video.current) {
        video.current.src = SCRUB_ASSETS.celebration;
      }
      images = Array.from({ length: nextSet.frameCount }, (_, index) => {
        const image = new Image();
        image.decoding = "async";
        image.fetchPriority = "low";
        image.onload = () => {
          if (index <= WINDOW_RADIUS || Math.abs(index - requestedFrame) <= WINDOW_RADIUS) decode(index);
        };
        image.onerror = () => {
          failed.add(index);
          if (index === requestedFrame) {
            warm(requestedFrame);
            queuePaint();
          }
        };
        return image;
      });
      const firstLaterFrame = ACT_BOUNDARIES.find((act) => act.id === "a3")!.frameStart;
      activateFrames(0, firstLaterFrame - 1);
      warm(0);
      requestedFrame = 0;
      queuePaint();
    };

    const renderProgress = (p: number) => {
      currentProgress = clamp(p);
      requestedFrame = frameIndexForProgress(currentProgress);
      canvasElement.dataset.requestedFrame = String(requestedFrame);
      if (currentProgress > CHOREOGRAPHY.laterActsLoadAt) activateLaterActs();
      warm(requestedFrame);
      queuePaint();
    };

    const media = gsap.matchMedia();
    media.add({ reduce: "(prefers-reduced-motion: reduce)", portrait: "(max-width: 767px)", landscape: "(min-width: 768px)" }, (conditions) => {
      if (conditions.conditions?.reduce) {
        rootElement.dataset.motion = "reduced";
        return;
      }
      rootElement.dataset.motion = "scrub";
      loadSet(conditions.conditions?.portrait ? PORTRAIT_SET : LANDSCAPE_SET);
      resizeObserver = new ResizeObserver(() => queuePaint());
      resizeObserver.observe(stageElement);
      const progress = { value: 0 };
      gsap.to(progress, {
        value: 1,
        ease: "none",
        scrollTrigger: {
          trigger: rootElement,
          start: "top top",
          end: () => `+=${Math.max(1, rootElement.offsetHeight - stageElement.offsetHeight)}`,
          pin: stageElement,
          pinSpacing: false,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => renderProgress(progress.value),
      });
      return () => {
        resizeObserver?.disconnect();
        vitalsElement?.style.removeProperty("--vitals-release");
        disposeFrameSet();
      };
    });

    return () => {
      active = false;
      pathController?.abort();
      media.revert();
      if (raf) cancelAnimationFrame(raf);
      resizeObserver?.disconnect();
      disposeFrameSet();
    };
  }, { scope: root });

  return (
    <section
      id="scrub"
      className="scrub-shell"
      ref={root}
      aria-hidden="true"
      style={{ "--scrub-length": scrollLength } as CSSProperties}
    >
      <div className="scrub-stage" ref={stage}>
        <div className="scrub-background" aria-hidden="true" />
        <video ref={video} className="scrub-celebration" muted loop playsInline preload="metadata" aria-hidden="true" />
        <canvas ref={canvas} className="scrub-canvas" aria-hidden="true" />
        <img className="scrub-poster" src={SCRUB_ASSETS.poster} alt="" />
        <div className="scrub-loader" aria-hidden="true"><span>Preparing sequence</span></div>
        <div className="scrub-telemetry" aria-hidden="true"><span>GENERATED STAND-IN</span><p ref={status}>Approach · 0%</p></div>
        <div className="scrub-title-card" ref={title} aria-hidden="true"><p>JACOB DEJA</p><span>CAM / CDM · CLASS OF 2027</span></div>
      </div>
    </section>
  );
}
