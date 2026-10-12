import { moreWork } from "@/data/moreWork";

export default function MoreWork() {
  if (moreWork.length === 0) return null;
  return (
    <section id="more-work" className="section more" data-bg="ink" aria-labelledby="more-title">
      <div className="grid">
        <header className="more-head">
          <span className="eyebrow mono"><i>02b</i> More work</span>
          <h2 id="more-title" className="more-title" data-reveal>Other sites, <span className="ital">live online.</span></h2>
        </header>
        <ol className="more-list">
          {moreWork.map((m, i) => (
            <li key={m.url}>
              <a href={m.url} target="_blank" rel="noopener noreferrer" className="more-row">
                <span className="mono more-n">{String(i + 1).padStart(2, "0")}</span>
                <span className="more-t">{m.title}</span>
                <span className="mono more-l">{m.label}</span>
                <span className="more-arrow" aria-hidden>↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
