import { describe, expect, test, type Mock } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import LeaveProjectDialog from "$lib/components/composites/settings/project-settings/general/LeaveProjectDialog.svelte";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { mockUserContext } from "../../../test-helper";
import { Projects, Users } from "$tests/example-data";
import { backendService } from "$lib/grpc-api";

describe("LeaveProjectDialog", () => {
    async function openDialog(user: UserEvent) {
        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        await waitFor(() => {
            expect(trigger).not.toHaveStyle({ pointerEvents: "none" });
        });
        await user.click(trigger);
    }

    test("When rendered, then the trigger is enabled", () => {
        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeEnabled();
    });

    test("When isLastAdmin is true, then the trigger is disabled with an explanation", () => {
        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id, isLastAdmin: true },
            context: mockUserContext,
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeDisabled();
        expect(trigger).toHaveAttribute(
            "title",
            "You are the last admin of this project. Promote another member to admin before leaving.",
        );
    });

    test("When the trigger is clicked, then the dialog is opened with a warning", async () => {
        const user = userEvent.setup();
        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        await openDialog(user);

        const description = screen.getByTestId("alert-dialog-description");
        expect(description).toHaveTextContent(
            "Once you leave, you will lose access to this project. A project admin has to re-invite you to regain access.",
        );
    });

    test("When leaving is confirmed, then removeProjectMember is called for the current user", async () => {
        const user = userEvent.setup();
        const mockLeaveProject = mockApiCall("removeProjectMember", {});

        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        await openDialog(user);
        await user.click(screen.getByTestId("alert-dialog-action"));

        await waitFor(() => {
            expect(mockLeaveProject).toHaveBeenCalledWith({
                projectId: Projects.demoProjectActive.id,
                userEmail: Users.johnDoe.email,
            });
        });
    });

    test("When leaving fails, then a generic error message is shown", async () => {
        const user = userEvent.setup();
        mockFailedApiCall("removeProjectMember");

        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        await openDialog(user);
        await user.click(screen.getByTestId("alert-dialog-action"));

        expect(await screen.findByText("Couldn't Leave This Project")).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while leaving the project. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });

    test("When leaving fails because the current user is the last admin, then a specific error message is shown", async () => {
        const user = userEvent.setup();
        (backendService.removeProjectMember as Mock).mockImplementation(() => ({
            response: Promise.reject({ code: "FAILED_PRECONDITION" }),
        }));

        render(LeaveProjectDialog, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        await openDialog(user);
        await user.click(screen.getByTestId("alert-dialog-action"));

        expect(await screen.findByText("Couldn't Leave This Project")).toBeInTheDocument();
        expect(
            screen.getByText(
                "You are the last admin of this project. Promote another member to admin before leaving.",
            ),
        ).toBeInTheDocument();
    });
});
