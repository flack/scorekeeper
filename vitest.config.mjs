import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        include: [ 'src/**/*.spec.js' ],
        setupFiles: [ 'test/setup.js' ],
        coverage: {
            provider: 'v8',
            include: [ 'src/app/**/*.js' ],
            exclude: [ 'src/**/*.spec.js' ]
        }
    }
});
