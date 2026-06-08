# CLAUDE.md

Elonulator is a Cloudflare Worker that visualizes wealth inequality through relative-worth
calculations. The Worker (`src/index.js`) serves a static frontend (`public/`) and a small JSON
API at `/api/billionaires`.

## Development commands

- `npm run dev` — run the Worker locally with `wrangler dev`
- `npm test` — run the test suite with coverage (`vitest run --coverage`)
- `npm run build` — no-op build step; static assets are served as-is
- `npm run deploy` — deploy the Worker with `wrangler deploy`

## Source data

Billionaire net worths and the median American net worth are hardcoded in `src/index.js`
(`BILLIONAIRE_DATA` and `MEDIAN_AMERICAN_NET_WORTH`). Net worths are entered in billions of
dollars and expanded to absolute dollars when the API responds. The list is sorted by net worth
when served, so source order does not matter.

**When you update any of this source data, also update:**

- the `lastUpdated` date returned by the `/api/billionaires` handler in `src/index.js`
- the "as of <month year>" comments next to the data in `src/index.js`
