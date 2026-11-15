import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  allowedHashes,
  cspFor,
  find,
  inlineScriptHashes,
  numbers,
  parse,
  stripLinkTargets,
  toMarkdown,
  visibleText,
} from "../pipeline/lib/static-html";
import { hasTwin, isNotFound } from "../pipeline/lib/out-pages";
import { AI_AGENTS, robotsTxt } from "../src/lib/robots";

const BASE = "https://example.org/site/precedents/x/";
const PAGE = `<!DOCTYPE html><html><head><meta charSet="utf-8"/><title>X · Priors</title>
<script>self.__next_f=[1]</script><script type="application/ld+json">{"a":1}</script>
<script src="/a.js" async=""></script></head><body><main>
<a href="/site/precedents/">Precedents</a>
<h1>Farm laws protest, 2020-2021</h1>
<div class="strip"><a class="tick" href="/site/precedents/y/"><i></i><span class="tip">1974 JP</span></a></div>
<a class="row" href="/site/precedents/z/"><span>2011</span><span>Row title</span></a>
<p><span class="num">26<!-- --> precedents</span><span>202 actions</span>, <a href="/site/about/#sources">5 claims</a> held back.</p>
<details><summary><span>More</span><span>Less</span> · 4 sources</summary><p>Inside, 11 rounds.</p></details>
<ul><li>Tear gas <a href="https://a.example/b_(c)">[3]</a></li></ul>
<table><thead><tr><th>Party</th><th>Cases</th></tr></thead><tbody><tr><td>BJP</td><td>12</td></tr></tbody></table>
<select><option>1999</option></select><div data-twin="skip"><p>Phone view 7777</p></div>
<blockquote><p>A quote of 1 line.</p><footer>Speaker, 16 May 2006</footer></blockquote>
</main><footer><p>Last updated <time>15 Oct 2026</time>.</p></footer></body></html>`;

describe("Markdown twins", () => {
  const doc = parse(PAGE);
  const main = find(doc, (e) => e.tag === "main")!;
  const md = toMarkdown(main, BASE);

  it("keeps headings, lists, tables, quotes and absolute links", () => {
    expect(md).toContain("# Farm laws protest, 2020-2021");
    expect(md).toContain("[Precedents](https://example.org/site/precedents/)");
    expect(md).toContain("26 precedents 202 actions, [5 claims](https://example.org/site/about/#sources) held back.");
    expect(md).toContain("- Tear gas [[3]](https://a.example/b_%28c%29)");
    expect(md).toContain("| Party | Cases |\n| --- | --- |\n| BJP | 12 |");
    expect(md).toContain("> A quote of 1 line.");
    expect(md).toContain("- [2011 Row title](https://example.org/site/precedents/z/)");
    expect(md).toContain("Inside, 11 rounds.");
  });

  it("leaves out the year strip, form controls and More/Less toggles", () => {
    expect(md).not.toContain("1974");
    expect(md).not.toContain("1999");
    expect(md).not.toContain("7777");
    expect(md).not.toContain("More");
  });

  it("carries exactly the numbers the page shows", () => {
    expect(numbers(stripLinkTargets(md))).toEqual(numbers(visibleText(main)));
  });

  it("would catch a stale twin", () => {
    const stale = md.replace("202 actions", "201 actions");
    expect(numbers(stripLinkTargets(stale))).not.toEqual(numbers(visibleText(main)));
  });
});

describe("Content-Security-Policy", () => {
  it("hashes the inline script the browser runs, not the JSON-LD data block or external scripts", () => {
    const want = `'sha256-${createHash("sha256").update("self.__next_f=[1]").digest("base64")}'`;
    expect(inlineScriptHashes(PAGE)).toEqual([want]);
    expect(cspFor(PAGE)).toContain(`script-src 'self' ${want}`);
    expect(cspFor(PAGE)).not.toMatch(/script-src[^;]*unsafe-inline/);
  });

  it("reads back the hashes a page allows, so a drifted script fails the check", () => {
    const meta = `<meta http-equiv="Content-Security-Policy" content="${cspFor(PAGE)}"/>`;
    const page = PAGE.replace('<meta charSet="utf-8"/>', `<meta charSet="utf-8"/>${meta}`);
    expect(allowedHashes(page)).toEqual(inlineScriptHashes(PAGE));
    const drifted = page.replace("self.__next_f=[1]", "self.__next_f=[2]");
    expect(inlineScriptHashes(drifted).every((h) => allowedHashes(drifted).includes(h))).toBe(false);
  });
});

describe("pages and robots.txt", () => {
  it("gives twins to section pages and entries, not to action pages", () => {
    expect(hasTwin("/")).toBe(true);
    expect(hasTwin("/precedents/farm-laws-2020/")).toBe(true);
    expect(hasTwin("/precedents/farm-laws-2020/actions/2020-11-26-tear-gas/")).toBe(false);
    expect(isNotFound("/404")).toBe(true);
  });

  it("allows every crawler and names each AI agent", () => {
    const txt = robotsTxt("https://example.org/site");
    expect(txt).toContain("User-agent: *\nAllow: /");
    for (const a of AI_AGENTS) expect(txt).toContain(`User-agent: ${a}\n`);
    expect(txt.match(/Content-Signal: search=yes, ai-input=yes, ai-train=yes/g)).toHaveLength(2);
    expect(txt).toContain("Content-Signal: search=yes, ai-input=yes, ai-train=yes");
    expect(txt).toContain("Sitemap: https://example.org/site/sitemap.xml");
    expect(txt).not.toMatch(/Disallow/);
  });
});
