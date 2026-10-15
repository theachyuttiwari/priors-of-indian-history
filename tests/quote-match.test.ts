import { describe, expect, it } from "vitest";
import { decodeEntities, findQuote, htmlToText, normalise, quoteKey } from "@/lib/quote-match";
import { checkEntry, quoteKeySync, type QuoteCheck, type QuoteChecks } from "@/lib/validate";
import { entry } from "./fixtures";

const page = `<html><head><style>p{}</style><script>var q = "not in text";</script></head>
<body><p>The minister said: &ldquo;We will not allow the march to enter Delhi&rdquo; &mdash; and left.</p>
<p>Later he added that talks were “open at any time”.</p></body></html>`;
const text = htmlToText(page);

describe("htmlToText", () => {
  it("drops scripts and styles and decodes entities", () => {
    expect(text).not.toContain("not in text");
    expect(text).toContain("“We will not allow the march to enter Delhi”");
  });

  it("does not treat <!-- inside a style block as the start of a comment", () => {
    const html = `<style><!--<!-- p{} </style><p>The article text.</p><!-- real comment -->`;
    expect(htmlToText(html)).toContain("The article text.");
    expect(htmlToText(html)).not.toContain("real comment");
  });

  it("joins an inline tag inside a word, but keeps block tags apart", () => {
    const t = htmlToText(`<p>talk to the C<a href="/x">entre</a> now</p><p>Next</p>`);
    expect(findQuote("talk to the Centre now", t).status).toBe("exact");
    expect(t).toMatch(/now\s+Next/);
  });

  it("reads article text shipped only in JSON-LD", () => {
    const body = "The commissioner said the order would stay in force until the situation returned to normal.";
    const html = `<script type="application/ld+json">{"@type":"NewsArticle","articleBody":"${body}"}</script>`;
    expect(findQuote("the order would stay in force", htmlToText(html)).status).toBe("exact");
  });

  it("decodes numeric entities", () => {
    expect(decodeEntities("&#8377;100 &#x2014; done")).toBe("₹100 — done");
  });
});

describe("normalise", () => {
  it("folds curly quotes, dashes, case and spaces", () => {
    expect(normalise("“Open”  —  NOW’s")).toBe(`"open" - now's`);
  });
});

describe("findQuote", () => {
  it("finds an exact quote whatever the quote style", () => {
    expect(findQuote('"We will not allow the march to enter Delhi"', text).status).toBe("exact");
  });

  it("finds each part of a quote with an ellipsis, in order", () => {
    expect(findQuote("We will not allow ... enter Delhi", text).status).toBe("exact");
    expect(findQuote("enter Delhi ... We will not allow", text).status).not.toBe("exact");
  });

  it("reports a one-word change as close, with the passage", () => {
    const r = findQuote("We will never allow the march to enter Delhi", text);
    expect(r.status).toBe("close");
    expect(r.status !== "exact" && r.passage).toContain("we will not allow the march");
  });

  it("reports words that are not in the source as missing", () => {
    expect(findQuote("The protest was illegal and must end today", text).status).toBe("missing");
  });
});

describe("quoteKey", () => {
  it("ignores cosmetic differences and changes when the words change", async () => {
    expect(await quoteKey("“Open at any time”")).toBe(await quoteKey('"open at any time"'));
    expect(await quoteKey("open at any time")).not.toBe(await quoteKey("open at all times"));
  });
});

describe("quote checks in the validator", () => {
  const e = entry({
    positions: [
      {
        party: "P",
        in_power: true,
        statement: "Said talks were open.",
        sources: ["s1"],
        kind: "verbatim",
        quote: { text: "open at any time", source: "s1" },
      },
    ],
  });
  const FILE = "precedents/test-protest-2020.yaml";
  const check = (result: QuoteCheck["result"], source = "s1"): QuoteChecks => ({
    "test-protest-2020": {
      [quoteKeySync("open at any time")]: { position: 0, source, fetched: "u", checked: "2026-10-15", result },
    },
  });
  const unchecked = (checks: QuoteChecks) =>
    checkEntry(FILE, e, checks)
      .todos.filter((t) => t.rule === "quote-unchecked")
      .map((t) => t.message);

  it("computes the same key in Node and in the browser", async () => {
    expect(quoteKeySync("“Open at any time”")).toBe(await quoteKey("“Open at any time”"));
  });

  it("passes a quote with an exact match on record", () => {
    expect(unchecked(check("exact"))).toEqual([]);
  });

  it("flags a quote with no record, a close match, or a match against another source", () => {
    expect(unchecked({})).toEqual(["positions[0].quote: not yet matched against its source"]);
    expect(unchecked(check("close"))).toEqual(["positions[0].quote: close in s1 on 2026-10-15"]);
    expect(unchecked(check("exact", "s2"))).toEqual(["positions[0].quote: matched against s2, but cites s1"]);
  });
});
