import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
import { maybeAsDecision } from "$lib/global-state/maybe-as-decision-state.svelte";
import { ProjectStatus } from "$api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";
import { mockIsProjectArchivedContext } from "$tests/integration/test-helper";

describe("Maybe As Decision Project Setting", () => {
    const projectData = createProject();

    beforeEach(() => {
        projectData.settings = createProjectSettings();
        projectData.status = ProjectStatus.ACTIVE;
        maybeAsDecision.isActivated = false;

        vi.clearAllMocks();
    });

    afterAll(() => {
        vi.restoreAllMocks();
    });

    test(
        "When all props are provided and the SLR settings are not locked, then the component renders correctly, with a title, " +
            "a switch with a label, and a description",
        async () => {
            render(MaybeAsDecisionSetting, {
                target: document.body,
                props: {
                    projectId: projectData.id,
                    slrSettingsLocked: false,
                    loadingProject: Promise.resolve(projectData),
                },
                context: mockIsProjectArchivedContext(),
            });

            const maybeSwitch = screen.getByRole("switch");
            await waitFor(() => expect(maybeSwitch).toBeEnabled());
            expect(maybeAsDecision.isActivated).toBe(false);
            expect(maybeSwitch).not.toBeChecked();

            expect(screen.getByText("Maybe as Decision")).toBeInTheDocument();
            expect(screen.getByText("Allow 'Maybe' as decision on a Paper.")).toBeInTheDocument();
            expect(
                screen.getByText(
                    "When turned on, a reviewer can set their decision to 'Maybe', next to 'Accept' or 'Decline'.",
                ),
            ).toBeInTheDocument();
        },
    );

    test("When all props are provided and the SLR settings are locked, then the component renders correctly, with a title, a switch with a label, and a description", async () => {
        projectData.status = ProjectStatus.ACTIVE_LOCKED;
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: true,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeAsDecision.isActivated).toBe(false)); // Set by mount
        expect(maybeSwitch).toBeDisabled();
        expect(maybeSwitch).not.toBeChecked();

        expect(screen.getByText("Maybe as Decision")).toBeInTheDocument();
        expect(screen.getByText("Allow 'Maybe' as decision on a Paper.")).toBeInTheDocument();
        expect(
            screen.getByText(
                "When turned on, a reviewer can set their decision to 'Maybe', next to 'Accept' or 'Decline'.",
            ),
        ).toBeInTheDocument();
    });

    test("When the switch is clicked (initially off), then a popup should appear, asking for confirmation to change the SLR settings", async () => {
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        expect(maybeSwitch).not.toBeChecked();

        maybeSwitch.click();

        await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
        expect(screen.getByText("Enable 'Maybe' as Decision?")).toBeInTheDocument();
        expect(
            screen.getByText("Are you sure you want to enable 'Maybe' as decision?"),
        ).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
    });

    test(
        "When the switch is clicked (initially off), and the cancel option is selected, then the popup should close " +
            "and the switch should remain in its previous state",
        async () => {
            render(MaybeAsDecisionSetting, {
                target: document.body,
                props: {
                    projectId: projectData.id,
                    slrSettingsLocked: false,
                    loadingProject: Promise.resolve(projectData),
                },
                context: mockIsProjectArchivedContext(),
            });

            const maybeSwitch = screen.getByRole("switch");
            await waitFor(() => expect(maybeSwitch).toBeEnabled());
            expect(maybeSwitch).not.toBeChecked();

            maybeSwitch.click();
            await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());

            const cancelButton = screen.getByRole("button", { name: "Cancel" });
            cancelButton.click();

            await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());

            expect(maybeSwitch).not.toBeChecked();
            expect(maybeAsDecision.isActivated).toBe(false);
        },
    );

    test("When the switch is toggled, then the SLR settings should be updated accordingly", async () => {
        const mockUpdateCall = mockApiCall("updateProject", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        expect(maybeSwitch).not.toBeChecked();

        // First click
        maybeSwitch.click();
        await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
        screen.getByRole("button", { name: "Confirm" }).click();

        await waitFor(() => {
            expect(maybeSwitch).toBeChecked();
            expect(maybeSwitch).toBeEnabled();
        });
        expect(maybeAsDecision.isActivated).toBe(true);

        // Second click
        maybeSwitch.click();
        await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
        screen.getByRole("button", { name: "Confirm" }).click();

        await waitFor(() => {
            expect(maybeSwitch).not.toBeChecked();
            expect(maybeSwitch).toBeEnabled();
        });
        expect(maybeAsDecision.isActivated).toBe(false);

        expect(mockUpdateCall).toHaveBeenCalledTimes(2);
    });

    test("When the api call fails, then an error message is displayed", async () => {
        mockFailedApiCall("updateProject");
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        expect(maybeSwitch).not.toBeChecked();

        maybeSwitch.click();
        await waitFor(() => {
            expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        });
        screen.getByRole("button", { name: "Confirm" }).click();

        expect(
            await screen.findByRole("alert", { name: "Failed to Update Project Settings" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while updating the project settings. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();

        expect(maybeSwitch).not.toBeChecked();
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        expect(maybeAsDecision.isActivated).toBe(false);
    });

    test("When the project fails to resolve, then an error message is displayed", async () => {
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.reject(new Error("Failed to load project")),
            },
            context: mockIsProjectArchivedContext(),
        });

        expect(
            await screen.findByRole("alert", { name: "Failed to Load Project Settings" }),
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                "Something went wrong while loading the project settings. Please make sure your internet connection is stable, then try again.",
            ),
        ).toBeInTheDocument();
    });

    test("When the project is archived, then the section is locked and the switch is disabled", async () => {
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(true),
        });

        await waitFor(() => expect(screen.getByRole("switch")).toBeDisabled());
        expect(screen.getByTitle("This settings section is locked.")).toBeInTheDocument();
    });

    test("When the change is confirmed, then the confirmation dialog closes", async () => {
        mockApiCall("updateProject", projectData);

        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        maybeSwitch.click();

        await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
        screen.getByRole("button", { name: "Confirm" }).click();

        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
        expect(maybeSwitch).toBeChecked();
    });

    test("When the update fails, then the confirmation dialog still closes so the error is visible", async () => {
        mockFailedApiCall("updateProject");

        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
            context: mockIsProjectArchivedContext(),
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        maybeSwitch.click();

        await waitFor(() => expect(screen.getByRole("alertdialog")).toBeInTheDocument());
        screen.getByRole("button", { name: "Confirm" }).click();

        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
        expect(
            screen.getByRole("alert", { name: "Failed to Update Project Settings" }),
        ).toBeInTheDocument();
    });
});
