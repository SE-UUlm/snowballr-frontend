import ProjectMemberListEntry from "$lib/components/composites/settings/project-settings/members/ProjectMemberListEntry.svelte";
import { Members } from "$tests/example-data";
import { render, screen } from "@testing-library/svelte";
import { describe, test, expect } from "vitest";

describe("ProjectMembersListEntry", () => {
    test("When all props are provided, then it renders correctly", () => {
        render(ProjectMemberListEntry, {
            target: document.body,
            props: {
                projectId: "1",
                member: Members.demoMember1,
                isCurrentUser: false,
                isInvitationPending: false,
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
                member: Members.demoMember1,
                isCurrentUser: true,
                isInvitationPending: false,
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
                member: Members.demoMember2,
                isCurrentUser: false,
                isInvitationPending: true,
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
                member: Members.demoMember1,
                isCurrentUser: false,
                isInvitationPending: false,
                isAdminView: true,
            },
        });

        const svg = document.getElementsByClassName("lucide-trash");
        expect(svg).toHaveLength(1);
    });
});
