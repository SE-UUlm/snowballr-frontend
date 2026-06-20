import { Project, Project_Settings } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import FetcherOptionsDialog from "$lib/components/composites/settings/project-settings/slr/fetcher/FetcherOptionsDialog.svelte";
import userEvent from "@testing-library/user-event";
import { mockApiCall } from "$tests/setupTest";
import type { FetcherInformation } from "$api/fetcher";

describe("FetcherOptionsDialog", () => {
    beforeEach(() => vi.clearAllMocks());
    afterAll(() => vi.restoreAllMocks());

    const fetcher: FetcherInformation = {
        id: "test",
        name: "Test Fetcher",
        description: "This is a test fetcher",
        links: [],
        optionsSchema: {
            FOO: {
                description: "This is the FOO option",
                required: false,
                isSecret: false,
            },
        },
    };

    test("When all props are provided, then it renders correctly", async () => {
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                project: createProject(),
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
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                project: createProject(),
                onProjectChanged: () => {},
                fetcher: fetcher,
                disabled: false,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByText("Edit Test Fetcher Fetcher Options")).toBeVisible();
        expect(screen.getByRole("button", { name: "Save Options" })).toBeVisible();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
    });

    test("When changes are disabled, then the dialog still can be opened, but changes are not allowed", async () => {
        const user = userEvent.setup();
        render(FetcherOptionsDialog, {
            target: document.body,
            props: {
                project: createProject(),
                onProjectChanged: () => {},
                fetcher: fetcher,
                disabled: true,
            },
        });

        const trigger = screen.getByTestId("alert-dialog-trigger");
        await waitFor(async () => user.click(trigger));

        expect(screen.getByText("Edit Test Fetcher Fetcher Options")).toBeVisible();
        const saveButton = screen.getByRole("button", { name: "Save Options" });
        expect(saveButton).toBeVisible();
        expect(saveButton).toBeDisabled();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeVisible();
        expect(screen.getByPlaceholderText("This is the FOO option")).toBeDisabled();
    });

    test("When you modify a fetcher, then the settings are adjusted accordingly", async () => {
        const user = userEvent.setup();

        const projectData = createProject();
        let newProject: Project | undefined;

        const mockUpdateCall = mockApiCall("updateProject", {
            ...projectData,
            settings: createProjectSettings({
                fetchers: {
                    test: {
                        options: {
                            FOO: "TEST",
                        },
                    },
                },
            }),
        });

        render(FetcherOptionsDialog, {
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

        await userEvent.type(screen.getByPlaceholderText("This is the FOO option"), "TEST");
        await userEvent.click(screen.getByRole("button", { name: "Save Options" }));
        await waitFor(() => expect(newProject).toBeDefined());

        const fetcherOptions = Object.entries(newProject?.settings?.fetchers?.test?.options ?? {});
        expect(fetcherOptions).toEqual([["FOO", "TEST"]]);

        expect(mockUpdateCall).toHaveBeenCalledExactlyOnceWith({
            mask: {
                paths: ["project.settings.fetchers"],
            },
            project: Project.create({
                id: projectData.id,
                settings: Project_Settings.create({
                    fetchers: {
                        test: {
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
