# prototype/ — disposable

Scratch space for proving a data pipeline before any React is written. **Nothing in here is
shipped, imported by the app, or maintained.** Delete freely.

If you add a zero-build HTML prototype, serve it over HTTP, not `file://` — an opaque origin
breaks `fetch`:

```bash
node --experimental-strip-types -e "require('http')" # any static server will do
npx serve prototype   # or similar
```

## What was actually done for tool #1

No HTML prototype was written for the soil tool. The pipeline was proved two other ways, both of
which exercise more of the real code than an HTML file would:

1. **`curl` against USDA Soil Data Access and Photon** — confirmed the response shapes, the CORS
   headers, the error format (XML with HTTP 200) and the no-match format (`{}`), and timed the
   endpoint across eight runs.
2. **Node running the shipping `src/lib/*.ts` directly** via `--experimental-strip-types`, against
   the live service, before the app would build at all. This tested the code that actually ships,
   including the dead-zone fallback and the typed errors.

That second approach is the one to reach for first on this project. See
`.claude/skills/add-tool/references/code-patterns.md` §9 for the resolve-hook detail Node needs.
