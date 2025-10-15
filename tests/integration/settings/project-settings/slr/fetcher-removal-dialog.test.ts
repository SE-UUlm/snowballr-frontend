import { Project, Project_Settings } from "$lib/model/api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherRemovalDialog from "$lib/components/composites/settings/project-settings/slr/FetcherRemovalDialog.svelte";
import { mockApiCall } from "$tests/setupTest";

describe("Fetcher Removal Dialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When the component is shown, then it is rendered correctly", async () => {
        const projectData = createProject({
            settings: createProjectSettings({
                fetchers: {
                    foobar: {
                        options: {},
                    },
                },
            }),
        });

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: () => {},
                fetcher: "foobar",
                open: true,
            },
        });

        expect(screen.getByRole("button", { name: "Delete" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByText("foobar", { exact: false })).toBeVisible();
    });

    test("When a fetcher is deleted, then it is deleted correctly", async () => {
        const projectData = createProject({
            settings: createProjectSettings({
                fetchers: {
                    test: {
                        options: {},
                    },
                },
            }),
        });

        let newProject: Project | undefined;

        const mockUpdateCall = mockApiCall("updateProject", {
            ...projectData,
            settings: {
                ...projectData.settings!,
                fetchers: {},
            },
        });

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: (it: Project) => (newProject = it),
                fetcher: "test",
                open: true,
            },
        });

        screen.getByRole("button", { name: "Delete" }).click();
        expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
            mask: {
                paths: ["project.settings.fetchers"],
            },
            project: Project.create({
                id: projectData.id,
                settings: Project_Settings.create({
                    fetchers: {},
                }),
            }),
        });
        await waitFor(() => expect(newProject).toBeDefined());
        const fetchers = Object.keys(newProject?.settings?.fetchers ?? {});
        expect(fetchers.toSorted()).toEqual([]);
    });
});
