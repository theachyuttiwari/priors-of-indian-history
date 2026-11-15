/**
 * Small, dependency-free tools for the exported HTML in out/: a tolerant parser for the HTML Next writes,
 * a Markdown renderer for the Markdown twins, the numbers check for those twins, and the CSP hashes.
 * Used by pipeline/postbuild.ts and pipeline/verify-out.ts, and tested in tests/static-html.test.ts.
 */
import { createHash } from "node:crypto";

export type Node =
  { kind: "text"; text: string } | { kind: "el"; tag: string; attrs: Record<string, string>; children: Node[] };

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const RAW = new Set(["script", "style"]);

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#[0-9]+|amp|lt|gt|quot|apos|nbsp);/gi, (_, e: string) => {
    const k = e.toLowerCase();
    if (k[0] === "#") return String.fromCodePoint(k[1] === "x" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }[k] ?? "";
  });
}

function parseAttrs(s: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of s.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

/** Parse HTML into a tree. Tolerant: unknown closing tags are ignored, open tags close at their parent's end. */
export function parse(html: string): Node {
  const root: Node = { kind: "el", tag: "#root", attrs: {}, children: [] };
  const stack: Extract<Node, { kind: "el" }>[] = [root];
  const re =
    /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>|[^<]+|</gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    const tok = m[0];
    if (tok.startsWith("<!")) continue;
    if (!m[2]) {
      top.children.push({ kind: "text", text: decodeEntities(tok) });
      continue;
    }
    const tag = m[2].toLowerCase();
    if (m[1]) {
      const i = stack.map((n) => n.tag).lastIndexOf(tag);
      if (i > 0) stack.length = i;
      continue;
    }
    const el: Extract<Node, { kind: "el" }> = { kind: "el", tag, attrs: parseAttrs(m[3]), children: [] };
    top.children.push(el);
    if (RAW.has(tag)) {
      const end = html.toLowerCase().indexOf(`</${tag}`, re.lastIndex);
      const stop = end < 0 ? html.length : end;
      el.children.push({ kind: "text", text: html.slice(re.lastIndex, stop) });
      re.lastIndex = stop;
      continue;
    }
    if (!VOID.has(tag) && !m[4]) stack.push(el);
  }
  return root;
}

export function find(
  n: Node,
  pred: (el: Extract<Node, { kind: "el" }>) => boolean,
): Extract<Node, { kind: "el" }> | undefined {
  if (n.kind !== "el") return undefined;
  if (pred(n)) return n;
  for (const c of n.children) {
    const f = find(c, pred);
    if (f) return f;
  }
  return undefined;
}

/**
 * Parts of the page a twin leaves out: code, styles, drawings, form controls and More/Less toggles (they do
 * nothing in a text copy), and the year strip, whose ticks repeat the list of precedents that follows it.
 */
export function skipped(n: Node): boolean {
  if (n.kind !== "el") return false;
  if (
    [
      "script",
      "style",
      "svg",
      "select",
      "option",
      "input",
      "button",
      "noscript",
      "template",
      "label",
      "summary",
    ].includes(n.tag)
  )
    return true;
  if ("hidden" in n.attrs || n.attrs["data-twin"] === "skip") return true;
  return (n.attrs.class ?? "").split(/\s+/).includes("strip");
}

/** All the text a reader sees in a subtree (skipping what twins skip), as one string. */
export function visibleText(n: Node): string {
  if (n.kind === "text") return n.text;
  if (skipped(n)) return "";
  return n.children.map(visibleText).join(" ");
}

/** The numbers in a text, as a sorted list of digit runs ("1,200" gives 1 and 200; "2020-21" gives 2020 and 21). */
export function numbers(text: string): string[] {
  return (text.match(/\d+/g) ?? []).sort();
}

const BLOCK = new Set([
  "address",
  "article",
  "aside",
  "blockquote",
  "dd",
  "details",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "footer",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "li",
  "main",
  "nav",
  "ol",
  "p",
  "section",
  "summary",
  "table",
  "tbody",
  "thead",
  "tfoot",
  "tr",
  "ul",
]);

/** A link that is a whole row or card (it holds blocks, or two or more elements): it gets its own line. */
function isRowLink(n: Node): boolean {
  if (n.kind !== "el" || n.tag !== "a" || !n.attrs.href) return false;
  const els = n.children.filter((c) => c.kind === "el" && !skipped(c));
  return els.length >= 2 || n.children.some(isBlock);
}

function isBlock(n: Node): boolean {
  return n.kind === "el" && (BLOCK.has(n.tag) || isRowLink(n) || n.children.some(isBlock));
}

/** An absolute link target that is safe inside Markdown's (...): brackets and spaces percent-encoded. */
function absolute(href: string, base: string): string {
  let u = href;
  try {
    u = new URL(href, base).href;
  } catch {
    /* keep as written */
  }
  return u.replace(/\(/g, "%28").replace(/\)/g, "%29").replace(/ /g, "%20");
}

/** Inline content as one line of Markdown. */
function inline(nodes: Node[], base: string): string {
  let out = "";
  for (const n of nodes) {
    let piece: string;
    if (n.kind === "text") piece = n.text.replace(/\s+/g, " ");
    else if (skipped(n)) continue;
    else if (n.tag === "br") piece = " ";
    else if (n.tag === "a" && n.attrs.href) {
      const text = inline(n.children, base).trim();
      piece = text ? `[${text}](${absolute(n.attrs.href, base)})` : "";
    } else if (n.tag === "strong" || n.tag === "b") {
      const t = inline(n.children, base).trim();
      piece = t ? `**${t}**` : "";
    } else if (n.tag === "em" || n.tag === "i") {
      const t = inline(n.children, base).trim();
      piece = t ? `*${t}*` : "";
    } else piece = inline(n.children, base);
    // Separate two elements that touch without a space, such as a year span followed by a title span.
    if (n.kind === "el" && /[\p{L}\p{N}.)]$/u.test(out) && /^[\p{L}\p{N}([]/u.test(piece)) out += " ";
    out += piece;
  }
  return out;
}

/** A subtree as Markdown blocks. */
export function toMarkdown(n: Node, base: string): string {
  const blocks: string[] = [];
  const walk = (node: Node, quote: number): void => {
    if (node.kind === "text") {
      const t = node.text.replace(/\s+/g, " ").trim();
      if (t) blocks.push("> ".repeat(quote) + t);
      return;
    }
    if (skipped(node)) return;
    const prefix = "> ".repeat(quote);
    const t = node.tag;
    if (/^h[1-6]$/.test(t)) {
      const s = inline(node.children, base).trim();
      if (s) blocks.push(`${"#".repeat(+t[1])} ${s}`);
      return;
    }
    if (t === "tr") {
      const cells = node.children.filter((c) => c.kind === "el" && (c.tag === "td" || c.tag === "th"));
      const row = cells.map((c) =>
        inline((c as Extract<Node, { kind: "el" }>).children, base)
          .trim()
          .replace(/\|/g, "\\|"),
      );
      blocks.push(`${prefix}| ${row.join(" | ")} |`);
      const head = cells.length > 0 && cells.every((c) => (c as Extract<Node, { kind: "el" }>).tag === "th");
      if (head) blocks.push(`${prefix}|${row.map(() => " --- |").join("")}`);
      return;
    }
    if (t === "blockquote") {
      for (const c of node.children) walk(c, quote + 1);
      return;
    }
    const lead = t === "li" ? "- " : "";
    const strong = t === "dt" || t === "summary";
    if (isRowLink(node)) {
      const s = inline(node.children, base).replace(/\s+/g, " ").trim();
      if (s) blocks.push(`${prefix}- [${s}](${absolute(node.attrs.href, base)})`);
      return;
    }
    if (!node.children.some(isBlock) || !BLOCK.has(t)) {
      if (!BLOCK.has(t) && node.children.some(isBlock)) {
        for (const c of node.children) walk(c, quote);
        return;
      }
      const s = inline(node.children, base).trim();
      if (s) blocks.push(prefix + lead + (strong ? `**${s}**` : s));
      return;
    }
    // A block holding blocks: flush runs of inline children as their own paragraph.
    let run: Node[] = [];
    const flush = () => {
      const s = inline(run, base).trim();
      if (s) blocks.push(prefix + lead + s);
      run = [];
    };
    for (const c of node.children) {
      if (isBlock(c)) {
        flush();
        walk(c, quote);
      } else run.push(c);
    }
    flush();
  };
  walk(n, 0);
  // Table rows sit on adjacent lines; every other block is a paragraph.
  const isRow = (b: string) => /^(> )*\|/.test(b);
  return blocks.map((b, i) => (i === 0 ? "" : isRow(b) && isRow(blocks[i - 1]) ? "\n" : "\n\n") + b).join("") + "\n";
}

/** Markdown text with link targets removed, for the numbers check. */
export function stripLinkTargets(md: string): string {
  return md.replace(/\]\([^)\s]*\)/g, "]").replace(/\((?:https?:\/\/)[^)\s]*\)/g, "");
}

/** sha256 hashes, CSP form, of every inline script that the browser runs (data blocks such as JSON-LD excluded). */
export function inlineScriptHashes(html: string): string[] {
  const out: string[] = [];
  for (const m of html.matchAll(/<script((?:[^>"']|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = parseAttrs(m[1]);
    if (attrs.src !== undefined) continue;
    const type = (attrs.type ?? "").toLowerCase();
    if (type && !["text/javascript", "module", "application/javascript"].includes(type)) continue;
    out.push(`'sha256-${createHash("sha256").update(m[2], "utf8").digest("base64")}'`);
  }
  return [...new Set(out)];
}

/** The Content-Security-Policy for one page. GitHub Pages cannot send headers, so it goes in a meta tag. */
export function cspFor(html: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' ${inlineScriptHashes(html).join(" ")}`.trim(),
    // React and Next write style attributes; style hashes cannot cover those.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

/** The script-src hashes a page's CSP meta tag allows. */
export function allowedHashes(html: string): string[] {
  const m = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/i);
  if (!m) return [];
  return decodeEntities(m[1]).match(/'sha256-[^']+'/g) ?? [];
}
