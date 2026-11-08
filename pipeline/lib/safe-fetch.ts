/**
 * A fetch for quote sources that cannot be pointed at the maintainer's own machine or network.
 *
 * Every request, and every redirect hop, must:
 *   - use https on the default port, with no user name or password in the URL;
 *   - name a host on the allowlist (source-hosts.ts), not an IP address;
 *   - resolve only to public addresses (no loopback, private, link-local, CGNAT, multicast or
 *     reserved ranges);
 *   - stay on the host of the first URL when it redirects.
 * The body is capped in size and the request in time.
 *
 * The DNS check runs before fetch resolves the name again, so a host that changes its answer
 * between the two lookups is not fully excluded. TLS still requires a valid certificate for the
 * allowlisted name, which a service on a private address does not normally hold.
 *
 * Security audit run-1, lead 2 (pipeline/match-quotes.ts:sourceText:content-url-ssrf-passage-exfil).
 */
import { lookup as dnsLookup } from "node:dns/promises";
import net from "node:net";
import { SOURCE_HOSTS } from "./source-hosts";

export const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
export const MAX_REDIRECTS = 5;
export const FETCH_TIMEOUT_MS = 120_000;

export class BlockedUrlError extends Error {
  name = "BlockedUrlError";
}

/** Keeps the default name, so a recorded note still reads "Error: HTTP 404" as before. */
export class HttpStatusError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`);
  }
}

export type LookupFn = (host: string) => Promise<{ address: string; family: number }[]>;

export type SafeFetchDeps = { fetch: typeof fetch; lookup: LookupFn };

export const realSafeFetchDeps: SafeFetchDeps = {
  fetch: (...a) => fetch(...a),
  lookup: (host) => dnsLookup(host, { all: true, verbatim: true }),
};

export type SafeFetchOptions = {
  headers?: Record<string, string>;
  hosts?: ReadonlySet<string>;
  maxBytes?: number;
  deps?: SafeFetchDeps;
};

const NOT_PUBLIC = new net.BlockList();
for (const [net4, bits] of [
  ["0.0.0.0", 8], // "this network"
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, cloud metadata
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved, broadcast
] as const)
  NOT_PUBLIC.addSubnet(net4, bits, "ipv4");
for (const [net6, bits] of [
  ["::", 96], // unspecified, loopback, IPv4-compatible (IPv4-mapped is checked by the IPv4 rules)
  ["64:ff9b::", 96], // NAT64
  ["64:ff9b:1::", 48], // local NAT64
  ["100::", 64], // discard
  ["2001::", 32], // Teredo
  ["2001:db8::", 32], // documentation
  ["2002::", 16], // 6to4
  ["fc00::", 7], // unique local
  ["fe80::", 10], // link-local
  ["fec0::", 10], // site-local (deprecated)
  ["ff00::", 8], // multicast
] as const)
  NOT_PUBLIC.addSubnet(net6, bits, "ipv6");

export function isPublicAddress(address: string): boolean {
  const family = net.isIP(address);
  if (family === 4) return !NOT_PUBLIC.check(address, "ipv4");
  if (family === 6) return !NOT_PUBLIC.check(address, "ipv6");
  return false;
}

/** The parsed URL when it passes the scheme, credential, port and host checks; throws otherwise. */
export function checkSourceUrl(raw: string, hosts: ReadonlySet<string> = SOURCE_HOSTS): URL {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new BlockedUrlError(`not a valid URL: ${raw}`);
  }
  if (u.protocol !== "https:") throw new BlockedUrlError(`only https URLs are fetched: ${u.protocol}`);
  if (u.username || u.password) throw new BlockedUrlError("URL must not hold a user name or password");
  if (u.port !== "") throw new BlockedUrlError(`only the default https port is fetched: ${u.port}`);
  const host = u.hostname.toLowerCase();
  if (net.isIP(host.replace(/^\[|\]$/g, ""))) throw new BlockedUrlError(`IP address hosts are not fetched: ${host}`);
  if (!hosts.has(host)) throw new BlockedUrlError(`host is not on the source allowlist: ${host}`);
  return u;
}

async function assertPublicHost(host: string, lookup: LookupFn): Promise<void> {
  const addrs = await lookup(host);
  if (addrs.length === 0) throw new BlockedUrlError(`${host} did not resolve`);
  const bad = addrs.find((a) => !isPublicAddress(a.address));
  if (bad) throw new BlockedUrlError(`${host} resolves to a non-public address (${bad.address})`);
}

async function readCapped(res: Response, maxBytes: number): Promise<Buffer> {
  const declared = Number(res.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes)
    throw new BlockedUrlError(`response is larger than ${maxBytes} bytes`);
  if (!res.body) return Buffer.alloc(0);
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new BlockedUrlError(`response is larger than ${maxBytes} bytes`);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

const REDIRECT = new Set([301, 302, 303, 307, 308]);

/** The body of `url`, after the checks above on it and on each redirect. Throws on any failure. */
export async function safeFetch(url: string, opts: SafeFetchOptions = {}): Promise<{ bytes: Buffer; url: string }> {
  const { headers = {}, hosts = SOURCE_HOSTS, maxBytes = MAX_SOURCE_BYTES, deps = realSafeFetchDeps } = opts;
  const first = checkSourceUrl(url, hosts);
  let current = first;
  for (let hop = 0; ; hop++) {
    await assertPublicHost(current.hostname, deps.lookup);
    const res = await deps.fetch(current.href, {
      headers,
      redirect: "manual",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (REDIRECT.has(res.status)) {
      await res.body?.cancel();
      if (hop >= MAX_REDIRECTS) throw new BlockedUrlError(`more than ${MAX_REDIRECTS} redirects`);
      const location = res.headers.get("location");
      if (!location) throw new BlockedUrlError(`redirect ${res.status} with no location`);
      const next = checkSourceUrl(new URL(location, current).href, hosts);
      if (next.hostname !== first.hostname)
        throw new BlockedUrlError(`redirect to another host is not followed: ${next.hostname}`);
      current = next;
      continue;
    }
    if (!res.ok) {
      await res.body?.cancel();
      throw new HttpStatusError(res.status);
    }
    return { bytes: await readCapped(res, maxBytes), url: current.href };
  }
}
