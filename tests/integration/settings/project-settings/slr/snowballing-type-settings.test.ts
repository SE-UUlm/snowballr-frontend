import SnowballingTypeSettings from "$lib/components/composites/settings/project-settings/slr/SnowballingTypeSettings.svelte";
import { SnowballingType } from "$lib/model/api/project";
import { createProject, createProjectSettings } from "$tests/model-builder";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { describe, expect, test } from "vitest";
import userEvent from "@testing-library/user-event";

describe("SnowballingTypeSettings", () => {
    const projectData = createProject({
        settings: createProjectSettings({
            snowballingType: SnowballingType.BOTH,
        }),
    });

    test("When all props are provided and the SLR settings aren't locked, then the component renders correctly", async () => {
        projectData.settings!.snowballingType = SnowballingType.BOTH;
        render(SnowballingTypeSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
        });

        await waitFor(() => {
            expect(screen.getByRole("radio", { name: "Both" })).toBeChecked();
        });

        const forward = screen.getByRole("radio", { name: "Forward" });
        const backward = screen.getByRole("radio", { name: "Backward" });

        expect(forward).toBeEnabled();
        expect(backward).toBeEnabled();

        expect(screen.getByText("Snowballing Type")).toBeInTheDocument();
        expect(screen.getByText("Only forward references are fetched")).toBeInTheDocument();
        expect(screen.getByText("Only backward references are fetched")).toBeInTheDocument();
        expect(
            screen.getByText("Both forward and backward references are fetched"),
        ).toBeInTheDocument();
    });

    test("When the SLR settings are locked, then the radio buttons are disabled", async () => {
        projectData.settings!.snowballingType = SnowballingType.FORWARD;
        render(SnowballingTypeSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: true,
                loadingProject: Promise.resolve(projectData),
            },
        });

        await waitFor(() => expect(screen.getByRole("radio", { name: "Forward" })).toBeChecked());

        expect(screen.getByRole("radio", { name: "Forward" })).toBeDisabled();
        expect(screen.getByRole("radio", { name: "Backward" })).toBeDisabled();
        expect(screen.getByRole("radio", { name: "Both" })).toBeDisabled();
    });

    test("When a different type is selected, then the project is updated and the selection changes", async () => {
        const user = userEvent.setup();
        projectData.settings!.snowballingType = SnowballingType.BACKWARD;
        const mockUpdateCall = mockApiCall("updateProject", projectData);

        render(SnowballingTypeSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
        });

        await waitFor(() => expect(screen.getByRole("radio", { name: "Backward" })).toBeChecked());

        const forward = screen.getByRole("radio", { name: "Forward" });
        await user.click(forward);

        await waitFor(() => expect(forward).toBeChecked());
        expect(forward).toBeEnabled();
        expect(mockUpdateCall).toHaveBeenCalledTimes(1);
    });

    test("When the API call fails, then an error message is displayed and selection reverts", async () => {
        const user = userEvent.setup();
        projectData.settings!.snowballingType = SnowballingType.FORWARD;
        mockFailedApiCall("updateProject");

        render(SnowballingTypeSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.resolve(projectData),
            },
        });

        await waitFor(() => expect(screen.getByRole("radio", { name: "Forward" })).toBeChecked());
        const both = screen.getByRole("radio", { name: "Both" });
        await user.click(both);

        await waitFor(() =>
            expect(screen.getByRole("radio", { name: "Both" })).toBeInTheDocument(),
        );

        await waitFor(() => {
            expect(
                screen.getByRole("alert", { name: "Failed to Update Project Settings" }),
            ).toBeInTheDocument();

            // selection should revert to original
            expect(screen.getByRole("radio", { name: "Forward" })).toBeChecked();
        });
    });

    test("When the loadingProject promise rejects, then the component surfaces a load error", async () => {
        render(SnowballingTypeSettings, {
            target: document.body,
            props: {
                projectId: projectData.id,
                slrSettingsLocked: false,
                loadingProject: Promise.reject(new Error("Failed to load project")),
            },
        });

        const alert = await screen.findByRole("alert");
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent("Failed to Load Project Settings");
    });
});
