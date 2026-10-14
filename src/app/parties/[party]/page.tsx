import { notFound } from "next/navigation";
import Link from "next/link";
import StatementText from "@/components/StatementText";
import { allParties, partyRecord, fmtDate, type PartyRecord, isCurrent, entryHref } from "@/lib/content";
import { ACTION_TYPES, ACTION_META } from "@/lib/schema";
import { partySlug } from "@/components/PartyMark";
import PrecedentRow from "@/components/PrecedentRow";
import Glyph from "@/components/Glyph";

export function generateStaticParams() {
  return allParties().map((p) => ({ party: partySlug(p) }));
}

function find(slug: string) {
  return allParties().find((p) => partySlug(p) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ party: string }> }) {
  return { title: find((await params).party) ?? "Party" };
}

function Statements({ items }: { items: PartyRecord["statementsInPower"] }) {
  if (items.length === 0) return <p className="small">Nothing recorded yet.</p>;
  return (
    <div className="space-y-6">
      {items.map(({ p, pos }, i) => (
        <blockquote key={i} className="quote">
          <StatementText p={p} pos={pos} />
          <footer className="small mt-1">
            {[
              pos.person && `${pos.person}${pos.role_at_time ? `, ${pos.role_at_time}` : ""}`,
              pos.date && fmtDate(pos.date),
            ]
              .filter(Boolean)
              .join(", ")}
            <Link href={entryHref(p)} className="link block mt-0.5">
              {p.title}
            </Link>
          </footer>
        </blockquote>
      ))}
    </div>
  );
}

export default async function PartyPage({ params }: { params: Promise<{ party: string }> }) {
  const party = find((await params).party);
  if (!party) notFound();
  const r = partyRecord(party);
  const rows = ACTION_TYPES.filter((t) => r.actions[t] > 0).sort((a, b) => r.actions[b] - r.actions[a]);
  const max = rows.length ? r.actions[rows[0]] : 1;
  return (
    <article className="space-y-20">
      <header>
        <Link href="/parties/" className="link small">
          Parties
        </Link>
        <h1 className="t-1 mt-4">{party}</h1>
        <p className="small num mt-3">
          {r.inPower.length} cases while in power, {r.statementsInPower.length} statements in power,{" "}
          {r.statementsInOpposition.length} in opposition
        </p>
      </header>

      {rows.length > 0 && (
        <section>
          <h2 className="t-2 mb-6">Actions taken while governing</h2>
          <ul className="space-y-2.5 max-w-2xl">
            {rows.map((t) => (
              <li key={t} className="grid grid-cols-[12rem_1fr_2rem] items-center gap-3 text-[15px]">
                <span className="chip text-[15px]">
                  <Glyph group={ACTION_META[t].group} />
                  {ACTION_META[t].label}
                </span>
                <span
                  className="h-2 rounded-full bg-ink-3"
                  style={{ width: `${(r.actions[t] / max) * 100}%`, minWidth: 4 }}
                />
                <span className="num text-ink-2 text-right">{r.actions[t]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-12 lg:grid-cols-2">
        <div>
          <h2 className="t-2">Said in opposition</h2>
          <p className="small mt-1 mb-6">When another party was handling the protest.</p>
          <Statements items={r.statementsInOpposition} />
        </div>
        <div>
          <h2 className="t-2">Said in power</h2>
          <p className="small mt-1 mb-6">When this party was handling the protest.</p>
          <Statements items={r.statementsInPower} />
        </div>
      </section>

      {r.inPower.length > 0 && (
        <section>
          <h2 className="t-2 mb-4">Cases handled</h2>
          <div className="rows border-t border-line">
            {r.inPower.map((p) => (
              <PrecedentRow key={p.id} p={p} href={isCurrent(p) ? entryHref(p) : undefined} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
