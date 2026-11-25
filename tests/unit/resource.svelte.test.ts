import { afterEach, describe, expect, test, vi } from "vitest";
import { resource } from "#lib/resource.svelte.js";
import { ApiError } from "#lib/api/errors.js";

describe("resource", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When the promise resolves, then the status changes from pending to resolved", async () => {
        const loading = Promise.resolve(true);
        const state = resource(loading, { initialValue: false });

        expect(state.status).toBe("pending");
        expect(state.value).toBe(false);

        await vi.waitFor(() => expect(state.status).toBe("resolved"));
        expect(state.value).toBe(true);
    });

    test("When the promise rejects, then the status is rejected and the failure is logged", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const state = resource(Promise.reject(new ApiError("unknown", "")), {
            initialValue: false,
            resourceName: "flag",
        });

        await vi.waitFor(() => expect(state.status).toBe("rejected"));
        expect(state.value).toBe(false);
        expect(consoleError).toHaveBeenCalledWith("Couldn't load flag");
    });

    test("When the promise rejects because it was cancelled, then the failure is not logged", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const state = resource(Promise.reject(new ApiError("cancelled", "")), {
            initialValue: false,
        });

        await vi.waitFor(() => expect(state.status).toBe("rejected"));
        expect(consoleError).not.toHaveBeenCalled();
    });
});
