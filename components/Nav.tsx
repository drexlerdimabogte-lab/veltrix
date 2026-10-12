"use client";
import { useEffect, useState } from "react";
import type Lenis from "lenis";

const THRESHOLD = 24;

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = (y: number) => setScrolled(y > THRESHOLD);
    const onNative = () => update(window.scrollY);
    onNative();
    window.addEventListener("scroll", onNative, { passive: true });
    // Lenis drives window scroll, but subscribe to its event too so state tracks its interpolated position.
    let lenis: Lenis | undefined; let tries = 0;
    const onLenis = ({ scroll }: { scroll: number }) => update(scroll);
    const attach = () => {
      lenis = (window as unknown as { __lenis?: Lenis }).__lenis;
      if (lenis) lenis.on("scroll", onLenis); else if (tries++ < 20) id = window.setTimeout(attach, 100);
    };
    let id = window.setTimeout(attach, 0);
    return () => { window.removeEventListener("scroll", onNative); clearTimeout(id); lenis?.off("scroll", onLenis); };
  }, []);
  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}`}>
      <a href="#top" className="logo" aria-label="Veltrix home"><span className="logo-mark" />VELTRIX</a>
      <nav className="nav-links" aria-label="Primary">
        <a href="#capabilities">Capabilities</a><a href="#work">Work</a><a href="#process">Process</a><a href="#lab">Lab</a>
      </nav>
      <a href="#contact" className="nav-cta"><span className="pulse" />Start a project</a>
    </header>
  );
}
