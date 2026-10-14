import Link from "next/link";
import { getCurrent, getPrecedents, similar, stats, fmtPeriod } from "@/lib/content";
import PrecedentCard from "@/components/PrecedentCard";
import ActionChip from "@/components/ActionChip";

export default function Home() {
  const current = getCurrent();
  const s = stats();
  const recent = [...getPrecedents()].reverse().slice(0, 6);
  return (
    <div className="space-y-20">
      <section className="pt-6">
        <p className="eyebrow">India · protests and how governments answer them</p>
        <h1 className="display text-5xl sm:text-7xl leading-[1.02] mt-4 max-w-4xl">
          What did they do <em className="text-accent not-italic">before</em>?
        </h1>
        <p className="text-lg text-ink-2 mt-6 max-w-2xl leading-relaxed">
          Today&apos;s event, set beside the record. How the Centre and the states, under every party, have
          handled permissions, Section 144, internet shutdowns, detentions and talks since 1974. Every
          claim links to a dated source.
        </p>
        <div className="mono text-xs text-ink-3 mt-8 flex flex-wrap gap-x-6 gap-y-2">
          <span>{s.precedents} precedents</span>
          <span>{s.actions} government actions</span>
          <span>{s.sources} sources</span>
          <span>{s.parties} parties</span>
          <span>
            {s.from}–{s.to}
          </span>
        </div>
      </section>

      {current.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="display text-3xl">Now</h2>
            <Link href="/now/" className="link text-sm">
              all current events
            </Link>
          </div>
          <div className="mt-6 space-y-10">
            {current.slice(0, 2).map((ev) => {
              const sims = similar(ev, 3);
              return (
                <div key={ev.id} className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                  <div className="card p-6 border-accent/30">
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-accent">Happening now</span>
                      <span className="mono text-xs text-ink-3">{fmtPeriod(ev.period)}</span>
                    </div>
                    <h3 className="display text-2xl mt-3">
                      <Link href={`/now/${ev.id}/`} className="quiet">
                        {ev.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-ink-2 mt-3">{ev.summary}</p>
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {[...new Set(ev.actions.map((a) => a.type))].map((t) => (
                        <ActionChip key={t} type={t} />
                      ))}
                    </div>
                    {ev.reviewed === false && (
                      <p className="mt-4 text-xs text-ink-3">
                        Drafted by the ingestion pipeline. Not yet reviewed by a human.{" "}
                        <Link href="/about/#pipeline" className="link">
                          How this works
                        </Link>
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="eyebrow mb-3">Closest priors</p>
                    <div className="space-y-3">
                      {sims.map(({ p, shared }) => (
                        <PrecedentCard key={p.id} p={p} highlight={shared} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="display text-3xl">The record</h2>
          <Link href="/precedents/" className="link text-sm">
            all {s.precedents} precedents
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => (
            <PrecedentCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {[
          ["/compare/", "Compare parties", "One grid. Every party, every kind of action, counted the same way."],
          ["/parties/", "In power vs in opposition", "What each party did when it governed, next to what it said when it did not."],
          ["/about/", "Method and contributing", "How entries are written, sourced and reviewed. Add a precedent by pull request."],
        ].map(([href, t, d]) => (
          <Link key={href} href={href} className="card quiet p-6 block">
            <h3 className="display text-xl">{t}</h3>
            <p className="text-sm text-ink-2 mt-2">{d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
