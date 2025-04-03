import { Members, Users } from "$tests/example-data";
import { mockApiCall } from "$tests/setupTest";
import { describe, expect, test } from "vitest";
import { loadMembers } from "../../../src/routes/project/[projectId]/settings/members/helper";
import { MemberRole } from "$lib/model/api/project";

describe("LoadMembers", () => {
    test("When member is invitee, then isInvitationPending is true", async () => {
        mockApiCall("getProjectMembers", { members: [Members.demoMember1, Members.demoMember2] });
        mockApiCall("getPendingInvitationsForProject", { users: [Users.henryMoore] });

        const result = await loadMembers({ id: "1" });

        expect(result).toEqual([
            { ...{ user: Users.henryMoore, role: MemberRole.DEFAULT }, isInvitationPending: true },
            { ...Members.demoMember2, isInvitationPending: false },
            { ...Members.demoMember1, isInvitationPending: false },
        ]);
    });
});
