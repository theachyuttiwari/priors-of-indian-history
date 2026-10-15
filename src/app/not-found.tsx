import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <article className="max-w-xl">
      <h1 className="t-1">Page not found</h1>
      <p className="text-ink-2 mt-4">
        This address has no page. An entry may have moved, or it may be held back until its sources meet the bar.
      </p>
      <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Link href="/precedents/" className="link">
          All precedents
        </Link>
        <Link href="/now/" className="link">
          Current events
        </Link>
      </p>
    </article>
  );
}
