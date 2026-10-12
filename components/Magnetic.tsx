"use client";
import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

export default function Magnetic({ children, href, className = "" }: { children: React.ReactNode; href: string; className?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el || prefersReduced() || !matchMedia("(pointer: fine)").matches) return;
    const inner = el.querySelector(".mag-inner");
    const xt = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1,0.4)" }), yt = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1,0.4)" });
    const xi = gsap.quickTo(inner, "x", { duration: 0.6, ease: "power3" }), yi = gsap.quickTo(inner, "y", { duration: 0.6, ease: "power3" });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(); const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      xt(dx * 0.35); yt(dy * 0.35); xi(dx * 0.15); yi(dy * 0.15);
    };
    const leave = () => { xt(0); yt(0); xi(0); yi(0); };
    el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    return () => { el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); };
  }, []);
  return (
    <a ref={ref} href={href} className={`magnetic ${className}`}>
      <span className="mag-fill" aria-hidden />
      <span className="mag-inner">{children}<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg></span>
    </a>
  );
}
