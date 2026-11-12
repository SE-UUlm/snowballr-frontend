import { describe, expect, test } from "vitest";
import { MemberRole } from "snowballr-api/project";
import { ApiError } from "$lib/api/errors";
import { getProjectMembers } from "$lib/api/project-member";
import { createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getProjectMembers", () => {
    test("When the members are loaded, then they are requested by project ID and returned", async () => {
        const members = [{ user: createUser({ id: "1" }), role: MemberRole.ADMIN }];
        const getMembersCall = mockApiCall("getProjectMembers", { members });

        await expect(getProjectMembers("project-1")).resolves.toEqual(members);
        expect(getMembersCall).toHaveBeenCalledWith({ id: "project-1" });
    });

    test("When loading the members fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("getProjectMembers", "backend down");

        await expect(getProjectMembers("project-1")).rejects.toBeInstanceOf(ApiError);
    });
});
