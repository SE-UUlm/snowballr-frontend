import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import { ApiError } from "$lib/api/errors";
import { getCurrentUser } from "$lib/api/user";
import { createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getCurrentUser", () => {
    test("When the current user is loaded, then it is returned", async () => {
        const user = createUser({ id: "1" });
        const getCurrentUserCall = mockApiCall("getCurrentUser", user);

        await expect(getCurrentUser()).resolves.toEqual(user);
        expect(getCurrentUserCall).toHaveBeenCalledWith(Nothing);
    });

    test("When loading the current user fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("getCurrentUser", "backend down");

        await expect(getCurrentUser()).rejects.toBeInstanceOf(ApiError);
    });
});
