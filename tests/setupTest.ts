/* Test setup file, inspired by https://github.com/wd-David/svelte-component-test-recipes?tab=readme-ov-file#setuptestts */
import * as matchers from "@testing-library/jest-dom/matchers";
import { expect, vi } from "vitest";
import type { Navigation, Page } from "@sveltejs/kit";
import { readable } from "svelte/store";
import * as environment from "$app/environment";
import * as navigation from "$app/navigation";
import * as stores from "$app/stores";

// Add custom jest matchers
expect.extend(matchers);

// Mock SvelteKit runtime module $app/environment
vi.mock("$app/environment", (): typeof environment => ({
    browser: false,
    dev: true,
    building: false,
    version: "any",
}));

// Mock SvelteKit runtime module $app/navigation
vi.mock("$app/navigation", (): typeof navigation => ({
    afterNavigate: () => {},
    beforeNavigate: () => {},
    disableScrollHandling: () => {},
    goto: () => Promise.resolve(),
    invalidate: () => Promise.resolve(),
    invalidateAll: () => Promise.resolve(),
    preloadData: () => Promise.resolve({ type: "loaded", status: 200, data: {} }),
    preloadCode: () => Promise.resolve(),
    onNavigate: () => {},
    pushState: () => {},
    replaceState: () => {},
}));

// Mock SvelteKit runtime module $app/stores
vi.mock("$app/stores", (): typeof stores => {
    const getStores: typeof stores.getStores = () => {
        const navigating = readable<Navigation | null>(null);
        const page = readable<Page>({
            url: new URL("http://localhost"),
            params: {},
            route: {
                id: null,
            },
            status: 200,
            error: null,
            data: {},
            state: {},
            form: undefined,
        });

        const updated = { subscribe: readable(false).subscribe, check: async () => false };

        return { navigating, page, updated };
    };

    const page: typeof stores.page = {
        subscribe(fn) {
            return getStores().page.subscribe(fn);
        },
    };
    const navigating: typeof stores.navigating = {
        subscribe(fn) {
            return getStores().navigating.subscribe(fn);
        },
    };
    const updated: typeof stores.updated = {
        subscribe(fn) {
            return getStores().updated.subscribe(fn);
        },
        check: async () => false,
    };

    return {
        getStores,
        navigating,
        page,
        updated,
    };
});
