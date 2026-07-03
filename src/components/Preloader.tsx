"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DURATION = reduced ? 10 : 1900;
    const start = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / DURATION) * 100));
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          setGone(true);
          document.documentElement.style.overflow = "";
          window.dispatchEvent(new Event("manika:ready"));
        }, reduced ? 0 : 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ivory"
          aria-hidden="true"
        >
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/wordmark.png" alt="" className="w-64 opacity-15 md:w-80" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/wordmark.png"
              alt=""
              className="absolute inset-0 w-64 md:w-80"
              style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
            />
            <div className="mt-8 h-px w-full bg-ivory-3">
              <div className="h-px bg-bronze transition-all duration-150" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="absolute bottom-8 left-8 text-[11px] tracking-wide2 text-rose">{progress} %</div>
          <div className="absolute bottom-8 right-8 text-[10px] uppercase tracking-wide3 text-taupe">
            Récolte d&apos;automne
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
