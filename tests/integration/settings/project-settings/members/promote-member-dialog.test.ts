import { MemberRole, Project_Member } from "$lib/model/api/project";
import { Members } from "$tests/example-data";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { afterEach, assert, beforeEach, describe, expect, test, vi } from "vitest";
import PromoteMemberDialog from "$lib/components/composites/settings/project-settings/members/PromoteMemberDialog.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { getName } from "$lib/utils/common-helper";

describe("PromoteMemberDialog", () => {
    const adminMember = { ...Members.demoMember1, isInvitationPending: false };
    assert(adminMember.role === MemberRole.ADMIN, "Admin member must be an admin");
    const defaultMember = { ...Members.demoMember2, isInvitationPending: false };
    assert(defaultMember.role !== MemberRole.ADMIN, "Default member cannot be an admin");

    beforeEach(() => {
        mockApiCall("updateProjectMemberRole", {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided, then component is rendered correctly", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
    });

    test("When the member is the current user, then the dialog trigger is disabled", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: true,
                isAdminView: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeDisabled();
    });

    test("When the member is an admin, then the dialog trigger is disabled", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: adminMember,
                isCurrentUser: false,
                isAdminView: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeDisabled();
        expect(trigger).toHaveTextContent("Role: Admin");
    });

    test("When the current view is not the admin view, then the dialog trigger is disabled", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeDisabled();
    });

    test("When the member is an invitee, then the dialog trigger is disabled", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: { ...defaultMember, isInvitationPending: true },
                isCurrentUser: false,
                isAdminView: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeDisabled();
    });

    test("When the current view is the admin view, the member is not an admin or invitee and not the current user, then the dialog trigger is enabled", () => {
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).not.toBeDisabled();
        expect(trigger).toHaveTextContent("Role: Member");
    });

    test("When the trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();
        const memberName = getName(defaultMember.user);
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const promoteButton = screen.getByTestId("alert-dialog-action");
        expect(promoteButton).toBeInTheDocument();

        const description = screen.getByTestId("alert-dialog-description");
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
            `Once promoted, ${memberName} will be able to manage the project settings and members. This includes archiving and deleting the project. ` +
                `After promoting a member to an admin, you can't demote them back to a member.`,
        );
    });

    test("When the promote button is clicked, then the member is promoted to an admin", async () => {
        const user = userEvent.setup();
        let promotedMember: Project_Member | null = null;
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: true,
                onMemberPromoted: (member) => {
                    promotedMember = member;
                },
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const promoteButton = screen.getByTestId("alert-dialog-action");
        await user.click(promoteButton);

        await waitFor(() => {
            expect(promotedMember).toStrictEqual(defaultMember);
        });
    });

    test("When promoting a member fails, then an error message is shown", async () => {
        mockFailedApiCall("updateProjectMemberRole");

        const user = userEvent.setup();
        render(PromoteMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                isAdminView: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const promoteButton = screen.getByTestId("alert-dialog-action");
        await user.click(promoteButton);

        expect(screen.getByText("Couldn't promote member")).toBeInTheDocument();
    });
});
