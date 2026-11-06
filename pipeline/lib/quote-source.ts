/**
 * Where a quote's source text is fetched from, and whether an earlier check still stands.
 * Used by pipeline/match-quotes.ts.
 */
import type { QuoteCheck } from "../../src/lib/validate";

export const FX_API = "https://api.fxtwitter.com/status/";

/** Raw capture of the original page: the Wayback `id_` form skips the archive toolbar. */
export function rawArchiveUrl(archiveUrl: string): string {
  return archiveUrl.replace(/\/web\/(\d+)\//, "/web/$1id_/");
}

/**
 * A post on X: x.com serves no text without JavaScript, and archived copies rarely hold it. The
 * fxtwitter API returns the post text as JSON. The fetched address is recorded with the result.
 */
export function xPostText(url: string): string | undefined {
  const id = url.match(/^https:\/\/(?:www\.)?(?:x|twitter)\.com\/[^/]+\/status\/(\d+)/)?.[1];
  return id ? `${FX_API}${id}` : undefined;
}

/** The item id of an archive.org details page, whose text is fetched from its OCR file. */
export function archiveOrgItem(url: string): string | undefined {
  return url.match(/^https:\/\/archive\.org\/details\/([^/?#]+)/)?.[1];
}

type SourceRef = { id: string; url: string; archive_url?: string };

/**
 * An "exact" record is skipped only while it still describes this quote's source: the same source
 * id, fetched from an address that belongs to that source as it is now. A quote moved to another
 * source, or a source whose url changed, is checked again. So is a live-page check once the source
 * has an archive_url (the record's note asks for that). Older records fetched straight from x.com,
 * before posts were read through fxtwitter, still count. Decided without network access: an
 * archive.org item's OCR file is matched by its download prefix.
 */
export function exactStillHolds(prior: QuoteCheck | undefined, src: SourceRef): boolean {
  if (prior?.result !== "exact" || prior.source !== src.id) return false;
  const f = prior.fetched;
  if (src.archive_url ? f === rawArchiveUrl(src.archive_url) : f === src.url) return true;
  const x = xPostText(src.url);
  if (x && f === x) return true;
  const item = archiveOrgItem(src.url);
  return !!item && f.startsWith(`https://archive.org/download/${item}/`);
}
