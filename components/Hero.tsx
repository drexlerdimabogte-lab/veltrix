"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { gsap, prefersReduced, EASE, DUR, STAGGER } from "@/lib/motion";
import Magnetic from "./Magnetic";
import { site } from "@/config/site";

const Chars = ({ text, tail }: { text: string; tail?: React.ReactNode }) => (
  <span className="nowrap">{text.split("").map((c, i) => <span key={i} className="char">{c === " " ? "\u00a0" : c}</span>)}{tail}</span>
);

const NeuralCanvas = dynamic(() => import("./NeuralCanvas"), { ssr: false });

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (prefersReduced()) return;
    const ctx = gsap.context(() => {
      const first = !sessionStorage.getItem("vx-intro");
      const tl = gsap.timeline({ defaults: { ease: EASE.out }, delay: first ? 1.5 : 0.15 });
      tl.from(".h-line .char", { yPercent: 118, duration: DUR.lg, stagger: STAGGER.chars })
        .from(".h-rule", { scaleX: 0, duration: DUR.lg, ease: EASE.inOut }, 0.1)
        .from(".h-anno, .h-foot > *", { y: 14, opacity: 0, duration: DUR.md, stagger: STAGGER.items }, 0.5)
        .from(".hero-object", { clipPath: "inset(0 0 0 100%)", duration: 1.8, ease: EASE.inOut }, 0);
      gsap.to(".hero-type", { yPercent: -10, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero-object", { yPercent: 16, scale: 0.92, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" className="hero" ref={root}>
      <div className="hero-object" aria-hidden>
        <NeuralCanvas />
        <span className="h-fig mono">FIG. 00 — NEURAL CORE · HOVER / DRAG</span>
      </div>

      <div className="grid hero-grid">
        <div className="h-anno h-anno-l mono">
          <span>VELTRIX</span>
          <span className="dim">AI Creative Studio</span>
          {site.location && <span className="dim">{site.location}</span>}
        </div>
        <div className="h-anno h-anno-r mono">
          <span>(Index)</span>
          <a href="#capabilities" className="u-link">01 Capabilities</a>
          <a href="#work" className="u-link">02 Work</a>
          <a href="#process" className="u-link">03 Process</a>
          <a href="#lab" className="u-link">04 Lab</a>
        </div>

        <h1 className="hero-type">
          <span className="sr-only">We build digital experiences that think.</span>
          <span className="h-line l1" aria-hidden><Chars text="We build" /></span>
          <span className="h-line l2" aria-hidden><Chars text="digital" /></span>
          <span className="h-line l3 outline" aria-hidden><Chars text="experiences" /></span>
          <span className="h-line l4" aria-hidden><Chars text="that think" tail={<span className="char red">.</span>} /></span>
        </h1>

        <div className="h-rule" aria-hidden />
        <div className="h-foot">
          <p className="lede">AI systems, interactive websites, motion and digital experiences built for ambitious brands.</p>
          <Magnetic href="#work">Explore Our Work</Magnetic>
          <a href="#capabilities" className="scroll-ind mono" aria-label="Scroll to capabilities"><span className="scroll-line" />Scroll</a>
        </div>
      </div>
    </section>
  );
}
