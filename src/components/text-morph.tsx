"use client";

import { useEffect, useId, useRef, useState } from "react";

// Morphing text, adapted from the TextMorphAnimation component. Two stacked copies blur and fade into
// each other, and an SVG threshold filter turns the overlapping blur into a liquid merge. The animation
// writes styles directly to the two spans instead of setting React state every frame. Screen readers and
// reduced-motion visitors get the plain sentence instead.
// The SVG threshold filter is slow in Safari on iPhone, so touch devices get a plain blur crossfade and only
// devices with a mouse or trackpad get the liquid merge.

export function TextMorph({
  texts,
  morphTime = 1.5,
  cooldownTime = 1.2,
  className,
}: {
  texts: string[];
  morphTime?: number;
  cooldownTime?: number;
  className?: string;
}) {
  const filterId = `morph-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [liquid, setLiquid] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setReducedMotion(motion.matches);
      setLiquid(pointer.matches);
    };
    update();
    motion.addEventListener("change", update);
    pointer.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      pointer.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const first = firstRef.current;
    const second = secondRef.current;
    if (reducedMotion || !first || !second || texts.length < 2) return;

    let index = texts.length - 1;
    let morph = 0;
    let cooldown = cooldownTime;
    let last = performance.now();
    let frame = 0;

    const show = (el: HTMLSpanElement, fraction: number) => {
      el.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      el.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    };

    const setMorph = (fraction: number) => {
      show(second, fraction);
      show(first, 1 - fraction);
      first.textContent = texts[index % texts.length];
      second.textContent = texts[(index + 1) % texts.length];
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;
      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }
      setMorph(fraction);
    };

    const doCooldown = () => {
      morph = 0;
      second.style.filter = "";
      second.style.opacity = "100%";
      first.style.filter = "";
      first.style.opacity = "0%";
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const shouldAdvance = cooldown > 0;
      cooldown -= (now - last) / 1000;
      last = now;
      if (cooldown <= 0) {
        if (shouldAdvance) index++;
        doMorph();
      } else {
        doCooldown();
      }
    };

    // Pause in hidden tabs; resetting the clock avoids a jump when the tab comes back.
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [texts, morphTime, cooldownTime, reducedMotion]);

  const spanClass = "absolute inset-x-0 text-center font-extrabold leading-none tracking-tight select-none";

  if (reducedMotion) {
    return (
      <p aria-hidden="true" className={`text-balance text-center font-extrabold leading-tight tracking-tight ${className ?? ""}`}>
        {texts.join(" ")}
      </p>
    );
  }

  return (
    <div aria-hidden="true" className={`relative w-full ${className ?? ""}`} style={{ height: "1.3em" }}>
      {liquid && <svg className="absolute h-0 w-0">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>}
      <div className="absolute inset-0 flex items-center" style={liquid ? { filter: `url(#${filterId}) blur(0.6px)` } : undefined}>
        <span ref={firstRef} className={spanClass} style={{ opacity: 0 }} />
        <span ref={secondRef} className={spanClass}>
          {texts[0]}
        </span>
      </div>
    </div>
  );
}
