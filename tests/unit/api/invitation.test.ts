import { describe, expect, test } from "vitest";
import { ApiError } from "$lib/api/errors";
import { inviteUserToProject } from "$lib/api/invitation";
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

    test("When inviting fails, then it rejects with an ApiError", async () => {
        mockFailedApiCall("inviteUserToProject", "backend down");

        await expect(inviteUserToProject("project-1", "jane@example.com")).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});
