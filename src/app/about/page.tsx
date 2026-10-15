import Link from "next/link";
import { TIERS, TIER_META } from "@/lib/schema";

export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="measure space-y-12">
      <header>
        <h1 className="t-1">About Priors</h1>
        <p className="lede mt-4">
          Priors is a public record of how the Indian state acts when different parties hold power. It sets what a party
          does in government beside what earlier governments did in the same situation, and beside what the same party
          said in opposition.
        </p>
        <p className="text-ink-2 mt-4">
          It exists because memory is short and the record is long. A new generation sees today&apos;s decision without
          the thirty cases before it. Priors puts them side by side, with the same columns for every party.
        </p>
      </header>

      <section>
        <h2 className="t-2">Scope</h2>
        <p className="text-ink-2 mt-3">
          The record starts with one question: how do governments answer protest? Permission, Section 144 or 163,
          internet shutdowns, detentions, charges, force, talks and concessions are concrete acts with dates, orders and
          sources. That makes protest a good place to test the method.
        </p>
        <p className="text-ink-2 mt-3">
          The same method can cover other powers of the state later. That happens only once the protest record is solid.
        </p>
      </section>

      <section>
        <h2 className="t-2">Three rules</h2>
        <ol className="list-decimal pl-5 mt-3 space-y-2 text-ink-2">
          <li>Every claim links to a dated source. No source, no claim.</li>
          <li>Every party gets the same columns. The data model, not the editor, enforces symmetry.</li>
          <li>Describe actions. Do not judge them. The reader judges.</li>
        </ol>
      </section>

      <section>
        <h2 className="t-2">What an entry is</h2>
        <p className="text-ink-2 mt-3">
          One precedent is one protest and one government&apos;s answer to it. It records who was in power at the Centre
          and in the state, each action the government took with a date and a source, the outcome, and what parties said
          at the time, marked as in power or in opposition.
        </p>
        <p className="text-ink-2 mt-3">
          Entries live as YAML files in the repository under <code className="text-[15px]">content/precedents</code>.
          The schema is in <code className="text-[15px]">content/SCHEMA.md</code>. Add or fix an entry by pull request.
        </p>
      </section>

      <section id="pipeline">
        <h2 className="t-2">How entries get in</h2>
        <p className="text-ink-2 mt-3">
          Priors is not a live feed. It is updated by hand, and every page shows the date it last changed. Current
          events can be days or weeks behind the news.
        </p>
        <p className="text-ink-2 mt-3">
          Every entry so far was drafted with help from Claude, using web search and web fetch, and added by pull
          request. Each entry says where it stands:
        </p>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-ink-2">
          <li>
            <strong className="text-ink">Draft.</strong> Not yet checked by a person. Drafts can be wrong. The source
            links are there so you can check.
          </li>
          <li>
            <strong className="text-ink">Checked.</strong> A named person opened every source and confirmed each claim
            against it.
          </li>
          <li>
            <strong className="text-ink">Verified.</strong> Checked, every quote matched word for word against an
            archived copy of its source, and quotes of living people read by a second person.
          </li>
        </ul>
        <p className="text-ink-2 mt-3">
          Once an entry is checked, any change to what it says is logged on the{" "}
          <Link href="/corrections/" className="link">
            corrections
          </Link>{" "}
          page.
        </p>
      </section>

      <section id="sources">
        <h2 className="t-2">How sources are rated</h2>
        <p className="text-ink-2 mt-3">
          Every outlet looks biased to someone. So Priors rates each source by the kind of evidence it is, not by who
          published it. The same bar applies to every party.
        </p>
        <ol className="mt-4 space-y-2 text-ink-2">
          {TIERS.map((t) => (
            <li key={t} className="grid grid-cols-[6.5rem_1fr] gap-3">
              <span className="font-semibold text-ink">{TIER_META[t].label}</span>
              <span>{TIER_META[t].help}.</span>
            </li>
          ))}
        </ol>
        <p className="text-ink-2 mt-4">
          What the state ordered needs the order, a court record, or two independent reports. What happened on the
          ground needs a court finding or two independent reports. What someone said needs the record, a recording, or
          two independent reports. Copies of one wire story count as one source. Official sources settle what the state
          ordered or claimed, not contested facts. Disputed numbers are shown with who gave each one.
        </p>
        <p className="text-ink-2 mt-3">
          A claim that does not yet meet this bar is held back. It is not shown or counted until it is sourced. Each
          entry says how many of its claims are held back.
        </p>
        <p className="text-ink-2 mt-3">
          Only words that appear exactly in the source go in quote marks. A summary of what someone said is marked as a
          summary. A translated quote keeps the original words and says who translated it.
        </p>
        <p className="text-ink-2 mt-3">
          Priors records the law the state used and what courts later held. It does not judge an action against any
          country&apos;s free-speech law.
        </p>
      </section>

      <section>
        <h2 className="t-2">How counts work</h2>
        <p className="text-ink-2 mt-3">
          Each action counts for the party in power where it happened, on the day it happened. An action by the Centre
          counts for the party ruling the Centre. An action by a state government or its police counts for the party
          ruling that state on that date. Delhi Police reports to the Union Home Ministry, so its actions count for the
          party ruling the Centre. So do actions under President&apos;s Rule and in Union Territories run by the Centre.
          Court orders, commissions and protesters count for nobody.
        </p>
        <p className="text-ink-2 mt-3">
          Who governed where, and when, is in <code className="text-[15px]">content/governments</code>, with a source
          for each term. A count is a count of actions in this archive, not a measure of severity, and parties with
          longer time in power will have more.
        </p>
      </section>

      <section>
        <h2 className="t-2">Licence</h2>
        <p className="text-ink-2 mt-3">Code is MIT. Content is CC BY 4.0. Sources belong to their publishers.</p>
      </section>
    </article>
  );
}
