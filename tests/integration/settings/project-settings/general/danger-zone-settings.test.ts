import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { Projects } from "$tests/example-data";
import { loading } from "$tests/model-builder";
import { mockUserContext } from "../../../test-helper";
import DangerZoneSettings from "$lib/components/composites/settings/project-settings/general/DangerZoneSettings.svelte";

describe("DangerZoneSettings", () => {
    test("When a project is provided, then it renders correctly", async () => {
        render(DangerZoneSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
            context: mockUserContext,
        });

        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
        expect(screen.getAllByText("Leave Project")[0]).toBeInTheDocument();
        expect(screen.getAllByText("Delete Project")[0]).toBeInTheDocument();
    });

    test("When isLastAdmin is true, then the leave project trigger is disabled", async () => {
        render(DangerZoneSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
                isLastAdmin: true,
            },
            context: mockUserContext,
        });

        const leaveTrigger = screen.getByRole("button", { name: "Leave this project" });
        expect(leaveTrigger).toBeDisabled();
    });
});
