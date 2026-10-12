"use client";
import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

function Wave({ color = "#ff2a2a", bars = false }: { color?: string; bars?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, vis = true, t = 0;
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis && !reduced) loop(); });
    io.observe(c);
    const size = () => { const d = Math.min(devicePixelRatio, 2); c.width = c.clientWidth * d; c.height = c.clientHeight * d; };
    size(); addEventListener("resize", size);
    const draw = () => {
      const w = c.width, h = c.height; ctx.clearRect(0, 0, w, h);
      if (bars) {
        const n = 48;
        for (let i = 0; i < n; i++) {
          const a = Math.abs(Math.sin(i * 0.5 + t * 2) * Math.sin(i * 0.13 + t * 0.7)) * 0.9 + 0.05;
          ctx.fillStyle = i % 9 === 0 ? color : "rgba(244,239,230,.55)";
          const bw = w / n * 0.5; ctx.fillRect(i * (w / n), h / 2 - (a * h) / 2, bw, a * h);
        }
      } else {
        for (let k = 0; k < 3; k++) {
          ctx.beginPath(); ctx.strokeStyle = k === 0 ? color : `rgba(244,239,230,${0.25 - k * 0.07})`; ctx.lineWidth = (k === 0 ? 2 : 1) * (c.width / c.clientWidth);
          for (let x = 0; x <= w; x += 4) {
            const p = x / w; const env = Math.sin(p * Math.PI);
            const y = h / 2 + Math.sin(p * 18 + t * (3 + k)) * Math.sin(p * 5 - t) * h * 0.32 * env * (1 - k * 0.25);
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
    };
    const loop = () => { cancelAnimationFrame(raf); const f = () => { if (!vis) return; t += 0.016; draw(); raf = requestAnimationFrame(f); }; f(); };
    draw(); if (!reduced) loop();
    return () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size); };
  }, [bars, color]);
  return <canvas ref={ref} className="wave" />;
}

const LOG = [
  "> agent.spawn('research') ......... ok",
  "> tools: browser, docs, calendar",
  "> plan: 6 steps",
  "> step 1 — open dashboard ✓",
  "> step 2 — extract table data ✓",
  "> step 3 — draft outreach ✓",
  "> awaiting human approval ▌",
];

function Terminal() {
  const [n, setN] = useState(LOG.length);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setN((v) => (v >= LOG.length + 4 ? 1 : v + 1)), 700);
    return () => clearInterval(id);
  }, []);
  return <pre className="term mono">{LOG.slice(0, Math.min(n, LOG.length)).join("\n")}</pre>;
}

type Spec = { id: string; t: string; status: "DEMO" | "CONCEPT" | "SIMULATED" | "VISUAL PREVIEW"; note: string; notes: string[]; stage: React.ReactNode };

const specimens: Spec[] = [
  { id: "01", t: "AI Agents", status: "DEMO", note: "A scripted agent run, replayed as text.", notes: ["simulated agent run", "human approval step"], stage: <Terminal /> },
  { id: "02", t: "Voice AI", status: "SIMULATED", note: "Speech turned into intent; the waveform is generated.", notes: ["visual preview", "speech → intent"],
    stage: <div className="sp-voice"><Wave /><p className="sp-quote">“Book me a table for two near the venue, around eight.”</p></div> },
  { id: "03", t: "Computer Automation", status: "CONCEPT", note: "An agent operating a screen like a person would.", notes: ["concept", "screen-level agent"],
    stage: <div className="auto-screen"><div className="auto-win"><i /><i /><i /></div><div className="auto-rows">{Array.from({ length: 6 }).map((_, i) => <span key={i} style={{ width: `${92 - i * 12}%` }} />)}</div><span className="auto-cursor" /></div> },
  { id: "04", t: "Generative Video", status: "VISUAL PREVIEW", note: "Frames from a generative sequence, reinterpreted as a contact sheet.", notes: ["visual preview", "contact sheet"],
    stage: <div className="sp-video"><div className="frames">{Array.from({ length: 8 }).map((_, i) => <span key={i} style={{ ["--i" as string]: i }} />)}</div><Wave bars color="#c9a96e" /></div> },
  { id: "05", t: "Interactive 3D", status: "DEMO", note: "A small real-time object. Drag-free, pure CSS 3D.", notes: ["css 3d · demo", "interactive"],
    stage: <div className="cube-stage"><div className="cube">{["f", "b", "l", "r", "t", "d"].map((s) => <span key={s} className={`face ${s}`} />)}</div></div> },
];

export default function Lab() {
  const [cur, setCur] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (prefersReduced() || !stage.current) return;
    gsap.fromTo(stage.current, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "expo.out" });
  }, [cur]);
  const s = specimens[cur];
  return (
    <section id="lab" className="section lab" data-bg="paper">
      <div className="grid lab-grid">
        <header className="lab-head">
          <span className="eyebrow mono"><i>04</i> AI Lab — Notebook</span>
          <h2 className="display-2" data-mask><span className="mask-line"><span>Experiments</span></span><span className="mask-line"><span className="ital">&amp; concepts</span></span></h2>
          <p className="lab-disclaimer mono">All specimens are concept previews with simulated data.</p>
        </header>

        <ol className="spec-index" role="tablist" aria-label="Lab specimens">
          {specimens.map((sp, i) => (
            <li key={sp.id}>
              <button role="tab" aria-selected={cur === i} aria-controls="spec-stage" className={`spec-btn${cur === i ? " is-cur" : ""}`} onClick={() => setCur(i)}>
                <span className="mono spec-id">SPEC. {sp.id}</span>
                <span className="spec-t">{sp.t}</span>
                <span className="mono spec-status">[{sp.status}]</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="spec-sheet" id="spec-stage" role="tabpanel">
          <div className="spec-top mono"><span>SPECIMEN {s.id} / 05</span><span className="spec-badge">{s.status}</span></div>
          <div className="spec-stage" ref={stage} key={s.id}>{s.stage}</div>
          <div className="spec-notes">
            <p className="spec-note">{s.note}</p>
            <ul className="mono">{s.notes.map((n) => <li key={n}>— {n}</li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  );
}
