# v-rgd.github.io

Portfolio of Victor Regard, gameplay & 3C programmer. Built with [Astro](https://astro.build), published on GitHub Pages.

```
npm install     # once, and after a dependency changes
npm run dev     # live preview at http://localhost:4321
npm run build   # production build into dist/ (GitHub does this on every push)
```

How to edit the content: see [EDITING.md](EDITING.md).

## Structure

- `src/content/` – all the text: `site.yaml` (home page, profile, contact, 3D preview) and one Markdown file per project, prototype and art tile
- `src/styles/theme.css` – theme colors and fonts
- `src/components/`, `src/layouts/`, `src/pages/` – templates
- `src/scripts/r3d.js` – the dithered software 3D renderer; `dither.js` – the image dithering
- `public/` – files served as-is (images in `media/`, models in `models/`)
- `.github/workflows/deploy.yml` – builds and publishes the site on every push
