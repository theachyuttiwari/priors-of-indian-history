import Link from "next/link";
import { allParties, partyRecord } from "@/lib/content";
import { partySlug } from "@/components/PartyMark";
import PartyFlag from "@/components/PartyFlag";
import ActionChip from "@/components/ActionChip";
import { ACTION_TYPES } from "@/lib/schema";
import { PARTY_COUNTS, PARTY_COUNTS_PAUSED } from "@/lib/site";

export const metadata = { title: "Parties" };

export default function PartiesPage() {
  const parties = allParties();
  return (
    <div>
      <h1 className="t-1">Parties</h1>
      <p className="lede mt-4 measure">Each party, what it did when it governed, and what it said when it did not.</p>
      {!PARTY_COUNTS && <p className="text-[15px] text-ink-2 mt-4 measure">{PARTY_COUNTS_PAUSED}</p>}
      <div className="rows mt-10 border-t border-line">
        {parties.map((party) => {
          const r = partyRecord(party);
          const top = ACTION_TYPES.filter((t) => r.actions[t] > 0)
            .sort((a, b) => r.actions[b] - r.actions[a])
            .slice(0, 4);
          return (
            <Link
              key={party}
              href={`/parties/${partySlug(party)}/`}
              className="quiet grid gap-2 py-5 md:grid-cols-[16rem_1fr] items-baseline group"
            >
              <span>
                <span className="inline-flex items-baseline gap-2">
                  <PartyFlag party={party} />
                  <span className="row-title group-hover:underline underline-offset-4 decoration-1">{party}</span>
                </span>
                <span className="block small num mt-0.5">
                  {PARTY_COUNTS
                    ? `${r.inPower.length} cases in power, ${r.statementsInOpposition.length} statements in opposition`
                    : `${r.statementsInPower.length} statements in power, ${r.statementsInOpposition.length} in opposition`}
                </span>
              </span>
              <span className="chips">
                {(PARTY_COUNTS ? top : []).map((t) => (
                  <ActionChip key={t} type={t} count={r.actions[t]} />
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
