import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import ProjectNameSettings from "$lib/components/composites/settings/project-settings/general/ProjectNameSettings.svelte";
import { Projects } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { createProject, loading } from "$tests/model-builder";
import { mockIsProjectArchivedContext } from "$tests/integration/test-helper";

describe("ProjectNameSettings", () => {
    test("When all props are provided, then it renders correctly, with two labels, one input field and a button", async () => {
        render(ProjectNameSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: Promise.resolve(Projects.demoProjectActive),
            },
            context: mockIsProjectArchivedContext(),
        });

        expect(screen.queryByText("General")).toBeInTheDocument();
        expect(screen.queryByText("Project Name")).toBeInTheDocument();

        const projectRenameInput = screen.getByLabelText("Project Name");
        expect(projectRenameInput).toBeInTheDocument();
        await waitFor(() => {
            expect(projectRenameInput).toHaveValue(Projects.demoProjectActive.name);
        });

        const renameButton = screen.getByRole("button", { name: "Rename" });
        expect(renameButton).toBeInTheDocument();
    });

    test("When the input field is empty or the project name is the same, then the button should not change the name", async () => {
        const mockUpdateProject = mockApiCall(
            "updateProject",
            createProject({ name: "New Project Name" }),
        );
        render(ProjectNameSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: Promise.resolve(Projects.demoProjectActive),
            },
            context: mockIsProjectArchivedContext(),
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });
        await waitFor(() => {
            expect(renameButton).toBeEnabled();
            expect(projectRenameInput).toBeEnabled();
        });
        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, " ");
        await userEvent.click(renameButton);
        expect(mockUpdateProject).not.toHaveBeenCalled();
        expect(
            screen.getByText("The project name cannot start or end with whitespace"),
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(renameButton).toBeEnabled();
            expect(projectRenameInput).toBeEnabled();
        });
        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, Projects.demoProjectActive.name);
        await userEvent.click(renameButton);

        expect(mockUpdateProject).not.toHaveBeenCalled();
        expect(
            await screen.findByRole("alert", {
                name: "No Changes Detected",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "To successfully change the project's name, you must provide a new one that is different from the current one.",
            ),
        ).toBeInTheDocument();
    });

    test("When the input field is filled with a differing name, then the button should change the name", async () => {
        const mockCall = mockApiCall("updateProject", createProject({ name: "New Project Name" }));
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: Promise.resolve(Projects.demoProjectActive),
            },
            context: mockIsProjectArchivedContext(),
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });
        await waitFor(() => {
            expect(renameButton).toBeEnabled();
            expect(projectRenameInput).toBeEnabled();
        });
        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, "New Project Name");
        await userEvent.click(renameButton);
        expect(mockCall).toHaveBeenCalled();
    });

    test("When the loading project fails to resolve, then an error message should be shown", async () => {
        const failedPromise = Promise.reject(new Error("Error while loading project"));
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: failedPromise,
            },
            context: mockIsProjectArchivedContext(),
        });

        expect(
            await screen.findByRole("alert", {
                name: "Failed to Load the Project",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while loading the project name. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });

    test("When a failed API call to update the project is made, then an error message should be shown", async () => {
        mockFailedApiCall("updateProject");
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: Promise.resolve(Projects.demoProjectActive),
            },
            context: mockIsProjectArchivedContext(),
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });
        await waitFor(() => {
            expect(renameButton).toBeEnabled();
            expect(projectRenameInput).toBeEnabled();
        });
        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, "New Project Name");
        await userEvent.click(renameButton);

        expect(
            await screen.findByRole("alert", {
                name: "Failed to Update the Project",
            }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while updating the project name. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });

    test("When the project is loading, then the input placeholder is 'Loading'", async () => {
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProjectActive.id,
                loadingProject: loading(Projects.demoProjectActive, 5000),
            },
            context: mockIsProjectArchivedContext(),
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        expect(projectRenameInput as HTMLInputElement).toHaveAttribute("placeholder", "Loading");
    });
});
