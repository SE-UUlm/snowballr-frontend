import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { Projects } from "$tests/example-data";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import { createProject } from "$tests/model-builder";
import ArchiveProjectSettings from "$lib/components/composites/settings/project-settings/general/ArchiveProjectSettings.svelte";
import { ProjectStatus } from "snowballr-api/project";
import { mockIsProjectArchivedContext } from "$tests/integration/test-helper";
import { refreshProject } from "$lib/model/project-cache";

vi.mock("$lib/model/project-cache", () => ({
    refreshProject: vi.fn(() => Promise.resolve()),
}));

describe("ArchiveProjectSettings", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("When an active project is provided, then it renders correctly with an 'Archive Project' button", async () => {
        render(ArchiveProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
            context: mockIsProjectArchivedContext(),
        });

        const description = screen.getByText("Archiving makes the project read-only.", {
            exact: false,
        });
        expect(description).toBeInTheDocument();
        const archiveButton = screen.getByRole("button", { name: "Archive Project" });
        expect(archiveButton).toBeInTheDocument();
    });

    test("When the archive button is clicked, then it should update project status to archived", async () => {
        const mockUpdateProject = mockApiCall(
            "updateProject",
            createProject({ status: ProjectStatus.ARCHIVED }),
        );

        render(ArchiveProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
            context: mockIsProjectArchivedContext(),
        });

        const archiveButton = screen.getByRole("button", { name: "Archive Project" });
        await userEvent.click(archiveButton);
        expect(mockUpdateProject).toHaveBeenCalled();
    });

    test("When the project is archived, then the project is refreshed with the updated project", async () => {
        const updatedProject = createProject({
            id: Projects.demoProjectActive.id,
            status: ProjectStatus.ARCHIVED,
        });
        mockApiCall("updateProject", updatedProject);

        render(ArchiveProjectSettings, {
            target: document.body,
            props: {
                projectId: Projects.demoProjectActive.id,
            },
            context: mockIsProjectArchivedContext(),
        });

        await userEvent.click(screen.getByRole("button", { name: "Archive Project" }));

        await waitFor(() => {
            expect(refreshProject).toHaveBeenCalledWith(updatedProject);
        });
    });

    test("When the project is already archived, then it renders a 'Activate Project' button that update status to active if clicked", async () => {
        const mockCall = mockApiCall(
            "updateProject",
            createProject({ status: ProjectStatus.ACTIVE }),
        );

        const archivedProject = createProject({ status: ProjectStatus.ARCHIVED });
        render(ArchiveProjectSettings, {
            target: document.body,
            props: {
                projectId: archivedProject.id,
            },
            context: mockIsProjectArchivedContext(true),
        });

        const archivedProjectDescription = await screen.findByText("This project is archived.", {
            exact: false,
        });
        expect(archivedProjectDescription).toBeInTheDocument();

        const activateButton = await screen.findByRole("button", { name: "Activate Project" });
        expect(activateButton).toBeInTheDocument();

        await userEvent.click(activateButton);
        expect(mockCall).toHaveBeenCalled();
    });
});
