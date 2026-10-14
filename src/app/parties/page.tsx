import Link from "next/link";
import { allParties, partyRecord } from "@/lib/content";
import { partySlug } from "@/components/PartyMark";
import ActionChip from "@/components/ActionChip";
import { ACTION_TYPES } from "@/lib/schema";

export const metadata = { title: "Parties" };

export default function PartiesPage() {
  const parties = allParties();
  return (
    <div>
      <p className="eyebrow">Track records</p>
      <h1 className="display text-4xl mt-2">Parties</h1>
      <p className="text-ink-2 mt-3 max-w-2xl">Each party, what it did when it governed, and what it said when it did not.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {parties.map((party) => {
          const r = partyRecord(party);
          const top = ACTION_TYPES.filter((t) => r.actions[t] > 0)
            .sort((a, b) => r.actions[b] - r.actions[a])
            .slice(0, 4);
          return (
            <Link key={party} href={`/parties/${partySlug(party)}/`} className="card quiet p-5 block">
              <h2 className="display text-2xl">{party}</h2>
              <p className="mono text-xs text-ink-3 mt-1">
                {r.inPower.length} cases in power · {r.statementsInOpposition.length} statements in opposition
              </p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {top.map((t) => (
                  <ActionChip key={t} type={t} count={r.actions[t]} />
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
