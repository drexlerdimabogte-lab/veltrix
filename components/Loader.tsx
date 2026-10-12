"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";
import { useClientSnapshot } from "@/lib/useClientSnapshot";

/** First-load curtain. Plays once per session; skipped entirely with reduced motion. */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  // Skip on reduced motion or when the intro already played this session.
  const skip = useClientSnapshot(() => prefersReduced() || sessionStorage.getItem("vx-intro") !== null, false);
  useEffect(() => {
    if (skip) return;
    document.documentElement.classList.add("is-loading");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ onComplete: () => { sessionStorage.setItem("vx-intro", "1"); document.documentElement.classList.remove("is-loading"); setDone(true); } });
      tl.from(".ld-word span", { yPercent: 110, duration: 0.9, ease: "expo.out", stagger: 0.04 })
        .fromTo(".ld-bar i", { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 0.1)
        .to(".ld-word span", { yPercent: -110, duration: 0.6, ease: "expo.in", stagger: 0.02 }, 0.95)
        .to(".ld-bar", { opacity: 0, duration: 0.3 }, 1)
        .to(".ld-panel", { yPercent: -100, duration: 1, ease: "expo.inOut", stagger: 0.07 }, 1.15);
    }, root);
    return () => { ctx.revert(); document.documentElement.classList.remove("is-loading"); };
  }, [skip]);
  if (done || skip) return null;
  return (
    <div ref={root} className="loader" aria-hidden>
      <span className="ld-panel p2" /><span className="ld-panel p1" />
      <div className="ld-center">
        <div className="ld-word">{"VELTRIX".split("").map((c, i) => <span key={i}>{c}</span>)}</div>
        <div className="ld-bar"><i /></div>
      </div>
    </div>
  );
}
