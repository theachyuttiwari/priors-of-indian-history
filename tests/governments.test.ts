/** Lookups by place and date in the government tables. Uses a small made-up table. */
import { describe, expect, it } from "vitest";
import { canonicalParty, centreParty, fullDate, stateParty, termAt, type Governments } from "@/lib/governments";
import { GovernmentFile } from "@/lib/schema";

const src = [{ id: "s", title: "List", publisher: "Assembly", url: "https://example.org", tier: "record" }];
const file = (raw: Record<string, unknown>) => GovernmentFile.parse({ sources: src, ...raw });

const centre = file({
  name: "Centre",
  terms: [
    { from: "1990-01-01", to: "1999-12-31", head: "A", party: "other (Indian National Congress (I))", sources: ["s"] },
    { from: "2000-01-01", head: "B", party: "Blue Party", sources: ["s"] },
  ],
});
const somestate = file({
  name: "Somestate",
  aliases: ["Oldname"],
  terms: [
    { from: "1995-01-01", to: "2004-12-31", head: "C", party: "Red Party", sources: ["s"] },
    { from: "2005-01-01", to: "2005-06-30", head: "President's Rule", kind: "presidents_rule", sources: ["s"] },
    { from: "2005-07-01", head: "D", party: "AITC", sources: ["s"] },
  ],
});
const capital = file({
  name: "Capital",
  police: "centre",
  terms: [{ from: "1995-01-01", head: "E", party: "Green Party", sources: ["s"] }],
});
const govs: Governments = new Map([
  ["Centre", centre],
  ["Somestate", somestate],
  ["Oldname", somestate],
  ["Capital", capital],
]);

describe("fullDate and termAt", () => {
  it("reads a year or a month as its first day", () => {
    expect(fullDate("2016")).toBe("2016-01-01");
    expect(fullDate("2016-02")).toBe("2016-02-01");
    expect(fullDate("2016-02-18")).toBe("2016-02-18");
  });

  it("finds the term in office, counting both end days", () => {
    expect(termAt(somestate, "2004-12-31")?.head).toBe("C");
    expect(termAt(somestate, "2005-01-01")?.head).toBe("President's Rule");
    expect(termAt(somestate, "2030-01-01")?.head).toBe("D");
    expect(termAt(somestate, "1990-01-01")).toBeUndefined();
  });
});

describe("canonicalParty", () => {
  it("maps other spellings to one label and leaves the rest alone", () => {
    expect(canonicalParty("other (Indian National Congress (I))")).toBe("INC");
    expect(canonicalParty("AITC")).toBe("TMC");
    expect(canonicalParty("other (Indian National Lok Dal)")).toBe("INLD");
    expect(canonicalParty("BJP")).toBe("BJP");
  });

  it("is applied when a table is parsed", () => {
    expect(centre.terms[0].party).toBe("INC");
  });
});

describe("centreParty and stateParty", () => {
  it("gives the party ruling the Centre", () => {
    expect(centreParty(govs, "1995-05-05")).toEqual({ ok: true, party: "INC", via: "centre" });
    expect(centreParty(govs, "1980-01-01").ok).toBe(false);
  });

  it("gives the party ruling a state, by name or alias", () => {
    expect(stateParty(govs, "Somestate", "2000-01-01", false)).toEqual({ ok: true, party: "Red Party", via: "state" });
    expect(stateParty(govs, "Oldname", "2010", true)).toEqual({ ok: true, party: "TMC", via: "state" });
  });

  it("counts President's Rule for the party ruling the Centre", () => {
    expect(stateParty(govs, "Somestate", "2005-03-01", false)).toEqual({
      ok: true,
      party: "Blue Party",
      via: "centre",
    });
  });

  it("counts police under the Centre for the Centre, and the government for itself", () => {
    expect(stateParty(govs, "Capital", "2001-01-01", true)).toEqual({ ok: true, party: "Blue Party", via: "centre" });
    expect(stateParty(govs, "Capital", "2001-01-01", false)).toEqual({ ok: true, party: "Green Party", via: "state" });
  });

  it("says why when there is no answer", () => {
    expect(stateParty(govs, "Nowhere", "2001-01-01", false)).toEqual({
      ok: false,
      reason: "no government table for Nowhere",
    });
    expect(stateParty(govs, "Somestate", "1990-01-01", false).ok).toBe(false);
  });
});
