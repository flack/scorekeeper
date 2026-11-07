import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        globals: true,
        include: [ 'src/**/*.spec.js' ],
        setupFiles: [ 'test/setup.js' ]
    }
});
