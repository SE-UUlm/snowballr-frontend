import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import { invalidate } from "$app/navigation";
import { createPrimedCache, type PrimedCache } from "$lib/model/cache/primed-cache";

vi.mock("$app/navigation", () => ({
    invalidate: vi.fn(() => Promise.resolve()),
}));

type Value = { name: string };

const DEPENDENCY_KEY = "data:test";
const PROJECT_ID = "project-1";
const FETCHED: Value = { name: "fetched" };

describe("primed cache", () => {
    let cache: PrimedCache<Value>;
    let fetchFromSource: Mock<(projectId: string) => Promise<Value>>;

    beforeEach(() => {
        // Also resets the implementations set by `simulateLoad`
        vi.resetAllMocks();
        cache = createPrimedCache(DEPENDENCY_KEY);
        fetchFromSource = vi.fn(() => Promise.resolve(FETCHED));
    });

    /** Runs a load function of the given project, which loads the value from the cache. */
    function load(projectId = PROJECT_ID, depends = vi.fn()): Promise<Value> {
        return cache.load({ params: { projectId }, depends }, fetchFromSource);
    }

    /**
     * Makes every invalidation rerun a load function of the given project.
     *
     * @returns The values loaded by the load runs, in order
     */
    function simulateLoad(projectId = PROJECT_ID): Value[] {
        const loaded: Value[] = [];
        vi.mocked(invalidate).mockImplementation(async () => {
            loaded.push(await load(projectId));
        });
        return loaded;
    }

    test("When no value was primed, then the value is fetched for the loaded project", async () => {
        expect(await load()).toBe(FETCHED);

        expect(fetchFromSource).toHaveBeenCalledExactlyOnceWith(PROJECT_ID);
    });

    test("When a value is loaded, then the load function depends on the dependency key", async () => {
        const depends = vi.fn();

        await load(PROJECT_ID, depends);

        expect(depends).toHaveBeenCalledExactlyOnceWith(DEPENDENCY_KEY);
    });

    test("When a value is refreshed, then its dependency key is invalidated", async () => {
        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(invalidate).toHaveBeenCalledExactlyOnceWith(DEPENDENCY_KEY);
    });

    test("When a value is refreshed, then the next load of that project gets it without fetching", async () => {
        const loaded = simulateLoad();
        const value = { name: "value" };

        await cache.refresh(PROJECT_ID, value);

        expect(loaded).toEqual([value]);
        expect(fetchFromSource).not.toHaveBeenCalled();
    });

    test("When the primed value was loaded, then the following load fetches the value", async () => {
        simulateLoad();

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(await load()).toBe(FETCHED);
    });

    test("When another project is loaded, then its value is fetched and the primed value is discarded", async () => {
        const loaded = simulateLoad("project-2");

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(loaded).toEqual([FETCHED]);
        expect(fetchFromSource).toHaveBeenCalledExactlyOnceWith("project-2");
        expect(await load()).toBe(FETCHED);
    });

    test("When no load function takes the value, then it is discarded after the invalidation", async () => {
        // The default mock of invalidate does not rerun any load function, like after leaving the page
        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(await load()).toBe(FETCHED);
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
        expect(await load()).toBe(newer);
        newerInvalidation.resolve();
        await newerRefresh;
    });

    test("When the invalidation fails, then the refresh still resolves and the value is discarded", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(invalidate).mockRejectedValueOnce(new Error("Invalidation failed"));

        await expect(cache.refresh(PROJECT_ID, { name: "value" })).resolves.toBeUndefined();

        expect(consoleError).toHaveBeenCalled();
        expect(await load()).toBe(FETCHED);
        consoleError.mockRestore();
    });

    test("When a value is refreshed twice, then the value of each refresh is loaded", async () => {
        const loaded = simulateLoad();
        const first = { name: "first" };
        const second = { name: "second" };

        await cache.refresh(PROJECT_ID, first);
        await cache.refresh(PROJECT_ID, second);

        expect(loaded).toEqual([first, second]);
    });

    test("When two caches are created, then they do not share their primed values", async () => {
        const otherCache = createPrimedCache<Value>("data:other");
        let loadingFromOther: Promise<Value> | undefined;
        vi.mocked(invalidate).mockImplementation(async () => {
            loadingFromOther = otherCache.load(
                { params: { projectId: PROJECT_ID }, depends: vi.fn() },
                fetchFromSource,
            );
        });

        await cache.refresh(PROJECT_ID, { name: "value" });

        expect(await loadingFromOther).toBe(FETCHED);
    });
});
