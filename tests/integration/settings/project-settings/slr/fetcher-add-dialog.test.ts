import { Project, Project_Settings } from "$lib/model/api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherAddDialog from "$lib/components/composites/settings/project-settings/slr/FetcherAddDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import { mockUserContext } from "$tests/integration/test-helper";

describe("Fetcher Add Dialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When you add fetchers, then the settings are adjusted accordingly", async () => {
        const projectData = createProject();

        const unusedFetchers = ["FetcherFoo", "FetcherBar", "FetcherTest"];
        let newProject: Project | undefined;

        const mockUpdateCall = mockApiCall("updateProject", {
            ...projectData,
            settings: createProjectSettings({
                fetchers: {
                    FetcherFoo: { options: {} },
                    FetcherBar: { options: {} },
                },
            }),
        });

        render(FetcherAddDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: (it: Project) => (newProject = it),
                unusedFetchers,
                open: true,
            },
        });

        const selectBox = screen.getByRole("button", {
            name: "Select a fetcher",
        }) as HTMLInputElement;

        await userEvent.click(selectBox);

        for (const fetcher of unusedFetchers) {
            await waitFor(() =>
                expect(screen.getByRole("option", { name: fetcher })).toBeVisible(),
            );
        }

        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[0] }));
        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[1] }));

        expect(selectBox.textContent?.trim()).toBe("2 fetchers selected");
        await userEvent.click(selectBox);

        await userEvent.click(screen.getByRole("button", { name: "Add" }));

        await waitFor(() => expect(newProject).toBeDefined());

        const fetchers = Object.keys(newProject?.settings?.fetchers ?? {});
        expect(fetchers.toSorted()).toEqual(unusedFetchers.slice(0, 2).toSorted());

        expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
            mask: {
                paths: ["settings.fetchers"],
            },
            project: Project.create({
                id: projectData.id,
                settings: Project_Settings.create({
                    fetchers: {
                        FetcherFoo: {
                            options: {},
                        },
                        FetcherBar: {
                            options: {},
                        },
                    },
                }),
            }),
        });
    });
});
