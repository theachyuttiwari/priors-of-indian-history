import { notFound } from "next/navigation";
import Link from "next/link";
import { allParties, partyRecord, fmtDate } from "@/lib/content";
import { ACTION_TYPES, ACTION_META } from "@/lib/schema";
import { partySlug } from "@/components/PartyMark";
import PrecedentCard from "@/components/PrecedentCard";
import { groupColor } from "@/components/ActionChip";

export function generateStaticParams() {
  return allParties().map((p) => ({ party: partySlug(p) }));
}

function find(slug: string) {
  return allParties().find((p) => partySlug(p) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ party: string }> }) {
  return { title: find((await params).party) ?? "Party" };
}

export default async function PartyPage({ params }: { params: Promise<{ party: string }> }) {
  const party = find((await params).party);
  if (!party) notFound();
  const r = partyRecord(party);
  const rows = ACTION_TYPES.filter((t) => r.actions[t] > 0).sort((a, b) => r.actions[b] - r.actions[a]);
  const max = rows.length ? r.actions[rows[0]] : 1;
  return (
    <article className="space-y-14">
      <header>
        <p className="eyebrow">
          <Link href="/parties/" className="quiet">
            Parties
          </Link>
        </p>
        <h1 className="display text-5xl mt-3">{party}</h1>
        <p className="mono text-xs text-ink-3 mt-3">
          {r.inPower.length} cases while in power · {r.statementsInPower.length} statements in power · {r.statementsInOpposition.length} in opposition
        </p>
      </header>

      {rows.length > 0 && (
        <section>
          <h2 className="display text-2xl mb-6">Actions taken while governing</h2>
          <ul className="space-y-2 max-w-2xl">
            {rows.map((t) => (
              <li key={t} className="grid grid-cols-[180px_1fr_32px] items-center gap-3 text-sm">
                <span className="text-ink-2">{ACTION_META[t].label}</span>
                <span className="h-3 rounded-r-[4px]" style={{ width: `${(r.actions[t] / max) * 100}%`, background: groupColor(t), minWidth: 4 }} />
                <span className="mono text-xs text-ink-3 text-right">{r.actions[t]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="display text-2xl mb-1">
            Said in <span className="text-cool">opposition</span>
          </h2>
          <p className="text-xs text-ink-3 mb-6">When another party was handling the protest.</p>
          {r.statementsInOpposition.length === 0 && <p className="text-sm text-ink-3">Nothing recorded yet.</p>}
          <div className="space-y-5">
            {r.statementsInOpposition.map(({ p, pos }, i) => (
              <blockquote key={i} className="quote opp">
                <p className="text-sm">“{pos.statement}”</p>
                <footer className="text-xs text-ink-3 mt-1">
                  {pos.person}
                  {pos.role_at_time ? `, ${pos.role_at_time}` : ""} · {pos.date ? fmtDate(pos.date) : ""} ·{" "}
                  <Link href={`/precedents/${p.id}/`} className="link">
                    {p.title}
                  </Link>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
        <div>
          <h2 className="display text-2xl mb-1">
            Said in <span className="text-accent">power</span>
          </h2>
          <p className="text-xs text-ink-3 mb-6">When this party was handling the protest.</p>
          {r.statementsInPower.length === 0 && <p className="text-sm text-ink-3">Nothing recorded yet.</p>}
          <div className="space-y-5">
            {r.statementsInPower.map(({ p, pos }, i) => (
              <blockquote key={i} className="quote power">
                <p className="text-sm">“{pos.statement}”</p>
                <footer className="text-xs text-ink-3 mt-1">
                  {pos.person}
                  {pos.role_at_time ? `, ${pos.role_at_time}` : ""} · {pos.date ? fmtDate(pos.date) : ""} ·{" "}
                  <Link href={`/precedents/${p.id}/`} className="link">
                    {p.title}
                  </Link>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {r.inPower.length > 0 && (
        <section>
          <h2 className="display text-2xl mb-4">Cases handled</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {r.inPower.map((p) => (
              <PrecedentCard key={p.id} p={p} href={p.related_precedents.length || p.reviewed === false ? `/now/${p.id}/` : undefined} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
