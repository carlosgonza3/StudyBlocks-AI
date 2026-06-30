import { resolve } from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(process.cwd(), "src"),
        },
    },
    test: {
        environment: "node",
        globals: false,
        setupFiles: ["./src/test/setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        clearMocks: true,
        restoreMocks: true,
    },
});