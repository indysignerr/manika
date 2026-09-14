"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Preloader() {
  const [progress, setProgress] = useState(0);
  const [gone, setGone] = useState(false);
  const [fast, setFast] = useState(false);

  useEffect(() => {
    /**
     * Un salon connecté vient réassortir, pas admirer une intro : on lui rend
     * la main tout de suite. Le cookie `manika_role` est posé par la passerelle
     * (functions/_lib/roles.js) et lisible ici — il n'est pas httpOnly.
     */
    const estPro = document.cookie.includes("manika_role=pro");

    // Déjà vu dans cette session : on ne rejoue pas l'intro à chaque retour à l'accueil
    if (estPro || sessionStorage.getItem("mk-preloaded") === "1") {
      setFast(true);
      setGone(true);
      window.dispatchEvent(new Event("manika:ready"));
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 1100 ms suffisent à poser la marque. Au-delà, on fait attendre un
    // professionnel qui a une cliente sous la main.
    const DURATION = reduced ? 10 : 1100;
    const start = performance.now();
    let raf = 0;

    const tick = (t: number) => {
      const p = Math.min(100, Math.round(((t - start) / DURATION) * 100));
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          sessionStorage.setItem("mk-preloaded", "1");
          setGone(true);
          document.documentElement.style.overflow = "";
          window.dispatchEvent(new Event("manika:ready"));
        }, reduced ? 0 : 200);
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
          transition={{ duration: fast ? 0 : 0.65, ease: [0.76, 0, 0.24, 1] }}
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
          <div className="absolute bottom-8 left-8 text-[11px] tracking-wide2 text-bronze">{progress} %</div>
          <div className="absolute bottom-8 right-8 text-[10px] uppercase tracking-wide3 text-taupe-deep">
            Professional hair care
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
