# Camr Studio static website

A responsive, static portfolio website built for GitHub Pages using the supplied Camr Studio project imagery.

## Publish on GitHub Pages

1. Create a new GitHub repository.
2. Upload everything in this folder to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. GitHub will publish the site and show the public URL.

## Contact details

The site is configured with:

- Email: `info@camr.sa`
- Phone: `+966 55 450 9092`

## Structure

- `index.html` – English page (default, canonical `/`)
- `ar/index.html` – Arabic (Saudi/Najdi localization, RTL) served at `/ar/`
- `privacy/index.html`, `ar/privacy/index.html` – privacy notice (Google Analytics cookies,
  opt-out), linked from both footers
- `404.html` – standalone not-found page (absolute asset paths so it works at any URL)
- `styles.css` – the single shared stylesheet for both pages. The base rules are the
  English layout; Arabic overrides live at the end of the file and every one is
  prefixed with `[dir="rtl"]` (`:root[dir="rtl"]` for the font variable), so the same
  file serves both languages.
- `script.js` – mobile navigation, hero slider (lazy slides via `data-src`/`data-srcset`),
  reveal animations, lightbox, language switch
- `assets/fonts/` – self-hosted IBM Plex Sans Arabic (400/500/600/700, `arabic` + `latin`
  subsets, woff2) from `@fontsource/ibm-plex-sans-arabic`, loaded by `@font-face` rules
  with `unicode-range` in `styles.css`. Used by the Arabic page only; licence included.
- `assets/images/` – project images, logos and icons:
  - `apple-touch-icon.png` (180×180), `favicon-32.png` (32×32), `camr-home-icon.svg`
  - `og-image.jpg` (1200×630) for link previews (Open Graph, Twitter, JSON-LD)

### Responsive images

Every project image exists in three widths:

- `name.webp` – original (1600px wide; `commercial-front.webp` is 1371px)
- `name-1200.webp` – 1200px wide
- `name-800.webp` – 800px wide

The resized copies are WebP quality 80, made with Pillow. Each `<img>` lists all three in
`srcset` with a `sizes` value that matches where it sits on the page, and its
`width`/`height` attributes are the original file's real pixel size. When adding a new
project image, generate the `-800` and `-1200` versions the same way.

## Localization

English is the default and canonical language (`/`). Arabic is a manually selected
option at `/ar/` (served from `ar/index.html` by GitHub Pages). There is no
browser-, IP-, or location-based redirect. Both pages cross-reference each other
with `hreflang` tags (`en`, `ar`, `x-default` → English), and both are listed in
`sitemap.xml`.

No frameworks, build tools, externally hosted fonts, or server-side components are required.


## Latest design updates
- A single modern sans-serif typeface is used throughout the site, matching the CAMR STUDIO footer wordmark style.
- Hero slideshow images use full-image fit, with a subtle blurred backdrop so the complete render stays visible on wide and tall screens.
