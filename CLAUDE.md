# CLAUDE.md

Elonulator is a Cloudflare Worker that visualizes wealth inequality through relative-worth
calculations. The Worker (`src/index.js`) serves a static frontend (`public/`) and a small JSON
API at `/api/billionaires`.

## Development commands

- `npm run dev` — run the Worker locally with `wrangler dev`
- `npm test` — run the test suite with coverage (`vitest run --coverage`)
- `npm run lint` — lint with ESLint
- `npm run format` — format with Prettier (`format:check` to check only; CI runs both checks)
- `npm run build` — no-op build step; static assets are served as-is
- `npm run deploy` — deploy the Worker with `wrangler deploy`
- `pre-commit run --all-files` — the hooks in `.pre-commit-config.yaml`, which run the same tools

## Layout

The frontend is split three ways, and the split is enforced by convention rather than tooling —
each file says so in its own header:

- `public/utils.js` — **formatting only** (`formatCurrency`, `formatNumberWithCommas`,
  `parseFormattedNumber`, …). No calculation.
- `public/calc.js` — **calculation only**. Both directions of the calculator are
  `scaleByWealthRatio`; `calculateMedianEquivalent` and `calculateBillionaireEquivalent` are named
  aliases over it, so validation lives in one place.
- `public/script.js` — all DOM wiring and module-level state. Put a formatter in `utils.js`, not here.

`src/index.js` is the Worker: static assets plus `/api/billionaires`.

## Tests

Tests for `public/*.js` live in `src/__tests__/`, not beside the code. The default environment is
`node`; a file that needs a DOM opts in with a `// @vitest-environment happy-dom` comment on line 1
(see `script.test.js`).

`script.js` wires itself up on import, so a test needing different startup conditions — the
API-failure path, for instance — needs its own file with the stubs in place before the import.
`script-error.test.js` is that pattern.

**Coverage thresholds are 80% on all four metrics and are measured over everything in `src/` and
`public/`.** `public/script.js` used to be excluded, which meant "100% coverage" was measured over
58 statements while the 437-line file carrying most of the app went unmeasured. Don't re-add an
exclusion to make a number look better.

## Formatting

Prettier is configured for 4-space indent, single quotes, and 110 columns (`.prettierrc`).
`.github/` is Prettier-ignored (`.prettierignore`), which is why the workflow YAML uses 2-space
indent while everything else uses 4.

## Before committing

`.github/workflows/ci.yml` is a thin caller of
`jluszcz/github-utils/.github/workflows/node-ci.yml` — the steps live in that shared workflow,
not in this repo. It installs with `npm ci` against the lockfile on Node 22, then runs
`npm run build`, `npm test`, `npm run lint`, and `npm run format:check`.

Note the triggers are scoped to `main`: pushes to a **feature branch do not run CI**, only pushes
to `main` and pull requests targeting `main`. Since work happens on feature branches, run these
checks locally and confirm they pass **before** committing any change — do not rely on CI to catch
formatting or lint issues after the fact.

## Source data

Billionaire net worths and the median American net worth are hardcoded in `src/index.js`
(`BILLIONAIRE_DATA` and `MEDIAN_AMERICAN_NET_WORTH`). Net worths are entered in billions of
dollars and expanded to absolute dollars when the API responds. The list is sorted by net worth
when served, so source order does not matter.

**When you update any of this source data, also update the `DATA_AS_OF` constant in
`src/index.js`** — it is returned as `lastUpdated` by the `/api/billionaires` handler. The worked
example in `README.md` quotes both figures too, so it needs the same update.
