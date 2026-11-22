import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import CreateProjectDialog from "#lib/components/composites/project-components/CreateProjectDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockUserContext, waitForDialogFocus } from "#tests/integration/test-helper.js";
import { mockApiCall, mockFailedApiCall, mockPendingApiCall } from "#tests/setupTest.js";
import { goto } from "$app/navigation";
import { createProject as createDemoProject, createUser } from "#tests/model-builder.js";

describe("CreateProjectDialog", () => {
    const invitee = createUser({
        email: "ada.lovelace@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
    });
    const secondInvitee = createUser({
        email: "alan.turing@example.com",
        firstName: "Alan",
        lastName: "Turing",
    });

    beforeEach(() => {
        mockApiCall("createProject", createDemoProject());
        mockApiCall("inviteUserToProject", {});
        mockApiCall("getInviteCandidates", { users: [invitee, secondInvitee] });
    });

    afterEach(async () => {
        vi.restoreAllMocks();
    });

    async function openCreateProjectDialogIfNotOpen() {
        const user = userEvent.setup();

        const dialog = screen.queryByTestId("dialog-content");
        if (dialog?.getAttribute("data-state") === "open") {
            return;
        }

        const trigger = screen.getByRole("button", { name: "Create new Project" });
        await waitFor(() => {
            expect(trigger).not.toHaveStyle({ pointerEvents: "none" });
        });

        await user.click(trigger);

        await waitFor(() => {
            expect(screen.getByTestId("dialog-content")).toHaveAttribute("data-state", "open");
        });
        // The dialog moves the focus once it opened, which would swallow the keys typed meanwhile
        await waitForDialogFocus();
    }

    async function closeCreateProjectDialog() {
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Cancel" }));
    }

    async function createProject(invitees = [invitee]) {
        const user = userEvent.setup();
        await openCreateProjectDialogIfNotOpen();

        const projectNameInput = screen.getByRole("textbox", { name: "Name" });
        await user.type(projectNameInput, "Test project");
        await user.tab();

        const membersInput = screen.getByRole("textbox", { name: "Members" });
        for (const { email } of invitees) {
            await user.type(membersInput, email);
            await user.tab();
        }

        const createButton = screen.getByRole("button", { name: "Create Project" });
        await user.click(createButton);
    }

    test("When the component is rendered, then the trigger button is shown, but no dialog", () => {
        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        expect(screen.getByText("Create new Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Start a new SLR and invite other members."),
        ).not.toBeInTheDocument();
    });

    test("When the trigger button is clicked, then the dialog for creating the project is opened", async () => {
        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await openCreateProjectDialogIfNotOpen();

        expect(screen.getByText("Start a new SLR and invite other members.")).toBeInTheDocument();
    });

    test("When the dialog is closed, then the invitation candidates and project name inputs are reset", async () => {
        const user = userEvent.setup();
        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await openCreateProjectDialogIfNotOpen();

        const projectNameInput = screen.getByRole("textbox", { name: "Name" });
        await user.type(projectNameInput, "Test project");
        await user.tab();

        const membersInput = screen.getByRole("textbox", { name: "Members" });
        await user.type(membersInput, invitee.email);
        await user.tab();

        const chip = screen.getByText(invitee.firstName, { exact: false });
        expect(chip).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelButton);

        await openCreateProjectDialogIfNotOpen();

        const chipAfterCancel = screen.queryByText(invitee.firstName, {
            exact: false,
        });
        expect(chipAfterCancel).not.toBeInTheDocument();
        const inputProjectName = screen.queryByText("Test project");
        expect(inputProjectName).not.toBeInTheDocument();
    });

    test("When the project name is not valid, then no project is created", async () => {
        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        const user = userEvent.setup();
        await openCreateProjectDialogIfNotOpen();

        const createButton = screen.getByRole("button", { name: "Create Project" });
        await user.click(createButton);

        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();
    });

    test("When the project was created and the user were invited successfully, then a success dialog is opened", async () => {
        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();

        expect(
            await screen.findByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).toBeInTheDocument();
    });

    test("When an error occurred during creating the project, then an error message is displayed", async () => {
        mockFailedApiCall("createProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();

        expect(await screen.findByText("Failed to Create Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();

        await closeCreateProjectDialog();

        mockApiCall("createProject", createDemoProject());
        mockFailedApiCall("inviteUserToProject");

        await createProject();

        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();
        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();
    });

    test("When the invitations failed and the user tries again, then the project is created only once", async () => {
        const createProjectCall = mockApiCall(
            "createProject",
            createDemoProject({ id: "created-project" }),
        );
        mockFailedApiCall("inviteUserToProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();
        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();

        const inviteUserCall = mockApiCall("inviteUserToProject", {});
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Create Project" }));

        expect(
            await screen.findByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).toBeInTheDocument();
        expect(createProjectCall).toHaveBeenCalledOnce();
        expect(inviteUserCall).toHaveBeenCalledExactlyOnceWith({
            projectId: "created-project",
            userEmail: invitee.email,
        });
    });

    test("When the dialog was closed after the invitations failed and the next project creation fails, then nobody is invited to the earlier project", async () => {
        mockApiCall("createProject", createDemoProject({ id: "created-project" }));
        mockFailedApiCall("inviteUserToProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();
        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();
        await closeCreateProjectDialog();

        mockFailedApiCall("createProject");
        const inviteUserCall = mockApiCall("inviteUserToProject", {});
        await createProject();

        expect(await screen.findByText("Failed to Create Project")).toBeInTheDocument();
        expect(inviteUserCall).not.toHaveBeenCalled();
        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();
    });

    test("When the invitations failed, then the error says so and the project name can't be changed anymore", async () => {
        mockFailedApiCall("inviteUserToProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();

        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();
        expect(screen.getByText("The project was created", { exact: false })).toBeInTheDocument();
        expect(screen.queryByText("Failed to Create Project")).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Name" })).toBeDisabled();
    });

    test("When the dialog is closed while the project is being created, then it stays open and the new project can be opened afterwards", async () => {
        const createProjectCall = mockPendingApiCall("createProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
        await closeCreateProjectDialog();

        expect(screen.getByTestId("dialog-content")).toHaveAttribute("data-state", "open");

        createProjectCall.resolve(createDemoProject({ id: "created-project" }));

        const user = userEvent.setup();
        await user.click(await screen.findByRole("button", { name: "Open" }));

        expect(goto).toHaveBeenCalledWith(
            expect.stringContaining("/project/created-project/dashboard"),
        );
    });

    test("When some invitations failed and the user tries again, then only the failed ones are sent again", async () => {
        mockApiCall("createProject", createDemoProject({ id: "created-project" }));
        const inviteUserCall = mockApiCall("inviteUserToProject", {});
        const inviteSucceeds = inviteUserCall.getMockImplementation()!;
        const inviteFails = mockFailedApiCall("inviteUserToProject").getMockImplementation()!;
        inviteUserCall.mockImplementation((request, options) =>
            request.userEmail === secondInvitee.email
                ? inviteFails(request, options)
                : inviteSucceeds(request, options),
        );

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject([invitee, secondInvitee]);
        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();

        const retriedInviteUserCall = mockApiCall("inviteUserToProject", {});
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Create Project" }));

        expect(
            await screen.findByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).toBeInTheDocument();
        expect(retriedInviteUserCall).toHaveBeenCalledExactlyOnceWith({
            projectId: "created-project",
            userEmail: secondInvitee.email,
        });
    });

    test("When the invitations failed and the user tries again, then the old error is hidden while the invitations are resent", async () => {
        mockApiCall("createProject", createDemoProject({ id: "created-project" }));
        mockFailedApiCall("inviteUserToProject");

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();
        expect(await screen.findByText("Failed to Invite Members")).toBeInTheDocument();

        const retriedInviteUserCall = mockPendingApiCall("inviteUserToProject");
        const user = userEvent.setup();
        await user.click(screen.getByRole("button", { name: "Create Project" }));

        await waitFor(() => expect(retriedInviteUserCall.call).toHaveBeenCalled());
        expect(screen.queryByText("Failed to Invite Members")).not.toBeInTheDocument();
        retriedInviteUserCall.resolve({});
    });

    test("When opening the created project fails, then the open button stops loading", async () => {
        vi.mocked(goto).mockRejectedValueOnce(new Error("navigation failed"));
        vi.spyOn(console, "error").mockImplementation(() => {});

        render(CreateProjectDialog, {
            target: document.body,
            context: mockUserContext,
        });

        await createProject();
        const user = userEvent.setup();
        const openButton = await screen.findByRole("button", { name: "Open" });
        await user.click(openButton);

        await waitFor(() => expect(goto).toHaveBeenCalled());
        await waitFor(() => expect(screen.getByRole("button", { name: "Open" })).toBeEnabled());
    });
});
