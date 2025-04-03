import { expect, test, describe } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import CreateProjectDialog from "$lib/components/composites/project-components/CreateProjectDialog.svelte";
import userEvent from "@testing-library/user-event";
import { Users } from "$tests/example-data";

describe("CreateProjectDialog", () => {
    test("When the component is rendered, then the trigger button is shown, but no dialog", () => {
        render(CreateProjectDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
            },
        });

        expect(screen.getByText("Create Project")).toBeInTheDocument();
        expect(
            screen.queryByText("Start a new SLR and invite other members."),
        ).not.toBeInTheDocument();
    });

    test("When the the trigger button is clicked, then the dialog for creating the project is opened", async () => {
        render(CreateProjectDialog, {
            target: document.body,
            props: {
                user: Users.johnDoe,
            },
        });

        await userEvent.click(screen.getByTestId("dialog-trigger"));

        await waitFor(() => {
            expect(screen.getByTestId("dialog-content")).toHaveAttribute("data-state", "open");
        });

        expect(screen.getByText("Start a new SLR and invite other members.")).toBeInTheDocument();
        expect(screen.getByTestId("project-name-input")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
    });
});
