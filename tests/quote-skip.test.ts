/**
 * match-quotes skips a quote only while its "exact" record still describes the check that would
 * run now (pipeline/lib/quote-source.ts). QUOTE_SKIP_MODULE=/abs/path.ts runs these on another copy.
 */
import { describe, expect, it } from "vitest";
import type { QuoteCheck } from "../src/lib/validate";

type Mod = typeof import("../pipeline/lib/quote-source");
const { exactStillHolds } = (await import(process.env.QUOTE_SKIP_MODULE ?? "../pipeline/lib/quote-source")) as Mod;

const ARCHIVED = "https://web.archive.org/web/20201127000000/https://example.org/report";
const RAW = "https://web.archive.org/web/20201127000000id_/https://example.org/report";
const exact = (over: Partial<QuoteCheck> = {}): QuoteCheck => ({
  position: 0,
  source: "s1",
  fetched: RAW,
  checked: "2026-10-01",
  result: "exact",
  ...over,
});
const s1 = { id: "s1", url: "https://example.org/report", archive_url: ARCHIVED };

describe("exactStillHolds", () => {
  it("holds for the same source fetched from the same address", () => {
    expect(exactStillHolds(exact(), s1)).toBe(true);
  });

  it("does not hold once the quote points at another source", () => {
    const s2 = { id: "s2", url: "https://example.org/other" };
    expect(exactStillHolds(exact(), s2)).toBe(false);
  });

  it("does not hold when the source's url changed", () => {
    expect(exactStillHolds(exact(), { id: "s1", url: "https://example.org/moved" })).toBe(false);
  });

  it("does not hold when a live-page check has since been archived", () => {
    expect(exactStillHolds(exact({ fetched: s1.url }), s1)).toBe(false);
  });

  it("never holds for a result other than exact", () => {
    expect(exactStillHolds(exact({ result: "close" }), s1)).toBe(false);
    expect(exactStillHolds(undefined, s1)).toBe(false);
  });

  it("matches an X post by its fxtwitter address", () => {
    const x = { id: "s1", url: "https://x.com/someone/status/123" };
    expect(exactStillHolds(exact({ fetched: "https://api.fxtwitter.com/status/123" }), x)).toBe(true);
    expect(exactStillHolds(exact({ fetched: "https://api.fxtwitter.com/status/999" }), x)).toBe(false);
    // Checked straight from x.com before posts went through fxtwitter: still the same source.
    expect(exactStillHolds(exact({ fetched: x.url }), x)).toBe(true);
  });

  it("matches an archive.org item by its download prefix", () => {
    const item = { id: "s1", url: "https://archive.org/details/in.ernet.dli.2015.1234" };
    const fetched = "https://archive.org/download/in.ernet.dli.2015.1234/book_djvu.txt";
    expect(exactStillHolds(exact({ fetched }), item)).toBe(true);
  });
});
