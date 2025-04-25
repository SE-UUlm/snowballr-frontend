import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import ProjectNameSettings from "$lib/components/composites/settings/project-settings/general/ProjectNameSettings.svelte";
import { Projects } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { ProjectStatus } from "$lib/model/api/project";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";

describe("ProjectNameSettings", () => {
    test("When all props are provided, then it renders correctly, with two labels, one input field and a button", async () => {
        render(ProjectNameSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProject.id,
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        expect(screen.queryByText("General")).toBeInTheDocument();
        expect(screen.queryByText("Project Name")).toBeInTheDocument();
        const projectRenameInput = screen.getByLabelText("Project Name");
        expect(projectRenameInput).toBeInTheDocument();
        await waitFor(() => {
            expect(projectRenameInput).toHaveValue(Projects.demoProject.name);
        });
        const renameButton = screen.getByRole("button", { name: "Rename" });
        expect(renameButton).toBeInTheDocument();
    });

    test("When the input field is empty or the project name is the same, then the button should not change the name", async () => {
        const mockCall = mockApiCall("getProjectById", {
            id: "",
            name: "",
            status: ProjectStatus.UNSPECIFIED,
            currentStage: 0n,
            maxStage: 0n,
        });
        const mockUpdateProject = mockApiCall("updateProject", {
            id: "0",
            name: "New Project Name",
            status: ProjectStatus.ACTIVE,
            currentStage: 0n,
            maxStage: 1n,
            settings: undefined,
        });

        render(ProjectNameSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProject.id,
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, " ");
        await userEvent.click(renameButton);
        expect(mockUpdateProject).toHaveBeenCalled();
        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, "Demo Project");
        await userEvent.click(renameButton);
        expect(mockUpdateProject).toHaveBeenCalled();
        expect(mockCall).not.toHaveBeenCalled();
    });

    test("When the input field is filled with a differing name, then the button should change the name", async () => {
        const mockCall = mockApiCall("updateProject", {
            id: "0",
            name: "New Project Name",
            status: ProjectStatus.ACTIVE,
            currentStage: 0n,
            maxStage: 1n,
            settings: undefined,
        });

        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProject.id,
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });

        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, "New Project Name");
        await userEvent.click(renameButton);
        expect(mockCall).toHaveBeenCalled();
    });

    test("When a failed API call to get the project is made, then an error message should be shown", async () => {
        const failedPromise = Promise.reject(new Error("Error while loading project"));
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProject.id,
                loadingProject: failedPromise,
            },
        });
        const errorHeading = await screen.findByRole("heading", {
            name: "Something went wrong while loading the project name.",
        });
        expect(errorHeading).toBeInTheDocument();
    });

    test("When a failed API call to update the project is made, then an error message should be shown", async () => {
        mockFailedApiCall("updateProject");
        render(ProjectNameSettings, {
            props: {
                projectId: Projects.demoProject.id,
                loadingProject: Promise.resolve(Projects.demoProject),
            },
        });
        const projectRenameInput = screen.getByLabelText("Project Name");
        const renameButton = screen.getByRole("button", { name: "Rename" });

        await userEvent.clear(projectRenameInput);
        await userEvent.type(projectRenameInput, "New Project Name");
        await userEvent.click(renameButton);
        expect(
            screen.getByRole("heading", {
                name: "Something went wrong while updating the project name.",
            }),
        ).toBeInTheDocument();
    });
});
