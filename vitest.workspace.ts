import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
    {
        extends: "./vite.config.ts",
        test: {
            name: "unit",
            include: ["test/unit/**/*.{test,spec}.ts"],
        },
    },
    {
        extends: "./vite.config.ts",
        test: {
            name: "integration",
            include: ["test/integration/**/*.{test,spec}.ts"],
            environment: "jsdom",
            setupFiles: ["./vitest-setup.ts"],
        },
    },
]);
