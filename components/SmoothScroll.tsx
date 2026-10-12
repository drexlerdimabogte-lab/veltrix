"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/motion";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (prefersReduced()) return;
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
