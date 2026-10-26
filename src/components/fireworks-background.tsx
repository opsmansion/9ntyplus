"use client";

import { useEffect, useRef, type ReactNode } from "react";

// Adapted from the Bundui "Fireworks" background. Changes from the original: the canvas stays
// transparent so the page background shows through, drawing is sharp on high-density screens,
// the animation pauses in hidden tabs, reduced motion shows a still picture, and a click on
// empty space launches a rocket toward the pointer.

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
    let fireworks: Firework[] = [];
    let lastLaunch = 0;
    let frame = 0;
    let running = false;

    const pick = () => colors[Math.floor(Math.random() * colors.length)];

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
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
      const count = 60 + Math.floor(Math.random() * 40);
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

    function draw() {
      if (!running) return;
      const c = ctx!;

      // Fade earlier frames toward transparent (not black), which leaves short trails.
      c.globalCompositeOperation = "destination-out";
      c.fillStyle = "rgba(0, 0, 0, 0.1)";
      c.fillRect(0, 0, width, height);
      c.globalCompositeOperation = "source-over";

      fireworks = fireworks.filter((firework) => {
        if (!firework.exploded) {
          firework.x += firework.vx;
          firework.y += firework.vy;
          firework.vy += 0.1;
          c.beginPath();
          c.arc(firework.x, firework.y, 3, 0, Math.PI * 2);
          c.fillStyle = firework.color;
          c.fill();
          if (firework.y <= firework.targetY || firework.vy >= 0 || firework.x < 0 || firework.x > width) {
            if (firework.y > 0 && firework.y < height) explode(firework);
            firework.exploded = true;
          }
          return true;
        }

        firework.particles = firework.particles.filter((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
          p.alpha -= 1 / p.lifetime;
          if (p.alpha <= 0.1) return false;
          c.globalAlpha = p.alpha;
          c.beginPath();
          c.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          c.fillStyle = firework.color;
          c.fill();
          c.globalAlpha = 1;
          return true;
        });
        return firework.particles.length > 0;
      });

      const now = Date.now();
      if (now - lastLaunch > 1000 + Math.random() * 2000) {
        const count = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < count; i++) launch();
        lastLaunch = now;
      }
      frame = requestAnimationFrame(draw);
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
      lastLaunch = Date.now();
      frame = requestAnimationFrame(draw);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

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
    start();
    canvas.addEventListener("click", onClick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    reduced.addEventListener("change", onMotionChange);

    return () => {
      stop();
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
