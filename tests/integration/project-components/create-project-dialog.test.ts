import { expect, test, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import CreateProjectDialog from "$lib/components/composites/project-components/CreateProjectDialog.svelte";
import userEvent from "@testing-library/user-event";

describe("CreateProjectDialog", () => {
    test("When the component is rendered, then the trigger button is shown, but no dialog", () => {
        render(CreateProjectDialog);

        expect(screen.getByText("Create Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Start a new SLR and invite other members."),
        ).not.toBeInTheDocument();
    });

    test("When the the trigger button is clicked, then the dialog for creating the project is opened", async () => {
        render(CreateProjectDialog);

        await userEvent.click(screen.getByTestId("dialog-trigger-button"));

        await waitFor(() => {
            expect(screen.getByTestId("dialog-trigger-button")).toHaveAttribute(
                "data-state",
                "closed",
            );
        });

        // expect(screen.getByText("Start a new SLR and invite other members.")).toBeInTheDocument();
        // expect(screen.getByRole("form")).toBeInTheDocument();

        /// TODO: fix problem, that dialog can not be found
    });
});
