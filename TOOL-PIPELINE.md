# TOOL-PIPELINE.md

The manual version of what `.claude/skills/add-tool/` automates. Follow this when adding a tool
by hand, or read it to understand what the skill is doing and why.

Every step exists because skipping it has a specific, predictable failure mode. Those are named.

---

## 0. Start from research, not from an idea

Put a filled-in copy of `research/_TEMPLATE.md` in `research/`. If the research is thin, say what
is missing and ask.

**Never invent a data source, endpoint, formula or statistic to fill a gap.** A plausible-looking
endpoint that does not exist is worse than an unfinished tool: it ships, it 404s silently, and
the page keeps claiming an answer it cannot produce.

---

## 1. Validate the idea — all five must hold

1. **The answer depends on the user's own input.** A page that gives everyone the same answer is
   an article, not a tool.
2. **The data or method is obtainable legitimately and free.** No paid licence, no scraping, no
   per-lookup cost.
3. **The existing options are genuinely poor.** *This gap is the entire reason the tool exists —
   write it down explicitly.* An official database behind an unusable interface, a PDF nobody can
   search, a calculation people do by hand, a topic served only by forum guesses.
4. **The output is concrete** — a number, card, table, chart or file.
5. **It runs client-side.** No server, no key, no per-visitor cost.

**Buy signals:** an authoritative but unusable official tool ranking top-5; forum threads where
people ask each other because nothing good exists; **posts or videos titled "How to use \[the
official tool]"** — third parties spending their own effort documenting someone else's interface
proves demand *and* unusability at once; people doing the calculation by hand in comments.

**Walk away** if a funded SaaS with a pricing page ranks top-5, if an entrenched high-authority
site holds every long-tail term, or if the data needs a paid licence.

**Check it does not duplicate an existing tool.** One tool, one question. If it answers two
questions, it is two tools and two pages.

---

## 2. Verify the source — before any code

```bash
# Does it return what you think?
curl -s -X POST "https://<endpoint>" -H "Content-Type: application/json" -d '<query>' | head -c 600

# Will a browser be allowed to call it?
curl -s -o /dev/null -D - -X OPTIONS "https://<endpoint>" \
  -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" | grep -i access-control
```

**No CORS header means no client-side tool.** Find another endpoint or pre-bake the data into
static JSON at build time. **Do not add a proxy** — that reintroduces a per-visitor cost, which
is the thing this whole model avoids.

Check the header on the **real request** as well as the preflight, several times. A cached
response can come back without it. That is exactly why Nominatim was rejected for this project:
it sits behind a Varnish cache whose `Vary` does not include `Origin`.

**Time it at least five times.** One sample tells you nothing. USDA SDA measured
`1.02 / 1.30 / 1.34 / 1.25 / 7.66 / 1.06 / 2.58 / 2.16` seconds on eight identical queries. If
the spread is wide, use hedged requests (`src/lib/hedge.ts`), never sequential retries.

**Find out what failure looks like.** Not just success:

- What does an **error** return? (USDA SDA: XML, with HTTP 200, even when JSON was requested.)
- What does **no match** return? (USDA SDA: `{}`, with no `Table` key at all.)

For a pure calculation with no API: state the formula, cite where it is documented, work an
example by hand, and check it against an independent reference. **Never ship a formula you
cannot cite.**

---

## 3. Find the dead zone — before designing the UI

**Every tool has inputs where it cannot answer. Find them first.** This is the single most
common way a tool ships broken.

| Tool shape | Where it falls over |
|---|---|
| Location lookup | Built-up land, water, outside coverage, disputed borders |
| Dataset lookup | Discontinued models, missing fields, pre-digital entries |
| Calculation | Zero, negative, absurdly large values, unit confusion, divide-by-zero |
| Conversion | Ambiguous input, precision loss, locale separators |
| Time-based | Leap years, DST boundaries, historic and future dates |

**Do not assume the dead zone is rare.** For the soil tool, four of five tested urban points
returned no soil profile at all. The dead zone was the *normal* result, which means the fallback
deserved more care than the happy path.

The fallback must:

1. **Explain why the data is missing**, in plain language. An unexplained blank reads as a broken
   tool; an explained blank reads as expertise.
2. **Show whatever the source still records.** Never render an empty page when partial data
   exists.
3. **Offer the nearest usable answer**, ranked by what the user cares about — usually proximity,
   not whatever the database sorts by naturally.
4. **Never present the fallback as the point's own data.** That line is the whole credibility of
   the site.

And when there is honestly nothing good to offer, say so plainly. Presenting a 1%-share inclusion
as "the nearby soil" is worse than returning nothing.

---

## 4. Build, in this order

**1. Registry** — `src/config/tools.ts`, `status: "planned"`.

Adding this one entry wires the tool into the homepage grid, the tools index, the nav dropdown,
the footer, related-tool blocks and the sitemap. There is no second place to register a tool.
Add a category only if the tool needs one, with a label broad enough to hold future tools
(`Home & Property`, not `Soil Data`).

The slug **is** the keyword. It must pass the build-time guard: lowercase, hyphen-separated, no
duplicates, 60 characters or fewer, and none of the filler words `tool`, `utility`, `online`,
`free`, `app`, `website`, `page`. **If a slug fails the guard, fix the slug — never weaken the
guard.**

**2. Logic** — `src/lib/<name>.ts`

Framework-free. A typed result interface, a `ToolError` carrying a `kind`
(`no-data` / `unavailable` / `bad-input`), and `null` for every value that can be absent —
null-handling is the default, not an edge case. Hedged requests if it calls a remote service.
Validate any value before interpolating it into a query, even one that came back from the same
API.

**3. Component** — `src/components/<Name>Tool.tsx`

`"use client"`. Four real states: idle / loading / error / result. Headline answer first, detail
below. A purely local calculation has no loading state — **do not invent one.**

**The source, formula or retrieval date goes on the result card**, not only in the page footer.
That is the difference between a data site and a content farm.

The error state must distinguish "no data for this input" (explain, offer the fallback) from
"service is down" (say so, offer retry). Only the second gets a retry button.

**4. Page** — `src/app/tools/<slug>/page.tsx`

Render `ToolPageLayout` and supply content only. The section order is fixed: tool, how-to, uses,
data, FAQs, related. Read `.claude/skills/add-tool/references/content-rules.md` before writing
any of that copy.

**If the tool calls a new third-party service, add it to `thirdPartyServices` in
`src/config/site.ts` in the same change.** The privacy policy is generated from that array, so
skipping this makes the policy factually wrong.

---

## 5. Verify

```bash
npm run build     # type errors and the slug guard
```

Then **actually run it**, and record what happened:

- **the happy path**, with a result you have sanity-checked;
- **the dead zone**;
- **a hard error**;
- **a cross-check against an independent reference** — the official interface, a published worked
  example, or the calculation by hand.

Report what you checked it against and whether it agreed. If it disagreed, say by how much and
why before shipping.

The `lib/` code runs directly under Node, so this can happen before the app builds:

```bash
node --experimental-strip-types yourscript.mjs
```

(Avoid TS parameter properties in `lib/` — they need a transform, not just type stripping.)

Only now flip `status` to `"live"`, and confirm the URL appears in `/sitemap.xml`.

---

## 6. Pre-publish checklist

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

---

## 7. Close out

Move the research file to `research/_completed/`, and update `MEMORY.md`: current stage, the live
tools table, anything still broken, and the next actions. Use absolute dates.
