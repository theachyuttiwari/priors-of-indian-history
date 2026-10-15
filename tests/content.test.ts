/** Rules applied to the real content in content/. These guard the counting logic the site shows. */
import { describe, expect, it } from "vitest";
import { actionParties, getCurrent, getPrecedents, matrix, partyRecord, similar } from "@/lib/content";
import { Precedent } from "@/lib/schema";
import { entry } from "./fixtures";

const p = Precedent.parse(entry());
const centreOnly = Precedent.parse(entry({ government: { centre: { party: "Centre Party" } } }));

describe("actionParties", () => {
  it("counts centre actions for the party ruling the Centre on the action date", () => {
    expect(actionParties(p, { actor: "centre", state: [], date: "2020-01-02" })).toEqual(["BJP"]);
    expect(actionParties(p, { actor: "centre", state: [], date: "1976-01-01" })).toEqual(["INC"]);
  });

  it("uses the entry period start when the action has no date", () => {
    expect(actionParties(p, { actor: "centre", state: [] })).toEqual(["BJP"]);
  });

  it("counts state actions for the party ruling each state named", () => {
    expect(actionParties(p, { actor: "state", state: ["Kerala"], date: "2018-01-01" })).toEqual(["CPI(M)"]);
    expect(actionParties(p, { actor: "police", state: ["Kerala", "Gujarat"], date: "2018-01-01" })).toEqual([
      "CPI(M)",
      "BJP",
    ]);
  });

  it("counts Delhi Police for the party ruling the Centre, and the Delhi government for its own party", () => {
    expect(actionParties(p, { actor: "police", state: ["Delhi"], date: "2012-12-22" })).toEqual(["INC"]);
    expect(actionParties(p, { actor: "police", state: ["Delhi"], date: "2020-01-05" })).toEqual(["BJP"]);
    expect(actionParties(p, { actor: "state", state: ["Delhi"], date: "2020-01-05" })).toEqual(["AAP"]);
  });

  it("falls back to the entry's government block when no state is named or the table has no answer", () => {
    expect(actionParties(p, { actor: "state", state: [] })).toEqual(["State Party"]);
    expect(actionParties(p, { actor: "police", state: ["Somestate"] })).toEqual(["State Party"]);
    expect(actionParties(centreOnly, { actor: "police", state: [] })).toEqual(["Centre Party"]);
  });

  it("counts court and other actions for nobody", () => {
    expect(actionParties(p, { actor: "court", state: [] })).toEqual([]);
    expect(actionParties(p, { actor: "other", state: ["Kerala"] })).toEqual([]);
  });
});

describe("loaded content", () => {
  it("loads precedents oldest first and current events newest first", () => {
    const starts = getPrecedents().map((x) => x.period.start);
    expect(starts).toEqual([...starts].sort());
    const now = getCurrent().map((x) => x.period.start);
    expect(now).toEqual([...now].sort().reverse());
  });

  it("has unique ids across precedents and current events", () => {
    const ids = [...getPrecedents(), ...getCurrent()].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("matrix", () => {
  const m = matrix();

  it("has no party row without an attributed action", () => {
    for (const party of m.parties) expect(Object.values(m.cells[party]).some((n) => n > 0)).toBe(true);
  });

  it("has no empty action column", () => {
    for (const t of m.types) expect(m.parties.some((party) => m.cells[party][t] > 0)).toBe(true);
  });

  it("matches each party record", () => {
    for (const party of m.parties) expect(m.cells[party]).toEqual(partyRecord(party).actions);
  });

  it("reports the largest cell as max", () => {
    const all = m.parties.flatMap((party) => Object.values(m.cells[party]));
    expect(m.max).toBe(Math.max(...all));
  });
});

describe("similar", () => {
  for (const ev of getCurrent()) {
    it(`ranks precedents for ${ev.id} by score`, () => {
      const r = similar(ev, 10);
      const scores = r.map((x) => x.score);
      expect(scores).toEqual([...scores].sort((a, b) => b - a));
      expect(scores.every((s) => s > 0)).toBe(true);
    });
  }
});
