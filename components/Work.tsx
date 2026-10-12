"use client";
import Image from "next/image";
import { projects } from "@/data/projects";
import { withBase } from "@/lib/withBase";
import { projectArt } from "./ProjectArt";

const layouts = ["a", "b", "c", "d"] as const;

export default function Work() {
  return (
    <section id="work" className="section work" data-bg="ink">
      <div className="grid work-head">
        <span className="eyebrow mono"><i>02</i> Selected Work</span>
        <h2 className="display-2" data-mask><span className="mask-line"><span>Selected</span></span><span className="mask-line"><span className="ital">projects</span></span></h2>
        <p className="work-intro" data-reveal>A selection of AI products, interactive experiences, games and 3D work.</p>
      </div>

      {projects.map((p, i) => (
        <article key={p.slug} className={`chapter ch-${layouts[i % 4]}`} style={{ ["--tone" as string]: p.tone }}>
          <div className="grid chapter-grid">
            <div className="ch-text">
              <div className="ch-sticky">
                <span className="ch-count mono"><b>{String(i + 1).padStart(2, "0")}</b> / {String(projects.length).padStart(2, "0")}</span>
                <h3 className="ch-title"><span>{p.title}</span></h3>
                <span className="ch-sub">{p.subtitle}</span>
                <p className="ch-desc">{p.description}</p>
                <span className="ch-tags mono">{p.disciplines}</span>
                {(p.url || p.links?.length) && (
                  <div className="ch-links">
                    {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="u-link mono ch-link">View live site ↗</a>}
                    {p.links?.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="u-link mono ch-link dim">{l.label} ↗</a>)}
                  </div>
                )}
              </div>
            </div>
            <figure className="ch-media" data-cursor="View" data-clipreveal>
              <div className="ch-inner" data-parallax="-10">
                {p.image
                  ? <Image src={withBase(p.image)} alt={p.imageAlt ?? `${p.title} — ${p.subtitle}`} fill sizes="(max-width: 900px) 100vw, 66vw" className="ch-img" />
                  : projectArt[p.slug]}
              </div>
              <figcaption className="mono"><span>FIG. {String(i + 1).padStart(2, "0")}</span><span>{p.title} — {p.subtitle}</span></figcaption>
            </figure>
          </div>
        </article>
      ))}
    </section>
  );
}
