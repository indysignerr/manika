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
    let visible = false;
    let raf = 0;

    const setVisible = (v: boolean) => {
      visible = v;
      const op = v ? "1" : "0";
      if (ring.current) ring.current.style.opacity = op;
      if (dot.current) dot.current.style.opacity = op;
    };

    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        // Première apparition : on téléporte l'anneau pour éviter la traînée depuis (-100,-100)
        rx = x;
        ry = y;
        setVisible(true);
      }
      const el = e.target as HTMLElement;
      const interactive = el.closest?.("a,button,[data-cursor]");
      const field = el.closest?.("input,textarea,select,label");
      target = field ? 0 : interactive ? 2.1 : 1;
      if (dot.current)
        dot.current.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0) scale(${field ? 0 : 1})`;
    };

    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    const loop = () => {
      rx += (x - rx) * 0.3;
      ry += (y - ry) * 0.3;
      sc += (target - sc) * 0.28;
      if (ring.current)
        ring.current.style.transform = `translate3d(${rx - 16}px, ${ry - 16}px, 0) scale(${sc.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", move, { passive: true });
    document.documentElement.addEventListener("mouseleave", leave);
    document.documentElement.addEventListener("mouseenter", enter);
    raf = requestAnimationFrame(loop);

    return () => {
      document.body.classList.remove("custom-cursor");
      window.removeEventListener("mousemove", move);
      document.documentElement.removeEventListener("mouseleave", leave);
      document.documentElement.removeEventListener("mouseenter", enter);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hidden md:block" aria-hidden="true">
      <div
        ref={ring}
        className="pointer-events-none fixed left-0 top-0 z-[120] h-8 w-8 rounded-full border border-copper/50 opacity-0 transition-opacity duration-200 will-change-transform"
      />
      <div
        ref={dot}
        className="pointer-events-none fixed left-0 top-0 z-[120] h-1.5 w-1.5 rounded-full bg-copper opacity-0 transition-opacity duration-200 will-change-transform"
      />
    </div>
  );
}
