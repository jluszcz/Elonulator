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

The `Build, Lint, and Test` GitHub workflow (`.github/workflows/test.yml`) runs `npm run lint`,
`npm run format:check`, and `npm test` on every push and pull request. Run these same checks
locally and confirm they pass **before** committing any change — do not rely on CI to catch
formatting or lint issues after the fact.

## Source data

Billionaire net worths and the median American net worth are hardcoded in `src/index.js`
(`BILLIONAIRE_DATA` and `MEDIAN_AMERICAN_NET_WORTH`). Net worths are entered in billions of
dollars and expanded to absolute dollars when the API responds. The list is sorted by net worth
when served, so source order does not matter.

**When you update any of this source data, also update the `DATA_AS_OF` constant in
`src/index.js`** — it is returned as `lastUpdated` by the `/api/billionaires` handler.
