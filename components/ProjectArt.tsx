/* Generated per-project artwork (fallback when data/projects.ts has no image). */
import type { Project } from "@/data/projects";

const ArtTrip = () => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="art-svg">
    <defs><radialGradient id="tg" cx="70%" cy="30%"><stop offset="0" stopColor="#ff6a3d" stopOpacity=".9" /><stop offset=".5" stopColor="#5a1410" stopOpacity=".5" /><stop offset="1" stopColor="#0a0a0a" stopOpacity="0" /></radialGradient></defs>
    <rect width="400" height="300" fill="url(#tg)" />
    {Array.from({ length: 14 }).map((_, i) => <ellipse key={i} cx="260" cy="110" rx={20 + i * 22} ry={10 + i * 12} fill="none" stroke="#f4efe6" strokeOpacity={0.18 - i * 0.01} />)}
    <path d="M30 260 C 120 180, 180 240, 260 110" stroke="#ff2a2a" strokeWidth="1.5" fill="none" strokeDasharray="4 6" />
    <circle cx="260" cy="110" r="5" fill="#ff2a2a" /><circle cx="30" cy="260" r="3" fill="#f4efe6" />
  </svg>
);
const ArtIcope = () => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="art-svg">
    <rect width="400" height="300" fill="#0d0d0f" />
    {Array.from({ length: 12 }).map((_, r) => Array.from({ length: 16 }).map((_, c) => {
      const on = (r * 7 + c * 3) % 11 === 0; return <rect key={`${r}-${c}`} x={c * 26 + 4} y={r * 26 + 4} width="18" height="18" rx="3" fill={on ? "#ff2a2a" : "#f4efe6"} fillOpacity={on ? 0.85 : 0.04 + ((r + c) % 5) * 0.02} />;
    }))}
    <rect x="120" y="96" width="160" height="108" rx="10" fill="#0a0a0a" stroke="#c9a96e" strokeOpacity=".5" />
    <text x="140" y="140" fill="#f4efe6" fontSize="20" fontFamily="monospace">ENROLL_</text><text x="140" y="172" fill="#c9a96e" fontSize="10" fontFamily="monospace">STEP 03 / 05</text>
  </svg>
);
const ArtBagsak = () => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="art-svg">
    <defs><linearGradient id="bg1" x1="0" x2="1"><stop offset="0" stopColor="#2a0606" /><stop offset="1" stopColor="#090909" /></linearGradient></defs>
    <rect width="400" height="300" fill="url(#bg1)" />
    {Array.from({ length: 22 }).map((_, i) => <line key={i} x1="200" y1="150" x2={Math.round((200 + Math.cos(i * 0.285) * 400) * 100) / 100} y2={Math.round((150 + Math.sin(i * 0.285) * 400) * 100) / 100} stroke="#ff2a2a" strokeOpacity={i % 2 ? 0.25 : 0.08} strokeWidth={i % 3 ? 1 : 6} />)}
    <polygon points="200,70 228,140 300,150 228,162 200,232 172,162 100,150 172,140" fill="#ff2a2a" />
    <text x="200" y="285" textAnchor="middle" fill="#f4efe6" fontSize="30" fontWeight="800" fontFamily="sans-serif" letterSpacing="4">BAGSÁK!</text>
  </svg>
);
const ArtTrain = () => (
  <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="art-svg">
    <defs><linearGradient id="gt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a140a" /><stop offset="1" stopColor="#050505" /></linearGradient>
      <linearGradient id="gold" x1="0" x2="1"><stop offset="0" stopColor="#7a5a2a" /><stop offset=".5" stopColor="#f1d9a6" /><stop offset="1" stopColor="#7a5a2a" /></linearGradient></defs>
    <rect width="400" height="300" fill="url(#gt)" />
    {Array.from({ length: 18 }).map((_, i) => { const y = 170 + i * i * 0.5; return <line key={i} x1={200 - (y - 150) * 3} y1={y} x2={200 + (y - 150) * 3} y2={y} stroke="#c9a96e" strokeOpacity={0.08 + i * 0.012} />; })}
    <line x1="200" y1="150" x2="40" y2="300" stroke="url(#gold)" strokeWidth="2" /><line x1="200" y1="150" x2="360" y2="300" stroke="url(#gold)" strokeWidth="2" />
    <circle cx="200" cy="150" r="40" fill="#f1d9a6" fillOpacity=".12" /><circle cx="200" cy="150" r="8" fill="#f1d9a6" />
  </svg>
);

export const projectArt: Record<Project["slug"], React.ReactNode> = { tripyou: <ArtTrip />, icope: <ArtIcope />, bagsak: <ArtBagsak />, "golden-train": <ArtTrain /> };
