import { Project, Project_Settings } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherAddDialog from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherAddDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import { mockUserContext } from "$tests/integration/test-helper";

describe("Fetcher Add Dialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    test("When the component is created, then all buttons are there and no fetcher is selected", async () => {
        const projectData = createProject();
        const unusedFetchers = ["FetcherFoo", "FetcherBar", "FetcherTest"];

        render(FetcherAddDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: () => {},
                unusedFetchers,
                open: true,
            },
        });

        expect(
            screen.getByRole("button", {
                name: "Select a fetcher",
            }),
        ).toBeVisible();
        expect(
            screen.getByRole("button", {
                name: "Add Fetchers",
            }),
        ).toBeVisible();
        expect(
            screen.getByRole("button", {
                name: "Cancel",
            }),
        ).toBeVisible();
    });

    test("When the select box is opened, then the unused fetchers are shown", async () => {
        const projectData = createProject();
        const unusedFetchers = ["FetcherFoo", "FetcherBar", "FetcherTest"];

        render(FetcherAddDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: () => {},
                unusedFetchers,
                open: true,
            },
        });

        const selectBox = screen.getByRole("button", {
            name: "Select a fetcher",
        }) as HTMLInputElement;

        await userEvent.click(selectBox);

        for (const fetcher of unusedFetchers) {
            expect(screen.getByRole("option", { name: fetcher })).toBeVisible();
        }
    });

    test("When multiple fetchers are clicked, then multiple fetchers are selected", async () => {
        const projectData = createProject();
        const unusedFetchers = ["FetcherFoo", "FetcherBar", "FetcherTest"];

        render(FetcherAddDialog, {
            target: document.body,
            context: mockUserContext,
            props: {
                projectId: projectData.id,
                projectSettings: projectData.settings,
                onProjectChanged: () => {},
                unusedFetchers,
                open: true,
            },
        });

        const selectBox = screen.getByRole("button", {
            name: "Select a fetcher",
        }) as HTMLInputElement;

        await userEvent.click(selectBox);
        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[0] }));
        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[1] }));

        expect(screen.getByRole("option", { name: unusedFetchers[0] })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(screen.getByRole("option", { name: unusedFetchers[1] })).toHaveAttribute(
            "aria-selected",
            "true",
        );
        expect(selectBox.textContent?.trim()).toBe("2 fetchers selected");
    });

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
        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[0] }));
        await userEvent.click(screen.getByRole("option", { name: unusedFetchers[1] }));
        await userEvent.click(selectBox);
        await userEvent.click(screen.getByRole("button", { name: "Add Fetchers" }));
        await waitFor(() => expect(newProject).toBeDefined());

        const fetchers = Object.keys(newProject?.settings?.fetchers ?? {});
        expect(fetchers.toSorted()).toEqual(unusedFetchers.slice(0, 2).toSorted());

        expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
            mask: {
                paths: ["project.settings.fetchers"],
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
