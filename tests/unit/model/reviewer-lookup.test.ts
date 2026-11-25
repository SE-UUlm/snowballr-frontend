import { afterEach, describe, expect, test, vi } from "vitest";
import { createReviewerLookup } from "#lib/model/reviewer-lookup.js";
import { createUser } from "#tests/model-builder.js";
import { mockFailedApiCall, mockPendingApiCall } from "#tests/setupTest.js";

describe("createReviewerLookup()", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When the same reviewer is looked up twice while the first lookup is pending, then the user is requested once", async () => {
        const user = createUser({ id: "7" });
        const { call, resolve } = mockPendingApiCall("getUserById");
        const lookup = createReviewerLookup();

        const first = lookup.getReviewer("7");
        const second = lookup.getReviewer("7");
        resolve(user);

        await expect(first).resolves.toEqual(user);
        await expect(second).resolves.toEqual(user);
        expect(call).toHaveBeenCalledExactlyOnceWith({ id: "7" });
    });

    test("When a reviewer can't be loaded, then the lookups pending at that time resolve without a user and the failure is logged once", async () => {
        const call = mockFailedApiCall("getUserById", "not found", "NOT_FOUND");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const lookup = createReviewerLookup();

        const first = lookup.getReviewer("7");
        const second = lookup.getReviewer("7");

        await expect(first).resolves.toBeUndefined();
        await expect(second).resolves.toBeUndefined();
        expect(call).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
    });

    test("When a reviewer is looked up again after its lookup failed, then the user is requested again", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        mockFailedApiCall("getUserById", "unavailable", "UNAVAILABLE");
        const lookup = createReviewerLookup();
        await lookup.getReviewer("7");

        const user = createUser({ id: "7" });
        const { call, resolve } = mockPendingApiCall("getUserById");
        const retried = lookup.getReviewer("7");
        resolve(user);

        await expect(retried).resolves.toEqual(user);
        expect(call).toHaveBeenCalledExactlyOnceWith({ id: "7" });
    });
});
