import { describe, expect, it } from "vitest";
import { fmtDate, fmtPeriod, years } from "@/lib/format";

describe("fmtDate", () => {
  it("formats full, month and year precision", () => {
    expect(fmtDate("2020-11-26")).toBe("26 Nov 2020");
    expect(fmtDate("2020-11")).toBe("Nov 2020");
    expect(fmtDate("1975")).toBe("1975");
  });

  it("drops the leading zero from the day", () => {
    expect(fmtDate("2021-01-05")).toBe("5 Jan 2021");
  });

  it("returns an empty string for a missing date", () => {
    expect(fmtDate(undefined)).toBe("");
    expect(fmtDate(null)).toBe("");
  });
});

describe("fmtPeriod", () => {
  it("joins start and end", () => {
    expect(fmtPeriod({ start: "2020-11-26", end: "2021-12-11" })).toBe("26 Nov 2020 – 11 Dec 2021");
  });

  it("shows one date when start and end match", () => {
    expect(fmtPeriod({ start: "2018-05-22", end: "2018-05-22" })).toBe("22 May 2018");
  });

  it("marks a period with no end as ongoing", () => {
    expect(fmtPeriod({ start: "2026-03-01", end: null })).toBe("1 Mar 2026 – ongoing");
    expect(fmtPeriod({ start: "2026-03-01" })).toBe("1 Mar 2026 – ongoing");
  });
});

describe("years", () => {
  it("compacts a range in one century", () => {
    expect(years("2020-11-26", "2021-12-11")).toBe("2020–21");
  });

  it("keeps the full end year across a century", () => {
    expect(years("1999-06-01", "2001-01-01")).toBe("1999–2001");
  });

  it("shows one year when the range stays in it", () => {
    expect(years("2023-04-23", "2023-05-28")).toBe("2023");
  });

  it("leaves an ongoing range open", () => {
    expect(years("2026-03-01", null)).toBe("2026–");
    expect(years("2026-03-01")).toBe("2026–");
  });
});
