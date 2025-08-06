import { Project, Project_Settings } from "$lib/model/api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionsDialog from "$lib/components/composites/settings/project-settings/slr/FetcherOptionsDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import { mockUserContext } from "$tests/integration/test-helper";

describe("Fetcher Options Dialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

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

        await waitFor(() => expect(screen.getByText("FOO")).toBeVisible());

        await userEvent.type(screen.getByPlaceholderText("BAR"), "TEST");

        expect(screen.getByRole("checkbox")).toBeChecked();
        await userEvent.click(screen.getByRole("button", { name: "Save" }));

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
                paths: ["settings.fetchers"],
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
