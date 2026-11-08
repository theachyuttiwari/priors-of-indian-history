// Regression: the quote checker must not fetch from loopback, LAN or arbitrary hosts named in
// content, nor follow a redirect there (security audit run-1, lead 2:
// pipeline/match-quotes.ts:sourceText:content-url-ssrf-passage-exfil). No test here uses the network:
// fetch and DNS are passed in.
import { describe, expect, it } from "vitest";
import path from "node:path";
import { archiveOrgItem, rawArchiveUrl, xPostText } from "../pipeline/lib/quote-source";
import {
  BlockedUrlError,
  checkSourceUrl,
  HttpStatusError,
  isPublicAddress,
  safeFetch,
  type SafeFetchDeps,
} from "../pipeline/lib/safe-fetch";
import { SOURCE_HOSTS } from "../pipeline/lib/source-hosts";
import { validateContent } from "../src/lib/validate";

const PUBLIC = "93.184.215.14";

type Call = { url: string; init?: RequestInit };

function fakeDeps(
  responses: Record<string, () => Response>,
  dns: Record<string, string[]> = {},
): SafeFetchDeps & { calls: Call[] } {
  const calls: Call[] = [];
  return {
    calls,
    fetch: (async (input: string | URL | Request, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      const r = responses[url];
      if (!r) throw new Error(`unexpected fetch ${url}`);
      return r();
    }) as typeof fetch,
    lookup: async (host) =>
      (dns[host] ?? [PUBLIC]).map((address) => ({ address, family: address.includes(":") ? 6 : 4 })),
  };
}

const redirect = (status: number, location: string) => () => new Response(null, { status, headers: { location } });
const ok = (body: string) => () => new Response(body, { status: 200 });

describe("checkSourceUrl", () => {
  it.each([
    "https://web.archive.org/web/2020id_/https://example.com/",
    "https://api.fxtwitter.com/status/1",
    "https://WWW.TheHindu.com/news/x",
    "https://www.tribuneindia.com:443/x",
  ])("allows %s", (url) => {
    expect(() => checkSourceUrl(url)).not.toThrow();
  });

  it.each([
    ["http://web.archive.org/web/1/x", /only https/],
    ["file:///etc/passwd", /only https/],
    ["ftp://web.archive.org/x", /only https/],
    ["https://127.0.0.1/web/1/x", /IP address/],
    ["https://[::1]/x", /IP address/],
    ["https://192.168.1.1/", /IP address/],
    ["https://localhost/", /allowlist/],
    ["https://example.com/", /allowlist/],
    ["https://web.archive.org.evil.example/x", /allowlist/],
    ["https://evil.web.archive.org/x", /allowlist/],
    ["https://web.archive.org:8080/x", /default https port/],
    ["https://user:pw@web.archive.org/x", /user name/],
    ["not a url", /valid URL/],
  ])("blocks %s", (url, why) => {
    expect(() => checkSourceUrl(url)).toThrow(why);
  });
});

describe("isPublicAddress", () => {
  it.each(["93.184.215.14", "8.8.8.8", "2606:4700::6810:84e5"])("public: %s", (a) => {
    expect(isPublicAddress(a)).toBe(true);
  });

  it.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.1.1",
    "169.254.169.254",
    "100.64.0.1",
    "0.0.0.0",
    "224.0.0.1",
    "255.255.255.255",
    "::1",
    "::",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "fc00::1",
    "fd12:3456::1",
    "fe80::1",
    "64:ff9b::7f00:1",
    "not-an-ip",
  ])("not public: %s", (a) => {
    expect(isPublicAddress(a)).toBe(false);
  });
});

describe("safeFetch", () => {
  it("returns the body of an allowed URL and asks fetch not to follow redirects itself", async () => {
    const deps = fakeDeps({ "https://web.archive.org/a": ok("alpha bravo") });
    const r = await safeFetch("https://web.archive.org/a", { deps });
    expect(r.bytes.toString()).toBe("alpha bravo");
    expect(deps.calls[0].init?.redirect).toBe("manual");
  });

  it("never fetches a URL that is not allowed", async () => {
    const deps = fakeDeps({});
    await expect(safeFetch("http://127.0.0.1:8080/web/1id_/x", { deps })).rejects.toThrow(BlockedUrlError);
    expect(deps.calls).toEqual([]);
  });

  it("never fetches an allowed host that resolves to a private address", async () => {
    const deps = fakeDeps({}, { "web.archive.org": [PUBLIC, "10.0.0.5"] });
    await expect(safeFetch("https://web.archive.org/a", { deps })).rejects.toThrow(
      /non-public address \(10\.0\.0\.5\)/,
    );
    expect(deps.calls).toEqual([]);
  });

  it("follows a redirect on the same host", async () => {
    const deps = fakeDeps({
      "https://web.archive.org/web/1id_/x": redirect(302, "/web/2id_/x"),
      "https://web.archive.org/web/2id_/x": ok("found"),
    });
    const r = await safeFetch("https://web.archive.org/web/1id_/x", { deps });
    expect(r.bytes.toString()).toBe("found");
    expect(r.url).toBe("https://web.archive.org/web/2id_/x");
  });

  it.each([
    ["to loopback", "http://127.0.0.1:9000/", /only https/],
    ["to a LAN address over https", "https://192.168.1.1/", /IP address/],
    ["to a host not on the list", "https://evil.example/", /allowlist/],
    ["to another allowed host", "https://archive.org/x", /another host/],
  ])("does not follow a redirect %s", async (_, location, why) => {
    const deps = fakeDeps({ "https://www.oneindia.com/x": redirect(301, location) });
    await expect(safeFetch("https://www.oneindia.com/x", { deps })).rejects.toThrow(why);
    expect(deps.calls.map((c) => c.url)).toEqual(["https://www.oneindia.com/x"]);
  });

  it("checks DNS again on every redirect hop", async () => {
    let n = 0;
    const deps = fakeDeps({ "https://web.archive.org/a": redirect(302, "/b") });
    deps.lookup = async () => [{ address: n++ === 0 ? PUBLIC : "127.0.0.1", family: 4 }];
    await expect(safeFetch("https://web.archive.org/a", { deps })).rejects.toThrow(/non-public/);
    expect(deps.calls.map((c) => c.url)).toEqual(["https://web.archive.org/a"]);
  });

  it("stops after too many redirects", async () => {
    const deps = fakeDeps({ "https://web.archive.org/a": redirect(302, "/a") });
    await expect(safeFetch("https://web.archive.org/a", { deps })).rejects.toThrow(/redirects/);
  });

  it("rejects a body larger than the cap, by header or by bytes read", async () => {
    const big = "x".repeat(101);
    const byHeader = fakeDeps({
      "https://web.archive.org/a": () => new Response(big, { headers: { "content-length": "101" } }),
    });
    await expect(safeFetch("https://web.archive.org/a", { deps: byHeader, maxBytes: 100 })).rejects.toThrow(/larger/);

    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < 5; i++) c.enqueue(new TextEncoder().encode("x".repeat(30)));
        c.close();
      },
    });
    const byBytes = fakeDeps({ "https://web.archive.org/a": () => new Response(stream) });
    await expect(safeFetch("https://web.archive.org/a", { deps: byBytes, maxBytes: 100 })).rejects.toThrow(/larger/);
  });

  it("reports an HTTP error with the same text as before", async () => {
    const deps = fakeDeps({ "https://web.archive.org/a": () => new Response("no", { status: 404 }) });
    const err = await safeFetch("https://web.archive.org/a", { deps }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(HttpStatusError);
    expect(String(err)).toBe("Error: HTTP 404");
  });
});

describe("SOURCE_HOSTS", () => {
  it("covers every address match-quotes fetches for the quotes in content/ today", () => {
    const blocked: string[] = [];
    for (const r of validateContent(path.join(process.cwd(), "content"))) {
      const p = r.entry;
      if (!p) continue;
      for (const pos of p.positions) {
        const src = pos.quote && p.sources.find((s) => s.id === pos.quote!.source);
        if (!src) continue;
        // The same choice as match-quotes.ts; an archive.org item is read from archive.org itself.
        const item = archiveOrgItem(src.url);
        const url =
          xPostText(src.url) ??
          (item ? `https://archive.org/download/${item}/` : undefined) ??
          (src.archive_url ? rawArchiveUrl(src.archive_url) : src.url);
        try {
          checkSourceUrl(url);
        } catch (e) {
          blocked.push(`${p.id} ${src.id}: ${String(e)}`);
        }
      }
    }
    expect(blocked).toEqual([]);
  });

  it("holds only lowercase host names", () => {
    for (const h of SOURCE_HOSTS) expect(h).toMatch(/^[a-z0-9.-]+$/);
  });
});
