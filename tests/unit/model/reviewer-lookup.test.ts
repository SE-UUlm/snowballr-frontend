import { describe, expect, test, vi } from "vitest";
import { createReviewerLookup } from "#lib/model/reviewer-lookup.js";
import { createUser } from "#tests/model-builder.js";
import { mockFailedApiCall, mockPendingApiCall } from "#tests/setupTest.js";

describe("reviewer lookup", () => {
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

    test("When a reviewer can't be loaded, then every lookup of it resolves without a user and the failure is logged once", async () => {
        const call = mockFailedApiCall("getUserById", "not found", "NOT_FOUND");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const lookup = createReviewerLookup();

        await expect(lookup.getReviewer("7")).resolves.toBeUndefined();
        await expect(lookup.getReviewer("7")).resolves.toBeUndefined();

        expect(call).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
        consoleError.mockRestore();
    });
});
