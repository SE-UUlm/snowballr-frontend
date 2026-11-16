import { beforeEach, describe, expect, test, vi } from "vitest";
import { invalidate } from "$app/navigation";
import { createPrimedCache, type PrimedCache } from "$lib/model/cache/primed-cache";

vi.mock("$app/navigation", () => ({
    invalidate: vi.fn(() => Promise.resolve()),
}));

const DEPENDENCY_KEY = "data:test";

describe("primed cache", () => {
    let cache: PrimedCache<{ name: string }>;

    beforeEach(() => {
        vi.clearAllMocks();
        cache = createPrimedCache(DEPENDENCY_KEY);
    });

    test("When no value was primed, then no value is taken", () => {
        expect(cache.take("project-1")).toBeUndefined();
    });

    test("When a value is refreshed, then its dependency key is invalidated", async () => {
        await cache.refresh("project-1", { name: "value" });

        expect(invalidate).toHaveBeenCalledWith(DEPENDENCY_KEY);
    });

    test("When a value is refreshed, then it is taken by the next load of that project", async () => {
        const value = { name: "value" };

        await cache.refresh("project-1", value);

        expect(cache.take("project-1")).toBe(value);
    });

    test("When the primed value was taken, then it is not taken a second time", async () => {
        await cache.refresh("project-1", { name: "value" });

        cache.take("project-1");

        expect(cache.take("project-1")).toBeUndefined();
    });

    test("When another project is loaded, then the primed value is not taken and discarded", async () => {
        await cache.refresh("project-1", { name: "value" });

        expect(cache.take("project-2")).toBeUndefined();
        expect(cache.take("project-1")).toBeUndefined();
    });

    test("When a value is refreshed twice, then only the latest value is taken", async () => {
        const latest = { name: "latest" };

        await cache.refresh("project-1", { name: "outdated" });
        await cache.refresh("project-1", latest);

        expect(cache.take("project-1")).toBe(latest);
    });

    test("When two caches are created, then they do not share their primed values", async () => {
        const otherCache = createPrimedCache<{ name: string }>("data:other");

        await cache.refresh("project-1", { name: "value" });

        expect(otherCache.take("project-1")).toBeUndefined();
    });
});
