import { describe, test, beforeEach, afterEach, vi, expect, assert } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import RemoveMemberDialog from "$lib/components/composites/settings/project-settings/members/RemoveMemberDialog.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { Members } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { getName } from "$lib/utils/common-helper";
import { MemberRole, Project_Member } from "$lib/model/api/project";

describe("RemoveMemberDialog", () => {
    const adminMember = Members.demoMember1;
    assert(adminMember.role === MemberRole.ADMIN, "Admin member must be an admin");
    const defaultMember = Members.demoMember2;
    assert(defaultMember.role !== MemberRole.ADMIN, "Default member cannot be an admin");

    beforeEach(() => {
        mockApiCall("removeProjectMember", {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("When all props are provided, then it renders correctly", () => {
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
    });

    test("When the trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();
        const memberName = getName(defaultMember.user!);
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const removeButton = screen.getByTestId("alert-dialog-action");
        expect(removeButton).toBeInTheDocument();

        const description = screen.getByTestId("alert-dialog-description");
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
            `Once removed, ${memberName} will no longer have access to this project. You can always re-invite them later.`,
        );
    });

    test("When the member is an admin, then the trigger is disabled", async () => {
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: adminMember,
                isCurrentUser: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeDisabled();
    });

    test("When the member is the current user, then the trigger is disabled", async () => {
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeDisabled();
    });

    test("When the remove button is clicked, then the member is removed successfully", async () => {
        const user = userEvent.setup();
        let removedMember: Project_Member | null = null;
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
                onMemberRemoved: (member) => {
                    removedMember = member;
                },
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const removeButton = screen.getByTestId("alert-dialog-action");
        await user.click(removeButton);

        await waitFor(() => {
            expect(removedMember).toStrictEqual(defaultMember);
        });
    });

    test("When removing the member fails, then an error message is displayed", async () => {
        mockFailedApiCall("removeProjectMember");

        const user = userEvent.setup();
        render(RemoveMemberDialog, {
            target: document.body,
            props: {
                projectId: "1",
                member: defaultMember,
                isCurrentUser: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        const removeButton = screen.getByTestId("alert-dialog-action");
        await user.click(removeButton);

        expect(screen.getByText("Couldn't remove member")).toBeInTheDocument();
    });
});
