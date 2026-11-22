import { describe, expect, test } from "vitest";
import TestDialog from "#tests/integration/dialog/TestDialog.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

describe("Dialog", () => {
    /**
     * Clicks the trigger once the page accepts pointer events again, as tests run in random order
     * and a dialog left open by an earlier test blocks them for a moment.
     */
    async function clickTrigger(user: ReturnType<typeof userEvent.setup>) {
        const trigger = screen.getByTestId("dialog-trigger");
        await waitFor(() => expect(trigger).not.toHaveStyle({ pointerEvents: "none" }));
        await user.click(trigger);
        return trigger;
    }

    test("When all props are provided, then component is rendered correctly", () => {
        render(TestDialog);

        const trigger = screen.getByTestId("dialog-trigger");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveTextContent("This is the dialog trigger");
        expect(trigger).toHaveClass("bg-red-500");
        expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
        expect(trigger).toHaveAttribute("data-state", "closed");
    });

    test("When trigger is clicked, then the dialog is opened", async () => {
        const user = userEvent.setup();
        render(TestDialog);

        const trigger = await clickTrigger(user);

        expect(trigger).toHaveAttribute("data-state", "open");

        const title = screen.getByText("This is the dialog title");
        expect(title).toBeInTheDocument();

        const description = screen.getByText("This is the dialog description");
        expect(description).toBeInTheDocument();
    });

    test("When the cancel button is disabled, then it can't close the dialog", async () => {
        const user = userEvent.setup();
        render(TestDialog, { cancelDisabled: true });

        const trigger = await clickTrigger(user);

        const cancelButton = screen.getByRole("button", { name: "Cancel" });
        expect(cancelButton).toBeDisabled();

        await user.click(cancelButton);
        expect(trigger).toHaveAttribute("data-state", "open");
    });

    test("When the cancel button is disabled, then neither Escape nor the close button close the dialog", async () => {
        const user = userEvent.setup();
        render(TestDialog, { cancelDisabled: true });

        const trigger = await clickTrigger(user);
        await waitFor(() => expect(screen.getByTestId("dialog-content")).toHaveFocus());

        await user.keyboard("{Escape}");
        expect(trigger).toHaveAttribute("data-state", "open");

        await user.click(screen.getByRole("button", { name: "Close" }));
        expect(trigger).toHaveAttribute("data-state", "open");
    });
});
