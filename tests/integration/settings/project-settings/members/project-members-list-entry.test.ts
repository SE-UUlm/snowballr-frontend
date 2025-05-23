import ProjectMemberListEntry from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntry.svelte";
import { MemberRole } from "$lib/model/api/project";
import { Members } from "$tests/example-data";
import { render, screen } from "@testing-library/svelte";
import { describe, test, expect, assert } from "vitest";

describe("ProjectMembersListEntry", () => {
    const adminMember = { ...Members.demoMember1, isInvitationPending: false };
    assert(adminMember.role === MemberRole.ADMIN, "Admin member must be an admin");
    const defaultMember = { ...Members.demoMember2, isInvitationPending: false };
    assert(defaultMember.role !== MemberRole.ADMIN, "Default member cannot be an admin");

    test("When all props are provided, then it renders correctly", () => {
        render(ProjectMemberListEntry, {
            target: document.body,
            props: {
                projectId: "1",
                member: adminMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john.doe@example.com")).toBeInTheDocument();
    });

    test("When the member is the current user, then it displays 'You'", () => {
        render(ProjectMemberListEntry, {
            target: document.body,
            props: {
                projectId: "1",
                member: adminMember,
                isCurrentUser: true,
                isAdminView: true,
            },
        });

        const memberName = screen.getByText("John Doe");
        expect(memberName).toHaveTextContent("John Doe - You");
    });

    test("When the invitation is pending, then it displays 'Invitation Pending'", () => {
        render(ProjectMemberListEntry, {
            target: document.body,
            props: {
                projectId: "1",
                member: { ...defaultMember, isInvitationPending: true },
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        expect(screen.getByText("Invitation Pending ...")).toBeInTheDocument();
    });

    test("When the current user is an admin, then it displays the 'Remove' button", async () => {
        render(ProjectMemberListEntry, {
            target: document.body,
            props: {
                projectId: "1",
                member: adminMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        const svg = document.getElementsByClassName("lucide-trash");
        expect(svg).toHaveLength(1);
    });
});
