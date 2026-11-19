import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import type { FetcherInformation } from "snowballr-api/fetcher";
import { ApiError } from "$lib/api/errors";
import { getAvailableFetchers } from "$lib/api/fetcher";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getAvailableFetchers", () => {
    test("When the available fetchers are loaded, then they are returned", async () => {
        const fetchers: FetcherInformation[] = [
            { id: "test", name: "Test Fetcher", description: "", links: [], optionsSchema: {} },
        ];
        const getAvailableFetchersCall = mockApiCall("getAvailableFetchers", { fetchers });

        await expect(getAvailableFetchers()).resolves.toEqual(fetchers);
        expect(getAvailableFetchersCall).toHaveBeenCalledWith(Nothing);
    });

    test("When loading the available fetchers fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("getAvailableFetchers", "backend down");

        await expect(getAvailableFetchers()).rejects.toBeInstanceOf(ApiError);
    });
});
