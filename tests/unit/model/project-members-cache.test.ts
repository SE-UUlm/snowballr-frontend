import { beforeEach, describe, expect, test, vi } from "vitest";
import { invalidate } from "$app/navigation";
import {
    MEMBERS_DEPENDENCY_KEY,
    refreshMembers,
    takePrimedMembers,
} from "$lib/model/cache/project-members-cache";
import { Members } from "$tests/example-data";
import type { MemberInfo } from "../../../src/routes/project/[projectId]/settings/helper";

vi.mock("$app/navigation", () => ({
    invalidate: vi.fn(() => Promise.resolve()),
}));

const members: MemberInfo[] = [{ ...Members.demoMember1, isInvitationPending: false }];

describe("project members cache", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear any members primed by a previous test
        takePrimedMembers("");
    });

    test("When no members were primed, then no members are taken", () => {
        expect(takePrimedMembers("project-1")).toBeUndefined();
    });

    test("When the members are refreshed, then the settings layout is invalidated", async () => {
        await refreshMembers("project-1", members);

        expect(invalidate).toHaveBeenCalledWith(MEMBERS_DEPENDENCY_KEY);
    });

    test("When the members are refreshed, then they are taken by the next load of that project", async () => {
        await refreshMembers("project-1", members);

        expect(takePrimedMembers("project-1")).toBe(members);
    });

    test("When the primed members were taken, then they are not taken a second time", async () => {
        await refreshMembers("project-1", members);

        takePrimedMembers("project-1");

        expect(takePrimedMembers("project-1")).toBeUndefined();
    });

    test("When the members of another project are loaded, then the primed members are not taken and discarded", async () => {
        await refreshMembers("project-1", members);

        expect(takePrimedMembers("project-2")).toBeUndefined();
        expect(takePrimedMembers("project-1")).toBeUndefined();
    });
});
