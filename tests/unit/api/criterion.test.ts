import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import { listCriteria } from "$lib/api/criterion";
import { createCriterion } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("listCriteria", () => {
    test("When the criteria of a project are loaded, then they are requested by project ID and returned", async () => {
        const criteria = [createCriterion({ id: "c1" }), createCriterion({ id: "c2" })];
        const getCriteriaCall = mockApiCall("getAllCriteriaForProject", { criteria });

        await expect(listCriteria("project-1")).resolves.toEqual(criteria);
        expect(getCriteriaCall).toHaveBeenCalledExactlyOnceWith({ id: "project-1" });
    });

    test("When loading the criteria fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("getAllCriteriaForProject", "backend down");

        await expect(listCriteria("project-1")).rejects.toBeInstanceOf(ApiError);
    });
});
