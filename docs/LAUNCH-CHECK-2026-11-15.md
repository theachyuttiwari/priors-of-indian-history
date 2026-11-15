# Launch check, 2026-11-15

Live site: https://theachyuttiwari.github.io/priors-of-indian-history/ (GitHub Pages, project address).
Branch `launch-check-2026-11-15`, based on `main` at e28ce6d. Production is not deployed: merging to
`main` deploys it (`.github/workflows/build.yml`). The draft was a local server that serves the static
export the way Pages does: under `/priors-of-indian-history/`, `404.html` with status 404, no custom headers.

"Before" is the live site, built from 31a696a. "After" is the draft, built from a clean clone of e3d3ad3
with the production `SITE_URL` and `BASE_PATH`.

## Results

| #   | Item                   | Before                                                                        | After                                                                                                                                                                                                                                                                  |
| --- | ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Icons                  | `icon.svg` only                                                               | Added `favicon.ico` (16/32/48), `apple-icon.png` (180), `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png` and `manifest.webmanifest`. All scaled from `src/app/icon.svg` by `pipeline/icons.sh`. Served bytes match the committed files (md5). |
| 2   | Name and mark          | "Priors" and the tick mark in the header                                      | No change.                                                                                                                                                                                                                                                             |
| 3   | Copyright and contact  | Licence line, Corrections, "Report an error"                                  | No change. Open: owner ruling.                                                                                                                                                                                                                                         |
| 4   | Link previews          | No `og:url` on any page. 28 entry pages had no `og:image`                     | `og:url` on 282 of 282 pages. The 28 entry pages use the home card. The 225 action pages keep their own cards.                                                                                                                                                         |
| 5   | Canonical              | None                                                                          | One self canonical on each of the 282 pages, at the current address.                                                                                                                                                                                                   |
| 6   | robots.txt and sitemap | `User-agent: *` / `Allow: /`                                                  | `*` and 12 named AI agents allowed, `Content-Signal: search=yes, ai-input=yes, ai-train=yes`, sitemap link. Sitemap unchanged (282 URLs with `lastmod`).                                                                                                               |
| 7   | Structured data        | None                                                                          | Home: Organization "Priors", WebSite, Dataset (CC BY 4.0). Other pages: WebPage.                                                                                                                                                                                       |
| 8   | llms.txt               | 404                                                                           | `llms.txt` lists the 35 Markdown copies, using wording taken from the site.                                                                                                                                                                                            |
| 9   | AI crawlers            | 12 agents get 200 on `/`; `llms.txt` returns 404                              | 12 agents × 5 paths all return 200 on the draft.                                                                                                                                                                                                                       |
| 10  | Markdown twins         | None                                                                          | `index.md` for the 7 section pages and the 28 entries, with `rel="alternate"` links. `pipeline/verify-out.ts` fails the build when a copy's numbers differ from its page.                                                                                              |
| 11  | Static facts in HTML   | Present                                                                       | No change.                                                                                                                                                                                                                                                             |
| 12  | No blank screens       | All content shows without JavaScript, but the filters do nothing              | Same content. Without JavaScript the precedent filters are hidden (`@media (scripting: none)`).                                                                                                                                                                        |
| 13  | 404 page               | Status 404, noindex, links                                                    | No change.                                                                                                                                                                                                                                                             |
| 14  | Security               | HSTS only (from GitHub)                                                       | CSP meta tag on all 285 pages: inline scripts allowed by sha256, checked by `verify-out.ts` and unit tests. Referrer-policy meta tag. 0 CSP violations on 14 pages × 2 sizes × light/dark.                                                                             |
| 15  | Accessibility (axe)    | 24 violations (color-contrast, 12 pages × 2 sizes)                            | 0 with the kit's rule set. With the WCAG 2.2 rules added: 1 rule (target-size) on the home page only.                                                                                                                                                                  |
| 16  | Lighthouse             | Performance 100. Accessibility 90 (home) and 95–96. Best practices 100. CLS 0 | Performance 98–100. Accessibility 100, except home at 95 (target-size). Best practices 100. CLS 0.                                                                                                                                                                     |
| 17  | Links                  | 2,107 external links, of which 674 failed a parallel check                    | 119 of 1,724 external URLs fail a serial recheck (listed under "Source links"). All 1,224 site-internal URLs in the draft return 200.                                                                                                                                  |
| 18  | Console                | Clean                                                                         | Clean. The only error is the deliberate 404 test.                                                                                                                                                                                                                      |
| 19  | Phones                 | No horizontal overflow                                                        | No horizontal overflow at 390×844 or 844×390 (5 pages).                                                                                                                                                                                                                |
| 20  | Copy gate              | —                                                                             | 0 hits in the new text. The Markdown copies repeat page text verbatim, so their 16 hits are in existing editorial text and were not changed.                                                                                                                           |
| 21  | Tests                  | 227 tests                                                                     | 235 tests pass. `npm run check` passes. Build passes with the new verification step.                                                                                                                                                                                   |
| 22  | Record                 | —                                                                             | This file.                                                                                                                                                                                                                                                             |

## Changes

- Light-mode `--ink-3` changed from `#86868b` to `#6e6e73`. Contrast went from 3.6:1 to 5.1:1 on white and from 3.3:1 to 4.7:1 on `--surface`. Dark mode is unchanged.
- Faded action words (`.dim`) use `--ink-3` in place of `opacity: 0.32` (1.7:1).
- Year-strip ticks are 24 px wide links. The drawn line keeps its height and stands on the axis.
- Zod runs with `jitless: true`. Its `Function("")` probe broke the CSP and cost 4 points of best practices.
- `pipeline/postbuild.ts` runs after `next build`. It writes the Markdown copies and llms.txt. It also adds the canonical, og:url, JSON-LD, referrer and CSP tags to each page.

## Limits of GitHub Pages (project address)

- Pages cannot send headers, so it can't send X-Frame-Options or `frame-ancestors`, `X-Content-Type-Options`, `Permissions-Policy` or COOP. A meta CSP also ignores `frame-ancestors`.
- Crawlers read robots.txt only at the host root (`theachyuttiwari.github.io/robots.txt`), which returns 404 and so allows everything. This site's robots.txt states the policy, but it takes effect only on a domain of the site's own.
- `/favicon.ico` at the host root is outside this repository. The pages link their own icons.
- The content type of `.md` files on Pages has not been seen yet. The draft served `text/markdown`.

## Still open

1. Owner ruling: a © line and a contact address (HANDOFF decision F).
2. Owner ruling: a root robots.txt would need a user-site repository (`theachyuttiwari.github.io`). None was created.
3. Target-size on the home page: 16 ticks at 1440 px and 22 at 390 px overlap a neighbour, because their precedents started within weeks of each other. Every tick's precedent also has a full-size link in the list below the strip (the WCAG 2.5.8 "equivalent" exception). Fixing it fully would mean a design change, such as grouping close ticks.
4. Source links: listed below. Sources are editorial, so none was changed.
5. Production: merging this branch to `main` deploys it. The 2026-11-10 deploy of e28ce6d timed out in `deploy-pages` ("syncing_files"), so the live site is still 31a696a.

## Source links

Rechecked one at a time on 2026-11-15, with a 25 s timeout and one retry: 119 of the 1,724 external URLs in the draft do not return 200 (59 no answer, 35 refused (403), 25 not found (404)). A parallel check reported 674, but most of those were Wayback rate limits. www.hindu.com no longer answers (40 links). For 33 of them the site also links a Wayback copy that does answer. A 403 usually means the site blocks scripts, and a browser may still open the page. Sources are editorial, so none was changed. Owner ruling: replace or archive these.

### Not found (404)

- <http://www.expressindia.com/ie/daily/19961203/33850312.html>
- <http://www.expressindia.com/ie/daily/19970131/03150333.html>
- <http://www.expressindia.com/ie/daily/19970531/15150023.html>
- <https://commons.wikimedia.org/wiki/File:All_India_Trinamool_Congress_flag_(5>
- <https://commons.wikimedia.org/wiki/File:Janata_Dal_(United>
- <https://content.time.com/time/subscriber/article/0>
- <https://frontierweekly.com/archive/vol-number/vol/vol-49-2016-17/49-2/49-2-Railway>
- <https://frontierweekly.com/articles/vol-56/56-49/56-49-The>
- <https://mod.gov.in/sites/default/files/pr3.pdf>
- <https://prsindia.org/files/bills_acts/acts_parliament/2006/the-central-educational-institutions-(reservation-in-admission>
- <https://web.archive.org/web/20170430220634/https://content.time.com/time/subscriber/article/0>
- <https://web.archive.org/web/20190208224513/https://frontierweekly.com/archive/vol-number/vol/vol-49-2016-17/49-2/49-2-Railway>
- <https://web.archive.org/web/20210917024203/https://prsindia.org/files/bills_acts/acts_parliament/2006/the-central-educational-institutions-(reservation-in-admission>
- <https://web.archive.org/web/20240614183100/https://frontierweekly.com/articles/vol-56/56-49/56-49-The>
- <https://web.archive.org/web/20250924163651/https://theprint.in/india/governance/hunger-anger-in-leh-prohibitory-orders-clamped-after-ladakh-statehood-stir-spirals-at-least-3-dead/2750356/>
- <https://web.archive.org/web/20250928054608/https://cdnbbsr.s3waas.gov.in/s395192c98732387165bf8e396c0f2dad2/uploads/2025/09/202509272018515825.pdf>
- <https://web.archive.org/web/20250929163152/https://theprint.in/india/leh-turns-into-a-fortress-for-funeral-of-ex-serviceman-who-fought-in-kargil-but-fell-to-police-bullets/2753789/>
- <https://web.archive.org/web/20251206173930/https://www.pudr.org/publicatiosn-files/2007-Jun-Civil>
- <https://www.mha.gov.in/MHA1/Par2017/pdfs/par2020-pdfs/rs-05022020/360.pdf>
- <https://www.mha.gov.in/MHA1/Par2017/pdfs/par2021-pdfs/rs-10022021/987.pdf>
- <https://www.mha.gov.in/sites/default/files/2022-08/CCSAP-REPORT-060111%5B1%5D.pdf>
- <https://www.mha.gov.in/sites/default/files/shutdown29thJan_30012021_0.pdf>
- <https://www.mha.gov.in/sites/default/files/shutdown5th_06022021_0.pdf>
- <https://www.mha.gov.in/sites/default/files/suspension31st01022021.pdf>
- <https://www.pudr.org/publicatiosn-files/2007-Jun-Civil>

### No answer

- <http://www.hindu.com/2006/01/03/stories/2006010308160100.htm>
- <http://www.hindu.com/2006/01/04/stories/2006010406581200.htm>
- <http://www.hindu.com/2006/01/06/stories/2006010606871200.htm>
- <http://www.hindu.com/2006/01/07/stories/2006010706361200.htm>
- <http://www.hindu.com/2006/01/08/stories/2006010803450800.htm>
- <http://www.hindu.com/2006/05/13/stories/2006051329920300.htm>
- <http://www.hindu.com/2006/05/15/stories/2006051512700100.htm>
- <http://www.hindu.com/2006/05/17/stories/2006051709611300.htm>
- <http://www.hindu.com/2006/05/17/stories/2006051725311600.htm>
- <http://www.hindu.com/2006/05/21/stories/2006052107690100.htm>
- <http://www.hindu.com/2006/05/22/stories/2006052214400100.htm>
- <http://www.hindu.com/2006/05/22/stories/2006052217471400.htm>
- <http://www.hindu.com/2006/05/27/stories/2006052714220100.htm>
- <http://www.hindu.com/2006/05/29/stories/2006052918050100.htm>
- <http://www.hindu.com/2006/05/30/stories/2006053015270100.htm>
- <http://www.hindu.com/2006/05/30/stories/2006053018920100.htm>
- <http://www.hindu.com/2006/05/31/stories/2006053123180100.htm>
- <http://www.hindu.com/2006/06/01/stories/2006060112450100.htm>
- <http://www.hindu.com/2006/12/30/stories/2006123003951200.htm>
- <http://www.hindu.com/2007/02/05/stories/2007020503711300.htm>
- <http://www.hindu.com/2007/03/15/stories/2007031506450100.htm>
- <http://www.hindu.com/2007/03/20/stories/2007032010100100.htm>
- <http://www.hindu.com/2007/05/30/stories/2007053007411200.htm>
- <http://www.hindu.com/2007/05/30/stories/2007053010600100.htm>
- <http://www.hindu.com/2007/05/30/stories/2007053014451400.htm>
- <http://www.hindu.com/2007/05/31/stories/2007053115991400.htm>
- <http://www.hindu.com/2007/06/01/stories/2007060110890100.htm>
- <http://www.hindu.com/2007/06/04/stories/2007060414190100.htm>
- <http://www.hindu.com/2007/06/05/stories/2007060506880100.htm>
- <http://www.hindu.com/2007/12/27/stories/2007122760900100.htm>
- <http://www.hindu.com/2008/05/24/stories/2008052460171200.htm>
- <http://www.hindu.com/2008/05/25/stories/2008052557770100.htm>
- <http://www.hindu.com/2008/05/27/stories/2008052757420100.htm>
- <http://www.hindu.com/2008/05/28/stories/2008052858360100.htm>
- <http://www.hindu.com/2008/05/28/stories/2008052861051900.htm>
- <http://www.hindu.com/2008/05/30/stories/2008053060951200.htm>
- <http://www.hindu.com/2008/06/09/stories/2008060959880100.htm>
- <http://www.hindu.com/2008/06/18/stories/2008061858640100.htm>
- <http://www.hindu.com/2008/06/19/stories/2008061958310100.htm>
- <http://www.hindu.com/2008/10/04/stories/2008100457660100.htm>
- <https://manushi.safyrus.com/wp-content/uploads/2022/11/pdfs_issues/PDF%20files%2063-64/instigators_of_hysteria.pdf>
- <https://manushi.safyrus.com/wp-content/uploads/2022/11/pdfs_issues/PDF%20files%2063-64/many_unexplained_issues.pdf>
- <https://web.archive.org/web/20071209100546/https://www.rediff.com/news/2006/may/27quota3.htm>
- <https://web.archive.org/web/20071215184804/https://www.mainstreamweekly.net/article476.html>
- <https://web.archive.org/web/20080304150219/http://www.hindu.com/2006/05/13/stories/2006051329920300.htm>
- <https://web.archive.org/web/20080620125640/http://www.hindu.com/2008/06/19/stories/2008061958310100.htm>
- <https://web.archive.org/web/20080627002719/https://www.tribuneindia.com/2008/20080619/edit.htm>
- <https://web.archive.org/web/20090130001335/https://indiankanoon.org/doc/1735815/>
- <https://web.archive.org/web/20110109031410/https://www.tribuneindia.com/2011/20110107/main1.htm>
- <https://web.archive.org/web/20110813081216/http://www.hindu.com/2006/05/30/stories/2006053018920100.htm>
- <https://web.archive.org/web/20190626183458/https://www.newindianexpress.com/galleries/nation/2018/jun/25/this-is-how-express-stood-up-to-the-emergency-declared-by-indira-gandhi-in-1975-101601.html>
- <https://web.archive.org/web/20190804204130/https://www.aljazeera.com/news/2019/08/india-imposes-lockdown-kashmir-puts-leaders-house-arrest-190804174841241.html>
- <https://web.archive.org/web/20191219052803/https://www.thehindu.com/news/national/other-states/section-144-enforced-in-all-of-up-ahead-of-caa-protest/article30343108.ece>
- <https://web.archive.org/web/20200324045710/https://indianexpress.com/article/cities/delhi/shaheen-bagh-protests-delhi-coronavirus-6328815/>
- <https://web.archive.org/web/20200519231226/https://indiankanoon.org/doc/123992151/>
- <https://web.archive.org/web/20241002060813/https://www.tribuneindia.com/news/delhi/sonam-wangchuk-detained-again-after-release-indefinite-fast-over-statehood-for-ladakh-continues>
- <https://web.archive.org/web/20241003082345/https://www.livelaw.in/high-court/delhi-high-court/climate-activist-sonam-wangchuk-his-associates-from-ladakh-released-and-set-free-sgi-tushar-mehta-tells-delhi-high-court-271457>
- <https://web.archive.org/web/20260112204432/https://www.outlookindia.com/national/wholly-unconstitutional-news-236066>
- <https://web.archive.org/web/20260723225753/https://www.bbc.com/news/articles/cjwx4x04yqzo>

### Refused (403)

- <http://www.telegraphindia.com/1060103/asp/frontpage/story_5674777.asp>
- <http://www.telegraphindia.com/1060104/asp/frontpage/story_5678941.asp>
- <http://www.telegraphindia.com/1060106/asp/nation/story_5686616.asp>
- <http://www.telegraphindia.com/1060107/asp/nation/story_5690584.asp>
- <http://www.telegraphindia.com/1061202/asp/bengal/story_7080963.asp>
- <http://www.telegraphindia.com/1070205/asp/bengal/story_7351469.asp>
- <http://www.telegraphindia.com/1070316/asp/nation/story_7523913.asp>
- <http://www.telegraphindia.com/1070320/asp/frontpage/story_7541173.asp>
- <http://www.telegraphindia.com/1071110/asp/bengal/story_8532607.asp>
- <http://www.telegraphindia.com/1071110/asp/nation/story_8532005.asp>
- <http://www.telegraphindia.com/1071113/asp/bengal/story_8542655.asp>
- <https://web.archive.org/web/20250924193957/https://www.pib.gov.in/PressReleasePage.aspx?PRID=2170941>
- <https://web.archive.org/web/20250929152728/https://www.pib.gov.in/PressReleasePage.aspx?PRID=2172865>
- <https://www.dnaindia.com/india/report-flop-show-by-anarchists-bjp-sambit-patra-mocks-cjp-protest-says-jantar-mantar-is-not-india-s-story-3222082>
- <https://www.france24.com/en/asia-pacific/20260725-indian-education-minister-resigns-after-mass-protests-over-exam-paper-leaks>
- <https://www.france24.com/en/asia-pacific/20261010-india-s-cockroach-movement-chief-detained-ahead-of-major-protest>
- <https://www.france24.com/en/asia-pacific/20261011-india-court-orders-release-of-cockroach-movement-leaders-after-detention>
- <https://www.france24.com/en/asia-pacific/20261012-opposition-leaders-and-journalists-allege-police-abuses-as-fresh-protests-break-out-in-india>
- <https://www.france24.com/en/live-news/20260722-india-opposition-leader-released-after-protest-detention>
- <https://www.france24.com/en/video/20261005-ndian-police-detain-demonstrators-as-protests-over-voter-roll-revision-intensify>
- <https://www.india.com/news/india/narendra-modi-government-bullying-jnu-says-rahul-gandhi-944484/>
- <https://www.moneylife.in/article/haryana-tense-army-deployed-in-eight-districts/45557.html>
- <https://www.moneylife.in/article/internet-services-blocked-in-haryana-after-clash/45534.html>
- <https://www.ndtv.com/article/india/home-minister-sushil-kumar-shinde-s-statement-on-delhi-gang-rape-308734>
- <https://www.ndtv.com/article/india/in-india-demonstrators-and-police-clash-at-rape-protest-308775>
- <https://www.ndtv.com/article/india/in-late-night-tweet-delhi-police-expresses-regret-for-violence-during-protests-309473>
- <https://www.ndtv.com/article/india/protesters-bid-to-march-to-rashtrapati-bhavan-wasn-t-right-home-minister-shinde-on-delhi-gang-rape-p-309013>
- <https://www.ndtv.com/article/india/sixteen-girls-detained-released-by-delhi-police-over-anti-rape-protests-309721>
- <https://www.ndtv.com/article/india/weren-t-even-near-india-gate-say-those-accused-of-rioting-309996>
- <https://www.ndtv.com/article/india/what-killed-constable-tomar-as-family-grieves-crime-branch-to-investigate-309853>
- <https://www.newsclick.in/kalinganagar-police-firing-2006-killed-13-tribals-was-justified-says-enquiry-commission>
- <https://www.nytimes.com/1996/01/09/business/second-thoughts-on-india-enron-project-on-track-but-policy-doubts-remain.html>
- <https://www.nytimes.com/1996/12/03/business/indian-court-backs-enron-on-power-project.html>
- <https://www.taxtmi.com/news?id=29387>
- <https://www.wionews.com/south-asia/india-tamil-nadu-assembly-passes-jallikattu-bill-11596>
