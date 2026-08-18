import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { Projects } from "$tests/example-data";
import { mockUserContext } from "../../../test-helper";
import LeaveProjectSettings from "$lib/components/composites/settings/project-settings/general/LeaveProjectSettings.svelte";

describe("LeaveProjectSettings", () => {
    test("When a project is provided, then it renders correctly", () => {
        render(LeaveProjectSettings, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id },
            context: mockUserContext,
        });

        expect(screen.getAllByText("Leave Project")[0]).toBeInTheDocument();
        const trigger = screen.getByTestId("alert-dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toBeEnabled();
    });

    test("When isLastAdmin is true, then the trigger is disabled", () => {
        render(LeaveProjectSettings, {
            target: document.body,
            props: { projectId: Projects.demoProjectActive.id, isLastAdmin: true },
            context: mockUserContext,
        });

        expect(screen.getByTestId("alert-dialog-trigger")).toBeDisabled();
    });
});
