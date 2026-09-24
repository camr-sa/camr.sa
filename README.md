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

- `index.html` – page content and SEO metadata (English, default)
- `ar/index.html` – Arabic (Saudi/Najdi localization, RTL) served at `/ar/`
- `script.js` – mobile navigation, hero slider, reveal animations, lightbox, language switch
- `assets/images/` – optimized WebP project images plus the cleaned logo asset

## Localization

English is the default and canonical language (`/`). Arabic is a manually selected
option at `/ar/` (served from `ar/index.html` by GitHub Pages). There is no
browser-, IP-, or location-based redirect. Both pages cross-reference each other
with `hreflang` tags (`en`, `ar`, `x-default` → English), and both are listed in
`sitemap.xml`.

No frameworks, build tools, external fonts, or server-side components are required.


## Latest design updates
- A single modern sans-serif typeface is used throughout the site, matching the CAMR STUDIO footer wordmark style.
- Hero slideshow images use full-image fit, with a subtle blurred backdrop so the complete render stays visible on wide and tall screens.
