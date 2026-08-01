"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function PromoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) v.play().catch(() => {});
  };

  return (
    <section className="bg-ivory-2 py-24 md:py-32">
      <div className="container-luxe">
        <Reveal className="text-center">
          <p className="kicker">En mouvement</p>
          <h2 className="heading mt-3 text-3xl md:text-4xl">Le film MANIKA.LAB</h2>
          <span className="mx-auto mt-6 block h-px w-10 bg-bronze" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-[4px] shadow-[0_30px_60px_rgba(107,66,48,0.18)]">
            <video
              ref={ref}
              className="aspect-video w-full object-cover"
              poster="/images/promo-poster.jpg"
              autoPlay={!reduced}
              muted
              loop
              playsInline
              preload="metadata"
              controls={reduced}
            >
              <source src="/videos/promo.mp4" type="video/mp4" />
            </video>

            {!reduced && (
              <button
                onClick={toggleSound}
                aria-label={muted ? "Activer le son" : "Couper le son"}
                className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full bg-copper-deep/70 text-ivory backdrop-blur-sm transition-colors hover:bg-copper-deep"
                data-cursor
              >
                {muted ? <VolumeX size={17} strokeWidth={1.5} /> : <Volume2 size={17} strokeWidth={1.5} />}
              </button>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
