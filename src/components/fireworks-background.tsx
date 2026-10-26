"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Adapted from the Bundui "Fireworks" background. Changes from the original:
// - Motion is time-based, so rockets keep the same speed at 30, 60 or 120 frames per second
//   (iPhones run at 120 Hz with ProMotion and drop to 30 in Low Power Mode).
// - Sparks are drawn in batches (one fill per colour and brightness step) instead of one fill each,
//   and smaller screens get fewer sparks.
// - The canvas stays transparent, is sharp on high-density screens, pauses in hidden tabs,
//   starts after the page has loaded, and shows a still picture for reduced motion.
// - A click on empty space launches a rocket toward the pointer.

type Particle = { x: number; y: number; vx: number; vy: number; alpha: number; lifetime: number; size: number };
type Firework = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  targetY: number;
  exploded: boolean;
  particles: Particle[];
};

const DEFAULT_COLORS = ["#9b87f5", "#D946EF", "#F97316", "#0EA5E9", "#ea384c", "#10B981", "#FCD34D"];
const FRAME_MS = 1000 / 60; // Speeds below are per 60 fps frame, as in the original.
const MAX_STEP = 3; // Cap catch-up after a stall so sparks never jump across the screen.
const ALPHA_STEPS = 4; // Brightness levels used to batch sparks into a few fills.

export function FireworksBackground({
  children,
  className,
  colors = DEFAULT_COLORS,
}: {
  children?: ReactNode;
  className?: string;
  colors?: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let sparkScale = 1;
    let fireworks: Firework[] = [];
    let lastLaunch = 0;
    let lastFrame = 0;
    let frame = 0;
    let running = false;
    let startTimer = 0;

    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // A phone screen gets about half the sparks of a laptop screen.
      sparkScale = Math.min(1, Math.max(0.5, (width * height) / (1280 * 800)));
      if (reduced.matches) drawStill();
    }

    function launch(x?: number, targetY?: number) {
      const angle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
      const speed = 6 + Math.random() * 4;
      fireworks.push({
        x: x ?? Math.random() * width,
        y: height,
        vx: Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed * 1.5,
        color: pick(),
        targetY: targetY ?? height * (0.1 + Math.random() * 0.4),
        exploded: false,
        particles: [],
      });
    }

    function explode(firework: Firework) {
      const count = Math.round((60 + Math.random() * 40) * sparkScale);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1;
        firework.particles.push({
          x: firework.x,
          y: firework.y,
          vx: Math.cos(angle) * speed * (0.5 + Math.random()),
          vy: Math.sin(angle) * speed * (0.5 + Math.random()),
          alpha: 1,
          lifetime: Math.random() * 30 + 30,
          size: Math.random() * 3 + 1,
        });
      }
    }

    function draw(now: number) {
      if (!running) return;
      frame = requestAnimationFrame(draw);
      const step = Math.min((now - lastFrame) / FRAME_MS, MAX_STEP);
      lastFrame = now;
      const c = ctx!;

      // Fade earlier frames toward transparent, leaving short trails. The fade is scaled by
      // elapsed time so trails are the same length at any frame rate.
      c.globalCompositeOperation = "destination-out";
      c.fillStyle = `rgba(0, 0, 0, ${1 - Math.pow(0.9, step)})`;
      c.fillRect(0, 0, width, height);
      c.globalCompositeOperation = "source-over";

      const batches = new Map<string, Particle[]>();

      fireworks = fireworks.filter((firework) => {
        if (!firework.exploded) {
          firework.x += firework.vx * step;
          firework.y += firework.vy * step;
          firework.vy += 0.1 * step;
          c.fillStyle = firework.color;
          c.beginPath();
          c.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          c.fill();
          if (firework.y <= firework.targetY || firework.vy >= 0 || firework.x < 0 || firework.x > width) {
            if (firework.y > 0 && firework.y < height) explode(firework);
            firework.exploded = true;
          }
          return true;
        }

        firework.particles = firework.particles.filter((p) => {
          p.x += p.vx * step;
          p.y += p.vy * step;
          p.vy += 0.05 * step;
          p.alpha -= step / p.lifetime;
          if (p.alpha <= 0.1) return false;
          const key = `${firework.color}|${Math.ceil(p.alpha * ALPHA_STEPS)}`;
          const batch = batches.get(key);
          if (batch) batch.push(p);
          else batches.set(key, [p]);
          return true;
        });
        return firework.particles.length > 0;
      });

      // One path and one fill per colour and brightness step. Small squares look the same as
      // circles at this size and are much cheaper to draw.
      for (const [key, particles] of batches) {
        const [color, level] = key.split("|");
        c.globalAlpha = Number(level) / ALPHA_STEPS;
        c.fillStyle = color;
        c.beginPath();
        for (const p of particles) c.rect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        c.fill();
      }
      c.globalAlpha = 1;

      if (now - lastLaunch > 1000 + Math.random() * 2000) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) launch();
        lastLaunch = now;
      }
    }

    // Reduced motion: a still picture of three bursts, nothing moves.
    function drawStill() {
      const c = ctx!;
      c.clearRect(0, 0, width, height);
      const spots: [number, number, string][] = [
        [0.2, 0.25, colors[0]],
        [0.78, 0.2, colors[colors.length - 1]],
        [0.55, 0.12, colors[Math.min(3, colors.length - 1)]],
      ];
      for (const [fx, fy, color] of spots) {
        c.fillStyle = color;
        for (let i = 0; i < 60; i++) {
          const angle = (Math.PI * 2 * i) / 60;
          const distance = 15 + ((i * 37) % 45);
          c.globalAlpha = 1 - distance / 70;
          c.beginPath();
          c.arc(width * fx + Math.cos(angle) * distance, height * fy + Math.sin(angle) * distance, 2, 0, Math.PI * 2);
          c.fill();
        }
      }
      c.globalAlpha = 1;
    }

    function start() {
      if (running || reduced.matches || document.hidden) return;
      running = true;
      if (fireworks.length === 0) for (let i = 0; i < 3; i++) launch();
      lastFrame = lastLaunch = performance.now();
      frame = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    // Start once the page has finished loading, so the first paint is not competing with the animation.
    const begin = () => {
      startTimer = window.setTimeout(start, 300);
    };

    const onClick = (event: MouseEvent) => {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      launch(event.clientX - rect.left, event.clientY - rect.top);
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onMotionChange = () => {
      stop();
      fireworks = [];
      resize();
      start();
    };

    resize();
    if (document.readyState === "complete") begin();
    else window.addEventListener("load", begin, { once: true });
    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      stop();
      window.clearTimeout(startTimer);
      window.removeEventListener("load", begin);
      canvas.removeEventListener("click", onClick);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      reduced.removeEventListener("change", onMotionChange);
    };
  }, [colors]);

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
      {children}
    </div>
  );
}
