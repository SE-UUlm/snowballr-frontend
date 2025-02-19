import DecisionsSelect from "$lib/components/composites/papers-view/DecisionsSelect.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("DecisionsSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown correctly", async () => {
        render(DecisionsSelect, {
            target: document.body,
            props: {
                selectedDecisions: [],
            },
        });

        await waitFor(() => {
            const trigger = screen.getByText("All Decisions (3)");
            expect(trigger).toBeInTheDocument();
        });
    });
});
