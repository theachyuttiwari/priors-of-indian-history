import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], axes: ["opsz", "SOFT"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Priors — what they did before", template: "%s · Priors" },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-20 backdrop-blur bg-[rgba(14,13,11,0.8)] border-b border-line">
          <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between gap-6">
            <Link href="/" className="quiet flex items-baseline gap-2">
              <span className="display text-xl">Priors</span>
              <span className="eyebrow hidden sm:inline">what they did before</span>
            </Link>
            <nav className="flex items-center gap-5 text-sm text-ink-2">
              {NAV.map(([href, label]) => (
                <Link key={href} href={href} className="quiet">
                  {label}
                </Link>
              ))}
              <a href="https://github.com/" className="quiet hidden sm:inline" rel="noreferrer">
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-5 py-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-ink-3 flex flex-wrap gap-x-8 gap-y-2">
            <span>Priors is open source. Content is CC BY 4.0. Code is MIT.</span>
            <span>Neutral by construction: every party gets the same columns, every claim links to a dated source.</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
