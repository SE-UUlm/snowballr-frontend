import { describe, expect, expectTypeOf, test } from "vitest";
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

    // `npm run check` verifies the expectTypeOf assertions; at runtime they do nothing.
    test("When a kind check fails, then the value can still be an ApiError of another kind", () => {
        function describeError(error: ApiError | undefined) {
            if (isApiError(error, "not-found")) {
                expectTypeOf(error.kind).toEqualTypeOf<"not-found">();
                return "not found";
            }
            expectTypeOf(error).toEqualTypeOf<ApiError | undefined>();
            return error?.kind;
        }

        expect(describeError(notFound)).toBe("not found");
        expect(describeError(new ApiError("unavailable", "down"))).toBe("unavailable");
    });

    test("When the check without a kind fails, then the value is no ApiError", () => {
        function describeError(error: ApiError | undefined) {
            if (isApiError(error)) {
                expectTypeOf(error).toEqualTypeOf<ApiError>();
                return error.kind;
            }
            expectTypeOf(error).toEqualTypeOf<undefined>();
            return "none";
        }

        expect(describeError(undefined)).toBe("none");
    });
});
