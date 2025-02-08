import ToggleableInput from "$lib/components/composites/input/ToggleableInput.svelte";
import { render, screen } from "@testing-library/svelte";
import { keyboard } from "@testing-library/user-event/dist/cjs/setup/directApi.js";
import { describe, expect, test } from "vitest";

describe("ToggleableInput", () => {
    test("When isEditable is set to true, then input border is shown and content can be edited", async () => {
        render(ToggleableInput, {
            target: document.body,
            props: {
                isEditable: true,
                value: "",
            },
        });

        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();

        expect(input.classList.contains("border")).toBe(true);
        expect(input.classList.contains("border-input")).toBe(true);
        expect(input.classList.contains("rounded-md")).toBe(true);
        expect(input.classList.contains("border-transparent")).toBe(false);

        expect(input).not.toHaveAttribute("readonly");

        await keyboard("Test");

        expect(input).not.toHaveValue("Test");
        expect(input).toHaveValue("");
    });

    test("When isEditable is set to false, then input border is not shown and content cannot be edited", () => {
        render(ToggleableInput, {
            target: document.body,
            props: {
                isEditable: false,
            },
        });

        const input = screen.getByRole("textbox");
        expect(input).toBeInTheDocument();

        expect(input.classList.contains("border")).toBe(true);
        expect(input.classList.contains("border-input")).toBe(false);
        expect(input.classList.contains("rounded-md")).toBe(false);
        expect(input.classList.contains("border-transparent")).toBe(true);

        expect(input).toHaveAttribute("readonly");
    });
});
