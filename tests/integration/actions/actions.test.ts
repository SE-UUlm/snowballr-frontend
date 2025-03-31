import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ClickOutsideOrEscapeActionComponent from "./ClickOutsideOrEscapeActionComponent.svelte";

describe("Click outside or press escape action", () => {
    it("When a component is created with the 'clickOutsideOrEscape' and the user clicks outside, then the 'ClickedOutsideOrEscape' is fired.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeActionComponent, { onEvent });

        await userEvent.click(screen.getByTestId("outside-action-container"));
        expect(onEvent).toHaveBeenCalled();
    });

    it("When a component is created with the 'clickOutsideOrEscape' and the user pressed escape, then the 'ClickedOutsideOrEscape' is fired.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeActionComponent, { onEvent });

        await userEvent.type(screen.getByTestId("outside-action-container"), "{Escape}");
        expect(onEvent).toHaveBeenCalled();
    });

    it(
        "When a component is created with the 'clickOutsideOrEscape' and the user clicks inside the component or " +
            "press any key except escape, then the 'ClickedOutsideOrEscape' is not fired.",
        async () => {
            const onEvent = vi.fn();
            render(ClickOutsideOrEscapeActionComponent, { onEvent });

            await userEvent.click(screen.getByTestId("action-container"));
            expect(onEvent).not.toHaveBeenCalled();

            await userEvent.type(screen.getByTestId("action-container"), "h");
            expect(onEvent).not.toHaveBeenCalled();
        },
    );
});
