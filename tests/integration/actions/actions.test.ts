import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ClickOutsideOrEscapeActionComponent from "./ClickOutsideOrEscapeActionComponent.svelte";

describe("Click outside or press escape action", () => {
    it("When a component is created with the 'clickOutsideOrEscape' action and the user clicks outside, then the 'ClickedOutsideOrEscape' event is fired.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeActionComponent, { onEvent });

        await userEvent.click(screen.getByTestId("outside-action-container"));
        expect(onEvent).toHaveBeenCalled();
    });

    it("When a component is created with the 'clickOutsideOrEscape' action and the user presses escape, then the 'ClickedOutsideOrEscape' event is fired.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeActionComponent, { onEvent });

        await userEvent.type(screen.getByTestId("outside-action-container"), "{Escape}");
        expect(onEvent).toHaveBeenCalled();
    });

    it(
        "When a component is created with the 'clickOutsideOrEscape' action and the user clicks inside the component or " +
            "presses any key except escape, then the 'ClickedOutsideOrEscape' event is not fired.",
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
