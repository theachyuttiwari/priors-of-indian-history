import { describe, expect, it } from "vitest";
import { flagFor } from "../src/lib/party-flags";

const DRAWN = [
  "BJP",
  "INC",
  "CPI(M)",
  "CPI",
  "BJD",
  "AIADMK",
  "NC",
  "TMC",
  "BRS",
  "DMK",
  "JD(U)",
  "JMM",
  "PMK",
  "TDP",
  "BSP",
];

describe("party flags", () => {
  it("gives every drawn flag valid colours and at least one source", () => {
    for (const party of DRAWN) {
      const f = flagFor(party)!;
      expect(f, party).toBeDefined();
      expect(f.bands.length).toBeGreaterThan(0);
      for (const b of f.bands) expect(b.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(f.sources.every((s) => s.startsWith("https://"))).toBe(true);
    }
  });

  it("draws no flag for parties without a sourced one", () => {
    for (const party of ["AAP", "RJD", "SS", "PDP", "Janata Dal", "Janata Party"])
      expect(flagFor(party)).toBeUndefined();
  });

  it("maps content spellings of PMK to one flag", () => {
    expect(flagFor("Pattali Makkal Katchi (PMK)")).toBe(flagFor("PMK"));
    expect(flagFor("other (Pattali Makkal Katchi)")).toBe(flagFor("PMK"));
  });
});
