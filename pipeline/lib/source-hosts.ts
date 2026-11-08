/**
 * The only hosts pipeline/match-quotes.ts may fetch from.
 *
 * Source URLs come from content files that anyone can propose in a pull request, and the fetched
 * words are copied into content/checks/quotes.json. So the quote checker fetches only from this
 * fixed list, never from a host it reads in the content (security audit run-1, lead 2).
 *
 * The list is the set of hosts that match-quotes fetched from for the quotes in content/ on
 * 2026-11-08: the Wayback Machine (archive_url), archive.org OCR files, the fxtwitter API (posts on
 * X), and the live pages of quoted sources that have no archive_url yet.
 *
 * A quote whose source is on another host fails with "host is not on the source allowlist". The
 * usual fix is `npm run archive`, which gives the source a web.archive.org archive_url. Add a host
 * here only after checking that it is the publisher's own public site.
 */
export const SOURCE_HOSTS: ReadonlySet<string> = new Set([
  // Archives and APIs
  "web.archive.org",
  "archive.org",
  "api.fxtwitter.com",
  // Live pages of quoted sources with no archive_url
  "cms.rajyasabha.nic.in",
  "dev1.cpim.org",
  "elibrary.sansad.in",
  "pib.gov.in",
  "theprint.in",
  "www.arabnews.com",
  "www.deccanherald.com",
  "www.governancenow.com",
  "www.oneindia.com",
  "www.outlookindia.com",
  "www.pmindia.gov.in",
  "www.rajnathsingh.in",
  "www.theguardian.com",
  "www.thehindu.com",
  "www.tribuneindia.com",
]);
