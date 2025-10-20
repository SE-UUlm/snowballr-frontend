import { describe, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import ClickOutsideOrEscapeAttachmentComponent from "./ClickOutsideOrEscapeAttachmentComponent.svelte";

describe("Click outside or press escape action", () => {
    test("When a component is created with the 'clickOutsideOrEscape' attachment and the user clicks outside, then the 'onClickedOutsideOrEscape' callback is called.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeAttachmentComponent, { onEvent });

        await userEvent.click(screen.getByTestId("outside-action-container"));
        expect(onEvent).toHaveBeenCalled();
    });

    test("When a component is created with the 'clickOutsideOrEscape' attachment and the user presses escape, then the 'onClickedOutsideOrEscape' callback is called.", async () => {
        const onEvent = vi.fn();
        render(ClickOutsideOrEscapeAttachmentComponent, { onEvent });

        await userEvent.type(screen.getByTestId("outside-action-container"), "{Escape}");
        expect(onEvent).toHaveBeenCalled();
    });

    test(
        "When a component is created with the 'clickOutsideOrEscape' attachment and the user clicks inside the component or " +
            "presses any key except escape, then the 'onClickedOutsideOrEscape' callback is not called.",
        async () => {
            const onEvent = vi.fn();
            render(ClickOutsideOrEscapeAttachmentComponent, { onEvent });

            await userEvent.click(screen.getByTestId("action-container"));
            expect(onEvent).not.toHaveBeenCalled();

            await userEvent.type(screen.getByTestId("action-container"), "h");
            expect(onEvent).not.toHaveBeenCalled();
        },
    );
});
