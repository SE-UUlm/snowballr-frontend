import { Project, Project_Settings } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionsDialog from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherOptionsDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import { mockUserContext, waitForComponentLoading } from "$tests/integration/test-helper";

describe("Fetcher Options Dialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When the component is shown, then it is rendered correctly", async () => {
        const projectData = createProject();

        mockApiCall("getAvailableFetcherOptions", {
            options: {
                FOO: "BAR",
            },
        });

        render(FetcherOptionsDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: () => {},
                fetcher: "foobar",
                open: true,
            },
        });

        await waitForComponentLoading();
        expect(screen.getByText("FOO")).toBeVisible();
        expect(screen.getByRole("button", { name: "Save Options" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    });

    test("When you modify a fetcher, then the settings are adjusted accordingly", async () => {
        const projectData = createProject();
        let newProject: Project | undefined;

        const mockOptionsCall = mockApiCall("getAvailableFetcherOptions", {
            options: {
                FOO: "BAR",
            },
        });
        const mockUpdateCall = mockApiCall("updateProject", {
            ...projectData,
            settings: createProjectSettings({
                fetchers: {
                    foobar: {
                        options: {
                            FOO: "TEST",
                        },
                    },
                },
            }),
        });

        render(FetcherOptionsDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: (it: Project) => (newProject = it),
                fetcher: "foobar",
                open: true,
            },
        });

        await waitForComponentLoading();
        await userEvent.type(screen.getByPlaceholderText("BAR"), "TEST");
        expect(screen.getByRole("checkbox")).toBeChecked();
        await userEvent.click(screen.getByRole("button", { name: "Save Options" }));
        await waitFor(() => expect(newProject).toBeDefined());

        const fetcherOptions = Object.entries(
            newProject?.settings?.fetchers?.foobar?.options ?? {},
        );
        expect(fetcherOptions).toEqual([["FOO", "TEST"]]);

        expect(mockOptionsCall).toHaveBeenCalledExactlyOnceWith({
            fetcherName: "foobar",
        });
        expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
            mask: {
                paths: ["project.settings.fetchers"],
            },
            project: Project.create({
                id: projectData.id,
                settings: Project_Settings.create({
                    fetchers: {
                        foobar: {
                            options: {
                                FOO: "TEST",
                            },
                        },
                    },
                }),
            }),
        });
    });
});
