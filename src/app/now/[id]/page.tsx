import { notFound } from "next/navigation";
import Link from "next/link";
import { getCurrent, getCurrentEvent, fmtPeriod, similar, fmtDate } from "@/lib/content";
import { ACTION_META, type ActionType, type Precedent } from "@/lib/schema";
import Timeline from "@/components/Timeline";
import Positions from "@/components/Positions";
import Sources from "@/components/Sources";
import PartyMark from "@/components/PartyMark";
import Glyph from "@/components/Glyph";

export function generateStaticParams() {
  const ids = getCurrent().map((p) => ({ id: p.id }));
  // Static export needs at least one path; fall back to a placeholder when there are no current events yet.
  return ids.length ? ids : [{ id: "none" }];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const p = getCurrentEvent((await params).id);
  return { title: p?.title ?? "Now" };
}

function Column({ p, types, href, now }: { p: Precedent; types: ActionType[]; href?: string; now?: boolean }) {
  const govt = p.government.state ?? p.government.centre;
  return (
    <div className="panel p-5">
      <p className="small num">
        {now ? "Now, " : ""}
        {fmtPeriod(p.period)}
      </p>
      <h3 className="t-3 text-[17px] mt-1">
        {href ? (
          <Link href={href} className="quiet">
            {p.title}
          </Link>
        ) : (
          p.title
        )}
      </h3>
      <p className="small mt-1">
        <PartyMark party={govt.party} />
        {p.government.state ? ` in ${p.government.state.name}, ${p.government.centre.party} at the Centre` : " at the Centre"}
      </p>
      <ul className="mt-5 space-y-3">
        {types.map((t) => {
          const hits = p.actions.filter((a) => a.type === t);
          return (
            <li key={t} className="grid grid-cols-[14px_1fr] gap-2.5 items-start text-[15px]">
              <span className={`mt-[5px] flex ${hits.length ? "text-ink" : "text-line"}`}>
                <Glyph group={ACTION_META[t].group} />
              </span>
              <span className={hits.length ? "" : "text-ink-3"}>
                <span className="font-semibold">{ACTION_META[t].label}</span>
                {hits.length ? (
                  hits.map((h, i) => (
                    <span key={i} className="block text-ink-2 text-[14px] mt-0.5">
                      {h.date ? <span className="num text-ink-3">{fmtDate(h.date)}. </span> : null}
                      {h.description}
                    </span>
                  ))
                ) : (
                  <span className="block text-[14px]">Not recorded</span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
      {p.outcome && (
        <div className="mt-5 pt-4 border-t border-line">
          <p className="small">Outcome</p>
          <p className="text-[14px] text-ink-2 mt-0.5">{p.outcome}</p>
        </div>
      )}
    </div>
  );
}

export default async function NowEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ev = getCurrentEvent(id);
  if (!ev) {
    if (id === "none") return <p className="text-ink-2">No current events yet.</p>;
    notFound();
  }
  const sims = similar(ev, 3);
  const types = [...new Set([...ev.actions.map((a) => a.type), ...sims.flatMap((s) => s.p.actions.map((a) => a.type))])].sort(
    (a, b) => Object.keys(ACTION_META).indexOf(a) - Object.keys(ACTION_META).indexOf(b),
  );
  return (
    <article className="space-y-20">
      <header>
        <Link href="/now/" className="link small">
          Now
        </Link>
        <h1 className="t-1 mt-4 max-w-3xl">{ev.title}</h1>
        <p className="small num mt-3">{fmtPeriod(ev.period)}</p>
        <p className="lede mt-6 measure">{ev.summary}</p>
        {ev.reviewed === false && (
          <p className="mt-6 small inline-block panel px-3 py-2">
            Drafted by the ingestion pipeline on {ev.last_updated ? fmtDate(ev.last_updated) : "an unknown date"}. Not yet
            reviewed by a person.
          </p>
        )}
      </header>

      <section>
        <h2 className="t-2 mb-2">Side by side</h2>
        <p className="small mb-6 measure">The current event comes first. Its three closest precedents follow. Every column has the same rows.</p>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Column p={ev} types={types} now />
          {sims.map(({ p }) => (
            <Column key={p.id} p={p} types={types} href={`/precedents/${p.id}/`} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="t-2 mb-6">What has happened so far</h2>
        <Timeline p={ev} />
      </section>

      {ev.positions.length > 0 && (
        <section>
          <h2 className="t-2 mb-8">What they are saying</h2>
          <Positions p={ev} />
        </section>
      )}

      <section>
        <h2 className="t-2 mb-6">Sources</h2>
        <Sources p={ev} />
      </section>
    </article>
  );
}
