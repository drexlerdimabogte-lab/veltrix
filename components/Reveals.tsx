"use client";
import { useEffect } from "react";
import { gsap, ScrollTrigger, prefersReduced, EASE, DUR, STAGGER } from "@/lib/motion";

const BG: Record<string, string> = { ink: "#070707", paper: "#11100e" };

/** Attribute-driven motion: [data-mask] lines, [data-reveal], [data-clipreveal], [data-parallax], [data-bg] section colour shifts. */
export default function Reveals() {
  useEffect(() => {
    const reduced = prefersReduced();
    const ctx = gsap.context(() => {
      // Section colour transitions (instant under reduced motion)
      gsap.utils.toArray<HTMLElement>("[data-bg]").forEach((sec) => {
        const c = BG[sec.dataset.bg ?? "ink"] ?? BG.ink;
        ScrollTrigger.create({ trigger: sec, start: "top 55%", end: "bottom 55%",
          onToggle: (st) => { if (st.isActive) gsap.to(document.body, { backgroundColor: c, duration: reduced ? 0 : DUR.md, ease: EASE.soft, overwrite: true }); } });
      });
      if (reduced) { gsap.set("[data-reveal], .mask-line > span, [data-clipreveal]", { clearProps: "all" }); return; }

      gsap.utils.toArray<HTMLElement>("[data-mask]").forEach((el) => {
        gsap.from(el.querySelectorAll(".mask-line > span"), { yPercent: 112, duration: DUR.lg, ease: EASE.out, stagger: STAGGER.lines,
          scrollTrigger: { trigger: el, start: "top 85%" } });
      });
      gsap.utils.toArray<HTMLElement>(".eyebrow").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: DUR.md, ease: EASE.out, scrollTrigger: { trigger: el, start: "top 90%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 28, opacity: 0, duration: DUR.md, ease: EASE.soft, scrollTrigger: { trigger: el, start: "top 90%" } });
      });
      gsap.utils.toArray<HTMLElement>("[data-clipreveal]").forEach((el) => {
        gsap.fromTo(el, { clipPath: "inset(30% 0% 30% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none",
          scrollTrigger: { trigger: el, start: "top 95%", end: "top 30%", scrub: 0.4 } });
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(el, { yPercent: -Number(el.dataset.parallax) }, { yPercent: Number(el.dataset.parallax), ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
      });
    });
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => { clearTimeout(t); ctx.revert(); };
  }, []);
  return null;
}
