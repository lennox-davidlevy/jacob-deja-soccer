import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type CSSProperties } from "react";
import {
  ACT_BOUNDARIES,
  ACT_FIVE_START,
  ACT_TRANSITIONS,
  CHOREOGRAPHY,
  LANDSCAPE_SET,
  PORTRAIT_SET,
  SCRUB_ASSETS,
  frameIndexForProgress,
  type FrameSet,
} from "../lib/frames";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface BallPoint { frame: number; x: number; y: number }

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

  useGSAP(() => {
    const rootElement = root.current;
    const canvasElement = canvas.current;
    const stageElement = stage.current;
    if (!rootElement || !canvasElement || !stageElement) return;

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

    const loadPath = () => {
      pathController = new AbortController();
      fetch(SCRUB_ASSETS.ballPath, { signal: pathController.signal })
        .then((response) => response.ok ? response.json() as Promise<unknown> : Promise.reject())
        .then((data) => {
          if (!active || !data || typeof data !== "object" || !("points" in data) || !Array.isArray(data.points)) return;
          path = data.points.filter((point): point is BallPoint =>
            typeof point === "object" && point !== null &&
            typeof (point as BallPoint).frame === "number" &&
            typeof (point as BallPoint).x === "number" &&
            typeof (point as BallPoint).y === "number",
          );
          paintedEffect = "";
          queuePaint();
        }).catch(() => undefined);
    };

    const updateBackground = (p: number) => {
      stageElement.style.setProperty("--approach-darkness", String(0.38 * clamp(p / 0.6)));
      stageElement.style.setProperty("--strike-bloom", String(bell(p, CHOREOGRAPHY.strikeAt, CHOREOGRAPHY.strikeWidth)));
      stageElement.style.setProperty("--title-opacity", String(range(p, CHOREOGRAPHY.titleStart, CHOREOGRAPHY.titleEnd)));
      stageElement.style.setProperty("--video-opacity", String(range(p, ACT_FIVE_START, CHOREOGRAPHY.videoEnd) * 0.52));
      const transitionFade = Math.max(...ACT_TRANSITIONS.map((point) => bell(p, point, CHOREOGRAPHY.transitionWidth)), 0);
      stageElement.style.setProperty("--canvas-opacity", String(1 - transitionFade));
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
      const cut = range(p, CHOREOGRAPHY.matchCutStart, CHOREOGRAPHY.matchCutEnd);
      const cutFade = range(p, CHOREOGRAPHY.matchCutEnd, CHOREOGRAPHY.matchCutFadeEnd);
      const cutStep = cut > 0 && cut < 1 ? cut : cut === 1 && cutFade < 1 ? 1 + cutFade : 0;
      const effectKey = `${Math.round(cutStep * 120)}:${canvasElement.width}x${canvasElement.height}`;
      const sourceFrame = bitmaps.has(requestedFrame)
        ? requestedFrame
        : [...bitmaps.keys()].sort((a, b) => Math.abs(a - requestedFrame) - Math.abs(b - requestedFrame))[0];
      const bitmap = sourceFrame === undefined ? undefined : bitmaps.get(sourceFrame);
      if (paintedFrame === requestedFrame && paintedSourceFrame === sourceFrame && paintedEffect === effectKey) return;
      if (!bitmap || sourceFrame === undefined) return;
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
        context.globalAlpha = (0.18 + 0.42 * clamp((p - 0.1) / 0.55)) *
          (1 - range(p, CHOREOGRAPHY.videoStart, CHOREOGRAPHY.matchCutEnd));
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

      context.save();
      context.globalAlpha = 1 - range(p, CHOREOGRAPHY.videoStart, CHOREOGRAPHY.matchCutEnd);
      context.drawImage(bitmap, left, top, width, height);
      context.restore();
      lastUsed.set(sourceFrame, ++useCounter);

      if (cut > 0) {
        const lastPoint = path.at(-1) ?? { x: 0.5, y: 0.5 };
        const radius = Math.hypot(canvasElement.width, canvasElement.height) * cut;
        context.save();
        context.fillStyle = getComputedStyle(stageElement).getPropertyValue("--volt").trim();
        context.globalAlpha = (0.22 + cut * 0.78) * (1 - cutFade);
        context.beginPath();
        context.arc(left + lastPoint.x * width, top + lastPoint.y * height, radius, 0, Math.PI * 2);
        context.fill();
        context.restore();
      }
      paintedFrame = requestedFrame;
      paintedSourceFrame = sourceFrame;
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
      updateBackground(0);
      queuePaint();
    };

    const renderProgress = (p: number) => {
      currentProgress = clamp(p);
      requestedFrame = frameIndexForProgress(currentProgress);
      canvasElement.dataset.requestedFrame = String(requestedFrame);
      if (currentProgress > CHOREOGRAPHY.laterActsLoadAt) activateLaterActs();
      if (video.current) {
        if (currentProgress >= CHOREOGRAPHY.videoStart) void video.current.play().catch(() => undefined);
        else video.current.pause();
      }
      warm(requestedFrame);
      updateBackground(currentProgress);
      if (status.current) status.current.textContent = `${actFor(currentProgress)} · ${Math.round(currentProgress * 100)}%`;
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
        <div className="scrub-title-card" aria-hidden="true"><i /><p>JACOB DEJA</p><span>CAM / CDM · CLASS OF 2027</span></div>
      </div>
    </section>
  );
}
