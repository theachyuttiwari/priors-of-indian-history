import type { Metadata } from "next";
import Link from "next/link";
import { REPO } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Priors: what they did before", template: "%s · Priors" },
  description:
    "How Indian governments, across parties, have handled protests. Today's event, compared with the record. Every claim sourced.",
};

const NAV = [
  ["/now/", "Now"],
  ["/precedents/", "Precedents"],
  ["/compare/", "Compare"],
  ["/parties/", "Parties"],
  ["/about/", "About"],
] as const;

/** The mark: one tick on a line. */
function Mark() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M3 17h18" strokeWidth="1.6" />
      <path d="M14 6v11" strokeWidth="2.6" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-[var(--header)] border-b border-line">
          <div className="mx-auto max-w-5xl px-5 h-12 flex items-center justify-between gap-6">
            <Link href="/" className="quiet flex items-center gap-1.5 font-semibold tracking-tight" aria-label="Priors, home">
              <Mark />
              Priors
            </Link>
            <nav className="flex items-center gap-4 sm:gap-5 text-[14px] text-ink-2 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className={`quiet hover:text-ink ${href === "/about/" ? "hidden sm:inline" : ""}`}>
                  {label}
                </Link>
              ))}
              <a href={REPO} className="quiet hover:text-ink hidden sm:inline" rel="noreferrer">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-5xl px-5 pt-14 pb-24">{children}</main>
        <footer className="bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-8 small space-y-1">
            <p>Priors is open source. Content is CC BY 4.0. Code is MIT.</p>
            <p>Every party gets the same columns. Every claim links to a dated source.</p>
            <p className="flex gap-4 pt-2">
              <Link href="/about/" className="link">
                About and method
              </Link>
              <a href={REPO} className="link" rel="noreferrer">
                GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
