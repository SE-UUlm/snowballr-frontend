import { describe, expect, test } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import CriteriaSettings from "$lib/components/composites/settings/project-settings/review/CriteriaSettings.svelte";
import { CriterionCategory } from "$api/criterion";
import { mockApiCall, mockFailedApiCall } from "$tests/setupTest";
import { createCriterion, createProject } from "$tests/model-builder";
import {
    mockIsProjectArchivedContext,
    waitForComponentLoading,
} from "$tests/integration/test-helper";

const storedCriterion = createCriterion({
    id: "7",
    tag: "E1",
    name: "Not in English",
    category: CriterionCategory.EXCLUSION,
});

function renderSettings({ currentStage = 0n, isArchived = false } = {}) {
    const project = createProject({ currentStage });
    render(CriteriaSettings, {
        target: document.body,
        props: { projectId: project.id, loadingProject: Promise.resolve(project) },
        context: mockIsProjectArchivedContext(isArchived),
    });
}

describe("CriteriaSettings", () => {
    test("When the criteria are loaded, then they are listed in their category", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [storedCriterion] });
        renderSettings();
        await waitForComponentLoading();

        const softExclusion = screen.getByRole("region", { name: "Soft Exclusion" });
        expect(within(softExclusion).getByText("Not in English")).toBeInTheDocument();
        expect(screen.getByText("No hard exclusion criteria yet.")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Save criteria" })).not.toBeInTheDocument();
    });

    test("When a new criterion has no name, then it is not applied", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [] });
        renderSettings();
        await waitForComponentLoading();

        await userEvent.click(screen.getByRole("button", { name: "Add criterion to Inclusion" }));
        expect(screen.getByLabelText("Tag")).toHaveValue("I1");
        await userEvent.click(screen.getByRole("button", { name: "Done" }));

        expect(screen.getByText("Enter a name.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Save criteria" })).toBeDisabled();
    });

    test("When a criterion is added in stage 0 and saved, then it is created without confirmation", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [] });
        const create = mockApiCall(
            "createCriterion",
            createCriterion({ id: "9", tag: "I1", name: "Peer reviewed" }),
        );
        renderSettings();
        await waitForComponentLoading();

        await userEvent.click(screen.getByRole("button", { name: "Add criterion to Inclusion" }));
        await userEvent.type(screen.getByLabelText("Name"), "Peer reviewed");
        await userEvent.click(screen.getByRole("button", { name: "Done" }));
        await userEvent.click(screen.getByRole("button", { name: "Save criteria" }));

        await waitFor(() => expect(create).toHaveBeenCalledOnce());
        expect(create.mock.calls[0][0]).toMatchObject({ tag: "I1", name: "Peer reviewed" });
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    test("When the project is past stage 0, then saving asks for confirmation first", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [storedCriterion] });
        const remove = mockApiCall("deleteCriterion", {});
        renderSettings({ currentStage: 1n });
        await waitForComponentLoading();

        await userEvent.click(screen.getByRole("button", { name: "Remove criterion E1" }));
        await userEvent.click(screen.getByRole("button", { name: "Save criteria" }));

        const dialog = await screen.findByRole("alertdialog");
        expect(within(dialog).getByText("Change Criteria During Stage 1?")).toBeInTheDocument();
        expect(remove).not.toHaveBeenCalled();

        await userEvent.click(within(dialog).getByRole("button", { name: "Save criteria" }));
        await waitFor(() => expect(remove).toHaveBeenCalledWith({ id: "7" }));
    });

    test("When saving fails, then the change stays pending and an error is shown", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [storedCriterion] });
        mockFailedApiCall("deleteCriterion");
        renderSettings();
        await waitForComponentLoading();

        await userEvent.click(screen.getByRole("button", { name: "Remove criterion E1" }));
        await userEvent.click(screen.getByRole("button", { name: "Save criteria" }));

        expect(await screen.findByText("Failed to Save All Criteria")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Keep criterion E1" })).toBeInTheDocument();
    });

    test("When the project is archived, then no criterion can be added", async () => {
        mockApiCall("getAllCriteriaForProject", { criteria: [storedCriterion] });
        renderSettings({ isArchived: true });
        await waitForComponentLoading();

        expect(screen.getByRole("button", { name: "Add criterion to Inclusion" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Edit criterion E1" })).toBeDisabled();
    });
});
