import PublishersSelect from "$lib/components/composites/papers-view/PublishersSelect.svelte";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

describe("PublishersSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown correctly", async () => {
        render(PublishersSelect, {
            target: document.body,
            props: {
                loadingPublishers: Promise.resolve<string[]>(["Publisher 1", "Publisher 2"]),
                selectedPublishers: [],
            },
        });

        await waitFor(() => {
            const trigger = screen.getByText("All Publishers (2)");
            expect(trigger).toBeInTheDocument();
        });
    });

    test("When the loadingPublishers promise is rejected, then hint is shown", async () => {
        const user = userEvent.setup();
        render(PublishersSelect, {
            target: document.body,
            props: {
                loadingPublishers: Promise.reject("Error"),
                selectedPublishers: [],
            },
        });

        let trigger: HTMLElement;
        await waitFor(() => {
            trigger = screen.getByText("All Publishers (0)");
            expect(trigger).toBeInTheDocument();
        });
        assert(trigger!);

        await user.click(trigger);

        const option = screen.getByText("No publishers available");
        expect(option).toBeInTheDocument();
    });
});
