import Link from "next/link";
import { matrix, partyRecord } from "@/lib/content";
import { ACTION_META } from "@/lib/schema";
import { partySlug } from "@/components/PartyMark";

export const metadata = { title: "Compare" };

const SEQ = ["#0d366b", "#184f95", "#256abf", "#3987e5", "#6da7ec", "#9ec5f4", "#cde2fb"];

export default function ComparePage() {
  const m = matrix();
  return (
    <div>
      <p className="eyebrow">Symmetry</p>
      <h1 className="display text-4xl mt-2">Compare parties</h1>
      <p className="text-ink-2 mt-3 max-w-2xl">
        Count of recorded government actions by the party in charge, when it was in charge. Actions by the Centre
        count for the ruling party at the Centre. Actions by a state government or its police count for the party
        ruling that state. Courts count for no one.
      </p>
      <p className="text-xs text-ink-3 mt-2 max-w-2xl">
        A count is a count of entries in this archive, not a measure of severity. Parties with more years in power and more
        documented cases will have higher numbers. Read the rows, then open the party page.
      </p>

      <div className="mt-10 overflow-x-auto">
        <table className="heat border-collapse text-sm min-w-[900px] w-full">
          <thead>
            <tr>
              <th className="text-left p-2 eyebrow bg-bg-2 sticky left-0">Party</th>
              <th className="p-2 eyebrow bg-bg-2">cases</th>
              {m.types.map((t) => (
                <th key={t} className="p-2 bg-bg-2 align-bottom">
                  <span className="block text-[11px] leading-tight text-ink-2 font-normal" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: 110 }}>
                    {ACTION_META[t].label}
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
                  <th className="text-left p-2 bg-bg-2 sticky left-0 font-medium">
                    <Link href={`/parties/${partySlug(party)}/`} className="quiet hover:text-accent">
                      {party}
                    </Link>
                  </th>
                  <td className="mono text-center text-ink-3">{rec.inPower.length}</td>
                  {m.types.map((t) => {
                    const v = m.cells[party][t];
                    const step = v === 0 ? -1 : Math.min(6, Math.round(((v - 1) / Math.max(1, m.max - 1)) * 6));
                    const bg = step < 0 ? "transparent" : SEQ[6 - step];
                    const fg = step >= 3 ? "#0b0b0b" : "#f0efec";
                    return (
                      <td key={t} className="p-0" title={`${party} · ${ACTION_META[t].label}: ${v}`}>
                        <div className="cell" style={{ background: bg, color: v ? fg : "var(--ink-3)" }}>
                          {v || "·"}
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
      <p className="mono text-xs text-ink-3 mt-3">Darker blue = more recorded actions. Dot = none recorded.</p>

      <section className="mt-16">
        <h2 className="display text-2xl mb-6">Said in opposition, did in power</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {m.parties.map((party) => {
            const rec = partyRecord(party);
            const opp = rec.statementsInOpposition[0];
            const pow = rec.statementsInPower[0];
            if (!opp && !pow) return null;
            return (
              <Link key={party} href={`/parties/${partySlug(party)}/`} className="card quiet p-5 block">
                <h3 className="display text-xl">{party}</h3>
                {opp && (
                  <p className="quote opp text-sm mt-3 text-ink-2">
                    “{opp.pos.statement}”<span className="block text-xs text-ink-3 mt-1">in opposition · {opp.p.title}</span>
                  </p>
                )}
                {pow && (
                  <p className="quote power text-sm mt-3 text-ink-2">
                    “{pow.pos.statement}”<span className="block text-xs text-ink-3 mt-1">in power · {pow.p.title}</span>
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
