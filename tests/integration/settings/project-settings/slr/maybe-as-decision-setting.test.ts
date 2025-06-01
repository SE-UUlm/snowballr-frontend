import MaybeAsDecisionSetting from "$lib/components/composites/settings/project-settings/slr/MaybeAsDecisionSetting.svelte";
import { maybeAsDecision } from "$lib/global-state/maybe-as-decision-state.svelte";
import { ProjectStatus } from "$lib/model/api/project";
import { createProject, createProjectSettings, loading } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

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

    test("When all props are provided and the SLR settings are not locked, then the component renders correctly, with a title, a switch with a label, and a description", async () => {
        const mockGetCall = mockApiCall("getProjectById", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: false,
            },
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
        expect(mockGetCall).toHaveBeenCalledExactlyOnceWith({ id: projectData.id });
    });

    test("When all props are provided and the SLR settings are locked, then the component renders correctly, with a title, a switch with a label, and a description", async () => {
        projectData.status = ProjectStatus.ACTIVE_LOCKED;
        const mockGetCall = mockApiCall("getProjectById", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: true,
            },
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
        expect(mockGetCall).toHaveBeenCalledExactlyOnceWith({ id: projectData.id });
    });

    test("When the switch is clicked (initialy off), then a popup should appear, asking for confirmation to change the SLR settings", async () => {
        const mockGetCall = mockApiCall("getProjectById", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: false,
            },
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
        expect(mockGetCall).toHaveBeenCalledOnce();
    });

    test("When the switch is clicked (initially off), and the cancel option is selected, then the popup should close and the switch should remain in its previous state", async () => {
        const mockGetCall = mockApiCall("getProjectById", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: false,
            },
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
        expect(mockGetCall).toHaveBeenCalledOnce();
    });

    test("When the switch is toggled, then the SLR settings should be updated accordingly", async () => {
        const mockGetCall = mockApiCall("getProjectById", projectData);
        const mockUpdateCall = mockApiCall("updateProject", projectData);
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: false,
            },
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

        expect(mockGetCall).toHaveBeenCalledOnce();
        expect(mockUpdateCall).toHaveBeenCalledTimes(2);
    });

    test("When the api call fails, then an error message is displayed", async () => {
        const mockGetCall = mockApiCall("getProjectById", projectData);
        mockFailedApiCall("updateProject");
        render(MaybeAsDecisionSetting, {
            target: document.body,
            props: {
                projectId: projectData.id,
                loadingProject: loading(projectData),
                slrSettingsLocked: false,
            },
        });

        const maybeSwitch = screen.getByRole("switch");
        await waitFor(() => expect(maybeSwitch).toBeEnabled());
        expect(maybeSwitch).not.toBeChecked();

        maybeSwitch.click();
        await waitFor(() => {
            expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        });
        screen.getByRole("button", { name: "Confirm" }).click();

        await waitFor(() => {
            expect(screen.getByText("Failed to update project settings")).toBeInTheDocument();
        });

        expect(maybeSwitch).not.toBeChecked();
        expect(maybeSwitch).toBeEnabled();
        expect(maybeAsDecision.isActivated).toBe(false);

        expect(mockGetCall).toHaveBeenCalledOnce();
    });
});
