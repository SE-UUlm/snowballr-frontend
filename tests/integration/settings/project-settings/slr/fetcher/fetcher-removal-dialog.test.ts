import { Project, Project_Settings } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherRemovalDialog from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherRemovalDialog.svelte";
import { mockApiCall } from "$tests/setupTest";
import type { FetcherInformation } from "$api/fetcher";
import userEvent from "@testing-library/user-event";

describe("FetcherRemovalDialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    const fetcher: FetcherInformation = {
        id: "test",
        name: "Test Fetcher",
        description: "This is a test fetcher",
        links: [],
        optionsSchema: {},
    };

    test("When all props are provided, then it renders correctly", async () => {
        const projectData = createProject({
            settings: createProjectSettings({
                fetchers: {
                    test: {
                        options: {},
                    },
                },
            }),
        });

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                project: projectData,
                onProjectChanged: () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
    });

    test("When the trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();

        const projectData = createProject({
            settings: createProjectSettings({
                fetchers: {
                    test: {
                        options: {},
                    },
                },
            }),
        });

        render(FetcherRemovalDialog, {
            target: document.body,
            props: {
                project: projectData,
                onProjectChanged: () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByRole("button", { name: "Remove Fetcher" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByText(fetcher.name, { exact: false })).toBeVisible();
    });

    test("When a fetcher is deleted, then it is deleted correctly", async () => {
        const user = userEvent.setup();

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
                project: projectData,
                onProjectChanged: (it: Project) => (newProject = it),
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        screen.getByRole("button", { name: "Remove Fetcher" }).click();
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
