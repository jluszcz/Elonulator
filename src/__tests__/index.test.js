/**
 * Tests for CloudFlare Worker
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';

// Mock the worker module
const workerModule = await import('../index.js');
const worker = workerModule.default;

describe('CloudFlare Worker', () => {
    let mockEnv;
    let mockCtx;

    beforeEach(() => {
        mockEnv = {
            ASSETS: {
                fetch: vi.fn().mockResolvedValue(new Response('mock asset'))
            }
        };
        mockCtx = {};
    });

    describe('Static Asset Serving', () => {
        test('serves static assets for non-API routes', async () => {
            const request = new Request('https://example.com/index.html');
            const response = await worker.fetch(request, mockEnv, mockCtx);

            expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
        });

        test('serves static assets for root path', async () => {
            const request = new Request('https://example.com/');
            await worker.fetch(request, mockEnv, mockCtx);

            expect(mockEnv.ASSETS.fetch).toHaveBeenCalledWith(request);
        });
    });

    describe('API Endpoints', () => {
        describe('GET /api/billionaires', () => {
            test('returns billionaire data with correct structure', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                expect(response.status).toBe(200);

                const data = await response.json();
                expect(data).toHaveProperty('billionaires');
                expect(data).toHaveProperty('medianAmericanNetWorth');
                expect(data).toHaveProperty('lastUpdated');
            });

            test('returns array of 5 billionaires', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                const data = await response.json();
                expect(data.billionaires).toHaveLength(5);
            });

            test('each billionaire has required properties', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                const data = await response.json();
                data.billionaires.forEach(billionaire => {
                    expect(billionaire).toHaveProperty('id');
                    expect(billionaire).toHaveProperty('name');
                    expect(billionaire).toHaveProperty('netWorth');
                    expect(billionaire).toHaveProperty('source');
                    expect(typeof billionaire.netWorth).toBe('number');
                    expect(billionaire.netWorth).toBeGreaterThan(0);
                });
            });

            test('billionaires are sorted by net worth descending', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                const data = await response.json();
                const netWorths = data.billionaires.map(b => b.netWorth);
                const sortedNetWorths = [...netWorths].sort((a, b) => b - a);

                expect(netWorths).toEqual(sortedNetWorths);
            });

            test('median American net worth is positive number', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                const data = await response.json();
                expect(typeof data.medianAmericanNetWorth).toBe('number');
                expect(data.medianAmericanNetWorth).toBeGreaterThan(0);
            });

            test('includes CORS headers', async () => {
                const request = new Request('https://example.com/api/billionaires');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                expect(response.headers.get('Content-Type')).toBe('application/json');
                expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
            });
        });

        describe('OPTIONS /api/billionaires', () => {
            test('handles CORS preflight requests', async () => {
                const request = new Request('https://example.com/api/billionaires', {
                    method: 'OPTIONS'
                });
                const response = await worker.fetch(request, mockEnv, mockCtx);

                expect(response.status).toBe(200);
                expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
                expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
            });
        });

        describe('Unknown API endpoints', () => {
            test('returns 404 for unknown API paths', async () => {
                const request = new Request('https://example.com/api/unknown');
                const response = await worker.fetch(request, mockEnv, mockCtx);

                expect(response.status).toBe(404);

                const data = await response.json();
                expect(data).toHaveProperty('error');
                expect(data.error).toBe('Unknown API endpoint');
            });
        });
    });

    describe('Data Validation', () => {
        test('Elon Musk should be first in the list', async () => {
            const request = new Request('https://example.com/api/billionaires');
            const response = await worker.fetch(request, mockEnv, mockCtx);

            const data = await response.json();
            expect(data.billionaires[0].name).toBe('Elon Musk');
        });

        test('net worth values are realistic', async () => {
            const request = new Request('https://example.com/api/billionaires');
            const response = await worker.fetch(request, mockEnv, mockCtx);

            const data = await response.json();

            // All billionaires should have net worth > $100 billion
            data.billionaires.forEach(billionaire => {
                expect(billionaire.netWorth).toBeGreaterThan(100000000000);
            });

            // Median American net worth should be reasonable (between $100k and $500k)
            expect(data.medianAmericanNetWorth).toBeGreaterThan(100000);
            expect(data.medianAmericanNetWorth).toBeLessThan(500000);
        });
    });
});
