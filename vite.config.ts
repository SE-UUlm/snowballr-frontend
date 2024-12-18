import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";
import { svelteTesting } from "@testing-library/svelte/vite";

export default defineConfig({
    plugins: [sveltekit(), svelteTesting()],
    // Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
    resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
    test: {
        watch: false,
        reporters: process.env.GITHUB_ACTIONS ? ["default", "github-actions"] : ["default"],
        sequence: {
            shuffle: true,
        },
        setupFiles: ["./tests/setupTest.ts"],
        coverage: {
            include: ["src/**"],
            exclude: [
                "src/routes/**/+*.{svelte,ts}",
                "src/lib/components/primitives/**",
                "**/*.d.ts",
            ],
            provider: "v8",
            enabled: true,
            cleanOnRerun: true,
            reporter: process.env.GITHUB_ACTIONS ? ["lcovonly"] : ["html"],
        },
    },
});
