import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    {
        extends: "./vite.config.ts",
        test: {
            name: "unit",
            include: ["tests/unit/**/*.{test,spec}.ts"],
        },
    },
    {
        extends: "./vite.config.ts",
        test: {
            name: "integration",
            include: ["tests/integration/**/*.{test,spec}.ts"],
            environment: "jsdom",
            setupFiles: ["./vitest-setup.ts"],
        },
    },
]);
