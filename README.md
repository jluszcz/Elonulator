# Elonulator

A web application that visualizes wealth inequality through a relative worth calculator.

## Features

- **Billionaire Comparison**: Select from the top 5 richest people in the world
- **Wealth Perspective Calculator**: Enter an amount a billionaire might spend and see what that would be equivalent to for the median American
- **Real Net Worth Data**: Based on current estimates of billionaire net worth and median American net worth
- **Clean Interface**: Simple, easy-to-use interface built with CloudFlare Workers

## How It Works

The calculator uses a simple ratio to show perspective:

```
Equivalent Amount = (Billionaire Spending / Billionaire Net Worth) × Median American Net Worth
```

For example, if Elon Musk (net worth ~$430 billion) buys a $430 million yacht, that represents 0.1% of his wealth. For the median American (net worth ~$1,063,700), 0.1% would be about $1,063.70.

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
