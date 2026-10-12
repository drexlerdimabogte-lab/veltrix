"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

const items = [
  { t: "AI Assistants", d: "Conversational agents trained on your brand, products and tone — deployed across web, voice and messaging.", tags: ["LLM agents", "RAG", "Voice"] },
  { t: "Interactive Websites", d: "Performance-minded sites built with WebGL, motion and obsessive detail.", tags: ["Next.js", "WebGL", "CMS"] },
  { t: "AI Content Systems", d: "Pipelines that generate, adapt and publish on-brand content at scale — with humans in the loop.", tags: ["Automation", "Gen video", "Ops"] },
  { t: "Motion & 3D", d: "Real-time 3D, product visualisation and cinematic motion languages that make interfaces feel alive.", tags: ["Three.js", "GSAP", "Shaders"] },
  { t: "Brand Experiences", d: "Launches, installations and campaign worlds where identity, story and technology become one.", tags: ["Identity", "Campaign", "Events"] },
];

/** Small generated plates shown in the cursor-following preview. */
const plates = [
  <svg key="a" viewBox="0 0 320 220"><rect width="320" height="220" fill="#111" />{[0, 1, 2].map((i) => <rect key={i} x={i % 2 ? 120 : 24} y={30 + i * 58} width={i % 2 ? 176 : 150} height="38" fill="none" stroke={i === 2 ? "#ff2a2a" : "#f4efe6"} strokeOpacity={i === 2 ? 1 : 0.35} />)}<circle cx="290" cy="196" r="4" fill="#ff2a2a" /></svg>,
  <svg key="b" viewBox="0 0 320 220"><rect width="320" height="220" fill="#111" />{Array.from({ length: 9 }).map((_, i) => <line key={i} x1={i * 40} y1="0" x2={i * 40} y2="220" stroke="#f4efe6" strokeOpacity=".08" />)}<rect x="40" y="40" width="160" height="120" fill="none" stroke="#f4efe6" strokeOpacity=".5" /><rect x="120" y="80" width="160" height="100" fill="#ff2a2a" fillOpacity=".85" /></svg>,
  <svg key="c" viewBox="0 0 320 220"><rect width="320" height="220" fill="#111" />{[0, 1, 2, 3].map((i) => <rect key={i} x={40 + i * 26} y={30 + i * 18} width="150" height="110" fill="#111" stroke={i === 3 ? "#c9a96e" : "#f4efe6"} strokeOpacity={i === 3 ? 0.9 : 0.25} />)}</svg>,
  <svg key="d" viewBox="0 0 320 220"><rect width="320" height="220" fill="#111" />{Array.from({ length: 7 }).map((_, i) => <ellipse key={i} cx="160" cy="110" rx={80} ry={12 + i * 12} fill="none" stroke="#f4efe6" strokeOpacity=".22" transform={`rotate(${i * 26} 160 110)`} />)}<circle cx="160" cy="110" r="10" fill="#ff2a2a" /></svg>,
  <svg key="e" viewBox="0 0 320 220"><rect width="320" height="220" fill="#111" /><rect x="128" y="78" width="64" height="64" fill="none" stroke="#f4efe6" transform="rotate(45 160 110)" /><rect x="146" y="96" width="28" height="28" fill="#ff2a2a" transform="rotate(45 160 110)" /><line x1="20" y1="196" x2="300" y2="196" stroke="#c9a96e" strokeOpacity=".6" /></svg>,
];

export default function Capabilities() {
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const prev = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = prev.current; if (!el || !matchMedia("(pointer: fine)").matches) return;
    const reduced = prefersReduced();
    const xt = gsap.quickTo(el, "x", { duration: reduced ? 0 : 0.7, ease: "power4.out" }), yt = gsap.quickTo(el, "y", { duration: reduced ? 0 : 0.7, ease: "power4.out" });
    const move = (e: PointerEvent) => { xt(e.clientX + 28); yt(e.clientY - 110); };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <section id="capabilities" className="section caps" data-bg="ink">
      <div className="grid">
        <header className="caps-head">
          <span className="eyebrow mono"><i>01</i> Capabilities</span>
          <h2 className="display-2" data-mask><span className="mask-line"><span>Five</span></span><span className="mask-line"><span>disciplines,</span></span><span className="mask-line"><span className="ital">one nervous system.</span></span></h2>
        </header>
        <p className="caps-intro" data-reveal>We sit where intelligence meets craft. Every engagement blends strategy, design and engineering into systems that keep learning after launch.</p>

        <ol className="cap-index" onPointerLeave={() => setHover(null)}>
          {items.map((it, i) => {
            const isOpen = open === i;
            return (
              <li key={it.t} className={`cap${isOpen ? " is-open" : ""}`} onPointerEnter={() => setHover(i)} data-reveal>
                <button className="cap-btn" aria-expanded={isOpen} aria-controls={`cap-d-${i}`} onClick={() => setOpen(isOpen ? null : i)}>
                  <span className="cap-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span className="cap-t">{it.t}</span>
                  <span className="cap-plus" aria-hidden />
                </button>
                <div className="cap-d" id={`cap-d-${i}`}>
                  <div>
                    <p>{it.d}</p>
                    <p className="cap-tags mono">{it.tags.join(" / ")}</p>
                  </div>
                </div>
                <span className="cap-rule" aria-hidden />
              </li>
            );
          })}
        </ol>
      </div>
      <div ref={prev} className={`cap-preview${hover !== null ? " is-on" : ""}`} aria-hidden>
        {plates.map((p, i) => <div key={i} className={`plate${hover === i ? " is-cur" : ""}`}>{p}</div>)}
        <span className="mono">{hover !== null ? `PL. ${String(hover + 1).padStart(2, "0")}` : ""}</span>
      </div>
    </section>
  );
}
