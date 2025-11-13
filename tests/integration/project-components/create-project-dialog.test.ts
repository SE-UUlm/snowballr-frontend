import { expect, test, describe, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import CreateProjectDialog from "$lib/components/composites/project-components/CreateProjectDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockUserContext } from "../test-helper";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { Members, Users } from "$tests/example-data";
import { createProject as createDemoProject } from "$tests/model-builder";

describe.sequential("CreateProjectDialog", () => {
    beforeEach(() => {
        mockApiCall("createProject", createDemoProject());
        mockApiCall("inviteUserToProject", {});
        mockApiCall("getInviteCandidates", {
            users: [Users.johnDoe, Users.janeDoe, Users.henryMoore],
        });
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
    }

    async function closeCreateProjectDialog() {
        const user = userEvent.setup();
        await user.keyboard("{esc}");
    }

    async function createProject() {
        const user = userEvent.setup();
        await openCreateProjectDialogIfNotOpen();

        const projectNameInput = screen.getByRole("textbox", { name: "Name" });
        await user.type(projectNameInput, "Test project");
        await user.tab();

        const membersInput = screen.getByRole("textbox", { name: "Members" });
        await user.type(membersInput, Members.demoMember1.user!.email);
        await user.tab();

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
        await user.type(membersInput, Members.demoMember1.user!.email);
        await user.tab();

        const chip = screen.getByText(Members.demoMember1.user!.firstName, { exact: false });
        expect(chip).toBeInTheDocument();

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelButton);

        await openCreateProjectDialogIfNotOpen();

        const chipAfterCancel = screen.queryByText(Members.demoMember1.user!.firstName, {
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

        expect(screen.getByText("Failed to Create Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();

        await closeCreateProjectDialog();

        mockApiCall("createProject", createDemoProject());
        mockFailedApiCall("inviteUserToProject");

        await createProject();

        expect(screen.getByText("Failed to Create Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Success! Your new project has been created successfully.", {
                exact: false,
            }),
        ).not.toBeInTheDocument();
    });
});
