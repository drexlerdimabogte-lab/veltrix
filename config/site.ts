/**
 * Site-wide contact & social configuration.
 * TODO: fill these in. Anything left empty ("") is hidden from the UI automatically.
 */
export type Social = { label: string; href: string };

export const site = {
  name: "VELTRIX",
  tagline: "AI Creative Studio",
  /** e.g. "studio@yourdomain.com" — enables mailto CTAs + email display */
  email: "rrichardromero2323@gmail.com",
  /** e.g. "Based in City, Country" — shown in hero eyebrow + footer when set */
  location: "Pembo, Taguig City, Philippines",
  /** Résumé PDF link — shown in the contact block when set. */
  resume: "https://richard-romero-portfolio.drexlerdimabogte.chatgpt.site/assets/Richard-Romero-Resume.pdf",
  /** Main portfolio link — shown in the contact block when set. */
  portfolio: "https://richard-romero-portfolio.drexlerdimabogte.chatgpt.site/",
  /** Add entries like { label: "Instagram", href: "https://instagram.com/..." }. Empty hrefs are skipped. */
  socials: [
    { label: "Behance", href: "https://www.behance.net/richardromero23" },
  ] as Social[],
};

export const activeSocials = () => site.socials.filter((s) => s.href.trim() !== "");
/** Primary CTA target: mailto when an email is configured, otherwise the contact section. */
export const contactHref = () => (site.email ? `mailto:${site.email}` : "#contact");
