"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.body.classList.add("custom-cursor");
    let x = -100, y = -100, rx = -100, ry = -100, sc = 1, target = 1;
    let raf = 0;

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as HTMLElement).closest?.("a,button,[data-cursor]");
      target = t ? 2.1 : 1;
      if (dot.current) dot.current.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
    };

    const loop = () => {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      sc += (target - sc) * 0.18;
      if (ring.current)
        ring.current.style.transform = `translate(${rx - 16}px, ${ry - 16}px) scale(${sc.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hidden md:block" aria-hidden="true">
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-8 w-8 rounded-full border border-copper/50 will-change-transform"
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full bg-copper will-change-transform"
      />
    </div>
  );
}
