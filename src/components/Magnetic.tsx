"use client";

import { ReactNode, useRef } from "react";

export default function Magnetic({
  children,
  strength = 0.28,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const zone = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = zone.current!.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const mx = Math.max(-18, Math.min(18, dx * strength));
    const my = Math.max(-14, Math.min(14, dy * strength));
    inner.current!.style.transform = `translate(${mx.toFixed(1)}px, ${my.toFixed(1)}px)`;
  };

  const reset = () => {
    if (inner.current) inner.current.style.transform = "";
  };

  return (
    <div ref={zone} onMouseMove={onMove} onMouseLeave={reset} className={`inline-block p-3 -m-3 ${className}`}>
      <div ref={inner} className="transition-transform duration-200 ease-out will-change-transform">
        {children}
      </div>
    </div>
  );
}
