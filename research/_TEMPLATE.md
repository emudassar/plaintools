# Tool research: <the exact phrase people search>

Copy this file, fill it in, save it in `research/`, then run `/add-tool`.
Leave a field blank rather than guessing. **A blank is information; an invented answer is a bug
that ships.**

---

## 1. The keyword

- **Exact search phrase:**
- **Proposed slug:** (`/tools/<slug>/` — lowercase, hyphens, no filler words such as
  `tool`, `utility`, `online`, `free`, `app`, `website`, `page`)
- **Proposed H1 / name:** (phrased the way people type it, e.g. "What Soil Type Is My Property?"
  not "Soil Lookup Utility")
- **Tagline:** (one line naming the specific answer the user gets)
- **Category:** (existing one if it fits; propose a new broad label only if genuinely needed)
- **Scope:** US / Worldwide
- **EMD candidate:** (optional — do not check availability yet, that is a graduation-time step)

## 2. The question this answers

One sentence. If it takes two, it is probably two tools.

## 3. Why the existing options are poor

**This is the entire reason the tool exists. Be specific and name names.**

- What ranks now, and what is wrong with it:
- Buy signals observed (link them):
  - [ ] Official tool is authoritative but unusable, ranking top-5
  - [ ] Forum threads where people ask each other because nothing good exists
  - [ ] Third-party "How to use \[the official tool]" posts or videos
  - [ ] People doing the calculation by hand in comments
- Walk-away signals checked:
  - [ ] A funded SaaS with a pricing page ranks top-5
  - [ ] An entrenched high-authority site holds every long-tail term
  - [ ] The data needs a paid licence
- **Does this duplicate an existing tool on the hub?** (one tool, one question)

## 4. The data source

- **Name and publisher:**
- **Endpoint or file:**
- **Licence / terms URL:**
- **API key needed?** (if yes, this cannot be a client-side tool — stop and reconsider)
- **Quota or rate limit:**

### Verification — paste the actual commands and output

```bash
# request
# → response (first 600 chars)
```

```bash
# CORS preflight AND a real request, several times
# → access-control-* headers observed, per sample
```

- [ ] `Access-Control-Allow-Origin` present on the **preflight**
- [ ] `Access-Control-Allow-Origin` present on the **actual response**, across ≥3 samples
      (a cached copy can be served without it)

**Timings — at least five samples.** One sample tells you nothing.

| Run | Time |
|---|---|
| 1 | |
| 2 | |
| 3 | |
| 4 | |
| 5 | |

- Spread wide enough to need hedged requests? yes / no

**Failure shapes:**

- What an **error** returns (status code *and* body format — do not assume it matches the success
  format):
- What **no match** returns:

## 5. If it is a calculation, not an API

- **Formula:**
- **Where it is documented (URL):**
- **Worked example, by hand:**
- **Checked against which independent reference, and did it agree?**

## 6. The dead zone — inputs where it cannot answer

**Find these before designing the UI.** Do not assume they are rare; for the soil tool the dead
zone turned out to be the normal result.

| Input that fails | What the source returns | How common |
|---|---|---|
| | | |

- **How the fallback explains the gap in plain language:**
- **What the source still records even when the main answer is missing:**
- **What the nearest usable answer is, and how it should be ranked:**
- **How the UI makes clear the fallback is NOT the user's own data:**

## 7. The output

What the visitor sees. A number, card, table, chart or file — be concrete.

- **Headline answer (the one thing at the top):**
- **Supporting detail below it:**
- **Source + retrieval date shown on the result card:** (required, not optional)

## 8. Content notes

- **10 uses** — each a specific person with a specific problem and a real consequence, not a
  category. ("Checking foundation risk before buying a house", not "Real estate".) List them, or
  fewer if there are fewer good ones. **Never inflate to hit a count.**
- **Data section must cover:** what the source is and who made it · how this page gets the answer
  · its limits · what it must not be used for.
- **6–8 FAQs** real users would ask, including "is this the same as \[the official tool]?",
  "why did I get no answer?", and "can I use this instead of \[the professional test]?"

## 9. Privacy

- **New third-party service the visitor's browser will contact?** yes / no
- If yes, it **must** be added to `thirdPartyServices` in `src/config/site.ts`, or the generated
  privacy policy becomes factually wrong. Note name, purpose, privacy URL, and what it receives.

## 10. Open questions / what is still unverified

Be explicit. Anything unverified here must not appear as fact on the page.
