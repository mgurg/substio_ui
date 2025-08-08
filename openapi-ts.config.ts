import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost:5000/openapi.json',
    output: './app/client',
    plugins: ['@hey-api/client-axios'],
});