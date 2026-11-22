import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import { ApiError } from "$lib/api/errors";
import {
    addPaperToReadingList,
    getReadingList,
    isPaperOnReadingList,
    removePaperFromReadingList,
} from "$lib/api/reading-list";
import { createPaper } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getReadingList", () => {
    test("When the reading list is loaded, then its papers are returned", async () => {
        const papers = [createPaper({ id: "1" }), createPaper({ id: "2" })];
        const getReadingListCall = mockApiCall("getReadingList", { papers });

        await expect(getReadingList()).resolves.toEqual(papers);
        expect(getReadingListCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("isPaperOnReadingList", () => {
    test.each([true, false])(
        "When the backend answers %s, then that value is returned",
        async (onReadingList) => {
            const isPaperOnReadingListCall = mockApiCall("isPaperOnReadingList", {
                value: onReadingList,
            });

            await expect(isPaperOnReadingList("7")).resolves.toBe(onReadingList);
            expect(isPaperOnReadingListCall).toHaveBeenCalledWith({ id: "7" });
        },
    );
});

describe("addPaperToReadingList", () => {
    test("When a paper is added, then its ID is sent", async () => {
        const addPaperCall = mockApiCall("addPaperToReadingList", {});

        await expect(addPaperToReadingList("7")).resolves.toBeUndefined();
        expect(addPaperCall).toHaveBeenCalledWith({ id: "7" });
    });
});

describe("removePaperFromReadingList", () => {
    test("When a paper is removed, then its ID is sent", async () => {
        const removePaperCall = mockApiCall("removePaperFromReadingList", {});

        await expect(removePaperFromReadingList("7")).resolves.toBeUndefined();
        expect(removePaperCall).toHaveBeenCalledWith({ id: "7" });
    });
});

describe("reading list calls", () => {
    test.each([
        ["getReadingList", () => getReadingList()],
        ["isPaperOnReadingList", () => isPaperOnReadingList("7")],
        ["addPaperToReadingList", () => addPaperToReadingList("7")],
        ["removePaperFromReadingList", () => removePaperFromReadingList("7")],
    ] as const)("When %s fails, then it rejects with an ApiError", async (method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
