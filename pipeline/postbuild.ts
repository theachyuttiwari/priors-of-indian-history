/**
 * After `next build`: finish the static export in out/ for hosts that cannot send headers (GitHub Pages).
 *
 * 1. A Markdown twin (index.md) beside each key page, made from that page's own HTML, so the numbers match.
 * 2. llms.txt at the site root, linking the twins.
 * 3. In every page's head: canonical address, og:url, the home share card where a page has none,
 *    a link to its twin, JSON-LD, a referrer policy, and a Content-Security-Policy that allows the page's
 *    inline scripts by hash.
 *
 * pipeline/verify-out.ts checks the result. Both run in `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { DESCRIPTION, REPO, CORRECTION_FORM, SITE_URL } from "../src/lib/site";
import { cspFor, decodeEntities, find, parse, toMarkdown, visibleText } from "./lib/static-html";
import { hasTwin, isNotFound, pages } from "./lib/out-pages";

const OUT = path.join(process.cwd(), "out");
const SITE = SITE_URL;
const NAME = "Priors";

function meta(html: string, attr: "name" | "property", key: string): string | undefined {
  const m = html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`));
  return m ? decodeEntities(m[1]) : undefined;
}

function title(html: string): string {
  const m = html.match(/<title>([\s\S]*?)<\/title>/);
  return m ? decodeEntities(m[1]) : NAME;
}

/** The page's opening paragraph (its lede, else its first paragraph) in <main>, as plain text. */
function lede(html: string): string | undefined {
  const main = find(parse(html), (e) => e.tag === "main");
  const isP = (e: { tag: string }) => e.tag === "p";
  const p =
    main &&
    (find(main, (e) => isP(e) && (e.attrs.class ?? "").split(" ").includes("lede")) ??
      find(main, (e) => isP(e) && visibleText(e).trim().length > 20));
  return p ? visibleText(p).replace(/\s+/g, " ").trim() : undefined;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function twinFor(html: string, url: string): string {
  const doc = parse(html);
  const main = find(doc, (e) => e.tag === "main");
  const footer = find(doc, (e) => e.tag === "footer" && !find(main ?? doc, (x) => x === e));
  if (!main) throw new Error(`no <main> in ${url}`);
  // The body starts with the page's own heading; the line above the rule says where the copy comes from.
  const head = `Markdown copy of ${url}\n\n---\n\n`;
  return head + toMarkdown(main, url) + (footer ? "\n---\n\n" + toMarkdown(footer, url) : "");
}

function jsonLd(p: string, url: string, html: string): object {
  const org = { "@type": "Organization", "@id": `${SITE}/#organization`, name: NAME, url: `${SITE}/`, sameAs: [REPO] };
  const site = {
    "@type": "WebSite",
    "@id": `${SITE}/#website`,
    name: NAME,
    url: `${SITE}/`,
    description: DESCRIPTION,
    inLanguage: "en-IN",
    publisher: { "@id": org["@id"] },
  };
  if (p === "/") {
    const dataset = {
      "@type": "Dataset",
      name: title(html),
      description: DESCRIPTION,
      url,
      license: "https://creativecommons.org/licenses/by/4.0/",
      isAccessibleForFree: true,
      creator: { "@id": org["@id"] },
      publisher: { "@id": org["@id"] },
      distribution: [{ "@type": "DataDownload", encodingFormat: "text/markdown", contentUrl: `${url}index.md` }],
    };
    return { "@context": "https://schema.org", "@graph": [org, site, dataset] };
  }
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title(html),
    description: meta(html, "name", "description") ?? DESCRIPTION,
    url,
    inLanguage: "en-IN",
    isPartOf: { "@id": site["@id"] },
    publisher: org,
  };
}

function llmsTxt(twins: { p: string; url: string; title: string; description: string }[]): string {
  // A long summary is cut to its first sentence; a short lede is kept whole.
  const note = (d: string) => (d.length > 160 ? d.split(/(?<=\.)\s/)[0] : d);
  const line = (t: (typeof twins)[number]) =>
    `- [${t.title.replace(/ · Priors$/, "")}](${t.url}index.md): ${note(t.description)}`;
  const by = (p: string) => twins.find((t) => t.p === p)!;
  const sections = ["/now/", "/precedents/", "/compare/", "/parties/", "/about/", "/corrections/"].map((p) => by(p));
  return [
    `# ${NAME}`,
    "",
    `> ${DESCRIPTION}`,
    "",
    "Priors is a public record of how the Indian state acts when different parties hold power. Every party gets the same columns. Every claim links to a dated source.",
    "",
    "Priors describes actions; it does not judge them. It is updated by hand, not live. Content is CC BY 4.0. Code is MIT.",
    "",
    "Each page below has a Markdown copy (index.md) with the page's full text, numbers and sources.",
    "",
    "## Start here",
    "",
    line(by("/")),
    ...sections.map((t) => line(t)),
    "",
    "## Current events",
    "",
    ...twins.filter((t) => /^\/now\/[^/]+\/$/.test(t.p)).map((t) => line(t)),
    "",
    "## Precedents",
    "",
    ...twins.filter((t) => /^\/precedents\/[^/]+\/$/.test(t.p)).map((t) => line(t)),
    "",
    "## Optional",
    "",
    `- [Sitemap](${SITE}/sitemap.xml): every page, with the date it last changed.`,
    `- [Source repository](${REPO}): the content as YAML files, the schema and the code.`,
    `- [Report an error](${CORRECTION_FORM}): corrections go to GitHub issues. Bring a source.`,
    "",
  ].join("\n");
}

function main() {
  const all = pages(OUT);
  const twins: { p: string; url: string; title: string; description: string }[] = [];

  for (const [file, p] of all) {
    if (!hasTwin(p)) continue;
    const html = fs.readFileSync(file, "utf8");
    const url = SITE + p;
    fs.writeFileSync(path.join(path.dirname(file), "index.md"), twinFor(html, url));
    // Section pages share the site description, so llms.txt uses their opening paragraph instead.
    const own = meta(html, "name", "description");
    const description = own && own !== DESCRIPTION ? own : p === "/" ? DESCRIPTION : (lede(html) ?? DESCRIPTION);
    twins.push({ p, url, title: title(html), description });
  }
  fs.writeFileSync(path.join(OUT, "llms.txt"), llmsTxt(twins));

  const home = fs.readFileSync(path.join(OUT, "index.html"), "utf8");
  const card = [...home.matchAll(/<meta (?:property="og:image[^"]*"|name="twitter:image[^"]*") content="[^"]*"\/>/g)]
    .map((m) => m[0])
    .join("");

  for (const [file, p] of all) {
    let html = fs.readFileSync(file, "utf8");
    if (html.includes('http-equiv="Content-Security-Policy"')) throw new Error(`${file}: postbuild already ran`);
    const url = SITE + (isNotFound(p) ? "/" : p);
    const add: string[] = ['<meta name="referrer" content="strict-origin-when-cross-origin"/>'];
    if (!isNotFound(p)) {
      add.push(`<link rel="canonical" href="${esc(url)}"/>`, `<meta property="og:url" content="${esc(url)}"/>`);
      if (!/<meta property="og:image"/.test(html)) add.push(card);
      if (hasTwin(p)) add.push(`<link rel="alternate" type="text/markdown" href="${esc(url)}index.md"/>`);
      const ld = JSON.stringify(jsonLd(p, url, html)).replace(/</g, "\\u003c");
      add.push(`<script type="application/ld+json">${ld}</script>`);
    }
    html = html.replace("</head>", add.join("") + "</head>");
    const csp = `<meta http-equiv="Content-Security-Policy" content="${esc(cspFor(html))}"/>`;
    if (!html.includes('<meta charSet="utf-8"/>')) throw new Error(`${file}: no charset meta`);
    html = html.replace('<meta charSet="utf-8"/>', `<meta charSet="utf-8"/>${csp}`);
    fs.writeFileSync(file, html);
  }
  console.log(`postbuild: ${all.length} pages, ${twins.length} Markdown twins, llms.txt`);
}

main();
