/** A minimal valid entry. Tests copy it and change one thing. */
export function entry(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: "test-protest-2020",
    title: "Test protest, 2020",
    summary: "A protest used in tests.",
    period: { start: "2020-01-01", end: "2020-02-01" },
    government: {
      centre: { party: "Centre Party" },
      state: { party: "State Party", name: "Somestate" },
    },
    actions: [
      { type: "section_144", date: "2020-01-02", description: "Order issued.", actor: "state", sources: ["s1"] },
    ],
    positions: [
      { party: "Centre Party", in_power: true, statement: "A statement.", sources: ["s1"], kind: "paraphrase" },
    ],
    sources: [{ id: "s1", title: "A report", publisher: "A paper", url: "https://example.org/a", tier: "record" }],
    ...overrides,
  };
}
