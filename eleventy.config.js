import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import nunjucks from "nunjucks";

// Files copied to the site root unchanged.
const PASSTHROUGH = [
  "src/assets",
  "src/styles.css",
  "src/script.js",
  "src/CNAME",
  "src/robots.txt",
  "src/sitemap.xml",
  "src/f66437307ab5d328f718931a6b695487.txt", // IndexNow key (public by design)
];

export default function (eleventyConfig) {
  for (const path of PASSTHROUGH) eleventyConfig.addPassthroughCopy(path);

  // Cache busting: "/styles.css" -> "/styles.css?v=<first 10 hex of its content hash>".
  // Changes whenever the file changes, so nobody has to bump a version by hand.
  const hashes = new Map();
  eleventyConfig.addFilter("versioned", (url) => {
    if (!hashes.has(url)) {
      const hash = createHash("sha256").update(readFileSync(`src${url}`)).digest("hex").slice(0, 10);
      hashes.set(url, `${url}?v=${hash}`);
    }
    return hashes.get(url);
  });

  // srcset for a project image that exists at 800, 1200 and full width.
  eleventyConfig.addFilter("srcset", (name, fullWidth = 1600) =>
    `/assets/images/${name}-800.webp 800w, /assets/images/${name}-1200.webp 1200w, /assets/images/${name}.webp ${fullWidth}w`
  );

  // Arabic pages wrap Latin runs (numbers, email, phone) in <span class="ltr"> so they
  // keep left-to-right order inside right-to-left text. English pages leave them bare.
  // Output is marked safe so Nunjucks' autoescaping keeps the <span> as markup.
  eleventyConfig.addFilter("ltr", (text, lang) =>
    nunjucks.runtime.markSafe(lang === "ar" ? `<span class="ltr">${text}</span>` : String(text))
  );

  // Clear the hash cache on every rebuild so `npm start` picks up CSS/JS edits.
  eleventyConfig.on("eleventy.before", () => hashes.clear());

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
