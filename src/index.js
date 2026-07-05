// Static billionaire data
// This data can be updated manually or could be fetched from an API in the future
// Source: https://www.forbes.com/real-time-billionaires/
// Net worths are entered in billions of dollars for easy data entry.
const BILLION = 1000000000;

// Update whenever BILLIONAIRE_DATA or MEDIAN_AMERICAN_NET_WORTH changes;
// returned as `lastUpdated` by the /api/billionaires endpoint.
const DATA_AS_OF = '2026-06-08';

const BILLIONAIRE_DATA = [
    {
        name: 'Elon Musk',
        netWorthBillions: 788,
        source: 'Tesla, SpaceX, X',
    },
    {
        name: 'Larry Page',
        netWorthBillions: 300,
        source: 'Google',
    },
    {
        name: 'Sergey Brin',
        netWorthBillions: 277,
        source: 'Google',
    },
    {
        name: 'Larry Ellison',
        netWorthBillions: 261,
        source: 'Oracle',
    },
    {
        name: 'Jeff Bezos',
        netWorthBillions: 255,
        source: 'Amazon',
    },
];

const MEDIAN_AMERICAN_NET_WORTH = 193000; // $193,000

// The data is static per deployment, so the response body is built once at startup
const BILLIONAIRES_RESPONSE_BODY = JSON.stringify({
    billionaires: [...BILLIONAIRE_DATA]
        .sort((a, b) => b.netWorthBillions - a.netWorthBillions)
        .map(({ netWorthBillions, ...b }) => ({ ...b, netWorth: netWorthBillions * BILLION })),
    medianAmericanNetWorth: MEDIAN_AMERICAN_NET_WORTH,
    lastUpdated: DATA_AS_OF,
});

export default {
    async fetch(request, env, _ctx) {
        const url = new URL(request.url);

        // Handle API requests
        if (url.pathname.startsWith('/api/')) {
            return this.handleApiRequest(request, env, url);
        }

        // Serve static assets for all other requests
        return env.ASSETS.fetch(request);
    },

    handleApiRequest(request, env, url) {
        // Enable CORS for API requests
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };
        const jsonHeaders = {
            ...corsHeaders,
            'Content-Type': 'application/json',
        };

        // Handle OPTIONS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: {
                    ...corsHeaders,
                    'Access-Control-Max-Age': '86400',
                },
            });
        }

        // HEAD responses carry the same headers as GET but no body
        const isHead = request.method === 'HEAD';

        // Unknown API endpoint: 404 regardless of method, since 405 implies
        // the target resource exists
        if (url.pathname !== '/api/billionaires') {
            return new Response(
                isHead
                    ? null
                    : JSON.stringify({
                          error: 'Unknown API endpoint',
                      }),
                {
                    status: 404,
                    headers: jsonHeaders,
                },
            );
        }

        if (request.method !== 'GET' && request.method !== 'HEAD') {
            return new Response(
                JSON.stringify({
                    error: 'Method not allowed',
                }),
                {
                    status: 405,
                    headers: { ...jsonHeaders, Allow: 'GET, HEAD, OPTIONS' },
                },
            );
        }

        return new Response(isHead ? null : BILLIONAIRES_RESPONSE_BODY, {
            headers: {
                ...jsonHeaders,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    },
};
