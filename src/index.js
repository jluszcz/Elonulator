// Static billionaire data (as of December 2024)
// This data can be updated manually or could be fetched from an API in the future
// Source: https://www.forbes.com/real-time-billionaires/
const BILLIONAIRE_DATA = [
    {
        id: 1,
        name: "Elon Musk",
        netWorth: 744000000000, // $744 billion
        source: "Tesla, SpaceX, X"
    },
    {
        id: 2,
        name: "Larry Page",
        netWorth: 257000000000, // $257 billion
        source: "Google"
    },
    {
        id: 3,
        name: "Larry Ellison",
        netWorth: 249000000000, // $249 billion
        source: "Oracle"
    },
    {
        id: 4,
        name: "Jeff Bezos",
        netWorth: 243000000000, // $243 billion
        source: "Amazon"
    },
    {
        id: 5,
        name: "Sergey Brin",
        netWorth: 237000000000, // $237 billion
        source: "Google"
    }
];

const MEDIAN_AMERICAN_NET_WORTH = 193000; // $193,000 (as of 2024)

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
            return new Response(JSON.stringify({
                billionaires: BILLIONAIRE_DATA,
                medianAmericanNetWorth: MEDIAN_AMERICAN_NET_WORTH,
                lastUpdated: "2024-12-27"
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
