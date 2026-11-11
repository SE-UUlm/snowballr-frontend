import { describe, expect, test } from "vitest";
import { Nothing } from "snowballr-api/base";
import { ApiError } from "$lib/api/errors";
import { exportProject, getAvailableExportFormats } from "$lib/api/export";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getAvailableExportFormats", () => {
    test("When the export formats are loaded, then their names are returned", async () => {
        const getFormatsCall = mockApiCall("getAvailableExportFormats", {
            formats: ["csv", "bibtex"],
        });

        await expect(getAvailableExportFormats()).resolves.toEqual(["csv", "bibtex"]);
        expect(getFormatsCall).toHaveBeenCalledWith(Nothing);
    });
});

describe("exportProject", () => {
    test("When a project is exported, then the project and format are sent and the file returned", async () => {
        const data = new Uint8Array([1, 2, 3]);
        const exportProjectCall = mockApiCall("exportProject", { data, fileName: "project.csv" });

        await expect(exportProject("project-1", "csv")).resolves.toEqual({
            data,
            fileName: "project.csv",
        });
        expect(exportProjectCall).toHaveBeenCalledWith({ id: "project-1", format: "csv" });
    });
});

describe("export calls", () => {
    test.each([
        ["getAvailableExportFormats", () => getAvailableExportFormats()],
        ["exportProject", () => exportProject("project-1", "csv")],
    ] as const)("When %s fails, then it rejects with an ApiError", async (method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
