import { describe, expect, test } from "vitest";
import { ApiError, isApiError } from "$lib/api/errors";

describe("isApiError", () => {
    const notFound = new ApiError("not-found", "gone");

    test("When no kind is given, then any ApiError matches", () => {
        expect(isApiError(notFound)).toBe(true);
    });

    test("When the kind matches, then it returns true", () => {
        expect(isApiError(notFound, "not-found")).toBe(true);
    });

    test("When the kind differs, then it returns false", () => {
        expect(isApiError(notFound, "already-exists")).toBe(false);
    });

    test("When the value is not an ApiError, then it returns false", () => {
        expect(isApiError(new Error("gone"))).toBe(false);
        expect(isApiError(undefined)).toBe(false);
    });
});
