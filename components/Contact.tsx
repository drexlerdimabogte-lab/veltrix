import Magnetic from "./Magnetic";
import { site, activeSocials, contactHref } from "@/config/site";

export default function Contact() {
  const socials = activeSocials();
  const links = [
    { label: "Résumé", href: site.resume },
    { label: "Portfolio", href: site.portfolio },
    ...socials.map((s) => ({ label: s.label, href: s.href })),
  ].filter((l) => l.href.trim() !== "");
  return (
    <section id="contact" className="section contact" data-bg="ink">
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k}>Start a project <i>✦</i> Have an idea <i>✦</i> Start a project <i>✦</i> Have an idea <i>✦</i>&nbsp;</span>
          ))}
        </div>
      </div>
      <div className="grid contact-grid">
        <span className="eyebrow mono"><i>05</i> Contact</span>
        <h2 className="finale" data-mask>
          <span className="mask-line f1"><span>Have an idea?</span></span>
          <span className="mask-line f2"><span>Let’s build</span></span>
          <span className="mask-line f3"><span className="ital">something people</span></span>
          <span className="mask-line f4"><span className="red">remember.</span></span>
        </h2>
        <div className="contact-cta" data-reveal>
          <Magnetic href={contactHref()} className="big">Start a Project</Magnetic>
          {(site.email || site.location) && (
            <div className="contact-info">
              {site.email && <a href={`mailto:${site.email}`} className="u-link">{site.email}</a>}
              {site.location && <span className="dim">{site.location}</span>}
            </div>
          )}
          {links.length > 0 && (
            <ul className="contact-links mono">
              {links.map((l) => <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="u-link">{l.label} ↗</a></li>)}
            </ul>
          )}
        </div>
      </div>
      <footer className="footer">
        <div className="grid footer-grid mono">
          <span>© {new Date().getFullYear()} {site.name} — {site.tagline}</span>
          {socials.length > 0 && <span className="footer-links">{socials.map((s) => <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="u-link">{s.label}</a>)}</span>}
          <a href="#top" className="u-link">Back to top ↑</a>
        </div>
        <div className="footer-mark" aria-hidden>VELTRIX</div>
      </footer>
    </section>
  );
}
