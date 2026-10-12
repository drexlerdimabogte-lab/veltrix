/**
 * Selected Work data. Descriptions are factual (what the project is) — no outcomes or metrics.
 * To use a real image, drop a file at /public/work/<slug>.webp (or .jpg) and set `image`
 * e.g. image: "/work/tripyou.webp". When `image` is unset, generated art is shown instead.
 */
export type Project = {
  slug: "tripyou" | "icope" | "bagsak" | "golden-train";
  title: string;
  subtitle: string;
  description: string;
  disciplines: string;
  tone: string;
  image?: string;
  /** Public live link (only when published on the portfolio). */
  url?: string;
  /** Optional secondary links shown after the primary one. */
  links?: { label: string; url: string }[];
  imageAlt?: string;
};

export const projects: Project[] = [
  {
    slug: "tripyou", title: "TripYou", subtitle: "AI Travel Assistant", tone: "#ff5a36",
    description: "An AI-assisted travel agency experience that answers common questions, collects quote and travel inquiries, captures lead information, and provides customer-service handoff options.",
    disciplines: "AI assistant · Website design updates · Squarespace",
    url: "https://www.trip-you.com/",
  },
  {
    slug: "icope", title: "ICOPE", subtitle: "Interactive Enrollment Experience", tone: "#c9a96e",
    description: "An interactive enrollment experience that walks users through the enrollment process step by step.",
    disciplines: "UX · Interactive · Enrollment",
    url: "https://icope-enrollment.netlify.app/",
    links: [
      { label: "Registration forms", url: "https://chic-brigadeiros-da1097.netlify.app/" },
      { label: "Earlier build", url: "https://merry-nasturtium-914c85.netlify.app/" },
    ],
  },
  {
    slug: "bagsak", title: "BAGSÁK!", subtitle: "Battle Game", tone: "#ff2a2a",
    description: "A Godot-built competitive block battle game featuring AI opponents, combo systems, KO rounds, power-ups, progression, and arcade-style presentation.",
    disciplines: "Godot · Game design · AI opponents",
  },
  {
    slug: "golden-train", title: "Golden Train", subtitle: "Interactive 3D Portfolio", tone: "#f1d9a6",
    description: "A personal portfolio presented as a cinematic, interactive 3D train journey.",
    disciplines: "Personal portfolio · 3D · Interactive",
    url: "https://genuine-boba-50b459.netlify.app/",
  },
];
