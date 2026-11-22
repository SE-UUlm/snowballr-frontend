import { describe, expect, test } from "vitest";
import { ApiError } from "#lib/api/errors.js";
import {
    createCriterion as createCriterionInApi,
    deleteCriterion,
    listCriteria,
    updateCriterion,
} from "#lib/api/criterion.js";
import { CriterionCategory } from "#lib/api/types.js";
import { createCriterion } from "#tests/model-builder.js";
import { mockApiCall, mockFailedApiCall } from "#tests/setupTest.js";

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

describe("createCriterion", () => {
    test("When a criterion is created, then it is sent as given and the created criterion is returned", async () => {
        const created = createCriterion({ id: "c1", tag: "I1" });
        const createCall = mockApiCall("createCriterion", created);
        const newCriterion = {
            projectId: "project-1",
            tag: "I1",
            name: "Peer reviewed",
            description: "Published in a peer reviewed venue",
            category: CriterionCategory.INCLUSION,
        };

        await expect(createCriterionInApi(newCriterion)).resolves.toEqual(created);
        expect(createCall).toHaveBeenCalledExactlyOnceWith(newCriterion);
    });

    test("When creating the criterion fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("createCriterion", "tag taken", "INVALID_ARGUMENT");

        await expect(
            createCriterionInApi({
                projectId: "project-1",
                tag: "I1",
                name: "",
                description: "",
                category: CriterionCategory.INCLUSION,
            }),
        ).rejects.toMatchObject({ kind: "invalid-argument", message: "tag taken" });
    });
});

describe("updateCriterion", () => {
    test("When fields of a criterion are changed, then only these fields are in the mask", async () => {
        const stored = createCriterion({ id: "c1", tag: "E1", name: "Old" });
        const updated = { ...stored, name: "New" };
        const updateCall = mockApiCall("updateCriterion", updated);

        await expect(updateCriterion(stored, { name: "New" })).resolves.toEqual(updated);
        expect(updateCall).toHaveBeenCalledExactlyOnceWith({
            criterion: updated,
            mask: { paths: ["criterion.name"] },
        });
    });

    test("When updating the criterion fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("updateCriterion", "backend down");

        await expect(updateCriterion(createCriterion(), { name: "New" })).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});

describe("deleteCriterion", () => {
    test("When a criterion is deleted, then it is requested by ID", async () => {
        const deleteCall = mockApiCall("deleteCriterion", {});

        await expect(deleteCriterion("c1")).resolves.toBeUndefined();
        expect(deleteCall).toHaveBeenCalledExactlyOnceWith({ id: "c1" });
    });

    test("When deleting the criterion fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("deleteCriterion", "in use", "FAILED_PRECONDITION");

        await expect(deleteCriterion("c1")).rejects.toMatchObject({ kind: "failed-precondition" });
    });
});
