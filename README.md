# Camr Studio website

The bilingual (English / Arabic) website for Camr Studio at https://camr.sa, built with
[Eleventy](https://www.11ty.dev/) and published to GitHub Pages by GitHub Actions.
The output is plain HTML, CSS and a little JavaScript: no framework runs in the browser.

## Working on the site

Needs Node.js 20 or newer.

```
npm install
npm start          # local preview at http://localhost:8080, rebuilds on save
npm run build      # writes the finished site to _site/
```

## Publishing

Every push to `main` runs `.github/workflows/deploy.yml`, which:

1. builds the site with `npm run build`;
2. compares each built page with the live one (`.github/scripts/changed_pages.py`);
3. deploys `_site/` to GitHub Pages;
4. sends the changed pages to IndexNow (`.github/scripts/indexnow_submit.py`).

It can also be run by hand from the Actions tab ("Build and deploy" → Run workflow).
The repository's **Settings → Pages → Source** must be set to **GitHub Actions**.
`_site/` is never committed.

## Where things live

Everything that ends up on the site is in `src/`.

- `src/_data/en.json`, `src/_data/ar.json` – all page text, one file per language. Change
  wording here; both files have the same keys. Values that contain markup (`<br />`,
  `<span>`) are used as HTML.
- `src/_data/site.json` – facts shared by both languages: email, phone, links, map,
  Google Analytics ID, coordinates.
- `src/_includes/layouts/home.njk` – the home page markup, used for `/` and `/ar/`.
- `src/_includes/layouts/legal.njk` – layout for the privacy pages.
- `src/_includes/partials/` – pieces shared by layouts (icons, `hreflang` links, analytics).
- `src/index.njk`, `src/ar/index.njk` – the two home pages (front matter only: language,
  layout, URL).
- `src/privacy/index.njk`, `src/ar/privacy/index.njk` – privacy notice text.
- `src/404.njk` – standalone not-found page.
- `src/styles.css` – the single shared stylesheet. Base rules are the English layout;
  Arabic overrides are at the end, each prefixed with `[dir="rtl"]`.
- `src/script.js` – mobile navigation, hero slider, reveal animations, lightbox, language
  switch, background map loading.
- `src/assets/` – images, fonts (self-hosted IBM Plex Sans Arabic, licence included) and icons.
- `src/CNAME`, `src/robots.txt`, `src/sitemap.xml`, `src/<key>.txt` – copied to the site
  root unchanged. The `.txt` file is the public IndexNow key.
- `eleventy.config.js` – build settings and the template filters below.

### Template filters

- `versioned` – `{{ '/styles.css' | versioned }}` adds `?v=<content hash>`, so browsers
  fetch a new copy whenever the file changes. No version to bump by hand.
- `srcset` – `{{ 'villa-front' | srcset }}` gives the 800 / 1200 / full-width list for a
  project image (`srcset(1371)` when the original isn't 1600px wide).
- `ltr` – `{{ site.email | ltr(lang) }}` wraps Latin text (numbers, email, phone) in
  `<span class="ltr">` on Arabic pages so it reads left to right; English pages get it bare.

## Languages

English is the default and canonical language (`/`). Arabic (Saudi/Najdi register, RTL)
lives at the same path under `/ar/`, e.g. `/privacy/` ↔ `/ar/privacy/`. Each page's
`hreflang`, canonical and language-switch links are worked out from that rule
(`src/_data/eleventyComputed.js`). There is no browser-, IP- or location-based redirect.

## Responsive images

Every project image exists in three widths:

- `name.webp` – original (1600px wide; `commercial-front.webp` is 1371px)
- `name-1200.webp` – 1200px wide
- `name-800.webp` – 800px wide

The resized copies are WebP quality 80, made with Pillow. Each `<img>` lists all three in
`srcset` with a `sizes` value that matches where it sits on the page, and its
`width`/`height` attributes are the original file's real pixel size. When adding a new
project image, generate the `-800` and `-1200` versions the same way.

## Contact details

- Email: `info@camr.sa`
- Phone: `+966 55 450 9092`
