import MultiSelect from "$lib/components/composites/select/MultiSelect.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { get, type Writable, writable } from "svelte/store";
import TestMultiSelect from "./TestMultiSelect.svelte";

describe("MultiSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown", () => {
        render(MultiSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("All categories (2)");
        expect(trigger).toBeInTheDocument();
        expect(trigger).toHaveAttribute("data-state", "closed");
    });

    test("When select is clicked, then options are shown", async () => {
        const user = userEvent.setup();
        render(MultiSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("All categories (2)");
        await user.click(trigger);

        expect(trigger).toHaveAttribute("data-state", "open");
        const optionAll = screen.getByText("Select all");
        const option1 = screen.getByText("Option 1");
        const option2 = screen.getByText("Option 2");
        expect(optionAll).toBeInTheDocument();
        expect(option1).toBeInTheDocument();
        expect(option2).toBeInTheDocument();
    });

    test("When option is selected, then select label is updated", async () => {
        const user = userEvent.setup();
        render(MultiSelect, {
            target: document.body,
            props: {
                options: [
                    {
                        value: "option-1",
                        label: "Option 1 (with a very very long text and is longer than 30 characters)",
                    },
                    { value: "option-2", label: "Option 2" },
                ],
            },
        });

        const trigger = screen.getByText("All categories (2)");
        await user.click(trigger);

        const option1 = screen.getByText("Option 1", { exact: false });
        await user.click(option1);

        expect(trigger).toHaveTextContent("categories: Option 1 (with a very very ... (1)");
        expect(option1).toHaveAttribute("aria-selected", "true");
        expect(option1).toHaveAttribute("data-highlighted");
        expect(option1).toHaveAttribute("data-selected");

        await user.click(trigger);

        expect(trigger).toHaveAttribute("data-state", "closed");
    });

    test("When all options are selected, then default label is shown", async () => {
        const user = userEvent.setup();
        render(MultiSelect, {
            target: document.body,
            props: {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
                selectedValues: [],
            },
        });

        const trigger = screen.getByText("All categories (2)");
        await user.click(trigger);

        const option1 = screen.getByText("Option 1");
        const option2 = screen.getByText("Option 2");

        await user.click(option1);
        await user.click(option2);

        expect(trigger).toHaveTextContent("All categories (2)");
    });

    test(
        "When all options are selected at once, " +
            "then all options can be unselected at once too",
        async () => {
            const user = userEvent.setup();
            const selectedValues: Writable<string[]> = writable([]);

            render(TestMultiSelect, {
                options: [
                    { value: "option-1", label: "Option 1" },
                    { value: "option-2", label: "Option 2" },
                ],
                selectedValues: selectedValues,
            });

            const trigger = screen.getByText("All categories (2)");
            await user.click(trigger);

            let optionAll = screen.getByText("Select all");
            await user.click(optionAll);

            optionAll = screen.getByText("Unselect all");
            expect(get(selectedValues)).toContain("option-1");
            expect(get(selectedValues)).toContain("option-2");
            expect(optionAll).toBeInTheDocument();
            expect(trigger).toHaveTextContent("All categories (2)");

            await user.click(optionAll);

            optionAll = screen.getByText("Select all");
            expect(optionAll).toBeInTheDocument();
            expect(get(selectedValues)).not.toContain("option-1");
            expect(get(selectedValues)).not.toContain("option-2");
            expect(trigger).toHaveTextContent("All categories (2)");
        },
    );

    test("When no options are provided, then hint is shown", async () => {
        const user = userEvent.setup();
        render(MultiSelect, {
            target: document.body,
            props: {
                options: [],
            },
        });

        const trigger = screen.getByText("All categories (0)");

        await user.click(trigger);

        const hint = screen.getByText("No categories available");
        expect(hint).toBeInTheDocument();
    });
});
