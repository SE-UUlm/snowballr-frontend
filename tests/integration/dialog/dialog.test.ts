import { describe, expect, test } from "vitest";
import TestDialog from "./TestDialog.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";

describe("Dialog", () => {
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

        const trigger = screen.getByTestId("dialog-trigger");
        await user.click(trigger);

        expect(trigger).toHaveAttribute("data-state", "open");

        const title = screen.getByText("This is the dialog title");
        expect(title).toBeInTheDocument();

        const description = screen.getByText("This is the dialog description");
        expect(description).toBeInTheDocument();
    });
});
