import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import SingleSelect from "$lib/components/composites/select/SingleSelect.svelte";

describe("SingleSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown", () => {
        render(SingleSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("No category selected");
        expect(trigger).toBeInTheDocument();
    });

    test("When select is clicked, then options are shown", async () => {
        const user = userEvent.setup();
        render(SingleSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("No category selected");
        await user.click(trigger);

        const option1 = screen.getByText("Option 1");
        const option2 = screen.getByText("Option 2");
        expect(option1).toBeInTheDocument();
        expect(option2).toBeInTheDocument();
    });

    test("When option is selected, then select label is updated", async () => {
        const user = userEvent.setup();
        render(SingleSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("No category selected");
        await user.click(trigger);

        const option1 = screen.getByText("Option 1");
        await user.click(option1);

        expect(trigger).toHaveTextContent("Option 1");
    });
});
