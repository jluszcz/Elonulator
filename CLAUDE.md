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

## Before committing

`.github/workflows/ci.yml` is a thin caller of
`jluszcz/github-utils/.github/workflows/node-ci.yml@v1` — the steps live in that shared workflow,
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
`src/index.js`** — it is returned as `lastUpdated` by the `/api/billionaires` handler.
