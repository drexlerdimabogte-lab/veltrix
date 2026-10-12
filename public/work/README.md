# Project images

Drop project images here to replace the generated artwork on the Selected Work cards.

- **File name:** `<slug>.webp` (or `.jpg`). Slugs: `tripyou`, `icope`, `bagsak`, `golden-train`
- **Recommended size:** 1600×1000 (16:10), under ~300 KB. WebP is preferred.
- **Framing:** cards crop with `object-fit: cover` (4:3 on some cards, 16:11 on others), so keep the subject centred.

Then set the `image` field in `data/projects.ts`, for example:

```ts
image: "/work/tripyou.webp",
imageAlt: "TripYou chat interface on a phone",
```

When `image` is unset, the card falls back to its generated SVG art.
