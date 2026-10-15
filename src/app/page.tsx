import Link from "next/link";
import {
  getCurrent,
  getPrecedents,
  similar,
  stats,
  fmtPeriod,
  fmtDate,
  siteUpdated,
  reviewStatus,
} from "@/lib/content";
import PrecedentRow from "@/components/PrecedentRow";
import { PARTY_COUNTS } from "@/lib/site";
import ActionChip from "@/components/ActionChip";
import YearStrip from "@/components/YearStrip";
import { GlyphLegend } from "@/components/Glyph";

export default function Home() {
  const current = getCurrent();
  const s = stats();
  const precedents = getPrecedents();
  const recent = [...precedents].reverse().slice(0, 10);
  return (
    <div className="space-y-16 sm:space-y-24">
      <section>
        <h1 className="t-hero">What did they do before?</h1>
        <p className="lede mt-5 measure">
          Protests in India since {s.from}, and how the Centre and the states answered them under every party. Every
          claim links to a dated source.
        </p>
        <div className="mt-8 sm:mt-14">
          <YearStrip precedents={precedents} current={current[0]} />
        </div>
      </section>

      {current.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="t-2">Now</h2>
            <Link href="/now/" className="link small">
              All current events
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 space-y-14 sm:space-y-16">
            {current.slice(0, 2).map((ev) => {
              const sims = similar(ev, 3);
              return (
                <article key={ev.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                    <h3 className="t-3 text-[24px]">
                      <Link href={`/now/${ev.id}/`} className="quiet">
                        {ev.title}
                      </Link>
                    </h3>
                    <span className="small num">{fmtPeriod(ev.period)}</span>
                  </div>
                  <p className="clamp clamp-4 text-ink-2 mt-2 measure">{ev.summary}</p>
                  <div className="chips mt-4">
                    {[...new Set(ev.actions.map((a) => a.type))].map((t) => (
                      <ActionChip key={t} type={t} />
                    ))}
                  </div>
                  {reviewStatus(ev) === "draft" && (
                    <p className="small mt-3">
                      Draft, not yet checked by a person.{" "}
                      <Link href="/about/#pipeline" className="link">
                        How this works
                      </Link>
                    </p>
                  )}
                  {sims.length > 0 && (
                    <div className="mt-8">
                      <p className="small">
                        Closest priors, by shared actions. Faded glyphs are actions the current event does not share.
                      </p>
                      <div className="rows mt-2 border-t border-line">
                        {sims.map(({ p, shared }) => (
                          <PrecedentRow key={p.id} p={p} highlight={shared} />
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="t-2">The record</h2>
          <p className="small num">
            {s.precedents} precedents, {s.actions} government actions, {s.sources} sources. Last updated{" "}
            {fmtDate(siteUpdated())}.
          </p>
        </div>
        <GlyphLegend className="mt-4" />
        <div className="rows mt-4 border-t border-line">
          {recent.map((p) => (
            <PrecedentRow key={p.id} p={p} />
          ))}
        </div>
        <Link href="/precedents/" className="link inline-block mt-6">
          See all {s.precedents} precedents
        </Link>
      </section>

      <section className="grid gap-x-10 gap-y-8 md:grid-cols-3 border-t border-line pt-10">
        {[
          [
            "/compare/",
            "Compare parties",
            PARTY_COUNTS
              ? "One grid. Every party and every kind of action, counted the same way."
              : "What each party said in opposition, next to what it said in power.",
          ],
          [
            "/parties/",
            "In power and in opposition",
            "What each party did when it governed, next to what it said when it did not.",
          ],
          ["/about/", "Method", "How entries are written, sourced and reviewed. Add a precedent by pull request."],
        ].map(([href, t, d]) => (
          <Link key={href} href={href} className="quiet block group">
            <h3 className="t-3 group-hover:underline underline-offset-4 decoration-1">{t}</h3>
            <p className="text-[15px] text-ink-2 mt-1">{d}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
