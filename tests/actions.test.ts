/** Action pages: stable links, the post text and the same-action rule. */
import { describe, expect, it } from "vitest";
import { actionSlugs, allActions, firstSentence, postText, sameActionElsewhere, xIntent } from "@/lib/actions";
import { Precedent } from "@/lib/schema";
import { entry } from "./fixtures";

describe("actionSlugs", () => {
  it("names each action by date and type, and numbers repeats", () => {
    const a = { type: "detention", date: "2020-01-02", description: "x", actor: "police", sources: ["s1"] };
    const p = Precedent.parse(entry({ actions: [a, a, { ...a, date: undefined, type: "section_144" }] }));
    expect(actionSlugs(p)).toEqual(["2020-01-02-detention", "2020-01-02-detention-2", "undated-section-144"]);
  });
});

describe("firstSentence", () => {
  it("keeps the first sentence and cuts long text at a word", () => {
    expect(firstSentence("Police detained 14. They were released.")).toBe("Police detained 14.");
    expect(firstSentence("Section 144 CrPC was imposed. Later lifted.")).toBe("Section 144 CrPC was imposed.");
    expect(firstSentence("one two three four five", 12)).toBe("one two…");
  });
});

describe("the real record", () => {
  const all = allActions();

  it("gives every action a unique link", () => {
    expect(new Set(all.map((x) => x.href)).size).toBe(all.length);
  });

  it("picks the same action elsewhere by rule: one per party, never from the same entry", () => {
    for (const x of all.slice(0, 40)) {
      const others = sameActionElsewhere(x);
      const parties = others.map((y) => y.by[0].party);
      expect(new Set(parties).size).toBe(parties.length);
      expect(others.every((y) => y.a.type === x.a.type && y.p.id !== x.p.id)).toBe(true);
    }
  });

  it("writes a post that fits on X with its link", () => {
    for (const x of all) {
      // X counts every link as 23 characters.
      expect(postText(x).length + 1 + 23).toBeLessThanOrEqual(280);
      expect(xIntent(x)).toMatch(/^https:\/\/x\.com\/intent\/post\?text=/);
    }
  });
});
