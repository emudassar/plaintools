// Writes src/data/lastmod.json: the date each sitemap URL's source last changed in git.
//
// The sitemap used to stamp every URL with the build time, so every deploy claimed all
// pages had changed and search engines learn to ignore lastmod. This records real dates.
//
// Runs before every build (npm "prebuild"). In a checkout without full history (a
// shallow CI clone) it leaves the committed file alone rather than writing wrong dates.
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, writeFileSync } from "node:fs";

const OUT = "src/data/lastmod.json";
const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

try {
  if (git("rev-parse", "--is-shallow-repository") === "true") {
    console.log("[lastmod] shallow clone, keeping the committed", OUT);
    process.exit(0);
  }
} catch {
  console.log("[lastmod] no git available, keeping the committed", OUT);
  process.exit(0);
}

const last = (...paths) => {
  const existing = paths.filter((p) => existsSync(p));
  if (!existing.length) return null;
  const d = git("log", "-1", "--format=%cI", "--", ...existing);
  return d ? new Date(d).toISOString() : null;
};

const out = {};
const put = (url, ...paths) => {
  const d = last(...paths);
  if (d) out[url] = d;
};

// Pages that list tools change when the registry does.
put("/", "src/app/page.tsx", "src/config/tools.ts");
put("/tools/", "src/app/tools/page.tsx", "src/config/tools.ts");
put("/maps/blank/", "src/app/maps/blank/page.tsx", "src/config/blank-maps.ts");
put("/about/", "src/app/about");
put("/privacy-policy/", "src/app/privacy-policy", "src/config/site.ts");
put("/terms-of-use/", "src/app/terms-of-use");
put("/disclaimer/", "src/app/disclaimer");

for (const slug of readdirSync("src/app/tools", { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)) {
  put(`/tools/${slug}/`, `src/app/tools/${slug}`);
}
const blank = last("src/app/maps/blank/[slug]", "src/config/blank-maps.ts");
if (blank) out["/maps/blank/*"] = blank;

writeFileSync(OUT, JSON.stringify(out, null, 0).replace(/,"/g, ',\n"') + "\n");
console.log(`[lastmod] wrote ${Object.keys(out).length} dates to ${OUT}`);
