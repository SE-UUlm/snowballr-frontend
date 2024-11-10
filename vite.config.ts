import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit()],
    // Tell Vitest to use the `browser` entry points in `package.json` files, even though it's running in Node
    resolve: process.env.VITEST ? { conditions: ["browser"] } : undefined,
    test: {
        include: ["test/**/*.{test,spec}.{js,ts}"],
        reporters: process.env.GITHUB_ACTIONS ? ["default", "github-actions"] : ["default"],
        coverage: {
            enabled: true,
            cleanOnRerun: true,
            reporter: process.env.GITHUB_ACTIONS ? ["lcov"] : ["html"],
        },
    },
});
