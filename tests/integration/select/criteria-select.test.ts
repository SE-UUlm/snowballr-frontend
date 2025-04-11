import CriteriaSelect from "$lib/components/composites/select/CriteriaSelect.svelte";
import { render, screen } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { Criteria } from "../../example-data";
import { errorLoading, loading } from "$tests/model-builder";

describe("CriteriaSelect", () => {
    beforeEach(() => {
        // Apparently, these methods are not implemented in jsdom but used by the Select component
        // See https://github.com/testing-library/user-event/discussions/1087
        // They are necessary when clicking the select trigger
        window.HTMLElement.prototype.hasPointerCapture = () => true;
        window.HTMLElement.prototype.releasePointerCapture = vi.fn();
        window.HTMLElement.prototype.scrollIntoView = vi.fn();
    });

    test("When all props are provided, then component is shown correctly", async () => {
        render(CriteriaSelect, {
            target: document.body,
            props: {
                loadingCriteria: loading([Criteria.demoCriterion1, Criteria.demoCriterion2]),
                selectedCriteria: [],
            },
        });

        const trigger = await screen.findByText("All Criteria (2)");
        expect(trigger).toBeInTheDocument();
    });

    test("When the loadingCriteria promise is rejected, then hint is shown", async () => {
        const user = userEvent.setup();
        render(CriteriaSelect, {
            target: document.body,
            props: {
                loadingCriteria: errorLoading("Error"),
                selectedCriteria: [],
            },
        });

        const trigger = await screen.findByText("All Criteria (0)");
        expect(trigger).toBeInTheDocument();

        await user.click(trigger);

        const option = screen.getByText("No criteria available");
        expect(option).toBeInTheDocument();
    });
});
