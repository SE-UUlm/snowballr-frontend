import StagesSelect from "$lib/components/composites/select/StagesSelect.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";

describe("StagesSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown correctly", async () => {
        render(StagesSelect, {
            target: document.body,
            props: {
                loadingStageCount: Promise.resolve(2n),
                selectedStages: [],
            },
        });

        const trigger = await screen.findByText("All Stages (3)");
        expect(trigger).toBeInTheDocument();
    });

    test("When the loadingStageCount promise is rejected, then hint is shown", async () => {
        const user = userEvent.setup();
        render(StagesSelect, {
            target: document.body,
            props: {
                loadingStageCount: Promise.reject("Error"),
                selectedStages: [],
            },
        });

        const trigger = await screen.findByText("All Stages (0)");
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        const noStagesOption = screen.queryByText("No stages available");
        expect(noStagesOption).toBeInTheDocument();
    });
});
