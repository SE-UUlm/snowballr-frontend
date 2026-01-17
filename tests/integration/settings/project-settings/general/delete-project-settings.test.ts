import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { Projects } from "$tests/example-data";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { loading } from "$tests/model-builder";
import DeleteProjectSettings from "$lib/components/composites/settings/project-settings/general/DeleteProjectSettings.svelte";

describe("DeleteProjectSettings", () => {
    async function openDialog(user: UserEvent) {
        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        await waitFor(() => {
            expect(trigger).not.toHaveStyle({ pointerEvents: "none" });
        });
        await user.click(trigger);
    }

    test("When a project is provided, then it renders correctly", async () => {
        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        expect(screen.getAllByText("Delete Project")[0]).toBeInTheDocument();
        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
    });

    test("When the delete button is clicked, then the dialog is opened and the submit button is disabled", async () => {
        const user = userEvent.setup();

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const description = screen.getByTestId("alert-dialog-description");
        expect(description).toBeInTheDocument();
        expect(description).toHaveTextContent(
            `Enter ${Projects.demoProjectActive.name} below to confirm`,
        );

        const confirmButton = screen.getByRole("button", { name: "Delete This Project" });
        expect(confirmButton).toBeDisabled();
    });

    test("When the correct project name is entered, then the submit button is enabled and clicking it calls the deleteProject API", async () => {
        const user = userEvent.setup();
        const mockDeleteProject = mockApiCall("softDeleteProject", {});

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const inputField = screen.getByTestId("confirmation-input");
        await user.type(inputField, Projects.demoProjectActive.name);

        const confirmButton = screen.getByRole("button", { name: "Delete This Project" });
        expect(confirmButton).toBeEnabled();

        await user.click(confirmButton);
        expect(mockDeleteProject).toHaveBeenCalled();
    });

    test("When an incorrect project name is entered, then the submit button remains disabled", async () => {
        const user = userEvent.setup();

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const inputField = screen.getByTestId("confirmation-input");
        await user.type(inputField, "Wrong Project Name");

        const confirmButton = screen.getByRole("button", { name: "Delete This Project" });
        expect(confirmButton).toBeDisabled();
    });

    test("When loading the project fails, then an error message is shown", async () => {
        const user = userEvent.setup();

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: Promise.reject("Failed to load project"),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const errorMessage = await screen.findByText("Failed to Load the Project");
        expect(errorMessage).toBeInTheDocument();
    });

    test("When deleting the project fails, then an error message is shown", async () => {
        const user = userEvent.setup();
        mockFailedApiCall("softDeleteProject");

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const inputField = screen.getByTestId("confirmation-input");
        await user.type(inputField, Projects.demoProjectActive.name);

        const confirmButton = screen.getByRole("button", { name: "Delete This Project" });
        expect(confirmButton).toBeEnabled();

        await user.click(confirmButton);

        const errorMessage = await screen.findByText("Couldn't delete this project");
        expect(errorMessage).toBeInTheDocument();
    });

    test("When the dialog is canceled, then the input is cleared", async () => {
        const user = userEvent.setup();

        render(DeleteProjectSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        await openDialog(user);

        const inputField = screen.getByTestId("confirmation-input");
        await user.type(inputField, Projects.demoProjectActive.name);
        expect(inputField).toHaveValue(Projects.demoProjectActive.name);

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        await user.click(cancelButton);

        await openDialog(user);

        expect(inputField).toHaveValue("");
    });
});
