---
name: add-tool
description: Build and publish a new tool on the hub from a research file in research/. Use when adding a tool, building a tool page, or turning tool research into a live page. Covers validation, source verification, dead-zone discovery, the build order and the pre-publish checklist.
---

# Add a tool

Build one new tool, end to end, from a research file in `research/`.

The hub has no subject. A tool belongs here if people genuinely need the answer, the answer can
be produced accurately from a free citable source, and the existing options are weak. A new tool
need have nothing to do with the last one.

## Orient first

Read, in this order:

1. The research file in `research/`.
2. `src/config/tools.ts` — the registry and the existing slugs.
3. `src/lib/soil.ts` — the reference data client.
4. `src/components/SoilTool.tsx` — the reference tool component.
5. `src/app/tools/what-soil-type-is-my-property/page.tsx` — the reference page.
6. `references/content-rules.md` — **before writing any page copy**.
7. `references/code-patterns.md` — the non-obvious mechanics.

If the research is thin, say what is missing and ask. **Do not invent a data source, endpoint,
formula or statistic to fill a gap.**

## Validate before committing — all five must hold

1. **The answer depends on the user's own input.** A page that gives everyone the same answer is
   an article, not a tool.
2. **The data or method is obtainable legitimately and free.** No paid licence, no scraping, no
   per-lookup cost.
3. **The existing options are genuinely poor.** An official database behind an unusable
   interface, a PDF nobody can search, a calculation people do by hand, a topic served only by
   forum guesses. *This gap is the entire reason the tool exists.* **Name it explicitly.**
4. **The output is concrete** — a number, card, table, chart or file.
5. **It runs client-side.** No server, no key, no per-visitor cost.

**Strong buy signals:** an authoritative but unusable official tool ranking top-5; forum threads
where people ask each other because nothing good exists; **posts or videos titled "How to use
\[the official tool]"** — third parties spending their own effort documenting someone else's
interface proves demand *and* unusability at once; people doing the calculation by hand in
comments.

**Walk away** if a funded SaaS with a pricing page ranks top-5, if an entrenched high-authority
site holds every long-tail term, or if the data needs a paid licence. **Also check it does not
duplicate an existing tool** — one tool, one question.

## Verify the source before writing any code — non-negotiable

```bash
curl -s -X POST "https://<endpoint>" -H "Content-Type: application/json" -d '<query>' | head -c 600
curl -s -o /dev/null -D - -X OPTIONS "https://<endpoint>" \
  -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" | grep -i access-control
```

**No CORS header means no client-side tool.** Find another endpoint, or pre-bake the data into
static JSON at build time. **Do not add a proxy** — that reintroduces a per-visitor cost.

Check the CORS header on the *actual* request too, not only the preflight. A cached response can
come back without it — that is exactly why Nominatim was rejected in favour of Photon.

**Time it at least five times.** One sample tells you nothing; these endpoints are erratic. If
the spread is wide, use the hedged-request helper in `src/lib/hedge.ts`.

Check what an **error** looks like, not just a success. USDA SDA returns XML with HTTP 200 even
when JSON was requested. Check what **no match** looks like too — SDA returns `{}`, not an empty
array.

For a pure calculation with no API: state the formula, cite where it is documented, work an
example by hand, and check it against an independent reference. **Never ship a formula you cannot
cite.**

## Find the dead zone before designing the UI

**Every tool has inputs where it cannot answer. Find them first.** This is the single most common
way a tool ships broken.

| Tool shape | Where it falls over |
|---|---|
| Location lookup | Built-up land, water, outside coverage, disputed borders |
| Dataset lookup | Discontinued models, missing fields, pre-digital entries |
| Calculation | Zero, negative, absurdly large values, unit confusion, divide-by-zero |
| Conversion | Ambiguous input, precision loss, locale separators |
| Time-based | Leap years, DST boundaries, historic and future dates |

Do not assume the dead zone is rare. For the soil tool it turned out that four of five tested
urban points had no soil profile at all — **the dead zone was the normal result**, and the
fallback matters more than the happy path.

The fallback must:

1. **Explain why the data is missing**, in plain language. An unexplained blank reads as a broken
   tool; an explained blank reads as expertise.
2. **Show whatever the source still records.** Never render an empty page when partial data exists.
3. **Offer the nearest usable answer**, ranked by what the user cares about — usually proximity,
   not whatever the database sorts by naturally.
4. **Never present the fallback as the point's own data.** That line is the whole credibility of
   the site.

And when there is honestly no good fallback, say so. Offering a 1%-share inclusion as "the
nearby soil" is worse than returning nothing.

## Build order

1. **Registry** — add to `src/config/tools.ts` with `status: "planned"`. Flip to `"live"` last.
   Add a category only if the tool needs one, with a label broad enough to hold future tools.
2. **Logic** (`src/lib/<name>.ts`) — typed result interface, `ToolError` with a `kind`, and
   `null` for every absent value. Hedged requests if it calls a remote service. No React here.
3. **Component** (`src/components/<Name>Tool.tsx`) — `"use client"`, four real states
   (idle / loading / error / result), headline answer first with detail below. A purely local
   calculation has no loading state — **do not invent one**. **The source, formula or retrieval
   date goes on the result card**, not only in the page footer.
4. **Page** (`src/app/tools/<slug>/page.tsx`) — render `ToolPageLayout` and supply content only.

If the tool calls a new third-party service, **add it to `thirdPartyServices` in
`src/config/site.ts`** in the same change. The privacy policy is generated from that array, so
skipping it makes the policy factually wrong.

## Verify

Run `npm run build` for type errors and the slug guard. Then **actually run it**:

- the happy path, with a sanity-checked real result;
- the dead zone;
- a hard error;
- **a cross-check against an independent reference** — the official interface, a published worked
  example, or the calculation by hand.

Report what you checked it against and whether it agreed. The `lib/` code runs directly under
`node --experimental-strip-types`, so it can be exercised against the live service before the app
builds.

Only now flip `status` to `"live"`, and confirm the URL appears in `/sitemap.xml`.

## Pre-publish checklist

- [ ] Slug is the exact search phrase, no filler, build passes the slug guard
- [ ] Title has the keyword near the front; meta description promises the specific answer
- [ ] One H1; headings describe content, not keywords
- [ ] Tool renders above all prose
- [ ] 10 uses, each a specific person with a real consequence
- [ ] Data section states the source, how the page gets it, **its limits**, and what it must not
      be used for
- [ ] 6–8 FAQs people would actually ask
- [ ] Source + retrieval date on the result card itself
- [ ] Every factual claim traceable — no invented stats, tests, experience or credentials
- [ ] No advice — only what the source says or the formula gives
- [ ] Internal links point at URLs that exist
- [ ] Schema matches what is actually on the page
- [ ] Nothing duplicates an existing page
- [ ] New third-party service added to `thirdPartyServices` in `config/site.ts`
- [ ] Sitewide copy untouched, or still subject-neutral if changed

## Finally

Move the research file to `research/_completed/`, and update `MEMORY.md` — current stage, the
live tools table, anything still broken, and the next actions.
