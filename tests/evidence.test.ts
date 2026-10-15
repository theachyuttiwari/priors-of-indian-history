import { describe, expect, it } from "vitest";
import {
  claimOf,
  holdBack,
  independenceKey,
  isLeadUrl,
  leadOnly,
  meetsMinimum,
  mentionsCount,
  tierOf,
} from "@/lib/evidence";
import type { Source, Tier, Wire } from "@/lib/schema";

let n = 0;
function src(tier: Tier | undefined, publisher = `Paper ${++n}`, extra: Partial<Source> = {}): Source {
  return {
    id: `s${n}`,
    title: "t",
    publisher,
    url: `https://example${n}.org/a`,
    type: "news",
    language: "en",
    tier,
    ...extra,
  } as Source;
}
const wire = (w: Wire, publisher: string) => src("secondary", publisher, { wire: w });

describe("lead sources", () => {
  it("treats Wikipedia, its language editions and fact-checkers as leads", () => {
    expect(isLeadUrl("https://en.wikipedia.org/wiki/Emergency_(India)")).toBe(true);
    expect(isLeadUrl("https://hi.wikipedia.org/wiki/x")).toBe(true);
    expect(isLeadUrl("https://www.altnews.in/x")).toBe(true);
    expect(isLeadUrl("https://www.thequint.com/news/webqoof/x")).toBe(true);
  });

  it("does not treat news or look-alike hosts as leads", () => {
    expect(isLeadUrl("https://www.thequint.com/news/india/x")).toBe(false);
    expect(isLeadUrl("https://notwikipedia.org/x")).toBe(false);
  });

  it("makes a lead URL tier lead whatever tier was set", () => {
    expect(tierOf(src("report", "Wikipedia", { url: "https://en.wikipedia.org/wiki/x" }))).toBe("lead");
  });

  it("flags a claim whose only sources are leads", () => {
    const wiki = src(undefined, "Wikipedia", { url: "https://en.wikipedia.org/wiki/x" });
    expect(leadOnly([wiki])).toBe(true);
    expect(leadOnly([wiki, src("report")])).toBe(false);
    expect(leadOnly([])).toBe(false);
  });
});

describe("claimOf", () => {
  it("infers ordered, happened and held", () => {
    expect(claimOf({ type: "section_144", actor: "state" })).toBe("ordered");
    expect(claimOf({ type: "lathi_charge", actor: "police" })).toBe("happened");
    expect(claimOf({ type: "other", actor: "court" })).toBe("held");
  });

  it("lets the entry override the inferred kind", () => {
    expect(claimOf({ type: "detention", actor: "state", claim: "ordered" })).toBe("ordered");
  });
});

describe("independence", () => {
  it("counts copies of one wire story once", () => {
    expect(independenceKey(wire("PTI", "The Tribune"))).toBe(independenceKey(wire("PTI", "The Week")));
  });

  it("counts different publishers separately", () => {
    expect(independenceKey(src("report", "Scroll"))).not.toBe(independenceKey(src("report", "The Wire")));
  });
});

describe("meetsMinimum", () => {
  it("accepts the order itself for an ordered claim", () => {
    expect(meetsMinimum("ordered", [src("record")]).ok).toBe(true);
  });

  it("accepts two independent named reports for a physical event", () => {
    expect(meetsMinimum("happened", [src("report", "Scroll"), src("report", "The Hindu")]).ok).toBe(true);
  });

  it("rejects one report for a physical event", () => {
    expect(meetsMinimum("happened", [src("report")]).ok).toBe(false);
  });

  it("does not count wire copy or two reports from one publisher as independent", () => {
    expect(meetsMinimum("happened", [src("report", "Scroll"), src("report", "Scroll")]).ok).toBe(false);
    expect(meetsMinimum("happened", [wire("PTI", "A"), wire("PTI", "B")]).ok).toBe(false);
  });

  it("does not let an official record settle a contested physical event alone", () => {
    expect(meetsMinimum("happened", [src("record")]).ok).toBe(false);
  });

  it("needs the judgment for what a court held", () => {
    expect(meetsMinimum("held", [src("report"), src("report")]).ok).toBe(false);
    expect(meetsMinimum("held", [src("court")]).ok).toBe(true);
  });

  it("accepts a recording for what a person said", () => {
    expect(meetsMinimum("said", [src("recording")]).ok).toBe(true);
    expect(meetsMinimum("said", [src("secondary")]).ok).toBe(false);
  });

  it("reports how many sources still lack a tier", () => {
    const v = meetsMinimum("happened", [src(undefined), src(undefined)]);
    expect(v.ok).toBe(false);
    expect(!v.ok && v.untiered).toBe(2);
  });
});

describe("holdBack", () => {
  const record = src("record");
  const one = src("report");
  const action = (sources: string[]) =>
    ({ type: "section_144", date: "2020-01-02", description: "d", actor: "state", sources }) as never;
  const p = {
    sources: [record, one],
    actions: [action([record.id]), action([one.id])],
    positions: [{ sources: [record.id] }, { sources: [one.id] }],
  };

  it("drops claims below their minimum and counts them", () => {
    const { entry, held } = holdBack(p);
    expect(entry.actions).toHaveLength(1);
    expect(entry.positions).toEqual([{ sources: [record.id] }]);
    expect(held).toEqual({ actions: 1, positions: 1 });
    expect(entry.sources).toBe(p.sources);
  });
});

describe("mentionsCount", () => {
  it("spots casualty and detention counts", () => {
    expect(mentionsCount("Police firing killed 13 people")).toBe(true);
    expect(mentionsCount("13 people were killed in the firing")).toBe(true);
    expect(mentionsCount("About 1,500 supporters were detained")).toBe(true);
  });

  it("ignores dates and other numbers", () => {
    expect(mentionsCount("On 26 January 2021 the rally began")).toBe(false);
  });
});
