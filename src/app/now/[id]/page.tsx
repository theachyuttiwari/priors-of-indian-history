import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrent, getCurrentEvent, fmtPeriod, similar, fmtDate } from "@/lib/content";
import { ACTION_META, type ActionType, type Precedent } from "@/lib/schema";
import Timeline from "@/components/Timeline";
import Positions from "@/components/Positions";
import Sources from "@/components/Sources";
import PartyMark from "@/components/PartyMark";
import { groupColor } from "@/components/ActionChip";

export function generateStaticParams() {
  const ids = getCurrent().map((p) => ({ id: p.id }));
  // Static export needs at least one path; fall back to a placeholder when there are no current events yet.
  return ids.length ? ids : [{ id: "none" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getCurrentEvent((await params).id);
  return { title: p?.title ?? "Now" };
}

function Column({ p, types, href }: { p: Precedent; types: ActionType[]; href?: string }) {
  const govt = p.government.state ?? p.government.centre;
  return (
    <div className="card p-5">
      <span className="mono text-xs text-ink-3">{fmtPeriod(p.period)}</span>
      <h3 className="display text-lg mt-1">
        {href ? (
          <Link href={href} className="quiet hover:text-accent">
            {p.title}
          </Link>
        ) : (
          p.title
        )}
      </h3>
      <p className="text-xs text-ink-3 mt-1">
        <PartyMark party={govt.party} />
        {p.government.state ? ` in ${p.government.state.name}, centre ${p.government.centre.party}` : " at the centre"}
      </p>
      <ul className="mt-4 space-y-2">
        {types.map((t) => {
          const hits = p.actions.filter((a) => a.type === t);
          return (
            <li key={t} className="text-sm grid grid-cols-[14px_1fr] gap-2 items-start">
              <span
                className="mt-1.5 w-2.5 h-2.5 rounded-full"
                style={{ background: hits.length ? groupColor(t) : "transparent", border: `1px solid ${hits.length ? groupColor(t) : "var(--line-2)"}` }}
              />
              <span className={hits.length ? "" : "text-ink-3"}>
                <span className="font-medium">{ACTION_META[t].label}</span>
                {hits.length ? (
                  <span className="block text-ink-2 text-xs mt-0.5">
                    {hits.map((h, i) => (
                      <span key={i} className="block">
                        {h.date ? <span className="mono text-ink-3">{fmtDate(h.date)} · </span> : null}
                        {h.description}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="block text-xs">not recorded</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {p.outcome && (
        <p className="text-xs text-ink-2 mt-4 pt-4 border-t border-line">
          <span className="eyebrow">Outcome</span>
          <br />
          {p.outcome}
        </p>
      )}
    </div>
  );
}

export default async function NowEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ev = getCurrentEvent(id);
  if (!ev) {
    if (id === "none") return <p className="text-ink-3">No current events yet.</p>;
    notFound();
  }
  const sims = similar(ev, 3);
  const types = [...new Set([...ev.actions.map((a) => a.type), ...sims.flatMap((s) => s.p.actions.map((a) => a.type))])].sort(
    (a, b) => Object.keys(ACTION_META).indexOf(a) - Object.keys(ACTION_META).indexOf(b),
  );
  return (
    <article className="space-y-14">
      <header>
        <p className="eyebrow text-accent">Happening now · {fmtPeriod(ev.period)}</p>
        <h1 className="display text-4xl sm:text-5xl mt-3 max-w-3xl">{ev.title}</h1>
        <p className="text-lg text-ink-2 mt-5 max-w-3xl leading-relaxed">{ev.summary}</p>
        {ev.reviewed === false && (
          <p className="mt-4 text-xs text-ink-3 inline-block border border-line-2 rounded px-2 py-1">
            Drafted by the ingestion pipeline on {ev.last_updated ? fmtDate(ev.last_updated) : "an unknown date"}. Not yet reviewed by a human.
          </p>
        )}
      </header>

      <section>
        <h2 className="display text-2xl mb-2">Side by side</h2>
        <p className="text-sm text-ink-3 mb-6">The current event in the first column. The three closest priors beside it. Same rows for all.</p>
        <div className="grid gap-4 lg:grid-cols-4">
          <Column p={ev} types={types} />
          {sims.map(({ p }) => (
            <Column key={p.id} p={p} types={types} href={`/precedents/${p.id}/`} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="display text-2xl mb-6">What has happened so far</h2>
        <Timeline p={ev} />
      </section>

      {ev.positions.length > 0 && (
        <section>
          <h2 className="display text-2xl mb-6">What they are saying</h2>
          <Positions p={ev} />
        </section>
      )}

      <section>
        <h2 className="display text-2xl mb-4">Sources</h2>
        <Sources p={ev} />
      </section>
    </article>
  );
}
