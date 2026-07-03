"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Corrige la navigation par ancres sur la page d'accueil.
 * Les sections épinglées (ScrollTrigger pin) ajoutent leur hauteur APRÈS le
 * premier rendu : un hash présent à l'arrivée pointe donc vers une position
 * périmée. On re-mesure et on re-saute une fois les pins en place.
 */
export default function ScrollManager() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const jumpToHash = () => {
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash) {
        try {
          document.querySelector(hash)?.scrollIntoView();
        } catch {
          /* hash invalide — on ignore */
        }
      }
    };

    // Après le préloader (les pins sont montés et la page est mesurable)
    window.addEventListener("manika:ready", jumpToHash, { once: true });
    // Après chargement complet (polices, vidéo) : les mesures bougent encore un peu
    const onLoad = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") {
      requestAnimationFrame(jumpToHash);
    } else {
      window.addEventListener("load", onLoad, { once: true });
    }
    // Filet de sécurité si l'évènement est passé avant le montage
    const fallback = setTimeout(jumpToHash, 3400);

    return () => {
      window.removeEventListener("manika:ready", jumpToHash);
      window.removeEventListener("load", onLoad);
      clearTimeout(fallback);
    };
  }, []);

  return null;
}
