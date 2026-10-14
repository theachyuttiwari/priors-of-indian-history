/** Rules applied to the real content in content/. These guard the counting logic the site shows. */
import { describe, expect, it } from "vitest";
import { actionParties, getCurrent, getPrecedents, matrix, partyRecord, similar } from "@/lib/content";
import { Precedent } from "@/lib/schema";
import { entry } from "./fixtures";

const p = Precedent.parse(entry());
const centreOnly = Precedent.parse(entry({ government: { centre: { party: "Centre Party" } } }));

describe("actionParties", () => {
  it("counts centre actions for the centre party", () => {
    expect(actionParties(p, "centre")).toEqual(["Centre Party"]);
  });

  it("counts state and police actions for the state party", () => {
    expect(actionParties(p, "state")).toEqual(["State Party"]);
    expect(actionParties(p, "police")).toEqual(["State Party"]);
  });

  it("counts state actions for the centre where no state government is recorded", () => {
    expect(actionParties(centreOnly, "police")).toEqual(["Centre Party"]);
  });

  it("counts court actions for nobody", () => {
    expect(actionParties(p, "court")).toEqual([]);
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
