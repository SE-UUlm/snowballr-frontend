import { describe, expect, test } from "vitest";
import { MemberRole } from "snowballr-api/project";
import { ApiError } from "$lib/api/errors";
import {
    getProjectMembers,
    removeProjectMember,
    setProjectMemberRole,
} from "$lib/api/project-member";
import { createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("getProjectMembers", () => {
    test("When the members are loaded, then they are requested by project ID and returned", async () => {
        const members = [{ user: createUser({ id: "1" }), role: MemberRole.ADMIN }];
        const getMembersCall = mockApiCall("getProjectMembers", { members });

        await expect(getProjectMembers("project-1")).resolves.toEqual(members);
        expect(getMembersCall).toHaveBeenCalledWith({ id: "project-1" });
    });
});

describe("removeProjectMember", () => {
    test("When a member is removed, then the project ID and their email address are sent", async () => {
        const removeMemberCall = mockApiCall("removeProjectMember", {});

        await expect(removeProjectMember("project-1", "jane@example.com")).resolves.toBeUndefined();
        expect(removeMemberCall).toHaveBeenCalledExactlyOnceWith({
            projectId: "project-1",
            userEmail: "jane@example.com",
        });
    });

    test("When the last admin is removed, then it rejects with a failed-precondition error", async () => {
        mockFailedApiCall("removeProjectMember", "last admin", "FAILED_PRECONDITION");

        await expect(removeProjectMember("project-1", "jane@example.com")).rejects.toMatchObject({
            kind: "failed-precondition",
        });
    });
});

describe("setProjectMemberRole", () => {
    test("When the role of a member is set, then the project, the member and the role are sent", async () => {
        const updateRoleCall = mockApiCall("updateProjectMemberRole", {});

        await expect(
            setProjectMemberRole("project-1", "user-1", MemberRole.ADMIN),
        ).resolves.toBeUndefined();
        expect(updateRoleCall).toHaveBeenCalledExactlyOnceWith({
            projectId: "project-1",
            userId: "user-1",
            newRole: MemberRole.ADMIN,
        });
    });
});

describe("project member calls", () => {
    test.each([
        ["getProjectMembers", "getProjectMembers", () => getProjectMembers("project-1")],
        [
            "removeProjectMember",
            "removeProjectMember",
            () => removeProjectMember("project-1", "jane@example.com"),
        ],
        [
            "setProjectMemberRole",
            "updateProjectMemberRole",
            () => setProjectMemberRole("project-1", "user-1", MemberRole.ADMIN),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
