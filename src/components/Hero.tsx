"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ShoppingBag } from "lucide-react";
import { bySlug, fmt } from "@/lib/products";
import { useCart } from "@/components/cart-context";
import Magnetic from "@/components/Magnetic";

const Split = ({ text }: { text: string }) => (
  <span className="inline-block overflow-hidden pb-1 align-bottom">
    {text.split("").map((c, i) => (
      <span key={i} className="char inline-block will-change-transform">
        {c === " " ? " " : c}
      </span>
    ))}
  </span>
);

const DUST = [
  { left: "58%", top: "60%", size: 4, dur: "5s", delay: "0s", color: "#8A5F2A" },
  { left: "66%", top: "46%", size: 3, dur: "6.4s", delay: "1.2s", color: "#B68D78" },
  { left: "74%", top: "68%", size: 5, dur: "5.6s", delay: "2.1s", color: "#C89678" },
  { left: "82%", top: "52%", size: 3, dur: "7s", delay: "0.6s", color: "#8A5F2A" },
  { left: "62%", top: "78%", size: 4, dur: "6s", delay: "3s", color: "#B68D78" },
  { left: "88%", top: "72%", size: 4, dur: "5.2s", delay: "1.7s", color: "#C89678" },
  { left: "70%", top: "34%", size: 3, dur: "6.8s", delay: "2.6s", color: "#B68D78" },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [videoOn, setVideoOn] = useState(false);
  const { add } = useCart();
  const featured = bySlug("coloration-bio-vegan")!;
  const featuredSize = featured.sizes.find((s) => s.delta === 0) ?? featured.sizes[0];
  const addFeatured = () => add(featured.slug, featuredSize.label, featured.price + featuredSize.delta);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduced) setVideoOn(true);
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(".char, .hero-fade", { opacity: 1, yPercent: 0, y: 0 });
        return;
      }

      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        ".char",
        { yPercent: 120 },
        { yPercent: 0, stagger: 0.035, duration: 1.1, ease: "power4.out" }
      )
        .fromTo(
          ".hero-fade",
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.9, ease: "power3.out" },
          "-=0.7"
        )
        .fromTo(
          ".hero-bottle",
          { y: 60, opacity: 0, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 1.3, ease: "power3.out" },
          "-=1.1"
        );

      const play = () => tl.play();
      window.addEventListener("manika:ready", play, { once: true });
      const fallback = setTimeout(play, 2900);

      // Parallaxe de sortie au scroll
      gsap.to(".hero-inner", {
        yPercent: -12,
        opacity: 0.4,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      // Parallaxe souris par couches
      const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
      const setters = layers.map((el) => ({
        x: gsap.quickTo(el, "x", { duration: 0.4, ease: "power2.out" }),
        y: gsap.quickTo(el, "y", { duration: 0.4, ease: "power2.out" }),
        depth: parseFloat(el.dataset.depth || "0.5"),
      }));
      const onMove = (e: MouseEvent) => {
        const r = root.current!.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setters.forEach((s) => {
          s.x(-x * s.depth * 42);
          s.y(-y * s.depth * 42);
        });
      };
      root.current!.addEventListener("mousemove", onMove);

      return () => {
        clearTimeout(fallback);
        window.removeEventListener("manika:ready", play);
        root.current?.removeEventListener("mousemove", onMove);
      };
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-28"
      aria-label="MANIKA.LAB — L'expertise capillaire professionnelle"
    >
      {/* Film de marque en fond (généré via Higgsfield — Veo 3.1) */}
      {videoOn && (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/images/hero-poster.jpg"
            className="h-full w-full object-cover opacity-[0.5]"
          >
            <source src="/videos/hero-manika.mp4" type="video/mp4" />
          </video>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(245,243,239,0.94) 0%, rgba(245,243,239,0.72) 42%, rgba(245,243,239,0.35) 100%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-ivory" />
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-t from-transparent to-ivory" />
        </div>
      )}

      {/* Halo atmosphérique */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(52% 60% at 72% 42%, rgba(200,150,120,0.16) 0%, rgba(245,243,239,0) 70%), radial-gradient(40% 44% at 18% 78%, rgba(138,95,42,0.08) 0%, rgba(245,243,239,0) 70%)",
        }}
      />

      {/* Filigrane monogramme M·L */}
      <div data-depth="0.3" className="pointer-events-none absolute -right-16 top-10 w-[380px] opacity-[0.05] md:w-[460px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-mark.png" alt="" />
      </div>

      {/* Particules d'or */}
      {DUST.map((d, i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            background: d.color,
            animationDuration: d.dur,
            animationDelay: d.delay,
          }}
        />
      ))}

      <div className="hero-inner container-luxe relative grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div data-depth="0.5">
          <p className="hero-fade kicker mb-6 opacity-0">Cosmétique capillaire professionnelle</p>
          <h1 className="heading text-[13vw] leading-[1.04] md:text-7xl">
            <Split text="L'EXPERTISE" />
            <br />
            <Split text="DU SALON" />
          </h1>
          <p className="hero-fade mt-4 font-serif text-2xl italic text-bronze opacity-0 md:text-3xl">
            chez vous
          </p>
          <p className="hero-fade mt-6 max-w-sm text-[14px] font-light leading-relaxed text-ink/80 opacity-0">
            Coloration vegan, soins reconstructeurs à la kératine, coiffage de précision.
            La gamme professionnelle MANIKA.LAB, formulée en Italie.
          </p>
          <div className="hero-fade mt-9 flex flex-wrap items-center gap-4 opacity-0">
            <Magnetic>
              <Link href="/boutique/" className="btn-primary" data-cursor>
                Découvrir
              </Link>
            </Magnetic>
            <Link href="/rituels/" className="btn-ghost" data-cursor>
              Le protocole
            </Link>
          </div>
        </div>

        <div data-depth="0.9" className="hero-bottle relative mx-auto flex flex-col items-center opacity-0">
          <div className="floaty">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/products/coloration-cutout.png"
              alt={featured.name}
              className="h-[42svh] max-h-[460px] w-auto object-contain drop-shadow-[0_28px_42px_rgba(107,66,48,0.3)] md:h-[56svh]"
            />
          </div>
          <p className="mt-7 text-[10px] uppercase tracking-wide3 text-taupe-deep">
            {featured.name} · {featured.tagline}
          </p>
          <Magnetic>
            <button onClick={addFeatured} className="btn-primary mt-3" data-cursor>
              <ShoppingBag size={14} strokeWidth={1.5} />
              Ajout rapide — {fmt(featured.price)}
            </button>
          </Magnetic>
        </div>
      </div>

      <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex">
        <span className="text-[9px] uppercase tracking-wide3 text-taupe-deep">Défiler</span>
        <span className="h-10 w-px animate-pulse bg-copper/50" />
      </div>
    </section>
  );
}
