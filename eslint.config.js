import js from '@eslint/js';
import globals from 'globals';

export default [
    { ignores: ['coverage/', '.wrangler/'] },
    js.configs.recommended,
    {
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['public/**/*.js'],
        languageOptions: { globals: globals.browser },
    },
    {
        files: ['src/index.js'],
        languageOptions: { globals: globals.serviceworker },
    },
    {
        files: ['src/__tests__/**/*.js'],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
];
