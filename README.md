# Elonulator

A web application that visualizes wealth inequality through a relative worth calculator.

## Features

- **Billionaire Comparison**: Select from the top 5 richest people in the world
- **Wealth Perspective Calculator**: Enter an amount a billionaire might spend and see what that would be equivalent to for the median American
- **Swap Direction**: Go the other way — enter what an ordinary person spends and see the billionaire-scale equivalent
- **Editable Net Worths**: Override either side with your own figures; the dropdown switches to "Custom"
- **Real Net Worth Data**: Based on current estimates of billionaire net worth and median American net worth
- **Light/Dark Theme**: Follows your system preference until you pick one
- **Clean Interface**: Simple, easy-to-use interface built with CloudFlare Workers

## How It Works

The calculator uses a simple ratio to show perspective:

```
Equivalent Amount = (Billionaire Spending / Billionaire Net Worth) × Median American Net Worth
```

For example, if Elon Musk (net worth ~$788 billion) buys a $788 million yacht, that represents 0.1% of his wealth. For the median American (net worth ~$193,000), 0.1% would be about $193.

Those figures come from `src/index.js` — `BILLIONAIRE_DATA` and `MEDIAN_AMERICAN_NET_WORTH`. If you update them, update this example too.

## Tech Stack

- **CloudFlare Workers**: Serverless backend
- **Vanilla JavaScript**: No framework needed for this simple app
- **Static Assets**: HTML, CSS, and JS served from CloudFlare Workers

## Development

### Prerequisites

- Node.js and npm
- Wrangler CLI (`npm install -g wrangler`)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Visit `http://localhost:8787` to view the application.

### Checks

```bash
npm test              # Vitest with coverage (80% thresholds on all four metrics)
npm run lint          # ESLint
npm run format:check  # Prettier (npm run format to fix)
pre-commit run --all-files
```

CI runs `npm ci`, `npm run build`, `npm test`, `npm run lint`, and `npm run format:check` on Node 22 via the shared
`jluszcz/github-utils` workflow.

### Deployment

```bash
# Deploy to CloudFlare Workers
npm run deploy
```

## Data Sources

- Billionaire net worth: Estimates based on Forbes Real-Time Billionaires List
- Median American net worth: Federal Reserve Survey of Consumer Finances

Note: Net worth figures are estimates and fluctuate frequently. The data in this application is updated manually and may not reflect real-time changes.

## License

MIT License - see LICENSE file for details
