import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import {
    acceptProjectInvitation,
    getInviteCandidates,
    getPendingInvitations,
    inviteUserToProject,
} from "$lib/api/invitation";
import { createUser } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("inviteUserToProject", () => {
    test("When a user is invited, then the project ID and email address are sent", async () => {
        const inviteCall = mockApiCall("inviteUserToProject", {});

        await expect(inviteUserToProject("project-1", "jane@example.com")).resolves.toBeUndefined();
        expect(inviteCall).toHaveBeenCalledWith({
            projectId: "project-1",
            userEmail: "jane@example.com",
        });
    });
});

describe("getPendingInvitations", () => {
    test("When the pending invitations are loaded, then the invited users of the project are returned", async () => {
        const users = [createUser({ id: "1" }), createUser({ id: "" })];
        const getInvitationsCall = mockApiCall("getPendingInvitationsForProject", { users });

        await expect(getPendingInvitations("project-1")).resolves.toEqual(users);
        expect(getInvitationsCall).toHaveBeenCalledExactlyOnceWith({ id: "project-1" });
    });
});

describe("getInviteCandidates", () => {
    test("When candidates for a project are searched, then the query and project ID are sent", async () => {
        const users = [createUser({ id: "1" })];
        const getCandidatesCall = mockApiCall("getInviteCandidates", { users });

        await expect(getInviteCandidates("Jane", "project-1")).resolves.toEqual(users);
        expect(getCandidatesCall).toHaveBeenCalledExactlyOnceWith({
            query: "Jane",
            projectId: "project-1",
        });
    });

    test("When candidates are searched without a project, then an empty project ID is sent", async () => {
        const getCandidatesCall = mockApiCall("getInviteCandidates", { users: [] });

        await expect(getInviteCandidates("Jane")).resolves.toEqual([]);
        expect(getCandidatesCall).toHaveBeenCalledExactlyOnceWith({ query: "Jane", projectId: "" });
    });
});

describe("acceptProjectInvitation", () => {
    test("When an invitation is accepted, then its token is sent", async () => {
        const acceptCall = mockApiCall("acceptProjectInvitation", {});

        await expect(acceptProjectInvitation("token-1")).resolves.toBeUndefined();
        expect(acceptCall).toHaveBeenCalledExactlyOnceWith({ token: "token-1" });
    });

    test.each([
        ["INVALID_ARGUMENT", "invalid-argument"],
        ["NOT_FOUND", "not-found"],
        ["FAILED_PRECONDITION", "failed-precondition"],
    ] as const)(
        "When accepting fails with %s, then it rejects with kind %s",
        async (code, kind) => {
            mockFailedApiCall("acceptProjectInvitation", "rejected", code);

            await expect(acceptProjectInvitation("token-1")).rejects.toMatchObject({ kind });
        },
    );
});

describe("invitation calls", () => {
    test.each([
        [
            "inviteUserToProject",
            "inviteUserToProject",
            () => inviteUserToProject("project-1", "jane@example.com"),
        ],
        [
            "getPendingInvitations",
            "getPendingInvitationsForProject",
            () => getPendingInvitations("project-1"),
        ],
        ["getInviteCandidates", "getInviteCandidates", () => getInviteCandidates("Jane")],
        [
            "acceptProjectInvitation",
            "acceptProjectInvitation",
            () => acceptProjectInvitation("token-1"),
        ],
    ] as const)("When %s fails, then it rejects with an ApiError", async (_, method, run) => {
        mockFailedApiCall(method, "backend down");

        await expect(run()).rejects.toBeInstanceOf(ApiError);
    });
});
