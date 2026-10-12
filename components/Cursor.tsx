"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-cursor");
    const xd = gsap.quickTo(dot.current, "x", { duration: 0.08 }), yd = gsap.quickTo(dot.current, "y", { duration: 0.08 });
    const xr = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" }), yr = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });
    const move = (e: PointerEvent) => { document.documentElement.classList.add("cursor-moved"); xd(e.clientX); yd(e.clientY); xr(e.clientX); yr(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as HTMLElement).closest("a,button,[data-cursor]");
      ring.current?.classList.toggle("is-active", !!t);
      const label = t?.getAttribute("data-cursor") ?? "";
      if (ring.current) ring.current.dataset.label = label;
      ring.current?.classList.toggle("has-label", !!label);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerover", over);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerover", over); };
  }, []);
  return (<><div ref={ring} className="cursor-ring" aria-hidden /><div ref={dot} className="cursor-dot" aria-hidden /></>);
}
