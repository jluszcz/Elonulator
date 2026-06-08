// Static billionaire data (as of June 2026)
// This data can be updated manually or could be fetched from an API in the future
// Source: https://www.forbes.com/real-time-billionaires/
// Net worths are entered in billions of dollars for easy data entry.
const BILLION = 1000000000;
const BILLIONAIRE_DATA = [
    {
        name: "Elon Musk",
        netWorthBillions: 788,
        source: "Tesla, SpaceX, X"
    },
    {
        name: "Larry Page",
        netWorthBillions: 300,
        source: "Google"
    },
    {
        name: "Sergey Brin",
        netWorthBillions: 277,
        source: "Google"
    },
    {
        name: "Larry Ellison",
        netWorthBillions: 261,
        source: "Oracle"
    },
    {
        name: "Jeff Bezos",
        netWorthBillions: 255,
        source: "Amazon"
    }
];

const MEDIAN_AMERICAN_NET_WORTH = 193000; // $193,000 (as of June 2026)

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Handle API requests
        if (url.pathname.startsWith('/api/')) {
            return this.handleApiRequest(request, env, url);
        }

        // Serve static assets for all other requests
        return env.ASSETS.fetch(request);
    },

    async handleApiRequest(request, env, url) {
        // Enable CORS for API requests
        const corsHeaders = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle OPTIONS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: corsHeaders
            });
        }

        if (url.pathname === '/api/billionaires') {
            const billionaires = [...BILLIONAIRE_DATA]
                .sort((a, b) => b.netWorthBillions - a.netWorthBillions)
                .map(({ netWorthBillions, ...b }) => ({ ...b, netWorth: netWorthBillions * BILLION }));
            return new Response(JSON.stringify({
                billionaires,
                medianAmericanNetWorth: MEDIAN_AMERICAN_NET_WORTH,
                lastUpdated: "2026-06-08"
            }), {
                headers: corsHeaders
            });
        }

        // Unknown API endpoint
        return new Response(JSON.stringify({
            error: 'Unknown API endpoint'
        }), {
            status: 404,
            headers: corsHeaders
        });
    }
};
