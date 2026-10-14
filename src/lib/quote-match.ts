/**
 * Check that a quote appears word for word in its source (decision B, research 4.5).
 * Matching proves the words are in the source. It cannot prove they were not clipped
 * or that the source gives them to the right person; a reviewer checks that.
 */

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
  hellip: "…",
  rupee: "₹",
};

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/** Visible text of an HTML page. Good enough for matching, not for display. */
export function htmlToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<(br|\/p|\/div|\/li|\/h\d)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  );
}

/**
 * Fold differences that do not change the words: Unicode form, curly quotes, dashes,
 * ellipses, zero-width characters, case and whitespace.
 */
export function normalise(s: string): string {
  return s
    .normalize("NFC")
    .replace(/[​-‍﻿­]/g, "")
    .replace(/[‘’‚‛′`´]/g, "'")
    .replace(/[“”„‟″]/g, '"')
    .replace(/[‐‑‒–—―−]/g, "-")
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function words(s: string): string[] {
  return normalise(s)
    .replace(/[^\p{L}\p{N}' ]+/gu, " ")
    .split(" ")
    .filter(Boolean);
}

export type MatchResult =
  | { status: "exact" }
  | { status: "close"; score: number; passage: string }
  | { status: "missing"; score: number; passage: string };

/** Share of quote words that a fuzzy match needs before it counts as close. */
export const CLOSE_AT = 0.85;

/**
 * Exact if the normalised quote is a substring of the normalised text. Otherwise find the
 * window of the text with the most quote words in order-insensitive overlap, and report it.
 * A quote with an ellipsis is checked part by part: each part must appear, in order.
 */
export function findQuote(quote: string, text: string): MatchResult {
  const nt = normalise(text);
  const parts = normalise(quote)
    .split(/\s*\.\.\.\s*|\s*\[\.\.\.\]\s*/)
    .map((p) => p.replace(/^["']|["']$/g, "").trim())
    .filter(Boolean);
  let at = 0;
  let exact = parts.length > 0;
  for (const p of parts) {
    const i = nt.indexOf(p, at);
    if (i < 0) {
      exact = false;
      break;
    }
    at = i + p.length;
  }
  if (exact) return { status: "exact" };

  const q = words(quote);
  const t = words(text);
  if (!q.length || !t.length) return { status: "missing", score: 0, passage: "" };
  const need = new Map<string, number>();
  for (const w of q) need.set(w, (need.get(w) ?? 0) + 1);
  let best = 0;
  let bestAt = 0;
  const win = q.length;
  const have = new Map<string, number>();
  let hits = 0;
  const add = (w: string, d: number) => {
    const before = Math.min(have.get(w) ?? 0, need.get(w) ?? 0);
    have.set(w, (have.get(w) ?? 0) + d);
    hits += Math.min(have.get(w)!, need.get(w) ?? 0) - before;
  };
  for (let i = 0; i < t.length; i++) {
    add(t[i], 1);
    if (i >= win) add(t[i - win], -1);
    if (hits > best) {
      best = hits;
      bestAt = Math.max(0, i - win + 1);
    }
  }
  const score = best / q.length;
  const passage = t.slice(bestAt, bestAt + win).join(" ");
  return score >= CLOSE_AT ? { status: "close", score, passage } : { status: "missing", score, passage };
}

/** Stable key for a quote: changes when the quoted words change, so an edit voids its check. */
export async function quoteKey(text: string): Promise<string> {
  const data = new TextEncoder().encode(normalise(text));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);
}
