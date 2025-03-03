import DecisionsSelect from "$lib/components/composites/select/DecisionsSelect.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
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
        const user = userEvent.setup();
        render(DecisionsSelect, {
            target: document.body,
            props: {
                selectedDecisions: [],
            },
        });

        const trigger = await screen.findByText("All Decisions (4)");
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        const option1 = screen.getByText("Accepted");
        expect(option1).toBeInTheDocument();
        const option2 = screen.getByText("Declined");
        expect(option2).toBeInTheDocument();
        const option3 = screen.getByText("Undecided");
        expect(option3).toBeInTheDocument();
        const option4 = screen.getByText("Unreviewed");
        expect(option4).toBeInTheDocument();
    });
});
