import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { Projects } from "$tests/example-data";
import { loading } from "$tests/model-builder";
import DangerZoneSettings from "$lib/components/composites/settings/project-settings/general/DangerZoneSettings.svelte";

describe("DangerZoneSettings", () => {
    test("When a project is provided, then it renders correctly", async () => {
        render(DangerZoneSettings, {
            target: document.body,
            props: {
                loadingProject: loading(Projects.demoProjectActive),
                projectId: Projects.demoProjectActive.id,
            },
        });

        expect(screen.getByText("Danger Zone")).toBeInTheDocument();
        expect(screen.getAllByText("Delete Project")[0]).toBeInTheDocument();
    });
});
