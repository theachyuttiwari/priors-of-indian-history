import Link from "next/link";
import { matrix, partyRecord } from "@/lib/content";
import { ACTION_META, type ActionType } from "@/lib/schema";
import { partySlug } from "@/components/PartyMark";
import Glyph, { GlyphLegend } from "@/components/Glyph";
import ByAction from "./ByAction";

export const metadata = { title: "Compare" };

const SHORT: Partial<Record<ActionType, string>> = {
  permission_denied: "Permit denied",
  permission_granted: "Permit granted",
  section_144: "Sec 144/163",
  internet_shutdown: "Internet",
  preventive_arrest: "Preventive",
  house_arrest: "House arrest",
  sedition_charge: "Sedition",
  uapa_charge: "UAPA",
  nsa_detention: "NSA",
  property_demolition: "Demolition",
  lathi_charge: "Lathi",
  commission_of_inquiry: "Inquiry",
  negotiation: "Talks",
};

/** One grey ramp from surface to ink, seven steps. */
function shade(v: number, max: number) {
  if (v === 0) return { background: "transparent", color: "var(--ink-3)" };
  const step = Math.min(6, Math.round(((v - 1) / Math.max(1, max - 1)) * 6));
  const pct = 12 + step * 14.5;
  return {
    background: `color-mix(in srgb, var(--ink) ${pct}%, var(--surface))`,
    color: pct >= 55 ? "var(--bg)" : "var(--ink)",
  };
}

type Said = ReturnType<typeof partyRecord>["statementsInPower"][number] | undefined;

function Statement({ label, s }: { label: string; s: Said }) {
  if (!s) return <p className="small">{label}: nothing recorded yet.</p>;
  return (
    <blockquote className="quote">
      <p className="stance">{label}</p>
      <p className="text-[15px] text-ink-2 mt-1">{s.pos.statement}</p>
      <Link href={`/precedents/${s.p.id}/`} className="link small block mt-1">
        {s.p.title}
      </Link>
    </blockquote>
  );
}

export default function ComparePage() {
  const m = matrix();
  return (
    <div>
      <h1 className="t-1">Compare parties</h1>
      <p className="lede mt-4 measure">Count of recorded actions while in charge. A count, not a measure of severity.</p>
      <p className="text-[15px] text-ink-2 mt-4 measure">
        Actions by the Centre count for the party ruling the Centre. Actions by a state government or its police count
        for the party ruling that state. Courts count for no one. Parties with more years in power and more documented
        cases have higher numbers. Read a row, then open the party page.
      </p>
      <GlyphLegend className="mt-6" />

      <div className="mt-8 sm:hidden">
        <ByAction
          rows={m.parties.map((party) => ({
            party,
            slug: partySlug(party),
            cases: partyRecord(party).inPower.length,
            counts: m.cells[party],
          }))}
          types={m.types}
          initial={m.types.includes("section_144") ? "section_144" : m.types[0]}
        />
        <p className="small mt-3">Choose an action to rank every party on it. A wider screen shows the full grid.</p>
      </div>

      <div className="hidden sm:block mt-8 overflow-x-auto -mx-5 px-5">
        <table className="heat text-sm">
          <thead>
            <tr>
              <th className="sticky-col text-left align-bottom pr-4 small">Party</th>
              <th className="align-bottom small px-2">Cases</th>
              {m.types.map((t) => (
                <th key={t} className="align-bottom px-1 pb-1 w-[68px]">
                  <span className="flex flex-col items-center gap-1 text-[12px] leading-tight text-ink-2">
                    <Glyph group={ACTION_META[t].group} />
                    {SHORT[t] ?? ACTION_META[t].label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {m.parties.map((party) => {
              const rec = partyRecord(party);
              return (
                <tr key={party}>
                  <th className="sticky-col text-left pr-4 font-semibold whitespace-nowrap">
                    <Link href={`/parties/${partySlug(party)}/`} className="quiet block max-w-[11rem] truncate" title={party}>
                      {party}
                    </Link>
                  </th>
                  <td className="num text-center text-ink-2 px-2">{rec.inPower.length}</td>
                  {m.types.map((t) => {
                    const v = m.cells[party][t];
                    return (
                      <td key={t} className="p-0" title={`${party}, ${ACTION_META[t].label}: ${v}`}>
                        <div className="cell" style={shade(v, m.max)}>
                          {v}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="hidden sm:block small mt-3">Darker cells hold more recorded actions. A zero means none recorded in this archive.</p>

      <section className="mt-16 sm:mt-24">
        <h2 className="t-2">Said in opposition, did in power</h2>
        <div className="rows mt-6 border-t border-line">
          {m.parties.map((party) => {
            const rec = partyRecord(party);
            const opp = rec.statementsInOpposition[0];
            const pow = rec.statementsInPower[0];
            if (!opp && !pow) return null;
            return (
              <div key={party} className="py-6 grid gap-6 md:grid-cols-[10rem_1fr_1fr]">
                <h3 className="t-3">
                  <Link href={`/parties/${partySlug(party)}/`} className="quiet">
                    {party}
                  </Link>
                </h3>
                <Statement label="In opposition" s={opp} />
                <Statement label="In power" s={pow} />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
