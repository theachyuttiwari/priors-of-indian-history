export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <article className="measure space-y-12">
      <header>
        <h1 className="t-1">About Priors</h1>
        <p className="lede mt-4">
          Priors is a public record of how Indian governments answer protests. It exists because memory is short and the
          record is long. A new generation sees today&apos;s crackdown or today&apos;s permission without the thirty
          cases before it. Priors puts them side by side.
        </p>
      </header>

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
          Some entries were drafted with help from Claude, using web search and web fetch, and then added by pull
          request. A drafted entry carries a &quot;not yet reviewed&quot; mark until a person checks every source and
          removes it. Drafts can be wrong. The source links are there so you can check.
        </p>
        <p className="text-ink-2 mt-3">
          Statements are reported as the cited source gives them. They are not shown in quote marks, because some are
          summaries of what was said. Open the source for the exact words.
        </p>
      </section>

      <section>
        <h2 className="t-2">How counts work</h2>
        <p className="text-ink-2 mt-3">
          An action by the Centre counts for the party ruling the Centre. An action by a state government or its police
          counts for the party ruling that state. Court orders count for nobody. A count is a count of entries in this
          archive, not a measure of severity, and parties with longer time in power will have more.
        </p>
      </section>

      <section>
        <h2 className="t-2">Licence</h2>
        <p className="text-ink-2 mt-3">Code is MIT. Content is CC BY 4.0. Sources belong to their publishers.</p>
      </section>
    </article>
  );
}
