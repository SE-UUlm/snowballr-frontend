import { beforeEach, describe, expect, test, vi } from "vitest";
import { invalidate } from "$app/navigation";
import { createPrimedCache, type PrimedCache } from "$lib/model/cache/primed-cache";

vi.mock("$app/navigation", () => ({
    invalidate: vi.fn(() => Promise.resolve()),
}));

type Value = { name: string };

const DEPENDENCY_KEY = "data:test";
const PROJECT_ID = "project-1";

describe("primed cache", () => {
    let cache: PrimedCache<Value>;

    beforeEach(() => {
        // Also resets the implementations set by `simulateLoad`
        vi.resetAllMocks();
        cache = createPrimedCache(DEPENDENCY_KEY);
    });

    /**
     * Makes every invalidation rerun a load function of the given project, which takes the primed value.
     *
     * @returns The values taken by the load runs, in order
     */
    function simulateLoad(projectId = PROJECT_ID): (Value | undefined)[] {
        const taken: (Value | undefined)[] = [];
        vi.mocked(invalidate).mockImplementation(async () => {
            taken.push(cache.take(projectId));
        });
        return taken;
    }

    test("When no value was primed, then no value is taken", () => {
        expect(cache.take(PROJECT_ID)).toBeUndefined();
    });

    test("When a value is refreshed, then its dependency key is invalidated", async () => {
        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(invalidate).toHaveBeenCalledExactlyOnceWith(DEPENDENCY_KEY);
    });

    test("When a value is refreshed, then it is taken by the next load of that project", async () => {
        const taken = simulateLoad();
        const value = { name: "value" };

        await cache.refresh(PROJECT_ID, value);

        expect(taken).toEqual([value]);
    });

    test("When the primed value was taken, then it is not taken a second time", async () => {
        simulateLoad();

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(cache.take(PROJECT_ID)).toBeUndefined();
    });

    test("When another project is loaded, then the primed value is not taken and discarded", async () => {
        const taken = simulateLoad("project-2");

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(taken).toEqual([undefined]);
        expect(cache.take(PROJECT_ID)).toBeUndefined();
    });

    test("When no load function takes the value, then it is discarded after the invalidation", async () => {
        // The default mock of invalidate does not rerun any load function, like after leaving the page
        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(cache.take(PROJECT_ID)).toBeUndefined();
    });

    test("When a newer value is primed during an invalidation, then the newer value is not discarded", async () => {
        const newer = { name: "newer" };
        const newerInvalidation = Promise.withResolvers<void>();
        let newerRefresh: Promise<void> | undefined;
        vi.mocked(invalidate)
            .mockImplementationOnce(async () => {
                // A second refresh starts while the first invalidation is still running
                newerRefresh = cache.refresh(PROJECT_ID, newer);
            })
            .mockImplementationOnce(() => newerInvalidation.promise);

        await cache.refresh(PROJECT_ID, { name: "older" });

        // The load run by the still pending newer invalidation gets the newer value
        expect(cache.take(PROJECT_ID)).toBe(newer);
        newerInvalidation.resolve();
        await newerRefresh;
    });

    test("When the invalidation fails, then the refresh still resolves and the value is discarded", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(invalidate).mockRejectedValueOnce(new Error("Invalidation failed"));

        await expect(cache.refresh(PROJECT_ID, { name: "value" })).resolves.toBeUndefined();

        expect(consoleError).toHaveBeenCalled();
        expect(cache.take(PROJECT_ID)).toBeUndefined();
        consoleError.mockRestore();
    });

    test("When a value is refreshed twice, then the value of each refresh is taken", async () => {
        const taken = simulateLoad();
        const first = { name: "first" };
        const second = { name: "second" };

        await cache.refresh(PROJECT_ID, first);
        await cache.refresh(PROJECT_ID, second);

        expect(taken).toEqual([first, second]);
    });

    test("When two caches are created, then they do not share their primed values", async () => {
        const otherCache = createPrimedCache<Value>("data:other");
        let takenByOther: Value | undefined;
        vi.mocked(invalidate).mockImplementation(async () => {
            takenByOther = otherCache.take(PROJECT_ID);
        });

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(takenByOther).toBeUndefined();
    });
});
