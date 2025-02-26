import { Members, Users } from "$tests/example-data";
import { mockApiCall } from "$tests/setupTest";
import { assert, describe, expect, test } from "vitest";
import { loadMembers } from "../../../src/routes/project/[projectId]/settings/members/helper";

describe("LoadMembers", () => {
    test("When member is invitee, then isInvitationPending is true", async () => {
        assert(Members.demoMember1.user.id === Users.johnDoe.id);
        mockApiCall("getProjectMembers", { members: [Members.demoMember1, Members.demoMember2] });
        mockApiCall("getPendingInvitationsForProject", { users: [Users.johnDoe] });

        const result = await loadMembers({ id: "1" });

        expect(result).toEqual([
            { ...Members.demoMember1, isInvitationPending: true },
            { ...Members.demoMember2, isInvitationPending: false },
        ]);
    });
});
