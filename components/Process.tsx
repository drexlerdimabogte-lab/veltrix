"use client";
import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

const steps = [
  { t: "Discover", d: "Workshops, audits and data mapping. We find the one idea worth building." },
  { t: "Design", d: "Narrative, interface and motion language — prototyped, not just presented." },
  { t: "Build", d: "Production-grade engineering: performant front-ends, models and infrastructure." },
  { t: "Automate", d: "Agents and pipelines that remove the busywork and keep the system learning." },
  { t: "Launch", d: "Ship, measure, iterate — and keep refining after release." },
];

export default function Process() {
  const root = useRef<HTMLElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 768px)", () => {
        if (prefersReduced()) return;
        root.current?.classList.add("is-pinned");
        const n = steps.length;
        const descs = gsap.utils.toArray<HTMLElement>(".pr-desc");
        gsap.set(descs, { autoAlpha: 0, y: 20 }); gsap.set(descs[0], { autoAlpha: 1, y: 0 });
        // No forced snap: each stage holds a "plateau" in the timeline (HOLD) and scrub smoothing (1s)
        // lets the scroll come to rest naturally on a readable step without fighting trackpads.
        const HOLD = 0.7, MOVE = 1;
        const total = n * HOLD + (n - 1) * MOVE;
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: {
            trigger: ".pr-stage", start: "top top", end: () => `+=${window.innerHeight * (n - 0.2)}`, pin: true, scrub: 1,
            onUpdate: (st) => {
              if (!count.current) return;
              const t = st.progress * total;
              const idx = Math.min(n - 1, Math.floor((t + MOVE / 2) / (HOLD + MOVE)));
              count.current.textContent = String(idx + 1).padStart(2, "0");
            },
          },
        });
        tl.fromTo(".pr-progress i", { scaleY: 0 }, { scaleY: 1, duration: total, ease: "none" }, 0);
        for (let i = 1; i < n; i++) {
          const at = i * HOLD + (i - 1) * MOVE; // end of plateau i-1
          tl.to(".pr-words", { yPercent: (-100 * i) / n, duration: MOVE }, at)
            .to(descs[i - 1], { autoAlpha: 0, y: -20, duration: MOVE * 0.4, ease: "power2.in" }, at)
            .to(descs[i], { autoAlpha: 1, y: 0, duration: MOVE * 0.45, ease: "power2.out" }, at + MOVE * 0.55);
        }
        return () => root.current?.classList.remove("is-pinned");
      });
    }, root);
    return () => { ctx.revert(); mm.revert(); };
  }, []);

  return (
    <section id="process" className="section proc" ref={root} data-bg="ink">
      <div className="pr-stage">
        <div className="grid pr-grid">
          <div className="pr-meta">
            <span className="eyebrow mono"><i>03</i> How we build</span>
            <p className="pr-lead">From signal to launch. Five stages, one team.</p>
          </div>
          <div className="pr-progress" aria-hidden><i /></div>
          <div className="pr-window">
            <ol className="pr-words">
              {steps.map((s, i) => (
                <li key={s.t} className="pr-item">
                  <span className="pr-word">{s.t}</span>
                  <p className="pr-desc"><span className="mono pr-n">{String(i + 1).padStart(2, "0")} —</span> {s.d}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="pr-counter mono" aria-hidden><span ref={count}>01</span> / {String(steps.length).padStart(2, "0")}</div>
        </div>
      </div>
    </section>
  );
}
