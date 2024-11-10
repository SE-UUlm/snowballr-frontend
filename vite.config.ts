import { defineConfig } from "vitest/config";
import { sveltekit } from "@sveltejs/kit/vite";

export default defineConfig({
    plugins: [sveltekit()],

    test: {
        include: ["src/**/*.{test,spec}.{js,ts}"],
        reporters: process.env.GITHUB_ACTIONS ? ['default', 'github-actions'] : ['default'],




    },
});
