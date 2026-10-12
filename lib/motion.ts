"use client";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);
export { gsap, ScrollTrigger };
export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Motion tokens — keep all timing consistent across the site. */
export const EASE = { out: "expo.out", soft: "power4.out", inOut: "expo.inOut", none: "none" } as const;
export const DUR = { xs: 0.4, sm: 0.7, md: 1.1, lg: 1.5 } as const;
export const STAGGER = { chars: 0.018, lines: 0.09, items: 0.06 } as const;
